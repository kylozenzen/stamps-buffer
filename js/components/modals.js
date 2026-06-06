'use strict';

var _M = {
  wrap:  'padding:14px 16px 6px',
  title: 'font-size:16px;font-weight:700;color:#fafafa;margin:0 0 2px;letter-spacing:-0.02em;font-family:Space Grotesk,sans-serif',
  sub:   'font-size:12px;color:rgba(250,250,250,0.4);margin:0 0 14px',
  label: 'font-size:11px;font-weight:600;color:rgba(250,250,250,0.5);display:block;margin-bottom:3px;font-family:Space Grotesk,sans-serif',
  input: 'width:100%;background:#27272a;border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:8px 10px;font-size:13px;font-family:Space Grotesk,sans-serif;color:#fafafa;outline:none;box-sizing:border-box;-webkit-appearance:none',
  row:   'margin-bottom:8px',
  btnP:  'width:100%;background:#22d3ee;color:#18181b;border:none;border-radius:10px;padding:11px;margin-top:12px;font-family:Space Grotesk,sans-serif;font-weight:700;font-size:14px;cursor:pointer',
  btnS:  'width:100%;background:#27272a;color:rgba(250,250,250,0.6);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:11px;margin-top:6px;font-family:Space Grotesk,sans-serif;font-weight:600;font-size:13px;cursor:pointer'
};
window._M = _M;

function sheet(inner, center) {
  var d = document.createElement('div');
  d.className = 'modal-bg' + (center ? ' center' : '');
  d.innerHTML = '<div class="modal-sheet' + (center ? ' center-modal' : '') + '">'
    + '<div class="sheet-handle"></div>'
    + inner + '</div>';
  d.addEventListener('click', function(e) { if (e.target === d) closeModal(); });
  document.body.appendChild(d);
}

function closeModal() {
  document.querySelectorAll('.modal-bg').forEach(function(el) { el.remove(); });
}

// ── Assign client modal ───────────────────────────────────────────────────────

function showAssignClientModal(postId) {
  var post = window.getPost(postId);
  if (!post) return;
  var clients = window.S.clients || [];

  var clientList = clients.map(function(c) {
    var active = post.clientId === c.id;
    return '<button onclick="assignClient(\'' + postId + '\',\'' + c.id + '\')" class="hs" style="display:flex;align-items:center;gap:10px;background:' + (active ? 'rgba(34,211,238,0.08)' : '#27272a') + ';border:1px solid ' + (active ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.07)') + ';border-radius:10px;padding:10px 12px;text-align:left;cursor:pointer;width:100%;margin-bottom:6px">'
      + window.clientAvatar(c, 30)
      + '<div><div style="font-size:13px;font-weight:600;color:#fafafa;font-family:Space Grotesk,sans-serif">' + c.company + '</div>'
      + '<div style="font-size:11px;color:rgba(250,250,250,0.4)">' + c.name + '</div></div>'
      + (active ? '<span class="material-symbols-outlined fill-icon" style="font-size:16px;color:#22d3ee;margin-left:auto">check_circle</span>' : '')
      + '</button>';
  }).join('');

  sheet(
    '<div style="' + _M.wrap + '">'
    + '<div style="' + _M.title + '">Assign to client</div>'
    + '<div style="' + _M.sub + '">' + post.title + '</div>'
    + clientList
    + '<button onclick="showNewClientModal(\'' + postId + '\')" class="hs" style="' + _M.btnS + '">+ New client</button>'
    + '</div>'
  );
}

function assignClient(postId, clientId) {
  var post = window.getPost(postId);
  if (!post) return;
  post.clientId = clientId;
  if (post.status === 'draft') post.status = 'draft';
  window.saveState();
  window.closeModal();
  var c = window.getClient(clientId);
  window.toast('Assigned to ' + (c ? c.company : 'client'));
  window.render();
}

// ── New client modal ──────────────────────────────────────────────────────────

var CLIENT_COLORS = [
  { bg: '#22d3ee', text: '#18181b' },
  { bg: '#a78bfa', text: '#18181b' },
  { bg: '#f95630', text: '#fff'    },
  { bg: '#4ade80', text: '#18181b' },
  { bg: '#fbbf24', text: '#18181b' },
  { bg: '#f472b6', text: '#18181b' }
];

function showNewClientModal(returnPostId) {
  var swatches = CLIENT_COLORS.map(function(c, i) {
    return '<div onclick="selectClientColor(' + i + ')" data-ci="' + i + '" style="width:24px;height:24px;border-radius:6px;background:' + c.bg + ';cursor:pointer;border:2px solid ' + (i === 0 ? '#fafafa' : 'transparent') + ';flex-shrink:0" class="hs"></div>';
  }).join('');

  window._selectedClientColor = 0;
  window._returnPostId = returnPostId || null;

  sheet(
    '<div style="' + _M.wrap + '">'
    + '<div style="' + _M.title + '">New client</div>'
    + '<div style="' + _M.sub + '">Projects come after.</div>'
    + '<div style="' + _M.row + '"><div style="' + _M.label + '">Company or brand</div>'
    + '<input id="nc-company" type="text" placeholder="Barrio Brew Co." autocomplete="new-password" style="' + _M.input + '"></div>'
    + '<div style="' + _M.row + '"><div style="' + _M.label + '">Contact name</div>'
    + '<input id="nc-name" type="text" placeholder="Marisol Vega" autocomplete="new-password" style="' + _M.input + '"></div>'
    + '<div style="' + _M.row + '"><div style="' + _M.label + '">Contact email</div>'
    + '<input id="nc-email" type="email" placeholder="marisol@brand.com" autocomplete="new-password" style="' + _M.input + '"></div>'
    + '<div style="' + _M.row + '"><div style="' + _M.label + '">Final approver <span style="color:rgba(250,250,250,0.25);font-weight:500">optional</span></div>'
    + '<input id="nc-owner" type="text" placeholder="Who can give final sign-off?" autocomplete="new-password" style="' + _M.input + '"></div>'
    + '<div style="margin-bottom:10px"><div style="' + _M.label + '">Approval note <span style="color:rgba(250,250,250,0.25);font-weight:500">optional</span></div>'
    + '<textarea id="nc-note" rows="2" placeholder="What should this client double-check before approving?" style="' + _M.input + ';resize:none;line-height:1.4"></textarea></div>'
    + '<div style="' + _M.label + '">Brand color</div>'
    + '<div style="display:flex;gap:5px;margin-bottom:4px">' + swatches + '</div>'
    + '<button onclick="createClient()" class="hs" style="' + _M.btnP + '">Add client</button>'
    + '</div>'
  );
  setTimeout(function() { var el = document.getElementById('nc-company'); if (el) el.focus(); }, 60);
}

function selectClientColor(i) {
  window._selectedClientColor = i;
  document.querySelectorAll('[data-ci]').forEach(function(el) {
    el.style.border = '2px solid ' + (parseInt(el.dataset.ci) === i ? '#fafafa' : 'transparent');
  });
}

function createClient() {
  var company = ((document.getElementById('nc-company') || {}).value || '').trim();
  var name    = ((document.getElementById('nc-name')    || {}).value || '').trim();
  var email   = ((document.getElementById('nc-email')   || {}).value || '').trim();
  var note    = ((document.getElementById('nc-note')    || {}).value || '').trim();
  var owner   = ((document.getElementById('nc-owner')   || {}).value || '').trim() || name;
  if (!company) { window.toast('Add a company name'); return; }
  if (!name)    { window.toast('Add a contact name'); return; }
  var ci      = window._selectedClientColor || 0;
  var palette = CLIENT_COLORS[ci] || CLIENT_COLORS[0];
  var initials = name.split(' ').map(function(w) { return w[0]; }).join('').slice(0,2).toUpperCase();
  var client = {
    id: window.makeId('client'), name: name, company: company,
    email: email, approvalNote: note, approvalOwner: owner, approvalCode: window.approvalCode ? window.approvalCode() : String(Math.floor(1000 + Math.random() * 9000)), color: palette.bg, colorText: palette.text, initials: initials
  };
  window.S.clients.push(client);
  window.saveState();
  window.closeModal();
  window.toast(company + ' added');
  if (window._returnPostId) {
    setTimeout(function() { showAssignClientModal(window._returnPostId); }, 280);
  } else {
    window.render();
  }
}

// ── Share stamp link ──────────────────────────────────────────────────────────

function showStampLink(postId) {
  var post = window.getPost(postId);
  if (!post) return;
  var url = window.portalURL(post.token);
  sheet(
    '<div style="' + _M.wrap + '">'
    + '<div style="' + _M.title + '">Share stamp link</div>'
    + '<div style="' + _M.sub + '">' + post.title + ' — no login needed for client</div>'
    + '<div style="background:#27272a;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:10px 12px;font-size:12px;word-break:break-all;color:rgba(250,250,250,0.6);margin-bottom:10px;font-family:Space Grotesk,sans-serif">' + url + '</div>'
    + '<button onclick="window.copyText(\'' + url + '\');window.toast(\'Link copied\');closeModal();" class="hs" style="' + _M.btnP + ';margin-top:0">Copy link</button>'
    + '<button onclick="closeModal()" class="hs" style="' + _M.btnS + '">Done</button>'
    + '</div>'
  );
  // Mark as in review when link is shared
  if (post.status === 'draft') {
    post.status = 'review';
    window.saveState();
  }
}

// ── More sheet ────────────────────────────────────────────────────────────────

function openMoreSheet() {
  sheet(
    '<div style="' + _M.wrap + '">'
    + '<div style="' + _M.title + ';margin-bottom:12px">More</div>'
    + '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">'
    + _moreRow('sync', 'Sync Buffer', 'Pull latest drafts', 'syncBuffer()')
    + _moreRow('refresh', 'Reset demo', 'Start fresh', 'resetDemo()')
    + _moreRow('help', 'How Stamp works', 'Quick overview', 'openHowItWorks()')
    + '</div>'
    + '<div style="background:#27272a;border-radius:10px;padding:12px 14px;border:1px solid rgba(255,255,255,0.07)">'
    + '<div style="font-size:10px;color:rgba(250,250,250,0.3);margin-bottom:2px;font-family:Space Grotesk,sans-serif">Stamp is in beta</div>'
    + '<div style="font-size:13px;font-weight:600;color:#fafafa;font-family:Space Grotesk,sans-serif">Built by Nobody Creative</div>'
    + '</div>'
    + '</div>'
  );
}

function _moreRow(icon, label, sub, action) {
  return '<button onclick="' + action + '" class="hs" style="display:flex;align-items:center;gap:10px;background:#27272a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 12px;text-align:left;cursor:pointer;width:100%">'
    + '<span class="material-symbols-outlined" style="font-size:18px;color:rgba(250,250,250,0.4)">' + icon + '</span>'
    + '<div><div style="font-family:Space Grotesk,sans-serif;font-weight:600;font-size:13px;color:#fafafa">' + label + '</div>'
    + '<div style="font-size:11px;color:rgba(250,250,250,0.4)">' + sub + '</div></div>'
    + '</button>';
}

function openHowItWorks() {
  closeModal();
  sheet(
    '<div style="' + _M.wrap + '">'
    + '<div style="' + _M.title + ';margin-bottom:14px">How Stamp works</div>'
    + _step('1', 'sync', 'Sync your Buffer drafts', 'Your posts appear on the board instantly.')
    + _step('2', 'group', 'Assign posts to clients', 'Drag or tap to assign each post to a client.')
    + _step('3', 'link', 'Send the stamp link', 'One tap generates a no-login review link.')
    + _step('4', 'verified', 'Client stamps it', 'They approve or request changes — no account needed.')
    + _step('5', 'schedule', 'You schedule in Buffer', 'Approved posts go back to Buffer for scheduling.')
    + '<button onclick="closeModal()" class="hs" style="' + _M.btnP + '">Got it</button>'
    + '</div>'
  );
}

function _step(num, icon, title, body) {
  return '<div style="display:flex;gap:10px;margin-bottom:12px;align-items:flex-start">'
    + '<div style="width:22px;height:22px;border-radius:50%;background:#22d3ee;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">'
    + '<span style="font-size:11px;font-weight:700;color:#18181b;font-family:Space Grotesk,sans-serif">' + num + '</span></div>'
    + '<div><div style="font-size:13px;font-weight:600;color:#fafafa;margin-bottom:1px;font-family:Space Grotesk,sans-serif">' + title + '</div>'
    + '<div style="font-size:12px;color:rgba(250,250,250,0.4);font-family:Space Grotesk,sans-serif">' + body + '</div></div>'
    + '</div>';
}

window.sheet                  = sheet;
window.closeModal             = closeModal;
window.showAssignClientModal  = showAssignClientModal;
window.assignClient           = assignClient;
window.showNewClientModal     = showNewClientModal;
window.selectClientColor      = selectClientColor;
window.createClient           = createClient;
window.showStampLink          = showStampLink;
window.openMoreSheet          = openMoreSheet;
window.openHowItWorks         = openHowItWorks;
