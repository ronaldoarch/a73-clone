#!/usr/bin/env python3
"""
Baixa o site jt0c6h.com completo: HTML, CSS, JS, imagens, fontes, rotas e tRPC.
"""

import hashlib
import json
import os
import re
import ssl
import urllib.request
import urllib.parse
from pathlib import Path

BASE = "https://jt0c6h.com"
# Domínios externos para imagens/assets
UPLOAD_BASE = "https://upload-us.i-j-2-k.com"
OUT_DIR = Path(__file__).parent / "site_baixado"
TRPC_DIR = OUT_DIR / "api_trpc"  # Respostas tRPC salvas
EXTERNAL_DIR = OUT_DIR / "external"  # Assets de outros domínios

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Referer": f"{BASE}/main/inicio/",
}

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

downloaded = set()
url_to_local = {}  # URL original -> caminho local


def url_join(base, path):
    if path.startswith("http"):
        return path
    if path.startswith("//"):
        return "https:" + path
    if path.startswith("/"):
        if base.startswith(BASE):
            return BASE + path
        parsed = urllib.parse.urlparse(base)
        return f"{parsed.scheme}://{parsed.netloc}{path}"
    return urllib.parse.urljoin(base, path)


def path_for_url(url):
    """Converte URL em caminho local (apenas jt0c6h.com)."""
    if not url.startswith(BASE):
        return None
    path = url[len(BASE):].lstrip("/").split("?")[0]
    if not path:
        path = "index.html"
    elif "." not in path.split("/")[-1]:
        path = path.rstrip("/") + "/index.html"
    return OUT_DIR / path


def path_for_external(url):
    """Salva assets externos (upload-us, etc) em external/ com hash."""
    if "data:" in url or "javascript:" in url.lower():
        return None
    if not url.startswith("http"):
        return None
    # Extrai extensão
    path = urllib.parse.urlparse(url).path
    ext = Path(path).suffix or ".bin"
    if ext not in (".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".svg", ".css", ".js"):
        ext = ".bin"
    h = hashlib.md5(url.encode()).hexdigest()[:12]
    return EXTERNAL_DIR / f"{h}{ext}"


def fetch(url, binary=False):
    if url in downloaded:
        return None
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20, context=ssl_ctx) as r:
            data = r.read()
            downloaded.add(url)
            return data if binary else data.decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  [ERRO] {url[:70]}...: {e}")
        return None


def extract_urls(text, base_url):
    """Extrai todas as URLs de HTML, CSS ou JS."""
    urls = []
    # href, src
    for m in re.finditer(r'(?:href|src)=["\']([^"\']+)["\']', text, re.I):
        urls.append(url_join(base_url, m.group(1)))
    # url() em CSS
    for m in re.finditer(r'url\(["\']?([^"\')\s]+)["\']?\)', text):
        urls.append(url_join(base_url, m.group(1)))
    # @import em CSS
    for m in re.finditer(r'@import\s+["\']([^"\']+)["\']', text):
        urls.append(url_join(base_url, m.group(1)))
    # URLs em strings JS (https://...)
    for m in re.finditer(r'["\'](https?://[^"\']+)["\']', text):
        u = m.group(1).split("?")[0]
        if any(x in u for x in [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".woff", ".woff2", ".css", ".js"]):
            urls.append(u)
    return urls


def save_file(url, data, binary=False):
    path = path_for_url(url)
    if path and str(path).startswith(str(OUT_DIR)):
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            f.write(data if isinstance(data, bytes) else data.encode("utf-8"))
        print(f"  OK: {path.relative_to(OUT_DIR)}")
        url_to_local[url] = str(path.relative_to(OUT_DIR))
        return True
    # Asset externo (upload-us, etc)
    path = path_for_external(url)
    if path:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            f.write(data if isinstance(data, bytes) else data.encode("utf-8"))
        rel = path.relative_to(OUT_DIR)
        print(f"  OK (ext): {rel}")
        url_to_local[url] = str(rel)
        return True
    return False


def download_pages():
    pages = [
        "/",
        "/main/inicio/",
        "/main/inicio",
        "/main/",
        "/admin/",
        "/launch",
        "/launch/",
    ]
    all_assets = []
    for page in pages:
        url = BASE + page if page.startswith("/") else BASE + "/" + page
        url = url.rstrip("/") if "?" not in url else url
        if not url.endswith("/") and not url.endswith(".html"):
            url = url + "/"
        print(f"\n[Página] {url}")
        html = fetch(url)
        if not html:
            continue
        path = path_for_url(url)
        if path:
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"  OK: {path.relative_to(OUT_DIR)}")
        all_assets.extend(extract_urls(html, url))
    return all_assets


def should_download(url):
    """Só baixa de domínios conhecidos."""
    if not url.startswith("http"):
        return False
    allowed = (BASE, UPLOAD_BASE, "https://fonts.googleapis.com", "https://fonts.gstatic.com")
    return any(url.startswith(d) for d in allowed)


MAX_ASSETS = 200  # Limite para evitar loops infinitos

def download_assets(asset_urls):
    """Baixa CSS, JS, imagens."""
    seen = set()
    queue = [u for u in asset_urls if should_download(u)][:MAX_ASSETS]
    count = 0
    while queue and count < MAX_ASSETS:
        url = queue.pop(0)
        if url in seen or "data:" in url or "javascript:" in url.lower():
            continue
        seen.add(url)
        count += 1
        ext = url.split("?")[0].lower()
        binary = ext.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".svg"))
        data = fetch(url, binary=binary)
        if not data:
            continue
        if save_file(url, data, binary=binary):
            # Só extrair mais URLs de CSS (JS minificado tem muitas URLs)
            if not binary and isinstance(data, str) and ".css" in url and len(seen) < MAX_ASSETS:
                for u in extract_urls(data, url):
                    if u not in seen and should_download(u):
                        queue.append(u)
                        seen.add(u)
    return True


def capturar_trpc():
    """Captura respostas da API tRPC do site e salva em JSON."""
    TRPC_DIR.mkdir(parents=True, exist_ok=True)
    # Endpoints conhecidos (batch ou individual)
    endpoints = [
        "tenant.domainInfo",
        "tenant.tenantInfo",
        "channel.info",
        "channel.authTenants",
        "home.list",
        "home.popularGames",
        "home.hot",
        "home.marquee",
        "carouselConfig.list",
        "banner.list",
        "banner.quickEntryListPublic",
        "mainMedia.list",
        "activity.listPublic",
        "tenant.footerText",
    ]
    print("\n[Capturando tRPC]")
    for proc in endpoints:
        path = f"/api/frontend/trpc/{proc}"
        url = BASE + path
        try:
            req = urllib.request.Request(url, headers={
                **HEADERS,
                "Accept": "application/json",
                "Referer": f"{BASE}/main/inicio/",
            })
            with urllib.request.urlopen(req, timeout=15, context=ssl_ctx) as r:
                data = r.read().decode("utf-8")
                try:
                    json_data = json.loads(data)
                    safe_name = proc.replace(".", "_")
                    out_file = TRPC_DIR / f"{safe_name}.json"
                    with open(out_file, "w", encoding="utf-8") as f:
                        json.dump(json_data, f, ensure_ascii=False, indent=2)
                    print(f"  OK: {proc} -> {out_file.name}")
                except json.JSONDecodeError:
                    print(f"  [ERRO] {proc}: resposta não é JSON")
        except Exception as e:
            print(f"  [ERRO] {proc}: {e}")


def main():
    OUT_DIR.mkdir(exist_ok=True)
    EXTERNAL_DIR.mkdir(exist_ok=True)
    print("Baixando site jt0c6h.com (HTML, CSS, JS, imagens, rotas, tRPC)...\n")

    # 1. Páginas e assets do HTML
    assets = download_pages()

    # 2. Baixar assets (inclui recursão em CSS)
    download_assets(assets)

    # 3. Garantir assets comuns
    common = [
        "/assets/index-RQXNJvc3.js", "/assets/index-hk6yhvJm.js",
        "/assets/index-BZnNaqyU.css", "/assets/index-C_XsgnYD.css",
        "/assets/vendor_modules-HIjYY0tk.js", "/assets/vendor_modules-CB8zapD8.js",
        "/assets/polyfills-legacy-BW7b0pCl.js", "/assets/index-legacy-C4d4KC_N.js",
        "/sw.produce.min.2.1.6.js",
    ]
    for a in common:
        url = BASE + a
        if url not in downloaded:
            data = fetch(url, binary=a.endswith((".png", ".jpg", ".ico")))
            if data:
                save_file(url, data, binary=a.endswith((".png", ".jpg", ".ico")))

    # 4. Capturar respostas tRPC
    capturar_trpc()

    # 5. Salvar mapa URL->local para referência
    map_file = OUT_DIR / "url_map.json"
    with open(map_file, "w", encoding="utf-8") as f:
        json.dump(url_to_local, f, indent=2)
    print(f"\n  Mapa de URLs salvo em {map_file.name}")

    print(f"\nConcluído! Arquivos em: {OUT_DIR}")
    print(f"  - HTML/CSS/JS: raiz e subpastas")
    print(f"  - Imagens externas: {EXTERNAL_DIR.name}/")
    print(f"  - Respostas tRPC: {TRPC_DIR.name}/")


if __name__ == "__main__":
    main()
