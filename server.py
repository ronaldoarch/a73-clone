#!/usr/bin/env python3
"""
Servidor local com mock da API tRPC e backend de autenticação.
"""

import json
import os
import re
import urllib.parse
import urllib.request
from http.server import HTTPServer, SimpleHTTPRequestHandler

from backend import auth as auth_backend

PORT = 3000
# Frontend: frontend-clone (cópia editável) > site_baixado > jt0c6h_baixado
_BASE = os.path.dirname(__file__)
_DIR_CLONE = os.path.join(_BASE, "frontend-clone")
_DIR_SITE = os.path.join(_BASE, "site_baixado")
_DIR_OLD = os.path.join(_BASE, "jt0c6h_baixado")
DIR = _DIR_CLONE if os.path.isdir(_DIR_CLONE) else (_DIR_SITE if os.path.isdir(_DIR_SITE) else _DIR_OLD)
TRPC_DIR = os.path.join(_DIR_SITE if os.path.isdir(_DIR_SITE) else _DIR_OLD, "api_trpc")

# Dados mock para a API tRPC (baseado em main/inicio/index.html)
MOCK_TENANT_INFO = {
    "tenantId": 1,
    "currency": "BRL",
    "symbol": "R$",
    "id": 1,
    "region": {"currency": "BRL", "symbol": "R$", "language": "pt-BR"},
    "currencySymbol": "R$",
    "siteName": "A73",
    "appIcon": "/s5/app-icon/1222508/LOGO.jpg",
    "siteLogo": "/s5/app-icon/1222508/LOGO.jpg",
    "appLanguage": ["pt-BR", "en", "es"],
    "appDefaultLanguage": "pt-BR",
}

MOCK_DOMAIN_INFO = {
    "list": [],
    "config": [
        {"tenantId": 0, "currency": "BRL", "symbol": "R$"},
        {"tenantId": 1, "currency": "BRL", "symbol": "R$"},
    ],
    "domains": [],
}

MOCK_CHANNEL_INFO = {
    "id": 1,
    "tenantId": 1,
    "domain": "localhost:3000",
    "currency": "BRL",
    "symbol": "R$",
    "config": [{"tenantId": 1, "currency": "BRL", "symbol": "R$"}],
}

MOCK_AUTH_TENANTS = [
    {
        "id": 1,
        "tenantId": 1,
        "domain": "localhost:3000",
        "currency": "BRL",
        "symbol": "R$",
        "name": "A73",
        "region": {"currency": "BRL", "symbol": "R$", "language": "pt-BR"},
    }
]

# Endpoints de jogos/home - app espera list/segments com .games e .items (arrays)
MOCK_LIST_RESPONSE = {
    "list": [{"games": [], "items": [], "id": 1, "name": "default", "sort": 0}],
    "segments": [{"games": [], "items": [], "id": 1, "name": "default", "sort": 0}],
    "total": 0,
}

# Popular games - app faz .filter em array; games e list[].games devem ser arrays
MOCK_POPULAR_GAMES = {
    "list": [{"games": [], "items": [], "id": 1, "name": "popular", "sort": 0}],
    "segments": [{"games": [], "items": [], "id": 1, "name": "popular", "sort": 0}],
    "games": [],
    "total": 0,
}

# Marquee/Carousel - content, list e value devem ser arrays iteráveis
MOCK_MARQUEE = {"content": [], "list": [], "value": []}

# Agency config
MOCK_AGENCY_CONFIG = {}

# Announcement (loginOut, etc)
MOCK_ANNOUNCEMENT = {"list": [], "value": []}


def trpc_response(data):
    """Formato de resposta tRPC."""
    return {"result": {"data": {"json": data}}}


def trpc_error_response(message, code=-32001):
    """Formato de erro tRPC."""
    return {"error": {"message": message, "code": code, "data": {"code": str(code)}}}


def _parse_trpc_input(body_bytes):
    """
    Extrai input do body tRPC (POST).
    Formatos: {"0":{"json":{...}}}, {"json":{...}}, ou {...} direto.
    """
    if not body_bytes:
        return None
    try:
        raw = json.loads(body_bytes.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    if isinstance(raw, list) and len(raw) > 0:
        raw = raw[0]
    if not isinstance(raw, dict):
        return None
    # {"0": {"json": {...}}} - batch
    if "0" in raw and isinstance(raw["0"], dict):
        return raw["0"].get("json", raw["0"])
    # {"json": {...}}
    if "json" in raw:
        return raw["json"]
    # input direto
    return raw


class MockAPIHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if self.path.startswith("/api/frontend/trpc/"):
            self.handle_trpc()
        elif path.rstrip("/") == "/favicon.ico":
            self.send_response(302)
            self.send_header("Location", "/s5/app-icon/1222508/LOGO.jpg")
            self.end_headers()
        elif "/svg/" in path and path.endswith(".svg"):
            path_clean = path.lstrip("/")
            local_path = os.path.join(DIR, path_clean)
            if os.path.isfile(local_path):
                try:
                    with open(local_path, "rb") as f:
                        body = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "image/svg+xml")
                    self.send_header("Content-Length", len(body))
                    self.end_headers()
                    self.wfile.write(body)
                    return
                except OSError:
                    pass
            self._serve_ionicon(path)
        else:
            self._do_rest()

    def _serve_ionicon(self, path):
        """Serve ícones do Ionicons via proxy do unpkg."""
        parts = path.split("/svg/")
        if len(parts) < 2:
            self.send_error(404)
            return
        icon_file = parts[-1]
        if not icon_file.endswith(".svg"):
            self.send_error(404)
            return
        icon_name = icon_file[:-4]
        if not icon_name or "/" in icon_name:
            self.send_error(404)
            return
        try:
            url = f"https://unpkg.com/ionicons@7.1.2/dist/ionicons/svg/{icon_name}.svg"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                body = resp.read()
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", len(body))
            self.send_header("Cache-Control", "public, max-age=86400")
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            body = b'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"/>'
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)

    def do_POST(self):
        if self.path.startswith("/api/frontend/trpc/"):
            self.handle_trpc()
        else:
            super().do_GET()

    def _do_rest(self):
        # SPA fallback: rotas como /launch servem index.html; /admin tem seu próprio index
        path = urllib.parse.urlparse(self.path).path
        path_clean = path.lstrip("/").rstrip("/") or ""
        file_path = os.path.join(DIR, path_clean) if path_clean else os.path.join(DIR, "index.html")
        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, "index.html")
        is_file = os.path.isfile(file_path)
        is_dir_with_index = os.path.isdir(os.path.join(DIR, path_clean)) if path_clean else False
        if is_dir_with_index and not is_file:
            file_path = os.path.join(DIR, path_clean, "index.html")
            is_file = os.path.isfile(file_path)
        is_static = path.startswith(("/assets/", "/s5/", "/sw", "/svg/", "/version", "/first/", "/external/"))
        if path != "/" and not is_file and not is_static:
            self.serve_index()
        elif is_file and file_path.endswith(".html"):
            self._serve_html_local(file_path)
        elif is_static or path_clean.startswith(("assets/", "svg/", "version", "first/")):
            self._serve_static_with_fallback(path, path_clean)
        else:
            super().do_GET()

    def _serve_html_local(self, file_path):
        """Serve HTML reescrevendo apiUrl para local (desconecta conteúdo dinâmico)."""
        with open(file_path, "rb") as f:
            content = f.read()
        # Redireciona API para este servidor - apenas local
        content = re.sub(
            rb'"apiUrl"\s*:\s*"https?://[^"]*"',
            rb'"apiUrl":"http://localhost:' + str(PORT).encode() + rb'"',
            content,
            count=1,
        )
        # Ajusta domain no config quando servindo a73-clone (ex: localhost:3001 -> 3000)
        content = re.sub(
            rb'"domain"\s*:\s*"localhost:\d+"',
            rb'"domain":"localhost:' + str(PORT).encode() + rb'"',
            content,
        )
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", len(content))
        self.end_headers()
        self.wfile.write(content)

    def serve_index(self):
        """Serve index.html para rotas do SPA (fallback)."""
        self._serve_html_local(os.path.join(DIR, "index.html"))

    def _serve_static_with_fallback(self, path, path_clean):
        """Serve arquivos estáticos com fallback para jt0c6h_baixado."""
        path_clean = path_clean or path.lstrip("/")
        # versionControl/*.js - serve arquivo real de jt0c6h_baixado (PWA install)
        if path_clean.startswith("versionControl/") and path_clean.endswith(".js"):
            for base in (_DIR_OLD, DIR):
                full = os.path.join(base, path_clean)
                if os.path.isfile(full):
                    try:
                        with open(full, "rb") as f:
                            content = f.read()
                        self.send_response(200)
                        self.send_header("Content-Type", "application/javascript")
                        self.send_header("Content-Length", len(content))
                        self.end_headers()
                        self.wfile.write(content)
                        return
                    except OSError:
                        pass
            body = b"// versionControl placeholder"
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)
            return
        if path_clean == "version.js":
            body = json.dumps({"version": "local", "build": "1"}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)
            return
        if path_clean in ("version", "version.json") or path_clean.startswith("versionControl/version"):
            body = json.dumps({"version": "local", "build": "1"}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)
            return
        # locale-pt_BR*.js - fallback: tenta jt0c6h primeiro se site_baixado falhar
        if "locale" in path_clean and path_clean.endswith(".js"):
            for base in (_DIR_OLD, DIR):
                if not os.path.isdir(base):
                    continue
                full = os.path.join(base, path_clean)
                if os.path.isfile(full):
                    try:
                        with open(full, "rb") as f:
                            content = f.read()
                        self.send_response(200)
                        self.send_header("Content-Type", "application/javascript")
                        self.send_header("Content-Length", len(content))
                        self.end_headers()
                        self.wfile.write(content)
                        return
                    except OSError:
                        pass
            # último recurso: placeholder para não quebrar o app
            body = b"export default {};"
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)
            return
        for base in (DIR, _DIR_SITE, _DIR_OLD):
            if not os.path.isdir(base):
                continue
            full = os.path.join(base, path_clean)
            if os.path.isfile(full):
                try:
                    with open(full, "rb") as f:
                        content = f.read()
                    ctype = "application/octet-stream"
                    if full.endswith(".js"):
                        ctype = "application/javascript"
                    elif full.endswith(".json"):
                        ctype = "application/json"
                    elif full.endswith((".svg", ".xml")):
                        ctype = "image/svg+xml"
                    elif full.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
                        ctype = "image/" + full.split(".")[-1].lower()
                    elif full.endswith(".css"):
                        ctype = "text/css"
                    self.send_response(200)
                    self.send_header("Content-Type", ctype)
                    self.send_header("Content-Length", len(content))
                    self.end_headers()
                    self.wfile.write(content)
                    return
                except OSError:
                    pass
        if path_clean.endswith(".svg"):
            # Proxy ionicons do unpkg quando o arquivo não existe localmente
            icon_name = path_clean.replace("svg/", "").replace(".svg", "")
            if icon_name and path_clean.startswith("svg/"):
                try:
                    url = f"https://unpkg.com/ionicons@7.1.2/dist/ionicons/svg/{icon_name}.svg"
                    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        body = resp.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "image/svg+xml")
                    self.send_header("Content-Length", len(body))
                    self.send_header("Cache-Control", "public, max-age=86400")
                    self.end_headers()
                    self.wfile.write(body)
                    return
                except Exception:
                    pass
            body = b'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"/>'
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", len(body))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_error(404, "File not found")

    def _get_mock_for_path(self, proc_path):
        """Usa JSON capturado se existir, senão mock."""
        if os.path.isdir(TRPC_DIR):
            safe = proc_path.replace(".", "_") + ".json"
            json_path = os.path.join(TRPC_DIR, safe)
            if os.path.isfile(json_path):
                try:
                    with open(json_path, encoding="utf-8") as f:
                        data = json.load(f)
                    # tRPC retorna {result: {data: {json: ...}}}
                    if isinstance(data, dict) and "result" in data:
                        return data["result"].get("data", {}).get("json", data)
                    if isinstance(data, list) and len(data) > 0:
                        return data[0].get("result", {}).get("data", {}).get("json", data)
                    return data
                except Exception:
                    pass
        p = proc_path.lower()
        if "tenant" in p and "domain" in p:
            return MOCK_DOMAIN_INFO
        if "tenant" in p and "info" in p:
            return MOCK_TENANT_INFO
        if "channel" in p:
            return MOCK_CHANNEL_INFO
        if "auth" in p and "tenant" in p:
            return MOCK_AUTH_TENANTS
        if "agency" in p:
            return MOCK_AGENCY_CONFIG
        if "marquee" in p or "carousel" in p:
            return MOCK_MARQUEE
        if "announcement" in p:
            if "loginout" in p or "logout" in p:
                return {"list": [], "value": []}
            return MOCK_ANNOUNCEMENT
        if "popular" in p:
            return MOCK_POPULAR_GAMES
        if "home" in p or "list" in p or "games" in p:
            return MOCK_LIST_RESPONSE
        return MOCK_DOMAIN_INFO

    def _handle_auth_procedure(self, proc_path, input_data):
        """Executa procedimentos de auth e retorna resultado ou erro."""
        p = proc_path.lower()
        inp = input_data or {}
        account = inp.get("account") or inp.get("username") or inp.get("phone") or inp.get("email") or ""
        password = inp.get("password") or ""

        if "login" in p:
            result = auth_backend.login(account, password, **inp)
        elif "register" in p or "signup" in p:
            result = auth_backend.register(account, password, **inp)
        elif "sendverifycode" in p or "sendverify" in p or "send_code" in p:
            result = auth_backend.send_verify_code(**inp)
        elif "verifycode" in p or "verify" in p:
            result = auth_backend.verify_code(**inp)
        else:
            return None  # fallback para mock

        if "error" in result:
            return ("error", result["error"], result.get("code", "UNKNOWN"))
        return ("ok", result, None)

    def handle_trpc(self):
        path = self.path.split("?")[0]
        procs = [x.strip() for x in path.replace("/api/frontend/trpc/", "").split(",") if x.strip()]

        # Lê body em POST (mutations: login, register)
        body_bytes = b""
        if self.command == "POST":
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                if content_len > 0:
                    body_bytes = self.rfile.read(content_len)
            except (ValueError, OSError):
                pass

        input_data = _parse_trpc_input(body_bytes) if body_bytes else None

        def get_result(proc_path, inp=None):
            p = proc_path.lower()
            # Procedimentos de auth com input (POST)
            if any(x in p for x in ["login", "register", "signup", "sendverifycode", "verifycode", "sendcode"]):
                auth_result = self._handle_auth_procedure(proc_path, inp or input_data)
                if auth_result:
                    status, data, code = auth_result
                    if status == "error":
                        return trpc_error_response(data, code or -32001)
                    return trpc_response(data)
            return trpc_response(self._get_mock_for_path(proc_path))

        if len(procs) > 1:
            results = [get_result(p) for p in procs]
            out = json.dumps(results).encode("utf-8")
        else:
            result = get_result(procs[0] if procs else "")
            out = json.dumps(result).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", len(out))
        self.end_headers()
        self.wfile.write(out)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


if __name__ == "__main__":
    os.chdir(DIR)
    server = HTTPServer(("", PORT), MockAPIHandler)
    print(f"\n  Servidor rodando em http://localhost:{PORT}/\n")
    print("  API mock ativa em /api/frontend/trpc/*")
    print("  Pressione Ctrl+C para parar\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        server.shutdown()
