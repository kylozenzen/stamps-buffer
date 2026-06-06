'use strict';

var SK = 'stamp_v1';

function _defaultState() {
  return _ensureApprovalFields({
    clients:      JSON.parse(JSON.stringify(window.DEMO_CLIENTS)),
    posts:        JSON.parse(JSON.stringify(window.DEMO_POSTS)),
    view:         'board',
    activePost:   null,
    activeClient: null,
    bufferSynced: false,
    lastSync:     null
  });
}

function loadState() {
  try {
    var raw = localStorage.getItem(SK);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.posts)) return _defaultState();
      return _ensureApprovalFields(parsed);
    }
  } catch(e) {}
  return _ensureApprovalFields(_defaultState());
}

function saveState() {
  try { localStorage.setItem(SK, JSON.stringify(window.S)); } catch(e) {}
}

function resetState() {
  try { localStorage.removeItem(SK); } catch(e) {}
  window.S = _defaultState();
  saveState();
}


function _approvalCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function _ensureApprovalFields(state) {
  (state.clients || []).forEach(function(client) {
    if (!client.approvalOwner) client.approvalOwner = client.name || 'Primary approver';
    if (!client.approvalCode) client.approvalCode = _approvalCode();
  });
  (state.posts || []).forEach(function(post) {
    if (!Array.isArray(post.comments)) post.comments = [];
    if (!post.approvedBy) post.approvedBy = null;
    if (!post.approvedAt) post.approvedAt = null;
  });
  return state;
}

// ── Lookups ───────────────────────────────────────────────────────────────────

function getClient(id) {
  return (window.S.clients || []).find(function(c) { return c.id === id; });
}

function getPost(id) {
  return (window.S.posts || []).find(function(p) { return p.id === id; });
}

function postsByStatus(status) {
  return (window.S.posts || []).filter(function(p) { return p.status === status; });
}

function postsByClient(clientId) {
  return (window.S.posts || []).filter(function(p) { return p.clientId === clientId; });
}

function makeId(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 8);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

(function boot() {
  try {
    window.S = loadState();
    if (!window.S || !Array.isArray(window.S.posts)) window.S = _defaultState();
    if (!Array.isArray(window.S.clients)) window.S.clients = JSON.parse(JSON.stringify(window.DEMO_CLIENTS));
    if (typeof window.S.view !== 'string') window.S.view = 'board';
    if (window.S.view === 'portal') window.S.view = 'board';
  } catch(e) {
    window.S = _defaultState();
  }
})();

window.saveState     = saveState;
window.resetState    = resetState;
window.getClient     = getClient;
window.getPost       = getPost;
window.postsByStatus = postsByStatus;
window.postsByClient = postsByClient;
window.makeId        = makeId;
window.approvalCode  = _approvalCode;
