# Como resolver os erros do console

## Erros atuais
- `Cannot read properties of undefined (reading 'filter')` em `requestPopularGames`
- `Cannot read properties of undefined (reading 'map')` em `requestHomeGames`
- `o.content.reduce is not a function` em `loadCarouselList` / `requestMarqueeList`

## Solução 1: Servidor Proxy (recomendado)

O servidor proxy tenta buscar dados **reais** do site jt0c6h.com. Se conseguir, os erros devem desaparecer.

```bash
cd /Volumes/midascod/chinesa
python3 server-proxy.py
```

Acesse: **http://localhost:3001/main/inicio/**

> Se o proxy não conseguir conectar ao site (bloqueio, timeout), ele usa mocks locais.

## Solução 2: Capturar respostas do site

Se o proxy não funcionar, capture as respostas manualmente:

1. Abra **https://jt0c6h.com/main/inicio/** no Chrome
2. Abra DevTools (F12) → aba **Network**
3. Filtre por `trpc`
4. Recarregue a página
5. Para cada requisição (`home.list`, `home.popularGames`, `carouselConfig.list`):
   - Clique na requisição
   - Aba **Response** → copie o JSON
6. Envie as respostas para atualizar os mocks em `server.py`

Ou: clique direito na lista → **Save all as HAR with content** e envie o arquivo.

## Solução 3: Servidor mock (atual)

```bash
python3 server.py
```

Acesse: **http://localhost:3000/main/inicio/**

Os mocks podem não corresponder exatamente ao que o app espera, causando os erros.

## Página de ajuda

Abra `capture-api.html` no navegador para ver as instruções completas de captura.
