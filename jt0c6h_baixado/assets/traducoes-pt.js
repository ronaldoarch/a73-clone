/**
 * Substitui placeholders de tradução (main.login, Main.Inicio, etc.) pelos nomes reais em português.
 * As traduções originais vêm da API e não estão nos arquivos estáticos.
 */
(function() {
  const TRADUCOES = {
    'main.login': 'Entrar',
    'main.signUp': 'Registrar',
    'Main.Inicio': 'Início',
    'Main.Perfil': 'Perfil',
    'Main.Menu': 'Menu',
    'Main.Entrar': 'Entrar',
    'sort.POP': 'Popular',
    'viewsTabbar.pwaView1': 'Início',
    'viewsSystem.inst': 'Instalar'
  };

  function substituirTexto(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let texto = node.textContent;
      let alterado = false;
      for (const [chave, valor] of Object.entries(TRADUCOES)) {
        if (texto.includes(chave)) {
          texto = texto.replace(new RegExp(chave.replace(/\./g, '\\.'), 'g'), valor);
          alterado = true;
        }
      }
      if (alterado) node.textContent = texto;
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
      for (const attr of ['placeholder', 'title', 'aria-label']) {
        const val = node.getAttribute(attr);
        if (val) {
          let novo = val;
          for (const [chave, valor] of Object.entries(TRADUCOES)) {
            if (novo.includes(chave)) novo = novo.replace(chave, valor);
          }
          if (novo !== val) node.setAttribute(attr, novo);
        }
      }
    }
    for (const child of node.childNodes) substituirTexto(child);
  }

  function observar() {
    substituirTexto(document.body);
    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (n.nodeType === Node.ELEMENT_NODE) substituirTexto(n);
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function iniciar() {
    observar();
    [1000, 2000, 3500].forEach(ms => setTimeout(substituirTexto.bind(null, document.body), ms));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    setTimeout(iniciar, 300);
  }
})();
