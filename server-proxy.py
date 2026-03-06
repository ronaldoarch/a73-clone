#!/usr/bin/env python3
"""
Servidor local que faz PROXY da API para jt0c6h.com.
Use este servidor para obter dados reais do site e resolver os erros.
"""

import json
import os
import re
import urllib.parse
import urllib.request
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 3001  # Use 3001 to avoid conflict with server.py (3000)
_DIR_SITE = os.path.join(os.path.dirname(__file__), "site_baixado")
_DIR_OLD = os.path.join(os.path.dirname(__file__), "jt0c6h_baixado")
DIR = _DIR_SITE if os.path.isdir(_DIR_SITE) else _DIR_OLD
TRPC_SAVE_DIR = os.path.join(DIR, "api_trpc")
API_ORIGIN = "https://jt0c6h.com"
CAPTURE_TRPC = True  # Salva respostas tRPC em api_trpc/ quando proxy funciona


def proxy_trpc_request(path: str, method: str = "GET", body: bytes = None) -> tuple[bytes, int, dict]:
    """Faz proxy da requisição tRPC para o site original."""
    url = f"{API_ORIGIN}{path}"
    headers = {
        "Accept": "application/json",
        "Origin": API_ORIGIN,
        "Referer": f"{API_ORIGIN}/main/inicio/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read(), r.status, dict(r.headers)
    except Exception as e:
        print(f"[Proxy Error] {path}: {e}")
        raise


# Fallbacks quando o proxy falhar
MOCK_LIST = {"list": [{"games": [], "items": [], "id": 1, "name": "default"}], "total": 0}
MOCK_POPULAR = {"list": [{"games": [], "items": []}], "games": [], "total": 0}
MOCK_MARQUEE = {"content": [], "list": []}


def trpc_response(data):
    return {"result": {"data": {"json": data}}}


def get_mock_for_proc(proc: str):
    p = proc.lower()
    if "popular" in p:
        return MOCK_POPULAR
    if "marquee" in p or "carousel" in p:
        return MOCK_MARQUEE
    return MOCK_LIST


class ProxyAPIHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/frontend/trpc/"):
            self.handle_trpc_proxy()
        elif self.path.rstrip("/") == "/favicon.ico":
            self.send_response(302)
            self.send_header("Location", "/s5/app-icon/1222508/LOGO.jpg")
            self.end_headers()
        else:
            self._do_rest()

    def do_POST(self):
        if self.path.startswith("/api/frontend/trpc/"):
            self.handle_trpc_proxy()
        else:
            super().do_GET()

    def _do_rest(self):
        path = urllib.parse.urlparse(self.path).path
        path_clean = path.lstrip("/")
        file_path = os.path.join(DIR, path_clean) if path_clean else os.path.join(DIR, "index.html")
        is_file = os.path.isfile(file_path)
        is_dir_with_index = os.path.isdir(file_path) and os.path.isfile(os.path.join(file_path, "index.html"))
        is_static = path.startswith(("/assets/", "/s5/", "/sw", "/svg/", "/version", "/first/"))
        if path != "/" and not is_file and not is_dir_with_index and not is_static:
            self.serve_index(path)
        else:
            super().do_GET()

    def serve_index(self, path="/"):
        if path.startswith("/main/inicio"):
            index_path = os.path.join(DIR, "main", "inicio", "index.html")
        elif path.startswith("/admin"):
            index_path = os.path.join(DIR, "admin", "index.html")
        else:
            index_path = os.path.join(DIR, "index.html")
        if not os.path.isfile(index_path):
            index_path = os.path.join(DIR, "index.html")
        with open(index_path, "rb") as f:
            content = f.read()
        # Redirecionar apiUrl para este servidor (para proxy tRPC funcionar)
        content = re.sub(
            rb'"apiUrl"\s*:\s*"https?://[^"]*"',
            b'"apiUrl":"http://localhost:' + str(PORT).encode() + b'"',
            content, count=1
        )
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", len(content))
        self.end_headers()
        self.wfile.write(content)

    def handle_trpc_proxy(self):
        path = self.path
        method = self.command
        body = None
        if method == "POST":
            content_len = int(self.headers.get("Content-Length", 0))
            if content_len:
                body = self.rfile.read(content_len)

        try:
            data, status, resp_headers = proxy_trpc_request(path, method, body)
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", len(data))
            self.end_headers()
            self.wfile.write(data)
            print(f"[Proxy OK] {path[:60]}... -> {status}")
            # Salvar resposta para uso offline
            if CAPTURE_TRPC and status == 200 and data:
                procs = [x.strip() for x in path.replace("/api/frontend/trpc/", "").split("?")[0].split(",") if x.strip()]
                os.makedirs(TRPC_SAVE_DIR, exist_ok=True)
                try:
                    resp = json.loads(data)
                    items = resp if isinstance(resp, list) else [resp]
                    for i, p in enumerate(procs):
                        if i < len(items):
                            safe = p.replace(".", "_") + ".json"
                            out = os.path.join(TRPC_SAVE_DIR, safe)
                            with open(out, "w", encoding="utf-8") as f:
                                json.dump(items[i], f, ensure_ascii=False, indent=2)
                            print(f"  [Salvo] {safe}")
                except Exception:
                    pass
        except Exception:
            # Fallback para mock
            procs = path.replace("/api/frontend/trpc/", "").split("?")[0].split(",")
            results = [trpc_response(get_mock_for_proc(p)) for p in procs]
            body = json.dumps(results[0] if len(results) == 1 else results).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)
            print(f"[Mock Fallback] {path[:50]}...")

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


if __name__ == "__main__":
    os.chdir(DIR)
    server = HTTPServer(("", PORT), ProxyAPIHandler)
    print(f"\n  Servidor PROXY rodando em http://localhost:{PORT}/\n")
    print("  Acesse: http://localhost:3001/main/inicio/")
    print("  API: proxy para https://jt0c6h.com (dados reais)")
    print("  Se proxy falhar: usa mock local")
    print("  Pressione Ctrl+C para parar\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        server.shutdown()
