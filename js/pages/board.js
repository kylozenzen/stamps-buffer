'use strict';

var COLUMNS = [
  { status: 'draft',   label: 'Drafts',    dot: 'dot-muted', accent: '' },
  { status: 'review',  label: 'In review', dot: 'dot-cyan',  accent: 'rgba(34,211,238,0.15)' },
  { status: 'changes', label: 'Changes',   dot: 'dot-red',   accent: 'rgba(239,68,68,0.12)'  },
  { status: 'stamped', label: 'Stamped',   dot: 'dot-green', accent: '' }
];

function boardPage() {
  var S     = window.S;
  var total = S.posts.length;
  var pending = window.postsByStatus('review').length + window.postsByStatus('changes').length;

  var cols = COLUMNS.map(function(col) {
    var posts = window.postsByStatus(col.status);
    return _column(col, posts);
  }).join('');

  return '<div class="anim-fade">'

    // Top bar
    + '<div class="top-bar" style="display:flex;align-items:center;justify-content:space-between;">'
    +   '<div style="display:flex;align-items:center;gap:10px">'
    +     '<div style="width:28px;height:28px;background:#22d3ee;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +       '<span class="material-symbols-outlined fill-icon" style="font-size:15px;color:#18181b">verified</span>'
    +     '</div>'
    +     '<div>'
    +       '<div style="font-size:16px;font-weight:700;letter-spacing:-0.02em;color:#fafafa">Stamp</div>'
    +       '<div style="font-size:10px;color:rgba(250,250,250,0.35);margin-top:-1px">' + total + ' posts · ' + pending + ' need attention</div>'
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;align-items:center;gap:6px">'
    +     '<button onclick="syncBuffer()" class="hs" style="display:flex;align-items:center;gap:5px;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.2);border-radius:8px;padding:6px 10px;cursor:pointer">'
    +       '<span class="material-symbols-outlined" style="font-size:14px;color:#22d3ee">sync</span>'
    +       '<span style="font-size:12px;font-weight:600;color:#22d3ee;font-family:Space Grotesk,sans-serif">Sync</span>'
    +     '</button>'
    +     '<button onclick="showNewClientModal()" class="hs" style="display:flex;align-items:center;gap:5px;background:#27272a;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:6px 10px;cursor:pointer">'
    +       '<span class="material-symbols-outlined" style="font-size:14px;color:rgba(250,250,250,0.5)">person_add</span>'
    +       '<span style="font-size:12px;font-weight:600;color:rgba(250,250,250,0.5);font-family:Space Grotesk,sans-serif">Client</span>'
    +     '</button>'
    +   '</div>'
    + '</div>'

    // Board
    + '<div class="kanban-wrap">' + cols + '</div>'

    + '</div>';
}

function _column(col, posts) {
  var cards = posts.length
    ? posts.map(function(p) { return _postCard(p); }).join('')
    : '<div style="border:1px dashed rgba(255,255,255,0.07);border-radius:10px;padding:16px;text-align:center">'
    +   '<span style="font-size:11px;color:rgba(250,250,250,0.2);font-family:Space Grotesk,sans-serif">No posts</span>'
    + '</div>';

  return '<div class="kanban-col">'
    + '<div class="kanban-col-header">'
    +   '<div class="status-dot ' + col.dot + '"></div>'
    +   '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(250,250,250,0.4);font-family:Space Grotesk,sans-serif">' + col.label + '</span>'
    +   '<span style="font-size:10px;color:rgba(250,250,250,0.25);font-family:Space Grotesk,sans-serif;margin-left:2px">' + posts.length + '</span>'
    + '</div>'
    + cards
    + '</div>';
}

function _postCard(post) {
  var client  = post.clientId ? window.getClient(post.clientId) : null;
  var icon    = window.platformIcon(post.platform);
  var hasImg  = post.image && post.image.length > 0;

  var clientChip = client
    ? '<div style="display:flex;align-items:center;gap:5px;margin-bottom:6px">'
    +   '<div style="width:14px;height:14px;border-radius:3px;background:' + client.color + ';flex-shrink:0"></div>'
    +   '<span style="font-size:10px;color:rgba(250,250,250,0.5);font-family:Space Grotesk,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + client.company + '</span>'
    + '</div>'
    : '<button onclick="event.stopPropagation();showAssignClientModal(\'' + post.id + '\')" style="display:flex;align-items:center;gap:4px;background:transparent;border:1px dashed rgba(255,255,255,0.15);border-radius:5px;padding:3px 7px;cursor:pointer;margin-bottom:6px">'
    +   '<span style="font-size:10px;color:rgba(250,250,250,0.3);font-family:Space Grotesk,sans-serif">+ Assign client</span>'
    + '</button>';

  var actionBtn = '';
  if (post.status === 'draft') {
    actionBtn = '<button onclick="event.stopPropagation();showStampLink(\'' + post.id + '\')" class="hs" style="width:100%;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.2);border-radius:6px;padding:5px;font-size:10px;font-weight:700;color:#22d3ee;cursor:pointer;font-family:Space Grotesk,sans-serif;margin-top:6px">Send for review</button>';
  } else if (post.status === 'review') {
    actionBtn = '<button onclick="event.stopPropagation();showStampLink(\'' + post.id + '\')" class="hs" style="width:100%;background:transparent;border:1px solid rgba(34,211,238,0.15);border-radius:6px;padding:5px;font-size:10px;font-weight:600;color:rgba(34,211,238,0.6);cursor:pointer;font-family:Space Grotesk,sans-serif;margin-top:6px">Copy link</button>';
  } else if (post.status === 'changes') {
    actionBtn = '<div style="background:rgba(239,68,68,0.1);border-radius:6px;padding:5px 7px;margin-top:6px">'
    + '<span style="font-size:10px;color:#ef4444;font-family:Space Grotesk,sans-serif;line-height:1.3">' + (post.feedback || 'Changes requested').slice(0,60) + '</span>'
    + '</div>';
  } else if (post.status === 'stamped') {
    actionBtn = '<div style="display:flex;align-items:center;gap:4px;margin-top:6px">'
    + '<span class="material-symbols-outlined fill-icon" style="font-size:13px;color:#4ade80">verified</span>'
    + '<span style="font-size:10px;color:#4ade80;font-family:Space Grotesk,sans-serif">Stamped</span>'
    + '</div>';
  }

  return '<div class="post-card" onclick="openPost(\'' + post.id + '\')">'
    + (hasImg ? '<img src="' + post.image + '" class="post-card-img" alt="' + post.title + '" loading="lazy">' : '<div class="post-card-img" style="display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="font-size:24px;color:rgba(250,250,250,0.15)">' + icon + '</span></div>')
    + '<div class="post-card-body">'
    +   clientChip
    +   '<div style="font-size:12px;font-weight:600;color:#fafafa;font-family:Space Grotesk,sans-serif;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + post.title + '</div>'
    +   '<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">'
    +     '<span class="material-symbols-outlined" style="font-size:11px;color:rgba(250,250,250,0.3)">' + icon + '</span>'
    +     '<span style="font-size:10px;color:rgba(250,250,250,0.3);font-family:Space Grotesk,sans-serif">' + post.platform + '</span>'
    +   '</div>'
    +   actionBtn
    + '</div>'
    + '</div>';
}

window.boardPage = boardPage;
