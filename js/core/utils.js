'use strict';

function toast(msg) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function() { el.classList.remove('show'); }, 2600);
}

function isMobile() { return window.innerWidth < 768; }

function copyText(t) {
  try { navigator.clipboard.writeText(t); } catch(e) {}
}

function portalURL(token) {
  return window.location.href.split('?')[0] + '?stamp=' + token;
}

function badge(status) {
  var map = {
    draft:    'badge-draft',
    review:   'badge-review',
    changes:  'badge-changes',
    stamped:  'badge-stamped'
  };
  var labels = {
    draft:   'Draft',
    review:  'In review',
    changes: 'Changes',
    stamped: 'Stamped'
  };
  return '<span class="badge ' + (map[status] || 'badge-draft') + '">' + (labels[status] || status) + '</span>';
}

function clientAvatar(client, size) {
  size = size || 36;
  var bg   = (client && client.color)     || '#27272a';
  var text = (client && client.colorText) || '#fafafa';
  var init = (client && client.initials)  || '?';
  var fs   = size < 32 ? '10px' : '12px';
  var br   = Math.round(size * 0.25) + 'px';
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:' + br
    + ';background:' + bg + ';color:' + text
    + ';display:flex;align-items:center;justify-content:center;font-family:Space Grotesk,sans-serif;'
    + 'font-weight:700;font-size:' + fs + ';flex-shrink:0;letter-spacing:-0.01em">'
    + init + '</div>';
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  var d   = new Date(dateStr);
  var now = new Date();
  var diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return diff + 'd ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function platformIcon(platform) {
  var map = {
    'Instagram':       'photo_camera',
    'Instagram Reels': 'play_circle',
    'Instagram Story': 'blur_circular',
    'Twitter/X':       'tag',
    'TikTok':          'music_note',
    'LinkedIn':        'work',
    'Facebook':        'thumb_up'
  };
  return map[platform] || 'public';
}

window.toast         = toast;
window.isMobile      = isMobile;
window.copyText      = copyText;
window.portalURL     = portalURL;
window.badge         = badge;
window.clientAvatar  = clientAvatar;
window.relativeTime  = relativeTime;
window.platformIcon  = platformIcon;
