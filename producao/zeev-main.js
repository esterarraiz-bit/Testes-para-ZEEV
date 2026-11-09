(function(){
  var tries = 0;

  function estilizarLogin(){
    if(!location.href.includes('/login')) return;
    if(document.getElementById('crp-login-style')) return;
    var style = document.createElement('style');
    style.id = 'crp-login-style';
    style.textContent =
      'body.login { background: linear-gradient(135deg, #0a1e5e 0%, #1a3fa0 40%, #2563eb 100%) !important; margin: 0 !important; min-height: 100vh !important; }' +
      '.desktop-content-view { display: none !important; }' +
      '.col-12.col-lg-4 { flex: 0 0 100% !important; max-width: 100% !important; display: flex !important; justify-content: center !important; align-items: center !important; min-height: 100vh !important; }' +
      '.login-form { max-width: 480px !important; width: calc(100% - 32px) !important; border-radius: 16px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important; background: #fff !important; padding: 28px 24px !important; margin: 16px !important; }' +
      '.login-form .view-scroll-behavior { max-height: none !important; overflow: visible !important; }' +
      '.logo-field { margin-bottom: 12px !important; }' +
      '#bv-l { margin-bottom: 12px !important; }' +
      '@media(max-width:500px){ .login-form { max-width: 100% !important; border-radius: 12px !important; padding: 20px 16px !important; } }';
    document.head.appendChild(style);
  }

  // Toast/notificações do Zeev no padrão CRP (a página topo não carrega o
  // zeev-default.css, por isso o estilo é injetado aqui).
  function estilizarNotificacoes(){
    if(document.getElementById('crp-notif-style')) return;
    var style = document.createElement('style');
    style.id = 'crp-notif-style';
    style.textContent =
      '.notification-system{background:#FFFFFF !important;color:#22304F !important;border:1px solid #E3E8F3 !important;border-left:4px solid #1F3F8E !important;border-radius:12px !important;box-shadow:0 10px 30px rgba(31,63,142,.16) !important;padding:14px 18px 14px 16px !important;font-family:Roboto,"Segoe UI",Arial,sans-serif !important;font-size:14px !important;line-height:1.5 !important;}' +
      '.notification-system.alert-success{border-left-color:#2E7D32 !important;}' +
      '.notification-system.alert-danger,.notification-system.alert-error{border-left-color:#C62828 !important;}' +
      '.notification-system.alert-warning{border-left-color:#F6A730 !important;}' +
      '.notification-system.alert-info{border-left-color:#1F3F8E !important;}' +
      '.notification-system strong,.notification-system b,.notification-system .notification-title,.notification-system .title{color:#1F3F8E !important;font-weight:700 !important;}' +
      '.notification-system .close,.notification-system .notification-close{color:#5B6B8C !important;opacity:.8 !important;text-shadow:none !important;}';
    document.head.appendChild(style);
  }

  // Relatórios (/report/*): aplica as cores da CRP (azul #2A4B8D,
  // vermelho #E6373B, laranja #F6A730). Só nas páginas de relatório.
  function estilizarRelatorios(){
    if(!/^\/report(\/|$)/.test(location.pathname)) return;
    if(document.body && document.body.classList) document.body.classList.add('crp-report');
    if(document.getElementById('crp-report-style')) return;
    var style = document.createElement('style');
    style.id = 'crp-report-style';
    style.textContent =
      'body.crp-report{background:#F5F7FC !important;color:#22304F !important;font-family:Roboto,"Segoe UI",Arial,sans-serif !important;}' +
      'body.crp-report .dock-main{background:#F5F7FC !important;}' +
      'body.crp-report h1,body.crp-report h2,body.crp-report h3,body.crp-report h4,body.crp-report h5{color:#2A4B8D !important;font-weight:700 !important;}' +
      'body.crp-report a{color:#2A4B8D !important;}' +
      'body.crp-report .btn{border-radius:10px !important;font-weight:600 !important;box-shadow:none !important;}' +
      'body.crp-report .btn-primary{--bs-btn-bg:#2A4B8D;--bs-btn-border-color:#2A4B8D;--bs-btn-hover-bg:#223E77;--bs-btn-hover-border-color:#223E77;--bs-btn-active-bg:#223E77;--bs-btn-active-border-color:#223E77;--bs-btn-color:#fff;--bs-btn-hover-color:#fff;background:#2A4B8D !important;border-color:#2A4B8D !important;color:#fff !important;}' +
      'body.crp-report .btn-outline-secondary{--bs-btn-color:#2A4B8D;--bs-btn-border-color:#C7D4EA;--bs-btn-hover-color:#2A4B8D;--bs-btn-hover-bg:#E4ECFB;--bs-btn-hover-border-color:#2A4B8D;--bs-btn-active-color:#2A4B8D;--bs-btn-active-bg:#E4ECFB;--bs-btn-active-border-color:#2A4B8D;color:#2A4B8D !important;border-color:#C7D4EA !important;background-color:#FFFFFF !important;}' +
      'body.crp-report .btn-outline-danger{--bs-btn-color:#E6373B;--bs-btn-border-color:#E6373B;--bs-btn-hover-bg:#FDECEC;--bs-btn-hover-color:#C62828;--bs-btn-hover-border-color:#C62828;color:#E6373B !important;border-color:#E6373B !important;background:#fff !important;}' +
      'body.crp-report .form-control,body.crp-report .form-select{border:1px solid #E3E8F3 !important;border-radius:8px !important;}' +
      'body.crp-report .form-control:focus,body.crp-report .form-select:focus{border-color:#2A4B8D !important;outline:3px solid rgba(42,75,141,.15) !important;box-shadow:none !important;}' +
      'body.crp-report table.table thead th,body.crp-report table.instance-list thead th{background:#F5F7FC !important;color:#5B6B8C !important;text-transform:uppercase !important;font-size:11px !important;letter-spacing:.04em !important;font-weight:600 !important;border-bottom:1px solid #E3E8F3 !important;}' +
      'body.crp-report table.table tbody td{border-color:#EEF1F7 !important;color:#22304F !important;}' +
      'body.crp-report table.table tbody tr:hover>*{background:#F5F9FF !important;}' +
      'body.crp-report .badge.bg-primary{background:#2A4B8D !important;}' +
      'body.crp-report .btn-link.link-secondary,body.crp-report .btn-dock-header{color:#2A4B8D !important;}';
    document.head.appendChild(style);
  }

  function inserirLogin(){
    if(!location.href.includes('/login') || document.getElementById('bv-l')) return;
    var form = document.querySelector('form');
    if(!form){ if(++tries < 12) setTimeout(inserirLogin, 300); return; }
    var d = document.createElement('div');
    d.id = 'bv-l';
    d.style.cssText = 'background:#f0f4ff;border:1px solid #dde6ff;border-radius:10px;padding:14px 16px;margin:0 0 16px;text-align:center';
    d.innerHTML = '<p style="margin:0 0 10px;color:#6b7280;font-size:.84em;line-height:1.5">Use seu e-mail corporativo para acessar a plataforma de processos.</p><span style="background:#fff;border:1px solid #c7d7ff;border-radius:8px;padding:10px 12px;color:#1d4ed8;font-size:.82em;font-weight:500;display:block">Clique em <strong>"Entrar com Microsoft" abaixo</strong></span>';
    form.insertAdjacentElement('beforebegin', d);
  }

  function inserirSuporte(){
    if(location.href.includes('/login') || document.getElementById('s360')) return;

    var URL_SUPORTE = 'https://suporte360.crptecnologia.com.br/tickets';
    var ICONE = 'https://automacaocrptech.github.io/zeev-assets/producao/icons/logo_suporte.svg';

    // Interface nova: menu lateral "dock"
    var novo = document.getElementById('reportMy');
    if(novo){
      var link = document.createElement('a');
      link.id = 's360';
      link.className = 'dock-menu-group-title dock-menu-primary-section collapsed';
      link.href = URL_SUPORTE;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('data-title', 'Suporte360');
      link.innerHTML =
        '<span class="position-relative d-flex align-items-start">' +
          '<span>' +
            '<img id="s360_icon" class="collapse-show" src="' + ICONE + '" style="width:20px;height:20px;display:block">' +
            '<img class="collapse-hide me-2" src="' + ICONE + '" style="width:20px;height:20px;display:block">' +
          '</span>' +
          '<span class="collapse-hide text-truncate">Suporte360</span>' +
        '</span>';

      // Insere depois do tooltip que acompanha "Acompanhar solicitações"
      var apos = novo.nextElementSibling;
      if(!apos || apos.tagName.toLowerCase() !== 'wc-tooltip') apos = novo;
      apos.after(link);

      var tip = document.createElement('wc-tooltip');
      tip.setAttribute('target', '#s360_icon');
      tip.setAttribute('content', 'Suporte360');
      link.after(tip);
      return;
    }

    // Interface antiga
    var ids = ['aSideMenuMyRequests','aSideMenuMyTasks','aSideMenuStartApplication'];
    var ref = null;
    for(var i = 0; i < ids.length; i++){ ref = document.getElementById(ids[i]); if(ref) break; }
    if(!ref) return;
    var parent = ref.parentElement;
    var clone = parent.cloneNode(false);
    var a = document.createElement('a');
    a.id = 's360';
    a.className = 'nav-link';
    a.href = URL_SUPORTE;
    a.target = '_blank';
    a.innerHTML = '<img src="' + ICONE + '" style="width:24px;height:24px;vertical-align:middle;margin-right:10px"> Suporte360 <svg class="ico-right ico-sm" focusable="true"><use xlink:href="#right"></use></svg>';
    clone.appendChild(a);
    parent.after(clone);
  }

  new MutationObserver(function(){ estilizarLogin(); estilizarNotificacoes(); estilizarRelatorios(); inserirLogin(); inserirSuporte(); }).observe(document.body, {childList: true, subtree: true});
  estilizarLogin();
  estilizarNotificacoes();
  estilizarRelatorios();
  setTimeout(inserirLogin, 600);
  setTimeout(inserirSuporte, 1000);
})();
