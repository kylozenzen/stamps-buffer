'use strict';

// ── Buffer key manager (sidebar) ────────────────────────────────────────────
// Each user brings their own Buffer access token. They choose where it lives
// (this device = localStorage, this session = sessionStorage). The token is
// masked on entry with a reveal toggle. Collapsed view shows only a sync button
// + last-synced. Nothing auto-syncs — Buffer API usage is only spent on click.

var BK_KEY  = 'stamp_buffer_key';
var BK_MODE = 'stamp_buffer_storage_mode'; // 'local' | 'session' (pref lives in localStorage)

var _bkOpen    = false;
var _bkReveal  = false;
var _bkSyncing = false;

// ── Storage ──────────────────────────────────────────────────────────────────

function bkGetMode() {
  try { return localStorage.getItem(BK_MODE) === 'session' ? 'session' : 'local'; }
  catch (e) { return 'local'; }
}

function bkGetKey() {
  try {
    if (bkGetMode() === 'session') return sessionStorage.getItem(BK_KEY) || '';
    return localStorage.getItem(BK_KEY) || '';
  } catch (e) { return ''; }
}

function bkHasKey() { return bkGetKey().length > 0; }

function bkStoreKey(key, mode) {
  try {
    // Clear both stores first so a mode switch never leaves a stale copy behind.
    try { localStorage.removeItem(BK_KEY); } catch (e) {}
    try { sessionStorage.removeItem(BK_KEY); } catch (e) {}
    if (mode === 'session') sessionStorage.setItem(BK_KEY, key);
    else localStorage.setItem(BK_KEY, key);
    localStorage.setItem(BK_MODE, mode);
  } catch (e) {}
}

function bkWipeKey() {
  try { localStorage.removeItem(BK_KEY); } catch (e) {}
  try { sessionStorage.removeItem(BK_KEY); } catch (e) {}
}

function _bkEsc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function bkLastSyncLabel() {
  var ts = window.S && window.S.lastSync;
  if (!ts) return 'Never synced';
  var diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 10)  return 'Synced just now';
  if (diff < 60)  return 'Synced ' + diff + 's ago';
  var m = Math.floor(diff / 60);
  if (m < 60)     return 'Synced ' + m + 'm ago';
  var h = Math.floor(m / 60);
  if (h < 24)     return 'Synced ' + h + 'h ago';
  var d = Math.floor(h / 24);
  return 'Synced ' + d + 'd ago';
}

// ── Collapsed view ───────────────────────────────────────────────────────────

function bkRenderClosed() {
  var has = bkHasKey();

  var syncBtn = _bkSyncing
    ? '<button disabled style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.2);border-radius:8px;padding:9px;color:#22d3ee;font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;cursor:default">'
      + '<span class="material-symbols-outlined spinning" style="font-size:15px">sync</span>Syncing…</button>'
    : '<button onclick="bkSyncClick()" class="hs" style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:' + (has ? '#22d3ee' : 'rgba(34,211,238,0.1)') + ';border:1px solid ' + (has ? '#22d3ee' : 'rgba(34,211,238,0.2)') + ';border-radius:8px;padding:9px;color:' + (has ? '#18181b' : 'rgba(34,211,238,0.55)') + ';font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;cursor:pointer">'
      + '<span class="material-symbols-outlined" style="font-size:15px">sync</span>Sync drafts</button>';

  return '<div style="background:#1f1f23;border:0.5px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px">'
    + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:9px">'
    +   '<span class="status-dot ' + (has ? 'dot-cyan' : 'dot-muted') + '"></span>'
    +   '<span style="font-size:10px;font-weight:700;color:' + (has ? 'rgba(34,211,238,0.7)' : 'rgba(250,250,250,0.4)') + ';font-family:Space Grotesk,sans-serif">' + (has ? 'Buffer key set' : 'No Buffer key') + '</span>'
    +   '<button onclick="bkToggle()" class="hs" style="margin-left:auto;background:transparent;border:none;color:rgba(250,250,250,0.4);font-family:Space Grotesk,sans-serif;font-size:10px;font-weight:700;cursor:pointer;padding:2px 4px">' + (has ? 'Edit' : 'Add key') + '</button>'
    + '</div>'
    + syncBtn
    + '<div style="font-size:10px;color:rgba(250,250,250,0.3);font-family:Space Grotesk,sans-serif;margin-top:7px;text-align:center">' + bkLastSyncLabel() + '</div>'
    + '</div>';
}

// ── Open view ────────────────────────────────────────────────────────────────

function bkRenderOpen() {
  var mode = bkGetMode();
  var key  = bkGetKey();
  var type = _bkReveal ? 'text' : 'password';

  function modeBtn(val, label) {
    var active = val === mode;
    return '<button onclick="bkSetMode(\'' + val + '\')" class="hs" style="flex:1;background:' + (active ? '#22d3ee' : '#27272a') + ';border:1px solid ' + (active ? '#22d3ee' : 'rgba(255,255,255,0.08)') + ';border-radius:7px;padding:7px 6px;color:' + (active ? '#18181b' : 'rgba(250,250,250,0.5)') + ';font-family:Space Grotesk,sans-serif;font-size:10px;font-weight:700;cursor:pointer">' + label + '</button>';
  }

  return '<div style="background:#1f1f23;border:0.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:11px">'
    +   '<span style="font-size:11px;font-weight:700;color:#fafafa;font-family:Space Grotesk,sans-serif;letter-spacing:-0.01em">Buffer connection</span>'
    +   '<button onclick="bkToggle()" class="hs" style="background:transparent;border:none;color:rgba(250,250,250,0.35);cursor:pointer;padding:0;display:flex"><span class="material-symbols-outlined" style="font-size:16px">close</span></button>'
    + '</div>'

    + '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(250,250,250,0.35);font-family:Space Grotesk,sans-serif;margin-bottom:5px">Store key</div>'
    + '<div style="display:flex;gap:5px;margin-bottom:5px">' + modeBtn('local', 'This device') + modeBtn('session', 'This session') + '</div>'
    + '<div style="font-size:9px;color:rgba(250,250,250,0.3);font-family:Space Grotesk,sans-serif;line-height:1.4;margin-bottom:11px">' + (mode === 'session' ? 'Cleared when you close this tab.' : 'Saved in this browser until you clear it.') + '</div>'

    + '<div style="position:relative;margin-bottom:8px">'
    +   '<input id="bk-key-input" type="' + type + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Paste your Buffer access token" value="' + _bkEsc(key) + '" style="width:100%;background:#27272a;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:9px 32px 9px 10px;font-family:\'DM Mono\',monospace;font-size:11px;color:#fafafa;outline:none;box-sizing:border-box">'
    +   '<button onclick="bkToggleReveal()" class="hs" style="position:absolute;right:4px;top:50%;transform:translateY(-50%);background:transparent;border:none;color:rgba(250,250,250,0.4);cursor:pointer;padding:4px;display:flex"><span class="material-symbols-outlined" style="font-size:16px">' + (_bkReveal ? 'visibility_off' : 'visibility') + '</span></button>'
    + '</div>'

    + '<button onclick="bkSave()" class="hs" style="width:100%;background:#22d3ee;border:none;border-radius:8px;padding:9px;color:#18181b;font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;cursor:pointer">Save key</button>'
    + (key ? '<button onclick="bkClear()" class="hs" style="width:100%;background:transparent;border:none;border-radius:8px;padding:7px;margin-top:3px;color:rgba(239,68,68,0.7);font-family:Space Grotesk,sans-serif;font-size:11px;font-weight:600;cursor:pointer">Clear key</button>' : '')
    + '</div>';
}

// ── Render + actions ───────────────────────────────────────────────────────────

function bkRender() {
  var mount = document.getElementById('buffer-key-manager');
  if (!mount) return;
  mount.innerHTML = _bkOpen ? bkRenderOpen() : bkRenderClosed();
  if (_bkOpen) {
    setTimeout(function () {
      var el = document.getElementById('bk-key-input');
      if (el && !el.value) el.focus();
    }, 40);
  }
}

function bkToggle() {
  _bkOpen = !_bkOpen;
  if (!_bkOpen) _bkReveal = false;
  bkRender();
}

function bkToggleReveal() {
  var el  = document.getElementById('bk-key-input');
  var cur = el ? el.value : null;
  _bkReveal = !_bkReveal;
  bkRender();
  var el2 = document.getElementById('bk-key-input');
  if (el2 && cur !== null) { el2.value = cur; el2.focus(); }
}

function bkSetMode(mode) {
  // Preserve whatever is typed (or already saved) when switching stores.
  var el    = document.getElementById('bk-key-input');
  var typed = el ? el.value.trim() : '';
  var key   = typed || bkGetKey();
  if (key) bkStoreKey(key, mode);
  else { try { localStorage.setItem(BK_MODE, mode); } catch (e) {} }
  bkRender();
}

function bkSave() {
  var el  = document.getElementById('bk-key-input');
  var key = el ? el.value.trim() : '';
  if (!key) { window.toast && window.toast('Paste your Buffer token first'); return; }
  bkStoreKey(key, bkGetMode());
  _bkOpen   = false;
  _bkReveal = false;
  bkRender();
  window.toast && window.toast('Buffer key saved');
}

function bkClear() {
  bkWipeKey();
  _bkReveal = false;
  bkRender();
  window.toast && window.toast('Buffer key cleared');
}

function bkSyncClick() {
  if (!bkHasKey()) {
    _bkOpen = true;
    bkRender();
    window.toast && window.toast('Add your Buffer key first');
    return;
  }
  if (window.syncBuffer) window.syncBuffer();
}

function bkSetSyncing(on) {
  _bkSyncing = !!on;
  if (!_bkOpen) bkRender();
}

window.bkGetKey       = bkGetKey;
window.bkHasKey       = bkHasKey;
window.bkRender       = bkRender;
window.bkToggle       = bkToggle;
window.bkToggleReveal = bkToggleReveal;
window.bkSetMode      = bkSetMode;
window.bkSave         = bkSave;
window.bkClear        = bkClear;
window.bkSyncClick    = bkSyncClick;
window.bkSetSyncing   = bkSetSyncing;

document.addEventListener('DOMContentLoaded', function () { bkRender(); });
