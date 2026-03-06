# Site jt0c6h.com - Versão Offline

## O que foi baixado

- **HTML** – Todas as rotas: `/`, `/main/inicio/`, `/main/`, `/admin/`, `/launch/`
- **CSS** – Estilos (index, vendor_modules)
- **JS** – Scripts da aplicação (index, vendor, polyfills, legacy)
- **Imagens** – Ícones e imagens externas em `external/`
- **tRPC** – Respostas da API (quando capturadas via proxy)

## Como usar

### 1. Baixar tudo de novo

```bash
python3 baixar_site.py
```

Isso baixa:
- Páginas HTML
- CSS, JS e assets referenciados
- Imagens de upload-us.i-j-2-k.com
- Tenta capturar tRPC (pode falhar com 403)

### 2. Rodar modo offline (mock)

```bash
python3 server.py
```

Acesse: http://localhost:3000/main/inicio/

- Serve os arquivos de `site_baixado/`
- API mock em `/api/frontend/trpc/*`
- **Backend de auth**: login e cadastro funcionam localmente (dados em `users.json`)
- Se existir `site_baixado/api_trpc/*.json`, usa esses dados em vez dos mocks

### 3. Rodar com proxy (dados reais + captura)

```bash
python3 server-proxy.py
```

Acesse: http://localhost:3001/main/inicio/

- Faz proxy das requisições tRPC para jt0c6h.com
- **Salva** as respostas em `site_baixado/api_trpc/` para uso offline
- Depois de navegar um pouco, rode `server.py` para usar os dados capturados

### 4. Capturar tRPC manualmente

1. Rode `server-proxy.py`
2. Abra http://localhost:3001/main/inicio/
3. Navegue pela página (início, jogos, etc.)
4. As respostas tRPC serão salvas em `site_baixado/api_trpc/`
5. Pare o proxy e rode `server.py` – ele usará os JSON capturados

## Estrutura

```
site_baixado/
├── index.html
├── main/inicio/index.html
├── main/index.html
├── admin/index.html
├── launch/index.html
├── assets/          # CSS, JS
├── external/        # Imagens de outros domínios
├── api_trpc/        # Respostas tRPC (quando capturadas)
└── url_map.json     # Mapa URL → arquivo local
```

## Erros comuns

- **403 na captura tRPC** – A API bloqueia requisições diretas. Use o proxy (server-proxy) e acesse pelo navegador.
- **Página preta** – Verifique o console (F12) e a aba Network para erros de API.
- **Imagens quebradas** – Algumas imagens podem estar em CDNs que bloqueiam. Os arquivos em `external/` são as que foram baixadas.
