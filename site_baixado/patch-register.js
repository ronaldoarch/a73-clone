/**
 * Patch: adiciona campo Nome de usuário aos formulários de login e registro.
 */
(function() {
  'use strict';
  window.__registerAccount = '';
  window.__registerPhone = '';
  window.__loginAccount = '';

  function hasLoginForm() {
    if (!document.body) return false;
    var txt = (document.body.textContent || '').toLowerCase();
    return txt.indexOf('faça login') >= 0 || txt.indexOf('faca login') >= 0 ||
           (txt.indexOf('entrar') >= 0 && txt.indexOf('lembrar senha') >= 0) ||
           (txt.indexOf('login') >= 0 && txt.indexOf('senha') >= 0 && txt.indexOf('não tem uma conta') >= 0);
  }

  function hasRegisterForm() {
    if (!document.body) return false;
    var txt = (document.body.textContent || '').toLowerCase();
    // Não usar só "registro": no modal de login aparece "Registro R$ +99" e isso disparava inject no login.
    return txt.indexOf('crie uma conta') >= 0 || txt.indexOf('criar uma conta') >= 0 ||
           txt.indexOf('conta de jogo') >= 0 || txt.indexOf('confirmar senha') >= 0;
  }

  function getPasswordInputs() {
    var list = document.querySelectorAll('ion-input[type="password"]');
    if (list.length > 0) return list;
    var inputs = document.querySelectorAll('input[type="password"]');
    var out = [];
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      var ion = inp.closest('ion-input');
      if (!ion && inp.getRootNode && inp.getRootNode().host) {
        var host = inp.getRootNode().host;
        if (host.tagName === 'ION-INPUT') ion = host;
      }
      if (!ion) ion = inp.parentElement;
      if (ion && out.indexOf(ion) < 0) out.push(ion);
    }
    return out;
  }

  function injectRegisterFields() {
    if (window.__registerFieldsInjected) return;
    if (!hasRegisterForm()) return;
    var regCard = findRegisterCard();
    if (!regCard) return;

    if (document.querySelector('[data-a73-account-field]')) return;

    var pwdInputs = regCard.querySelectorAll('ion-input[type="password"], input[type="password"]');
    if (pwdInputs.length === 0) {
      var g = getPasswordInputs();
      for (var gi = 0; gi < g.length; gi++) {
        if (regCard.contains(g[gi])) {
          pwdInputs = [g[gi]];
          break;
        }
      }
    }
    if (pwdInputs.length === 0) return;

    var firstPwd = pwdInputs[0];
    var container = firstPwd.closest('.form-wrapper') || firstPwd.closest('form') || firstPwd.closest('ion-list') || firstPwd.closest('ion-card') || firstPwd.closest('ion-item') || firstPwd.parentElement;
    if (!container || !regCard.contains(container)) return;

    var userItem = document.createElement('div');
    userItem.setAttribute('data-a73-account-field', '1');
    userItem.className = 'item-height';
    userItem.style.cssText = 'margin-bottom:8px;display:block !important;visibility:visible !important;';
    userItem.innerHTML = '<ion-label position="stacked">Número de telefone</ion-label><ion-input type="tel" placeholder="Ex: (11) 99999-9999" data-a73-account-input inputmode="numeric"></ion-input>';
    var insertBefore = firstPwd.closest('ion-item') || firstPwd.closest('.item-height') || firstPwd.parentElement;
    if (insertBefore && insertBefore.parentNode === container) {
      container.insertBefore(userItem, insertBefore);
    } else {
      container.insertBefore(userItem, container.firstChild);
    }

    var userInput = userItem.querySelector('ion-input');
    if (userInput) {
      userInput.addEventListener('ionInput', function(e) {
        var v = (e.detail && e.detail.value) || userInput.value || '';
        window.__registerAccount = v;
        window.__registerPhone = v;
      });
      userInput.addEventListener('input', function() {
        var v = userInput.value || '';
        window.__registerAccount = v;
        window.__registerPhone = v;
      });
    }

    window.__registerFieldsInjected = true;
    ensureRegisterButtonClickable();
  }

  function ensureFormButtonsClickable() {
    var btns = document.querySelectorAll('ion-button, button, [role="button"]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var txt = (b.textContent || '').trim();
      if (txt.indexOf('Registro') >= 0 || txt.indexOf('Registrar') >= 0 || txt.indexOf('Entrar') >= 0 || txt.indexOf('Login') >= 0) {
        b.removeAttribute('disabled');
        b.classList.remove('button-disabled');
        b.style.pointerEvents = 'auto';
        b.style.cursor = 'pointer';
      }
    }
  }

  function findLoginCard() {
    var body = document.body;
    if (!body) return null;
    var all = body.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var txt = (el.textContent || '').trim();
      var isLogin = txt.indexOf('Faça login') >= 0 || txt.indexOf('Faca login') >= 0 ||
        (txt.indexOf('Entrar') >= 0 && (txt.indexOf('Lembrar Senha') >= 0 || txt.indexOf('Lembrar senha') >= 0)) ||
        (txt.indexOf('não tem uma conta') >= 0 && txt.indexOf('Crie uma conta') < 0 && txt.indexOf('Registro') >= 0);
      if (isLogin) {
        var formWrap = el.closest('.form-wrapper');
        if (formWrap) return formWrap;
        var form = el.closest('form');
        if (form) return form;
        var card = el.closest('ion-card') || el.closest('ion-card-content');
        if (card) return card;
        var modal = el.closest('ion-modal');
        if (modal) {
          var c = modal.querySelector('.form-wrapper') || modal.querySelector('form') || modal.querySelector('ion-content') || modal.querySelector('.ion-content-scroll-host');
          if (c) return c;
          return modal;
        }
        var outlet = el.closest('ion-router-outlet');
        if (outlet) {
          var c = outlet.querySelector('.form-wrapper') || outlet.querySelector('form') || outlet.querySelector('ion-card') || outlet.querySelector('ion-content');
          if (c) return c;
          return outlet;
        }
        return el.closest('[class*="card"]') || el;
      }
    }
    return null;
  }

  function loginCardHasUsernameField(card) {
    if (!card) return false;
    var labels = card.querySelectorAll('ion-label, label, [class*="label"]');
    for (var i = 0; i < labels.length; i++) {
      if (/nome de usuário|username|usuário|telefone|número de telefone/i.test((labels[i].textContent || '').trim())) return true;
    }
    var inputs = card.querySelectorAll('ion-input, input[type="text"], input[type="tel"]');
    for (var j = 0; j < inputs.length; j++) {
      var ph = (inputs[j].placeholder || inputs[j].getAttribute('placeholder') || '').toLowerCase();
      if (/nome de usuário|digite seu nome|username|telefone|99999/.test(ph)) return true;
    }
    return false;
  }

  function findVueLoginUsernameIon(card) {
    if (!card) return null;
    var ions = card.querySelectorAll('ion-input');
    for (var i = 0; i < ions.length; i++) {
      var el = ions[i];
      if (el.getAttribute && el.getAttribute('data-a73-login-account-input')) continue;
      var t = (el.getAttribute('type') || '').toLowerCase();
      if (t === 'password') continue;
      if (t === 'phone' || t === 'tel' || t === 'text' || t === 'account' || t === 'email' || !t) return el;
    }
    return null;
  }

  function setIonInputValueForVue(ionEl, val) {
    if (!ionEl) return;
    try {
      ionEl.value = val;
      var sr = ionEl.shadowRoot;
      if (sr) {
        var inp = sr.querySelector('input, textarea');
        if (inp) {
          inp.value = val;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      ionEl.dispatchEvent(new CustomEvent('ionInput', { detail: { value: val }, bubbles: true }));
    } catch (e) {}
  }

  function syncInjectedLoginIntoNativeVueField() {
    var card = findLoginCard();
    var nativeUser = findVueLoginUsernameIon(card);
    var v = window.__loginAccount || '';
    if (nativeUser && v) setIonInputValueForVue(nativeUser, v);
  }

  function hookExistingLoginUsernameField(card) {
    var inputs = card.querySelectorAll('ion-input:not([type="password"]), input[type="text"]');
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp.getAttribute && inp.getAttribute('data-a73-login-account-input')) continue;
      var ph = (inp.placeholder || (inp.getAttribute && inp.getAttribute('placeholder')) || '').toLowerCase();
      var labelEl = inp.closest('ion-item') || inp.closest('.item-height') || inp.parentElement;
      var labelNode = labelEl && (labelEl.querySelector('ion-label') || labelEl.querySelector('label'));
      var labelTxt = (labelNode && labelNode.textContent) || '';
      if (/nome de usuário|username|digite seu nome|telefone|99999/.test(ph) || /nome de usuário|username|telefone/i.test(labelTxt || '')) {
        inp.setAttribute('data-a73-login-account-input', '1');
        inp.addEventListener('ionInput', function(e) { window.__loginAccount = (e.detail && e.detail.value) || getInputValue(this) || ''; });
        inp.addEventListener('input', function() { window.__loginAccount = getInputValue(this) || ''; });
        return;
      }
    }
  }

  function injectLoginFields() {
    if (window.__loginFieldsInjected) return;
    if (!hasLoginForm()) return;

    var card = findLoginCard();
    if (!card) return;

    var nativeUserIon = findVueLoginUsernameIon(card);
    if (nativeUserIon && !(nativeUserIon.getAttribute && nativeUserIon.getAttribute('data-a73-login-account-input'))) {
      nativeUserIon.setAttribute('data-a73-login-account-input', '1');
      nativeUserIon.addEventListener('ionInput', function(e) {
        window.__loginAccount = (e.detail && e.detail.value) || getInputValue(nativeUserIon) || '';
      });
      window.__loginFieldsInjected = true;
      ensureFormButtonsClickable();
      return;
    }

    if (loginCardHasUsernameField(card)) {
      window.__loginFieldsInjected = true;
      hookExistingLoginUsernameField(card);
      ensureFormButtonsClickable();
      return;
    }

    if (document.querySelector('[data-a73-login-account-field]')) return;

    var pwdInputs = card.querySelectorAll('ion-input[type="password"], input[type="password"]');
    if (pwdInputs.length === 0) {
      var allPwds = getPasswordInputs();
      for (var pi = 0; pi < allPwds.length; pi++) {
        if (card.contains(allPwds[pi])) {
          pwdInputs = [allPwds[pi]];
          break;
        }
      }
    }
    if (pwdInputs.length === 0) return;

    var firstPwd = pwdInputs[0];
    var ionInput = firstPwd.tagName === 'ION-INPUT' ? firstPwd : firstPwd.closest('ion-input') || firstPwd.parentElement;
    var container = firstPwd.closest('.form-wrapper') || firstPwd.closest('form') || firstPwd.closest('ion-list') || firstPwd.closest('ion-card') || (ionInput && ionInput.parentElement) || firstPwd.parentElement;
    if (!container) return;

    var userItem = document.createElement('div');
    userItem.setAttribute('data-a73-login-account-field', '1');
    userItem.className = 'item-height';
    userItem.style.cssText = 'margin-bottom:8px;display:block !important;visibility:visible !important;';
    userItem.innerHTML = '<ion-label position="stacked">Telefone ou usuário</ion-label><ion-input type="text" autocomplete="username" placeholder="Ex: 11999999999 ou seu usuário" data-a73-login-account-input inputmode="text"></ion-input><p class="a73-login-hint" style="font-size:11px;opacity:0.75;margin:6px 0 0 0;line-height:1.35;">Modo local: qualquer senha com 6+ caracteres costuma ser aceite.</p>';
    var insertBefore = firstPwd.closest('ion-item') || firstPwd.closest('.item-height') || ionInput || firstPwd.parentElement;
    if (insertBefore && insertBefore.parentNode === container) {
      container.insertBefore(userItem, insertBefore);
    } else {
      container.insertBefore(userItem, container.firstChild);
    }

    var userInput = userItem.querySelector('ion-input');
    if (userInput) {
      function onOurLoginInput(val) {
        window.__loginAccount = val || '';
        syncInjectedLoginIntoNativeVueField();
      }
      userInput.addEventListener('ionInput', function(e) { onOurLoginInput((e.detail && e.detail.value) || userInput.value || ''); });
      userInput.addEventListener('input', function() { onOurLoginInput(userInput.value || ''); });
    }

    window.__loginFieldsInjected = true;
    ensureFormButtonsClickable();
  }

  function ensureRegisterButtonClickable() {
    ensureFormButtonsClickable();
  }

  function findRegisterCard() {
    var body = document.body;
    if (!body) return null;
    var all = body.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var txt = (el.textContent || '').trim();
      if (txt.indexOf('Crie uma conta de jogo') >= 0 || (txt.indexOf('Crie uma conta') >= 0 && txt.indexOf('já tem uma conta') < 0)) {
        var formWrap = el.closest('.form-wrapper');
        if (formWrap) return formWrap;
        var form = el.closest('form');
        if (form) return form;
        var card = el.closest('ion-card') || el.closest('ion-card-content');
        if (card) return card;
        var list = el.closest('ion-list');
        if (list && list.parentElement) return list.parentElement;
        var modal = el.closest('ion-modal');
        if (modal) {
          var c = modal.querySelector('.form-wrapper') || modal.querySelector('form') || modal.querySelector('ion-content') || modal.querySelector('ion-card') || modal.querySelector('ion-list') || modal.querySelector('.ion-content-scroll-host');
          if (c) return c;
          return modal;
        }
        return el.closest('[class*="card"]') || el;
      }
    }
    return null;
  }

  function injectFloatingField() {
    if (document.querySelector('#a73-username-overlay')) return;
    if (!hasRegisterForm()) return;

    var card = findRegisterCard();
    if (!card) return;

    var overlay = document.createElement('div');
    overlay.id = 'a73-username-overlay';
    overlay.setAttribute('data-a73-account-field', '1');
    overlay.className = 'item-height';
    overlay.style.cssText = 'padding:0 0 16px 0;margin:0 0 8px 0;border-bottom:1px solid rgba(255,255,255,0.08);';
    overlay.innerHTML = '<div style="color:var(--ion-text-color,#e5e7eb);font-size:12px;margin-bottom:6px;">Número de telefone</div><input type="tel" id="a73-account-input" placeholder="Ex: (11) 99999-9999" data-a73-account-input inputmode="numeric" style="width:100%;padding:12px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.3);color:var(--ion-text-color,#e5e7eb);font-size:15px;box-sizing:border-box;">';

    var list = card.querySelector('ion-list');
    var content = card.querySelector('ion-card-content');
    var form = card.querySelector('form');
    var target = list || content || form || card;
    target.insertBefore(overlay, target.firstChild);

    var inp = document.getElementById('a73-account-input');
    if (inp) inp.addEventListener('input', function() { window.__registerAccount = inp.value || ''; });
    ensureRegisterButtonClickable();
  }

  function tryMoveOverlayIntoCard() {
    var overlay = document.getElementById('a73-username-overlay');
    if (!overlay || !overlay.parentElement || overlay.parentElement.tagName !== 'BODY') return;
    var card = findRegisterCard();
    if (!card) return;
    var list = card.querySelector('ion-list');
    var content = card.querySelector('ion-card-content');
    var form = card.querySelector('form');
    var target = list || content || form || card;
    if (target && target !== overlay.parentElement) {
      overlay.style.cssText = 'padding:0 0 16px 0;margin:0 0 8px 0;border-bottom:1px solid rgba(255,255,255,0.08);';
      target.insertBefore(overlay, target.firstChild);
    }
  }

  function removeDuplicateLoginFields() {
    var fields = document.querySelectorAll('[data-a73-login-account-field]');
    for (var i = 1; i < fields.length; i++) {
      fields[i].parentNode && fields[i].parentNode.removeChild(fields[i]);
    }
  }

  function tryInject() {
    removeDuplicateLoginFields();
    injectLoginFields();
    injectRegisterFields();
    if (!document.querySelector('[data-a73-account-field]')) {
      injectFloatingField();
    } else {
      tryMoveOverlayIntoCard();
    }
    ensureFormButtonsClickable();
  }

  function getInputValue(el) {
    if (!el) return '';
    var v = el.value;
    if (v !== undefined && v !== null && v !== '') return String(v);
    var input = el.querySelector && el.querySelector('input');
    if (input && input.value) return input.value;
    if (el.shadowRoot) {
      input = el.shadowRoot.querySelector('input');
      if (input && input.value) return input.value;
    }
    return el.getAttribute && el.getAttribute('value') || '';
  }

  function getLoginAccount() {
    return window.__loginAccount || getInputValue(document.querySelector('ion-input[data-a73-login-account-input]')) ||
      (document.getElementById('a73-login-account-input') && document.getElementById('a73-login-account-input').value) || '';
  }

  function applyRegisterSuccessAndLogin(data, account) {
    try {
      var d = data;
      if (d && d.result && d.result.data && d.result.data.json) d = d.result.data.json;
      var payload = d && d.data && typeof d.data === 'object' && d.data.token ? d.data : d;
      if (payload && payload.token) {
        localStorage.setItem('token', payload.token);
        localStorage.setItem('account', (payload.user && payload.user.account) || account || '');
        if (typeof window.__a73RedirectAfterRegister === 'function') {
          window.__a73RedirectAfterRegister();
        } else {
          window.location.href = (window.location.pathname || '').replace(/\/?(main\/)?(register|registro).*$/i, '') + '/main/inicio/';
        }
      }
    } catch (e) {}
  }

  var origFetch = window.fetch;
  window.fetch = function(url, opts) {
    opts = opts || {};
    var urlStr = typeof url === 'string' ? url : (url && url.url) || '';
    var methodUp = String(opts.method || 'GET').toUpperCase();
    var isRegister = urlStr.toLowerCase().indexOf('register') >= 0 || urlStr.toLowerCase().indexOf('signup') >= 0;
    if (urlStr.indexOf('trpc') >= 0 && methodUp === 'POST' && opts.body) {
      try {
        syncInjectedLoginIntoNativeVueField();
        var body = typeof opts.body === 'string' ? opts.body : (opts.body && typeof opts.body.toString === 'function' ? opts.body.toString() : '');
        var data = JSON.parse(body);
        var procs = [];
        var m = (urlStr || '').match(/trpc\/([^?&#]+)/);
        if (m) procs = m[1].split(',').map(function(p) { return (p || '').trim().toLowerCase(); });

        var pwdMismatch = false;
        function patchInput(inp, isLogin, isReg) {
          if (!inp || typeof inp !== 'object' || Array.isArray(inp)) return;
          if (isLogin) {
            var loginAcc = getLoginAccount() || inp.account || inp.username || inp.phone || '';
            if (loginAcc) {
              inp.account = inp.username = loginAcc;
              try { window.__a73LastLoginAccount = loginAcc; } catch (e) {}
            }
          } else if (isReg) {
            var acc = window.__registerPhone || window.__registerAccount || getInputValue(document.querySelector('ion-input[data-a73-account-input]')) || (document.getElementById('a73-account-input') && document.getElementById('a73-account-input').value) || '';
            if (acc) {
              inp.account = inp.username = inp.phone = acc;
              try { window.__a73LastLoginAccount = acc; } catch (e2) {}
            }
            var pwdInputs = document.querySelectorAll('ion-input[type="password"], input[type="password"]');
            if (pwdInputs.length >= 2) {
              var pwd = inp.password || getInputValue(pwdInputs[0].closest ? pwdInputs[0].closest('ion-input') || pwdInputs[0] : pwdInputs[0]);
              var conf = getInputValue(pwdInputs[1].closest ? pwdInputs[1].closest('ion-input') || pwdInputs[1] : pwdInputs[1]);
              if (pwd && conf && pwd !== conf) pwdMismatch = true;
              inp.confirmPassword = inp.confirm_password = conf;
            }
          }
        }

        function patchOneItem(item, index) {
          if (!item || typeof item !== 'object' || !item.json) return;
          var proc = procs[index] || procs[0] || '';
          var isLogin = proc.indexOf('login') >= 0 && proc.indexOf('register') < 0 && proc.indexOf('signup') < 0;
          var isReg = proc.indexOf('register') >= 0 || proc.indexOf('signup') >= 0;
          patchInput(item.json, isLogin, isReg);
        }

        if (Array.isArray(data)) {
          for (var ai = 0; ai < data.length; ai++) patchOneItem(data[ai], ai);
        } else if (data['0'] && data['0'].json) {
          for (var k in data) {
            if (data.hasOwnProperty(k) && data[k] && data[k].json) {
              var proc = procs[parseInt(k, 10)];
              var isLogin = proc && proc.indexOf('login') >= 0 && proc.indexOf('register') < 0 && proc.indexOf('signup') < 0;
              var isReg = proc && (proc.indexOf('register') >= 0 || proc.indexOf('signup') >= 0);
              patchInput(data[k].json, isLogin, isReg);
            }
          }
        } else {
          var inp = data.json || data;
          var isLogin = urlStr.indexOf('login') >= 0 && urlStr.indexOf('register') < 0 && urlStr.indexOf('signup') < 0;
          var isReg = urlStr.indexOf('register') >= 0 || urlStr.indexOf('signup') >= 0;
          patchInput(inp, isLogin, isReg);
        }
        if (pwdMismatch) {
          return Promise.reject(new Error('As senhas não coincidem'));
        }
        opts.body = JSON.stringify(data);
      } catch (e) {}
    }
    var account = window.__registerPhone || window.__registerAccount || '';
    return origFetch.apply(this, arguments).then(function(res) {
      if (isRegister && res.ok) {
        var clone = res.clone();
        res.json().then(function(json) {
          applyRegisterSuccessAndLogin(json, account);
        }).catch(function() {});
        return clone;
      }
      return res;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInject);
  } else {
    tryInject();
  }
  setTimeout(tryInject, 500);
  setTimeout(tryInject, 1200);
  setTimeout(tryInject, 2500);
  setTimeout(tryInject, 5000);
  setTimeout(tryInject, 8000);
  setTimeout(tryInject, 12000);
  setTimeout(tryInject, 20000);
  if (typeof MutationObserver !== 'undefined') {
    function startObs() {
      var root = document.body || document.documentElement;
      if (!root) return;
      var obs = new MutationObserver(function() { tryInject(); });
      obs.observe(root, { childList: true, subtree: true });
      setTimeout(function() { obs.disconnect(); }, 60000);
    }
    if (document.body) startObs();
    else document.addEventListener('DOMContentLoaded', startObs);
  }
  document.addEventListener('ionModalDidPresent', function() { setTimeout(tryInject, 100); });
  document.addEventListener('ionModalWillPresent', function() { setTimeout(tryInject, 300); });
  document.addEventListener('click', function(ev) {
    var btn = ev.target && ev.target.closest && ev.target.closest('ion-button');
    if (!btn) return;
    var tx = (btn.textContent || '').trim();
    if (tx.indexOf('Entrar') >= 0 || tx.indexOf('Login') >= 0 || /^entrar$/i.test(tx)) {
      syncInjectedLoginIntoNativeVueField();
    }
  }, true);
})();
