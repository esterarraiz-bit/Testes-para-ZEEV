/* CRP | Relatório de Detalhamento (audit-legacy) — redesign por abas.
   Mantém o cabeçalho e o "Passo a passo"; move os painéis existentes para
   três abas (Resumo/Formulário, Mensagens, Anexos) SEM recriar conteúdo,
   preservando IDs, classes, eventos e integrações do Zeev. */
(function () {
  'use strict';
  if (window.__crpReportRedesign) return;

  function countRows(tableId) {
    var t = document.getElementById(tableId);
    if (!t) return 0;
    var n = 0;
    Array.prototype.forEach.call(t.querySelectorAll('tbody > tr'), function (tr) {
      if (tr.querySelector('.alert')) return; // linha de "não existem..."
      if (tr.querySelector('td[colspan]') && tr.children.length === 1 && !tr.querySelector('a,img,strong')) return;
      n++;
    });
    return n;
  }

  function build() {
    var step = document.getElementById('PanelStep');
    var form = document.getElementById('PanelForm');
    if (!step || !form) return false;
    if (document.getElementById('crp-report-region')) return true;

    if (document.body) document.body.classList.add('crp-report');
    if (step.parentElement) step.parentElement.classList.add('crp-report-main');

    var msg = document.getElementById('PanelMessage');
    var file = document.getElementById('PanelFile');

    var region = document.createElement('div');
    region.id = 'crp-report-region';
    region.className = 'crp-report-region';

    var nav = document.createElement('div');
    nav.className = 'crp-report-tabs';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Seções do relatório');

    var panelsWrap = document.createElement('div');
    panelsWrap.className = 'crp-tabpanels';

    var defs = [
      { key: 'resumo', label: 'Resumo', panel: 'crp-panel-resumo', count: null },
      { key: 'mensagens', label: 'Mensagens', panel: 'crp-panel-mensagens', count: countRows('tblMessage') },
      { key: 'anexos', label: 'Anexos', panel: 'crp-panel-anexos', count: countRows('tblFile') }
    ];

    var tabs = {};
    var panels = {};

    defs.forEach(function (d, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'crp-report-tab';
      btn.id = 'crp-tab-' + d.key;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('data-tab', d.key);
      var txt = document.createElement('span');
      txt.className = 'crp-tab-text';
      txt.textContent = d.label;
      btn.appendChild(txt);
      if (d.count !== null) {
        var c = document.createElement('span');
        c.className = 'crp-tab-count';
        c.textContent = String(d.count);
        btn.appendChild(c);
      }

      var p = document.createElement('section');
      p.className = 'crp-tabpanel';
      p.id = d.panel;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', btn.id);
      p.setAttribute('data-tab', d.key);
      if (i !== 0) p.setAttribute('data-hidden', '1');

      btn.addEventListener('click', function () { select(d.key); });

      nav.appendChild(btn);
      panelsWrap.appendChild(p);
      tabs[d.key] = btn;
      panels[d.key] = p;
    });

    function select(key) {
      defs.forEach(function (d) {
        var active = d.key === key;
        tabs[d.key].setAttribute('aria-selected', active ? 'true' : 'false');
        if (active) panels[d.key].removeAttribute('data-hidden');
        else panels[d.key].setAttribute('data-hidden', '1');
      });
    }

    region.appendChild(nav);
    region.appendChild(panelsWrap);
    step.parentNode.insertBefore(region, step.nextSibling);

    // Move os painéis existentes (mantém IDs/eventos). Os títulos internos
    // "Formulário/Mensagens/Anexos" são ocultados via CSS (as abas já rotulam).
    panels.resumo.appendChild(form);
    if (msg) panels.mensagens.appendChild(msg);
    if (file) panels.anexos.appendChild(file);

    // Certificado/Assinatura (se existirem) entram no Resumo, ao final.
    ['boxSignature', 'boxElectronicSignature'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b && b.parentNode) panels.resumo.appendChild(b);
    });

    // Marca painéis vazios (para eventual estado "vazio" via CSS).
    if (defs[1].count === 0) panels.mensagens.classList.add('crp-tabpanel-empty');
    if (defs[2].count === 0) panels.anexos.classList.add('crp-tabpanel-empty');

    return true;
  }

  function start() {
    if (build()) return;
    var tries = 0;
    var t = setInterval(function () {
      if (build() || ++tries > 25) clearInterval(t);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
