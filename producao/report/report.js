/* CRP | Relatório de Detalhamento (audit-legacy) — redesign no padrão dos
   formulários CRP. Preserva o DOM, IDs, valores e integrações do Zeev;
   apenas reorganiza/apresenta (abas, accordions, cabeçalho, timeline). */
(function () {
  'use strict';
  if (window.__crpReportRedesign) return;
  window.__crpReportRedesign = true;

  var ICONS = {
    geral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><path d="M9 13h6M9 17h6"/></svg>',
    mensagens: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.6A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/></svg>',
    anexos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    historico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>'
  };

  function countRows(tableId) {
    var t = document.getElementById(tableId);
    if (!t) return 0;
    var n = 0;
    Array.prototype.forEach.call(t.querySelectorAll('tbody > tr'), function (tr) {
      if (tr.querySelector('.alert')) return;
      if (tr.children.length === 1 && tr.firstElementChild.hasAttribute('colspan') && !tr.querySelector('a,img,strong')) return;
      n++;
    });
    return n;
  }

  function initials(name) {
    var parts = String(name || '').replace(/[()]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- Cabeçalho ---------- */
  function initHeader() {
    var title = document.querySelector('.title');
    var h1 = document.querySelector('h1.huge');
    if (!title) return;

    if (!title.querySelector('.crp-hero-icon')) {
      var icon = el('span', 'crp-hero-icon');
      icon.setAttribute('aria-hidden', 'true');
      title.insertBefore(icon, title.firstChild);
    }

    if (h1 && !title.querySelector('.crp-req-badge')) {
      var m = (h1.textContent || '').match(/#\s*(\d+)/);
      if (m) {
        var badge = el('span', 'crp-req-badge', '#' + m[1]);
        h1.setAttribute('data-original', h1.textContent);
        h1.textContent = (h1.textContent || '').replace(/#\s*\d+\s*/, '').trim();
        h1.parentNode.insertBefore(badge, h1.nextSibling);
      }
    }

    // Requester vai para o lado direito do cabeçalho
    var req = document.getElementById('RequesterInfo');
    if (req && !title.querySelector('#RequesterInfo')) {
      var right = title.querySelector('.crp-hero-requester');
      if (!right) { right = el('div', 'crp-hero-requester'); title.appendChild(right); }
      right.appendChild(req);
    }

    // Card "Resumo das informações principais"
    var panelReq = document.getElementById('PanelRequester');
    if (panelReq && !panelReq.querySelector('.crp-sec-titlebar')) {
      var bar = el('div', 'crp-sec-titlebar');
      bar.appendChild(el('span', 'crp-sec-eyebrow', 'RESUMO'));
      bar.appendChild(el('h3', 'crp-sec-title', 'Informações principais'));
      panelReq.insertBefore(bar, panelReq.firstChild);
    }
  }

  /* ---------- Passo a passo: status ---------- */
  function statusClass(txt) {
    txt = String(txt || '').toLowerCase();
    if (/conclu|cancel|fechad|finaliz|concluíd/.test(txt)) return 'crp-step-done';
    if (/andamento|execu|atual|em curso|abert/.test(txt)) return 'crp-step-running';
    if (/cancel|erro|reprov|falh/.test(txt)) return 'crp-step-error';
    return 'crp-step-pending';
  }
  function setupSteps() {
    var t = document.getElementById('TableStep');
    if (!t) return;
    Array.prototype.forEach.call(t.querySelectorAll('tbody > tr'), function (tr) {
      if (tr.querySelector('[class^="table-step-col"]')) return; // linha de cabeçalho
      if (tr.classList.contains('crp-step-flagged')) return;
      tr.classList.add('crp-step-flagged');
      var cells = tr.children;
      var statusCell = tr.querySelector('.table-step-col-5') || cells[4];
      tr.classList.add(statusClass(statusCell ? statusCell.innerText : ''));
    });
  }

  /* ---------- Accordions (seções do formulário) ---------- */
  function setupAccordions() {
    var form = document.getElementById('PanelForm');
    if (!form) return;
    Array.prototype.forEach.call(form.querySelectorAll('table.form'), function (tbl) {
      var tbody = tbl.querySelector(':scope > tbody');
      if (!tbody) return;
      var groupRow = tbody.querySelector(':scope > tr.group');
      if (!groupRow) return;
      var td = groupRow.querySelector('td.group') || groupRow.firstElementChild;
      if (!td || td.getAttribute('data-crp-acc') === '1') return;
      td.setAttribute('data-crp-acc', '1');

      var fields = Array.prototype.filter.call(tbody.querySelectorAll(':scope > tr'), function (tr) {
        return !tr.classList.contains('group');
      });
      var count = fields.length;

      var q = el('span', 'crp-sec-count', count + (count === 1 ? ' campo' : ' campos'));
      var arrow = el('span', 'crp-sec-arrow');
      arrow.setAttribute('aria-hidden', 'true');
      td.appendChild(q);
      td.appendChild(arrow);
      td.setAttribute('role', 'button');
      td.tabIndex = 0;
      td.setAttribute('aria-expanded', 'true');

      function toggle() {
        var col = tbl.classList.toggle('crp-collapsed');
        td.setAttribute('aria-expanded', String(!col));
      }
      td.addEventListener('click', toggle);
      td.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------- Mensagens: avatar com iniciais ---------- */
  function setupMessages() {
    var t = document.getElementById('tblMessage');
    if (!t) return;
    Array.prototype.forEach.call(t.querySelectorAll('tbody > tr'), function (tr) {
      if (tr.querySelector('.alert')) return;
      var actor = tr.querySelector('td.actor');
      if (!actor || actor.querySelector('.crp-avatar')) return;
      var name = (actor.innerText || '').trim();
      var av = el('span', 'crp-avatar', initials(name));
      actor.insertBefore(av, actor.firstChild);
    });
  }

  /* ---------- Histórico (timeline a partir do passo a passo) ---------- */
  function buildHistorico() {
    var t = document.getElementById('TableStep');
    if (!t) return null;
    var wrap = el('div', 'crp-timeline');
    var any = false;
    Array.prototype.forEach.call(t.querySelectorAll('tbody > tr'), function (tr) {
      if (tr.querySelector('[class^="table-step-col"]')) return;
      var cells = tr.children;
      if (!cells.length) return;
      var nameEl = tr.querySelector('td:first-child strong') || cells[0];
      var name = (nameEl ? nameEl.textContent : '').trim();
      if (!name) return;
      any = true;
      var start = cells[1] ? cells[1].innerText.trim() : '';
      var end = cells[2] ? cells[2].innerText.trim() : '';
      var status = cells[4] ? cells[4].innerText.trim() : '';
      var resp = cells[5] ? cells[5].innerText.trim() : '';

      var item = el('div', 'crp-tl-item ' + statusClass(status));
      item.appendChild(el('span', 'crp-tl-dot'));
      var card = el('div', 'crp-tl-card');
      card.appendChild(el('div', 'crp-tl-task', name));
      var meta = [];
      if (start) meta.push('Início: ' + start);
      if (end) meta.push('Conclusão: ' + end);
      if (status) meta.push(status);
      if (meta.length) card.appendChild(el('div', 'crp-tl-meta', meta.join(' · ')));
      if (resp) card.appendChild(el('div', 'crp-tl-resp', resp));
      item.appendChild(card);
      wrap.appendChild(item);
    });
    if (!any) {
      var empty = el('div', 'alert', 'Sem eventos no histórico.');
      wrap.appendChild(empty);
    }
    return wrap;
  }

  /* ---------- Abas ---------- */
  function build() {
    var step = document.getElementById('PanelStep');
    var form = document.getElementById('PanelForm');
    if (!step || !form) return false;
    if (document.getElementById('crp-report-region')) return true;

    if (document.body) document.body.classList.add('crp-report');
    if (step.parentElement) step.parentElement.classList.add('crp-report-main');

    initHeader();
    setupSteps();

    var msg = document.getElementById('PanelMessage');
    var file = document.getElementById('PanelFile');
    var msgCount = countRows('tblMessage');
    var fileCount = countRows('tblFile');

    var region = el('div', 'crp-report-region');
    region.id = 'crp-report-region';
    var nav = el('div', 'crp-report-tabs');
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Seções do relatório');
    var panelsWrap = el('div', 'crp-tabpanels');

    var defs = [
      { key: 'geral', label: 'Geral', icon: 'geral', count: null },
      { key: 'mensagens', label: 'Mensagens', icon: 'mensagens', count: msgCount },
      { key: 'anexos', label: 'Anexos', icon: 'anexos', count: fileCount },
      { key: 'historico', label: 'Histórico', icon: 'historico', count: null }
    ];
    var tabs = {}, panels = {};

    defs.forEach(function (d, i) {
      var btn = el('button', 'crp-report-tab');
      btn.type = 'button';
      btn.id = 'crp-tab-' + d.key;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('data-tab', d.key);
      var ic = el('span', 'crp-tab-ic'); ic.innerHTML = ICONS[d.icon];
      btn.appendChild(ic);
      btn.appendChild(el('span', 'crp-tab-text', d.label));
      if (d.count !== null) btn.appendChild(el('span', 'crp-tab-count', String(d.count)));
      btn.addEventListener('click', function () { select(d.key); });

      var p = el('section', 'crp-tabpanel');
      p.id = 'crp-panel-' + d.key;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', btn.id);
      p.setAttribute('data-tab', d.key);
      if (i !== 0) p.setAttribute('data-hidden', '1');

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

    // Move painéis existentes (mantém IDs/eventos), com cabeçalho de card.
    var geralPanel = panels.geral;
    geralPanel.appendChild(cardHeader('RESUMO', 'Dados da solicitação'));
    geralPanel.appendChild(form);
    ['boxSignature', 'boxElectronicSignature'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b && b.parentNode) geralPanel.appendChild(b);
    });

    if (msg) {
      panels.mensagens.appendChild(cardHeader('MENSAGENS', 'Conversa da solicitação', msgCount + (msgCount === 1 ? ' mensagem' : ' mensagens')));
      panels.mensagens.appendChild(msg);
    }
    if (file) {
      panels.anexos.appendChild(cardHeader('ANEXOS', 'Arquivos da solicitação', fileCount + (fileCount === 1 ? ' arquivo' : ' arquivos')));
      panels.anexos.appendChild(file);
    }
    var tl = buildHistorico();
    panels.historico.appendChild(cardHeader('HISTÓRICO', 'Linha do tempo da solicitação'));
    if (tl) panels.historico.appendChild(tl);

    if (msgCount === 0) panels.mensagens.classList.add('crp-tabpanel-empty');
    if (fileCount === 0) panels.anexos.classList.add('crp-tabpanel-empty');

    setupAccordions();
    setupMessages();
    return true;
  }

  function cardHeader(eyebrow, title, badge) {
    var head = el('div', 'crp-card-head');
    var ic = el('span', 'crp-card-ic'); ic.setAttribute('aria-hidden', 'true');
    head.appendChild(ic);
    var texts = el('div', 'crp-card-head-text');
    texts.appendChild(el('span', 'crp-card-eyebrow', eyebrow));
    texts.appendChild(el('h3', 'crp-card-heading', title));
    head.appendChild(texts);
    if (badge) head.appendChild(el('span', 'crp-card-badge', badge));
    return head;
  }

  function start() {
    if (build()) return;
    var tries = 0;
    var t = setInterval(function () {
      if (build() || ++tries > 25) clearInterval(t);
    }, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
