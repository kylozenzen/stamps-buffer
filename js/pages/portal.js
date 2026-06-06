'use strict';

function _esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function _statusLabel(status) {
  var labels = { draft: 'Draft', review: 'Needs review', changes: 'Changes requested', stamped: 'Approved' };
  return labels[status] || status || 'Draft';
}

function _portalBaseUrl() {
  return window.location.href.split('?')[0];
}

function clientPortalURL(clientId) {
  return _portalBaseUrl() + '?client=' + encodeURIComponent(clientId);
}

function copyClientPortal(clientId) {
  window.copyText(clientPortalURL(clientId));
  window.toast('Client portal link copied');
}

function _clientStats(clientId) {
  var posts = window.postsByClient(clientId);
  return {
    total: posts.length,
    draft: posts.filter(function(p) { return p.status === 'draft'; }).length,
    review: posts.filter(function(p) { return p.status === 'review'; }).length,
    changes: posts.filter(function(p) { return p.status === 'changes'; }).length,
    stamped: posts.filter(function(p) { return p.status === 'stamped'; }).length
  };
}

function _clientApprovalNote(client) {
  return (client && client.approvalNote) || 'Review caption accuracy, visuals, and anything that should change before posting.';
}

function _clientApprovalOwner(client) {
  return (client && (client.approvalOwner || client.name)) || 'Primary approver';
}

function _clientApprovalCode(client) {
  if (!client) return '';
  if (!client.approvalCode) client.approvalCode = window.approvalCode ? window.approvalCode() : String(Math.floor(1000 + Math.random() * 9000));
  return String(client.approvalCode);
}

function copyClientApprovalCode(clientId) {
  var client = window.getClient(clientId);
  if (!client) return;
  window.copyText(_clientApprovalCode(client));
  window.saveState();
  window.toast('Approval code copied');
}

function copyClientApprovalInvite(clientId) {
  var client = window.getClient(clientId);
  if (!client) return;
  var invite = 'Approval room for ' + client.company + ':\n' + clientPortalURL(clientId) + '\n\nFinal approval code for ' + _clientApprovalOwner(client) + ': ' + _clientApprovalCode(client) + '\n\nTeam members can use the link to review and comment. Final approval requires the code.';
  window.copyText(invite);
  window.saveState();
  window.toast('Approval room + code copied');
}

// ── App client views ──────────────────────────────────────────────────────────

function clientsPage() {
  var clients = window.S.clients || [];
  var cards = clients.map(function(client) {
    var stats = _clientStats(client.id);
    var attention = stats.review + stats.changes;
    return '<div class="card card-hover" style="padding:14px;display:flex;gap:12px;align-items:flex-start">'
      + window.clientAvatar(client, 38)
      + '<div style="min-width:0;flex:1">'
      +   '<div onclick="openClient(\'' + client.id + '\')" style="font-size:15px;font-weight:700;color:#fafafa;font-family:Space Grotesk,sans-serif;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _esc(client.company) + '</div>'
      +   '<div style="font-size:11px;color:rgba(250,250,250,0.4);font-family:Space Grotesk,sans-serif;margin-top:2px">' + _esc(client.name) + (client.email ? ' · ' + _esc(client.email) : '') + '</div>'
      +   '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">'
      +     '<span class="badge badge-review">' + attention + ' active</span>'
      +     '<span class="badge badge-draft">' + stats.draft + ' drafts</span>'
      +     '<span class="badge badge-stamped">' + stats.stamped + ' approved</span>'
      +   '</div>'
      +   '<div style="font-size:11px;color:rgba(250,250,250,0.38);font-family:Space Grotesk,sans-serif;line-height:1.45;margin-top:10px">' + _esc(_clientApprovalNote(client)) + '</div>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">'
      +   '<button onclick="openClient(\'' + client.id + '\')" class="hs" style="background:#27272a;border:1px solid rgba(255,255,255,0.08);color:rgba(250,250,250,0.7);border-radius:9px;padding:8px 10px;font-family:Space Grotesk,sans-serif;font-size:11px;font-weight:700;cursor:pointer">Open</button>'
      +   '<button onclick="copyClientPortal(\'' + client.id + '\')" class="hs" style="background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.25);color:#22d3ee;border-radius:9px;padding:8px 10px;font-family:Space Grotesk,sans-serif;font-size:11px;font-weight:700;cursor:pointer">Copy link</button>'
      +   '<button onclick="copyClientApprovalInvite(\'' + client.id + '\')" class="hs" style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.22);color:#4ade80;border-radius:9px;padding:8px 10px;font-family:Space Grotesk,sans-serif;font-size:11px;font-weight:700;cursor:pointer">Owner kit</button>'
      + '</div>'
      + '</div>';
  }).join('');

  return '<div class="anim-fade">'
    + '<div class="top-bar" style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
    +   '<div><div class="t-title">Clients</div><div class="t-small t-muted">Approval buckets, not a CRM wearing a fake mustache.</div></div>'
    +   '<button onclick="showNewClientModal()" class="hs" style="background:#27272a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:rgba(250,250,250,0.7);padding:9px 12px;font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px"><span class="material-symbols-outlined" style="font-size:15px">group_add</span>Client</button>'
    + '</div>'
    + '<div style="padding:16px 24px 32px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px">'
    + (cards || '<div class="card" style="padding:18px;color:rgba(250,250,250,0.45);font-family:Space Grotesk,sans-serif;font-size:13px">No clients yet.</div>')
    + '</div>'
    + '</div>';
}

function clientDetailPage(clientId) {
  var client = window.getClient(clientId);
  if (!client) return clientsPage();
  var posts = window.postsByClient(client.id);
  var stats = _clientStats(client.id);
  var grouped = [
    { key: 'changes', label: 'Needs changes' },
    { key: 'review', label: 'Awaiting review' },
    { key: 'draft', label: 'Drafts' },
    { key: 'stamped', label: 'Approved' }
  ].map(function(group) {
    var list = posts.filter(function(p) { return p.status === group.key; });
    if (!list.length) return '';
    return '<div style="margin-top:18px">'
      + '<div style="font-size:10px;font-weight:800;color:rgba(250,250,250,0.32);letter-spacing:0.12em;text-transform:uppercase;font-family:Space Grotesk,sans-serif;margin-bottom:8px">' + group.label + ' · ' + list.length + '</div>'
      + list.map(function(p) {
        return '<div onclick="openPost(\'' + p.id + '\')" class="card card-hover hs" style="padding:12px;margin-bottom:8px;display:flex;gap:10px;cursor:pointer">'
          + (p.image ? '<img src="' + _esc(p.image) + '" style="width:58px;height:58px;border-radius:10px;object-fit:cover;background:#2f2f34;flex-shrink:0" alt="">' : '<div style="width:58px;height:58px;border-radius:10px;background:#2f2f34;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:18px;color:rgba(250,250,250,0.25)">article</span></div>')
          + '<div style="min-width:0;flex:1">'
          +   '<div style="font-size:13px;font-weight:700;color:#fafafa;font-family:Space Grotesk,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _esc(p.title) + '</div>'
          +   '<div style="font-size:11px;color:rgba(250,250,250,0.38);font-family:Space Grotesk,sans-serif;margin-top:3px">' + _esc(p.platform || 'Buffer') + ' · ' + _esc(_statusLabel(p.status)) + '</div>'
          +   '<div style="font-size:11px;color:rgba(250,250,250,0.35);font-family:Space Grotesk,sans-serif;line-height:1.4;margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + _esc(p.caption) + '</div>'
          + '</div>'
          + '<button onclick="event.stopPropagation(); window.copyText(window.portalURL(\'' + p.token + '\')); window.toast(\'Post link copied\')" class="hs" style="align-self:center;background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.25);border-radius:8px;color:#22d3ee;padding:7px 8px;font-family:Space Grotesk,sans-serif;font-size:10px;font-weight:800;cursor:pointer">Link</button>'
          + '</div>';
      }).join('')
      + '</div>';
  }).join('');

  return '<div class="anim-fade">'
    + '<div class="top-bar" style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
    +   '<div style="display:flex;align-items:center;gap:10px;min-width:0">'
    +     '<button onclick="setView(\'clients\')" class="hs" style="background:transparent;border:none;color:rgba(250,250,250,0.4);cursor:pointer;padding:4px"><span class="material-symbols-outlined" style="font-size:18px">arrow_back</span></button>'
    +     window.clientAvatar(client, 34)
    +     '<div style="min-width:0"><div class="t-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _esc(client.company) + '</div><div class="t-small t-muted">' + stats.total + ' posts · ' + (stats.review + stats.changes) + ' active approvals</div></div>'
    +   '</div>'
    +   '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button onclick="copyClientPortal(\'' + client.id + '\')" class="hs" style="background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.25);border-radius:10px;color:#22d3ee;padding:9px 12px;font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px"><span class="material-symbols-outlined" style="font-size:15px">link</span>Copy portal</button><button onclick="copyClientApprovalInvite(\'' + client.id + '\')" class="hs" style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.22);border-radius:10px;color:#4ade80;padding:9px 12px;font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px"><span class="material-symbols-outlined" style="font-size:15px">key</span>Owner kit</button></div>'
    + '</div>'
    + '<div style="padding:16px 24px 32px;max-width:920px">'
    +   '<div class="card" style="padding:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:14px">'
    +     '<div><div style="font-size:10px;font-weight:800;color:rgba(250,250,250,0.35);letter-spacing:0.12em;text-transform:uppercase;font-family:Space Grotesk,sans-serif;margin-bottom:6px">Approval intel</div><div style="font-size:13px;color:rgba(250,250,250,0.62);font-family:Space Grotesk,sans-serif;line-height:1.55">' + _esc(_clientApprovalNote(client)) + '</div></div>'
    +     '<div><div style="font-size:10px;font-weight:800;color:rgba(250,250,250,0.35);letter-spacing:0.12em;text-transform:uppercase;font-family:Space Grotesk,sans-serif;margin-bottom:6px">Final approver</div><div style="font-size:13px;color:#fafafa;font-family:Space Grotesk,sans-serif">' + _esc(_clientApprovalOwner(client)) + '</div><div style="font-size:12px;color:rgba(250,250,250,0.42);font-family:Space Grotesk,sans-serif;margin-top:2px">' + _esc(client.email || 'No email saved') + '</div><button onclick="copyClientApprovalCode(\'' + client.id + '\')" class="hs" style="margin-top:8px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.22);border-radius:8px;color:#4ade80;padding:7px 9px;font-family:Space Grotesk,sans-serif;font-size:11px;font-weight:800;cursor:pointer">Code: ' + _esc(_clientApprovalCode(client)) + '</button></div>'
    +   '</div>'
    +   grouped
    +   (!posts.length ? '<div class="card" style="padding:18px;color:rgba(250,250,250,0.45);font-family:Space Grotesk,sans-serif;font-size:13px">No posts assigned to this client yet.</div>' : '')
    + '</div>'
    + '</div>';
}

// ── Public approval portals ──────────────────────────────────────────────────

function singlePostPortalPage(post) {
  if (!post) return errorPage();
  var client = post.clientId ? window.getClient(post.clientId) : null;
  var accentColor = client ? client.color : '#22d3ee';
  var accentText  = client ? client.colorText : '#18181b';
  var comments = _portalComments(post, client);
  var isStamped = post.status === 'stamped';

  return '<div class="portal-shell">'
    + _portalHeader(client, 'Single post review', 'Shared for review — no account needed')
    + '<main style="max-width:760px;margin:0 auto;padding:18px 14px 28px">'
    + _publicPostCard(post, client, true)
    + (comments ? '<section style="background:#fff;border:1px solid #e8e5dc;border-radius:18px;margin-top:12px;padding:14px"><div style="font-size:11px;font-weight:800;color:#8a877f;letter-spacing:0.1em;text-transform:uppercase;font-family:Space Grotesk,sans-serif;margin-bottom:10px">Conversation</div>' + comments + '</section>' : '')
    + (isStamped ? _stampedBlock(post) : _responseBlock(post, accentColor, accentText))
    + '</main></div>';
}

function clientApprovalPortalPage(client, posts) {
  if (!client) return errorPage();
  posts = posts || [];

  var active = posts.filter(function(p) { return p.status !== 'stamped'; });
  var approved = posts.filter(function(p) { return p.status === 'stamped'; });
  var reviewCount = posts.filter(function(p) { return p.status === 'review'; }).length;
  var changesCount = posts.filter(function(p) { return p.status === 'changes'; }).length;
  var activeCount = reviewCount + changesCount;
  var total = posts.length || 0;
  var approvedPercent = Math.round((approved.length / Math.max(total, 1)) * 100);

  var list = posts.length === 0
    ? '<section style="background:#fff;border:1px solid #e8e5dc;border-radius:18px;padding:34px 18px;text-align:center;color:#68635b;font-family:Space Grotesk,sans-serif;font-size:13px">No content to review yet.</section>'
    : '<section id="portal-post-list" style="display:flex;flex-direction:column;gap:10px">'
      + posts.map(function(post) { return _portalListCard(post, client); }).join('')
      + '</section>';

  return '<div class="portal-shell stamp-portal-room" style="min-height:100vh;background:#f7f6f1;color:#2e2f2c;width:100vw;overflow-x:hidden">'
    + _portalHeader(client, 'Approval room', 'No login needed')
    + '<main style="max-width:940px;margin:0 auto;padding:22px 16px 40px;width:100%;box-sizing:border-box">'
    +   '<section style="background:#fff;border:1px solid #e9e8e3;border-radius:24px;padding:18px;box-shadow:0 12px 30px rgba(46,47,44,0.07);margin-bottom:14px;overflow:hidden">'
    +     '<div style="display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap">'
    +       '<div style="min-width:240px;flex:1">'
    +         '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(34,211,238,0.12);color:#0891b2;border-radius:99px;padding:6px 10px;font-family:Space Grotesk,sans-serif;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px"><span class="material-symbols-outlined fill-icon" style="font-size:14px">verified</span>Stamp review</div>'
    +         '<h1 style="font-size:30px;font-weight:800;letter-spacing:-0.045em;line-height:1.05;color:#1a1a1a;font-family:Space Grotesk,sans-serif;margin:0 0 8px">' + _esc(client.company) + ' approvals</h1>'
    +         '<p style="font-size:14px;color:#68635b;font-family:Space Grotesk,sans-serif;line-height:1.55;margin:0;max-width:560px">Review each Buffer draft, leave comments, or request changes. Final approval requires the owner code.</p>'
    +       '</div>'
    +       '<div style="min-width:190px;background:#0d0f0c;color:#f7f6f1;border-radius:18px;padding:14px 16px;box-shadow:0 10px 24px rgba(0,0,0,0.12)">'
    +         '<div style="font-size:10px;font-weight:800;color:rgba(34,211,238,0.8);text-transform:uppercase;letter-spacing:0.11em;font-family:Space Grotesk,sans-serif;margin-bottom:6px">Approval progress</div>'
    +         '<div style="display:flex;align-items:flex-end;gap:6px;margin-bottom:10px"><span style="font-size:28px;font-weight:900;font-family:Space Grotesk,sans-serif;color:#fff">' + approved.length + '</span><span style="font-size:12px;color:rgba(247,246,241,0.58);font-family:Space Grotesk,sans-serif;margin-bottom:5px">of ' + total + ' approved</span></div>'
    +         '<div style="background:rgba(255,255,255,0.12);height:7px;border-radius:99px;overflow:hidden"><div style="width:' + approvedPercent + '%;height:100%;border-radius:99px;background:#22d3ee;transition:width 0.35s"></div></div>'
    +       '</div>'
    +     '</div>'
    +   '</section>'
    +   '<section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px">'
    +     _portalInfoCard('Needs review', reviewCount, 'visibility', '#ecfeff', '#0891b2')
    +     _portalInfoCard('Changes', changesCount, 'edit_note', '#fef2f2', '#dc2626')
    +     _portalInfoCard('Approved', approved.length, 'verified', '#f0fdf4', '#15803d')
    +   '</section>'
    +   '<section style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:10px;margin-bottom:14px" class="portal-intel-grid">'
    +     '<div style="background:#fff;border:1px solid #e9e8e3;border-radius:18px;padding:14px 16px">'
    +       '<div style="font-size:10px;font-weight:800;color:#8a877f;letter-spacing:0.1em;text-transform:uppercase;font-family:Space Grotesk,sans-serif;margin-bottom:7px">Approval note</div>'
    +       '<div style="font-size:13px;color:#3f3a33;font-family:Space Grotesk,sans-serif;line-height:1.55">' + _esc(_clientApprovalNote(client)) + '</div>'
    +     '</div>'
    +     '<div style="background:#fff;border:1px solid #e9e8e3;border-radius:18px;padding:14px 16px">'
    +       '<div style="font-size:10px;font-weight:800;color:#8a877f;letter-spacing:0.1em;text-transform:uppercase;font-family:Space Grotesk,sans-serif;margin-bottom:7px">Primary approver</div>'
    +       '<div style="font-size:14px;color:#1a1a1a;font-family:Space Grotesk,sans-serif;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _esc(_clientApprovalOwner(client)) + '</div>'
    +       '<div style="font-size:12px;color:#8a877f;font-family:Space Grotesk,sans-serif;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _esc('Code required for final sign-off') + '</div>'
    +     '</div>'
    +   '</section>'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0 10px;flex-wrap:wrap">'
    +     '<div><div style="font-size:16px;font-weight:900;color:#1a1a1a;font-family:Space Grotesk,sans-serif;letter-spacing:-0.03em">Posts to review</div><div style="font-size:12px;color:#8a877f;font-family:Space Grotesk,sans-serif">Tap a post to open the approval drawer.</div></div>'
    +     '<div style="display:flex;gap:6px;overflow-x:auto;max-width:100%;padding-bottom:2px">'
    +       _portalFilterButton('all', 'All', true)
    +       _portalFilterButton('review', 'Needs review', false)
    +       _portalFilterButton('changes', 'Changes', false)
    +       _portalFilterButton('stamped', 'Approved', false)
    +     '</div>'
    +   '</div>'
    +   list
    +   (total > 0 && activeCount === 0 ? '<section style="background:#dcfce7;border:1px solid #bbf7d0;border-radius:18px;padding:16px;display:flex;gap:10px;align-items:center;margin-top:14px"><span class="material-symbols-outlined fill-icon" style="font-size:24px;color:#15803d">task_alt</span><div><div style="font-size:14px;font-weight:900;color:#15803d;font-family:Space Grotesk,sans-serif">All caught up</div><div style="font-size:12px;color:#16a34a;font-family:Space Grotesk,sans-serif">Everything assigned to this room has been approved.</div></div></section>' : '')
    + '</main></div>';
}

function _portalInfoCard(label, value, icon, bg, color) {
  return '<div style="background:#fff;border:1px solid #e9e8e3;border-radius:16px;padding:13px 14px;display:flex;align-items:center;gap:10px">'
    + '<div style="width:34px;height:34px;border-radius:11px;background:' + bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined' + (icon === 'verified' ? ' fill-icon' : '') + '" style="font-size:18px;color:' + color + '">' + icon + '</span></div>'
    + '<div><div style="font-size:20px;font-weight:900;color:#1a1a1a;font-family:Space Grotesk,sans-serif;line-height:1">' + value + '</div><div style="font-size:10px;font-weight:800;color:#8a877f;text-transform:uppercase;letter-spacing:0.08em;font-family:Space Grotesk,sans-serif;margin-top:4px">' + label + '</div></div>'
    + '</div>';
}

function _portalFilterButton(key, label, active) {
  return '<button onclick="filterStampPortal(\'' + key + '\')" data-filter="' + key + '" class="hs" style="flex-shrink:0;padding:8px 13px;border-radius:99px;border:none;background:' + (active ? '#0d0f0c' : '#e9e8e3') + ';color:' + (active ? '#f7f6f1' : '#5b5c58') + ';font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:800;cursor:pointer">' + label + '</button>';
}

function _portalListCard(post, client) {
  var statusColors = post.status === 'changes'
    ? 'background:#fef2f2;color:#dc2626'
    : post.status === 'stamped'
      ? 'background:#dcfce7;color:#15803d'
      : post.status === 'review'
        ? 'background:#ecfeff;color:#0891b2'
        : 'background:#f3f4f6;color:#4b5563';
  var image = post.image
    ? '<img src="' + _esc(post.image) + '" style="width:72px;height:72px;border-radius:14px;object-fit:cover;background:#eee;flex-shrink:0" alt="">'
    : '<div style="width:72px;height:72px;border-radius:14px;background:#f0ede6;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:24px;color:#adada9">article</span></div>';
  return '<article onclick="openClientApprovalPost(\'' + post.id + '\')" data-status="' + _esc(post.status) + '" class="proj-card hs" style="background:#fff;border:1px solid #e9e8e3;border-radius:18px;overflow:hidden;cursor:pointer;box-shadow:0 1px 10px rgba(46,47,44,0.05)">'
    + '<div style="display:flex;gap:12px;align-items:center;padding:12px 14px">'
    + image
    + '<div style="min-width:0;flex:1">'
    +   '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px">'
    +     '<div style="font-size:15px;font-weight:900;color:#1a1a1a;font-family:Space Grotesk,sans-serif;letter-spacing:-0.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _esc(post.title) + '</div>'
    +     '<span style="' + statusColors + ';font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;border-radius:6px;padding:4px 7px;font-family:Space Grotesk,sans-serif;white-space:nowrap">' + _esc(_statusLabel(post.status)) + '</span>'
    +   '</div>'
    +   '<div style="font-size:12px;color:#8a877f;font-family:Space Grotesk,sans-serif;margin-bottom:6px">' + _esc(post.platform || 'Buffer') + (post.dueAt ? ' · ' + _esc(new Date(post.dueAt).toLocaleDateString()) : '') + '</div>'
    +   '<div style="font-size:13px;color:#3f3a33;line-height:1.45;font-family:Space Grotesk,sans-serif;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + _esc(post.caption || 'No caption text pulled in yet.') + '</div>'
    +   ((post.comments || []).length ? '<div style="font-size:11px;color:#adada9;font-family:Space Grotesk,sans-serif;margin-top:7px">' + (post.comments || []).length + ' comments</div>' : '')
    + '</div>'
    + '<span class="material-symbols-outlined" style="font-size:20px;color:#adada9;flex-shrink:0">chevron_right</span>'
    + '</div></article>';
}

function _portalHeader(client, label, sub) {
  return '<div class="portal-header" style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
    + '<div style="display:flex;align-items:center;gap:10px;min-width:0">'
    + (client ? '<div style="width:30px;height:30px;border-radius:8px;background:' + client.color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:11px;font-weight:800;color:' + client.colorText + ';font-family:Space Grotesk,sans-serif">' + _esc(client.initials) + '</span></div>' : '')
    + '<div style="min-width:0"><div style="font-size:13px;font-weight:800;color:#fafafa;font-family:Space Grotesk,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _esc(client ? client.company : 'Review request') + '</div><div style="font-size:10px;color:rgba(250,250,250,0.42);font-family:Space Grotesk,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + sub + '</div></div>'
    + '</div>'
    + '<span style="background:rgba(34,211,238,0.15);color:#22d3ee;font-size:10px;font-weight:800;padding:4px 9px;border-radius:6px;text-transform:uppercase;letter-spacing:0.08em;font-family:Space Grotesk,sans-serif;white-space:nowrap">' + label + '</span>'
    + '</div>';
}

function _miniStat(label, value) {
  return '<div style="background:#f5f3ee;border:1px solid #e8e5dc;border-radius:12px;padding:10px"><div style="font-size:18px;font-weight:800;color:#1a1a1a;font-family:Space Grotesk,sans-serif">' + value + '</div><div style="font-size:10px;font-weight:800;color:#8a877f;text-transform:uppercase;letter-spacing:0.08em;font-family:Space Grotesk,sans-serif">' + label + '</div></div>';
}

function _publicPostCard(post, client, standalone) {
  var cardRadius = standalone ? '18px' : '18px 18px 0 0';
  var comments = _portalComments(post, client);
  return '<article style="background:#fff;border:1px solid #e8e5dc;border-radius:' + cardRadius + ';overflow:hidden;margin-bottom:12px">'
    + (post.image ? '<img src="' + _esc(post.image) + '" style="width:100%;max-height:300px;object-fit:cover;display:block;background:#eee" alt="">' : '')
    + '<div style="padding:14px">'
    +   '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px">'
    +     '<div style="min-width:0"><div style="font-size:17px;font-weight:800;color:#1a1a1a;font-family:Space Grotesk,sans-serif;letter-spacing:-0.03em">' + _esc(post.title) + '</div><div style="font-size:11px;color:#8a877f;font-family:Space Grotesk,sans-serif;margin-top:3px">' + _esc(post.platform || 'Buffer') + ' · ' + _esc(_statusLabel(post.status)) + '</div></div>'
    +     '<span style="background:' + (post.status === 'changes' ? '#fee2e2;color:#dc2626' : post.status === 'stamped' ? '#dcfce7;color:#15803d' : '#ecfeff;color:#0891b2') + ';font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;border-radius:6px;padding:4px 7px;font-family:Space Grotesk,sans-serif;white-space:nowrap">' + _esc(_statusLabel(post.status)) + '</span>'
    +   '</div>'
    +   '<div style="font-size:14px;color:#3f3a33;line-height:1.6;font-family:Space Grotesk,sans-serif;white-space:pre-wrap">' + _esc(post.caption) + '</div>'
    +   (post.feedback ? '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:10px;margin-top:12px;font-size:13px;color:#dc2626;font-family:Space Grotesk,sans-serif;line-height:1.45"><strong>Requested change:</strong> ' + _esc(post.feedback) + '</div>' : '')
    +   (comments && !standalone ? '<details style="margin-top:12px"><summary style="font-size:12px;color:#68635b;font-family:Space Grotesk,sans-serif;cursor:pointer">View comments</summary><div style="margin-top:10px">' + comments + '</div></details>' : '')
    + '</div></article>';
}

function _portalComments(post, client) {
  var accentColor = client ? client.color : '#22d3ee';
  var accentText = client ? client.colorText : '#18181b';
  return (post.comments || []).map(function(c) {
    var isClient = c.from === 'client';
    return '<div style="display:flex;gap:8px;margin-bottom:10px;' + (isClient ? 'flex-direction:row-reverse' : '') + '">'
      + '<div style="width:26px;height:26px;border-radius:50%;background:' + (isClient ? accentColor : '#e5e3dc') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
      +   '<span style="font-size:10px;font-weight:800;color:' + (isClient ? accentText : '#555') + ';font-family:Space Grotesk,sans-serif">' + _esc(c.av) + '</span>'
      + '</div>'
      + '<div style="max-width:78%">'
      +   '<div style="font-size:10px;color:#999;margin-bottom:2px;font-family:Space Grotesk,sans-serif;' + (isClient ? 'text-align:right' : '') + '">' + _esc(c.name) + ' · ' + _esc(c.time) + '</div>'
      +   '<div style="background:' + (isClient ? accentColor + '20' : '#f0ede6') + ';border-radius:' + (isClient ? '12px 12px 4px 12px' : '12px 12px 12px 4px') + ';padding:8px 12px;font-size:13px;color:#1a1a1a;font-family:Space Grotesk,sans-serif;line-height:1.5">' + _esc(c.text) + '</div>'
      + '</div></div>';
  }).join('');
}

function _stampedBlock(post) {
  var by = post && post.approvedBy ? post.approvedBy : 'Final approver';
  var at = post && post.approvedAt ? new Date(post.approvedAt).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }) : '';
  return '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:18px;padding:16px;text-align:center;margin-top:12px">'
    + '<span class="material-symbols-outlined fill-icon" style="font-size:32px;color:#16a34a;display:block;margin-bottom:6px">verified</span>'
    + '<div style="font-size:15px;font-weight:800;color:#15803d;font-family:Space Grotesk,sans-serif;margin-bottom:2px">Stamped!</div>'
    + '<div style="font-size:12px;color:#16a34a;font-family:Space Grotesk,sans-serif">Final approval signed off by ' + _esc(by) + (at ? ' · ' + _esc(at) : '') + '.</div>'
    + '</div>';
}

function _responseBlock(post, accentColor, accentText) {
  var id = 'portal-comment-' + post.id;
  return '<div style="padding:' + (post.status === 'stamped' ? '0' : '0') + '">'
    + '<div style="font-size:11px;font-weight:800;color:#8a877f;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.08em;font-family:Space Grotesk,sans-serif">Your response</div>'
    + '<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin-bottom:8px"><input id="portal-name-' + post.id + '" type="text" placeholder="Your name, optional" style="width:100%;background:#f5f3ee;border:1px solid #e0ddd6;border-radius:10px;padding:10px 12px;font-size:13px;font-family:Space Grotesk,sans-serif;color:#1a1a1a;outline:none;box-sizing:border-box"></div>'
    + '<textarea id="' + id + '" placeholder="Add a note or requested change..." rows="3" style="width:100%;background:#f5f3ee;border:1px solid #e0ddd6;border-radius:10px;padding:10px 12px;font-size:13px;font-family:Space Grotesk,sans-serif;color:#1a1a1a;outline:none;resize:none;box-sizing:border-box;margin-bottom:10px"></textarea>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    +   '<button onclick="portalRequestChanges(\'' + post.id + '\')" class="hs" style="flex:1;min-width:132px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:10px;padding:11px;font-size:13px;font-weight:800;cursor:pointer;font-family:Space Grotesk,sans-serif">Request changes</button>'
    +   '<button onclick="portalComment(\'' + post.id + '\')" class="hs" style="flex:1;min-width:112px;background:#f0ede6;color:#555;border:none;border-radius:10px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;font-family:Space Grotesk,sans-serif">Comment</button>'
    +   '<button onclick="showStampConfirm(\'' + post.id + '\')" class="hs" style="flex:1;min-width:112px;background:' + accentColor + ';color:' + accentText + ';border:none;border-radius:10px;padding:11px;font-size:13px;font-weight:800;cursor:pointer;font-family:Space Grotesk,sans-serif;display:flex;align-items:center;justify-content:center;gap:5px"><span class="material-symbols-outlined fill-icon" style="font-size:15px">verified</span>Approve with code</button>'
    + '</div></div>';
}

function _commentName(postId, fallback) {
  var el = document.getElementById('portal-name-' + postId);
  var name = el ? el.value.trim() : '';
  return name || fallback || 'Client';
}

function _commentAv(name) {
  name = String(name || 'Client').trim();
  return (name[0] || 'C').toUpperCase();
}

function _commentValue(postId) {
  var el = document.getElementById('portal-comment-' + postId) || document.getElementById('portal-comment');
  return el ? el.value.trim() : '';
}

function _clearComment(postId) {
  var el = document.getElementById('portal-comment-' + postId) || document.getElementById('portal-comment');
  if (el) el.value = '';
}

function filterStampPortal(status) {
  document.querySelectorAll('[data-filter]').forEach(function(btn) {
    var isActive = btn.dataset.filter === status;
    btn.style.background = isActive ? '#0d0f0c' : '#e9e8e3';
    btn.style.color = isActive ? '#f7f6f1' : '#5b5c58';
  });
  document.querySelectorAll('[data-status]').forEach(function(card) {
    card.style.display = (status === 'all' || card.dataset.status === status) ? '' : 'none';
  });
}

function openClientApprovalPost(postId) {
  var post = window.getPost(postId);
  if (!post) return;
  var client = post.clientId ? window.getClient(post.clientId) : null;
  var accentColor = client ? client.color : '#22d3ee';
  var accentText = client ? client.colorText : '#18181b';
  var comments = _portalComments(post, client);

  window.sheet(
    '<div style="padding:0 18px 6px;color:#1a1a1a">'
    + (post.image ? '<img src="' + _esc(post.image) + '" style="width:100%;border-radius:16px;margin-bottom:14px;display:block;max-height:260px;object-fit:cover;background:#eee" alt="">' : '')
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px">'
    +   '<div style="min-width:0"><div style="font-size:20px;font-weight:900;color:#1a1a1a;font-family:Space Grotesk,sans-serif;letter-spacing:-0.035em;line-height:1.1">' + _esc(post.title) + '</div><div style="font-size:12px;color:#8a877f;font-family:Space Grotesk,sans-serif;margin-top:4px">' + _esc(post.platform || 'Buffer') + ' · ' + _esc(_statusLabel(post.status)) + '</div></div>'
    +   '<span style="background:' + (post.status === 'changes' ? '#fee2e2;color:#dc2626' : post.status === 'stamped' ? '#dcfce7;color:#15803d' : '#ecfeff;color:#0891b2') + ';font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;border-radius:6px;padding:5px 8px;font-family:Space Grotesk,sans-serif;white-space:nowrap">' + _esc(_statusLabel(post.status)) + '</span>'
    + '</div>'
    + '<div style="background:#f7f6f1;border:1px solid #e9e8e3;border-radius:14px;padding:12px;margin-bottom:12px;font-size:14px;color:#3f3a33;line-height:1.6;font-family:Space Grotesk,sans-serif;white-space:pre-wrap">' + _esc(post.caption || 'No caption text pulled in yet.') + '</div>'
    + (post.feedback ? '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;padding:11px;margin-bottom:12px;font-size:13px;color:#dc2626;font-family:Space Grotesk,sans-serif;line-height:1.45"><strong>Requested change:</strong> ' + _esc(post.feedback) + '</div>' : '')
    + (comments ? '<details style="margin-bottom:12px"><summary style="font-size:12px;color:#68635b;font-family:Space Grotesk,sans-serif;cursor:pointer;font-weight:800">Conversation</summary><div style="margin-top:10px">' + comments + '</div></details>' : '')
    + (post.status === 'stamped' ? _stampedBlock(post) : _responseBlock(post, accentColor, accentText))
    + '</div>'
  );
}

function portalComment(postId) {
  var post = window.getPost(postId);
  var text = _commentValue(postId);
  if (!post || !text) { window.toast('Write a comment first'); return; }
  if (!post.comments) post.comments = [];
  var name = _commentName(postId, 'Client');
  post.comments.push({ from: 'client', name: name, av: _commentAv(name), text: text, time: 'Just now' });
  window.saveState();
  _clearComment(postId);
  window.toast('Comment added');
  window.render();
}

function portalRequestChanges(postId) {
  var post = window.getPost(postId);
  var text = _commentValue(postId);
  if (!post || !text) { window.toast('Add the requested change first'); return; }
  post.status = 'changes';
  post.feedback = text;
  if (!post.comments) post.comments = [];
  var name = _commentName(postId, 'Client');
  post.comments.push({ from: 'client', name: name, av: _commentAv(name), text: text, time: 'Just now' });
  window.saveState();
  _clearComment(postId);
  window.toast('Changes requested');
  window.render();
}

function showStampConfirm(postId) {
  var post = window.getPost(postId);
  if (!post) return;
  var client = post.clientId ? window.getClient(post.clientId) : null;
  var owner = _clientApprovalOwner(client);
  var M = window._M;
  window.sheet(
    '<div style="' + M.wrap + ';text-align:left;padding-top:18px">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span class="material-symbols-outlined fill-icon" style="font-size:30px;color:#22d3ee">verified_user</span><div><div style="' + M.title + ';margin-bottom:2px">Final approval code</div><div style="font-size:12px;color:rgba(250,250,250,0.42);font-family:Space Grotesk,sans-serif;line-height:1.45">Team members can comment, but only the owner code can stamp final approval.</div></div></div>'
    + '<div style="' + M.row + '"><div style="' + M.label + '">Signing as</div><input id="stamp-approver-name" type="text" value="' + _esc(owner) + '" style="' + M.input + '"></div>'
    + '<div style="' + M.row + '"><div style="' + M.label + '">Approval code</div><input id="stamp-approval-code" type="password" inputmode="numeric" placeholder="4-digit code" style="' + M.input + ';letter-spacing:0.18em;font-weight:800"></div>'
    + '<button onclick="stampPost(\'' + postId + '\')" class="hs" style="' + M.btnP + ';margin-top:12px">Stamp final approval</button>'
    + '<button onclick="closeModal()" class="hs" style="' + M.btnS + '">Not yet</button>'
    + '</div>', true
  );
  setTimeout(function() { var el = document.getElementById('stamp-approval-code'); if (el) el.focus(); }, 60);
}

function stampPost(postId) {
  var post = window.getPost(postId);
  if (!post) return;
  var client = post.clientId ? window.getClient(post.clientId) : null;
  var required = client ? _clientApprovalCode(client) : '';
  var codeEl = document.getElementById('stamp-approval-code');
  var nameEl = document.getElementById('stamp-approver-name');
  var entered = codeEl ? codeEl.value.trim() : '';
  var approver = nameEl && nameEl.value.trim() ? nameEl.value.trim() : _clientApprovalOwner(client);

  if (required && entered !== required) {
    window.toast('Approval code does not match');
    if (codeEl) codeEl.focus();
    return;
  }

  post.status = 'stamped';
  post.feedback = '';
  post.approvedBy = approver;
  post.approvedAt = new Date().toISOString();
  if (!post.comments) post.comments = [];
  post.comments.push({ from: 'client', name: approver, av: _commentAv(approver), text: '✓ Final approval stamped with owner code.', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
  window.saveState();
  window.closeModal();
  window.toast('Final approval stamped');
  window.render();
}

function errorPage() {
  return '<div class="portal-shell" style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:32px;text-align:center">'
    + '<div>'
    +   '<span class="material-symbols-outlined" style="font-size:40px;color:#555;display:block;margin-bottom:14px">link_off</span>'
    +   '<div style="font-size:18px;font-weight:800;color:#1a1a1a;font-family:Space Grotesk,sans-serif;margin-bottom:6px">Link not found</div>'
    +   '<div style="font-size:13px;color:#999;font-family:Space Grotesk,sans-serif">This review link may have expired or been removed.</div>'
    + '</div>'
    + '</div>';
}

window.clientsPage              = clientsPage;
window.clientDetailPage         = clientDetailPage;
window.clientPortalURL          = clientPortalURL;
window.copyClientPortal         = copyClientPortal;
window.copyClientApprovalCode   = copyClientApprovalCode;
window.copyClientApprovalInvite = copyClientApprovalInvite;
window.singlePostPortalPage     = singlePostPortalPage;
window.clientApprovalPortalPage = clientApprovalPortalPage;
window.clientPortalPage         = singlePostPortalPage;
window.filterStampPortal        = filterStampPortal;
window.openClientApprovalPost  = openClientApprovalPost;
window.portalComment            = portalComment;
window.portalRequestChanges     = portalRequestChanges;
window.showStampConfirm         = showStampConfirm;
window.stampPost                = stampPost;
window.errorPage                = errorPage;
