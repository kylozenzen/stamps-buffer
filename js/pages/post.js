'use strict';

function postDetailPage(postId) {
  var post   = window.getPost(postId);
  if (!post) return '<div style="padding:24px;color:rgba(250,250,250,0.4);font-family:Space Grotesk,sans-serif">Post not found.</div>';
  var client = post.clientId ? window.getClient(post.clientId) : null;
  var icon   = window.platformIcon(post.platform);

  var statusBar = '';
  if (post.status === 'changes') {
    statusBar = '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:10px 14px;margin:0 16px 12px">'
    + '<div style="font-size:11px;font-weight:700;color:#ef4444;margin-bottom:3px;font-family:Space Grotesk,sans-serif">Changes requested</div>'
    + '<div style="font-size:12px;color:rgba(250,250,250,0.6);font-family:Space Grotesk,sans-serif">' + (post.feedback || '') + '</div>'
    + '</div>';
  }

  var comments = (post.comments || []).map(function(c) {
    var isClient = c.from === 'client';
    return '<div style="display:flex;gap:8px;margin-bottom:10px;' + (isClient ? 'flex-direction:row-reverse' : '') + '">'
      + '<div style="width:26px;height:26px;border-radius:50%;background:' + (isClient ? (client ? client.color : '#27272a') : '#22d3ee') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
      +   '<span style="font-size:10px;font-weight:700;color:' + (isClient ? (client ? client.colorText : '#fafafa') : '#18181b') + ';font-family:Space Grotesk,sans-serif">' + c.av + '</span>'
      + '</div>'
      + '<div style="max-width:75%">'
      +   '<div style="font-size:10px;color:rgba(250,250,250,0.35);margin-bottom:2px;font-family:Space Grotesk,sans-serif;' + (isClient ? 'text-align:right' : '') + '">' + c.name + ' · ' + c.time + '</div>'
      +   '<div style="background:' + (isClient ? (client ? client.color + '22' : 'rgba(255,255,255,0.06)') : '#27272a') + ';border-radius:' + (isClient ? '12px 12px 4px 12px' : '12px 12px 12px 4px') + ';padding:8px 12px;font-size:12px;color:#fafafa;font-family:Space Grotesk,sans-serif;line-height:1.4">' + c.text + '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  var actionBtns = '';
  if (post.status !== 'stamped') {
    actionBtns = '<div style="display:flex;gap:8px;padding:12px 16px;border-top:0.5px solid rgba(255,255,255,0.07)">'
      + '<button onclick="showStampLink(\'' + post.id + '\')" class="hs" style="flex:1;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.25);border-radius:10px;padding:10px;font-size:12px;font-weight:700;color:#22d3ee;cursor:pointer;font-family:Space Grotesk,sans-serif">Share link</button>'
      + (post.clientId ? '' : '<button onclick="showAssignClientModal(\'' + post.id + '\')" class="hs" style="flex:1;background:#27272a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px;font-size:12px;font-weight:600;color:rgba(250,250,250,0.5);cursor:pointer;font-family:Space Grotesk,sans-serif">Assign client</button>')
      + '</div>';
  }

  return '<div class="anim-fade">'
    + '<div class="top-bar" style="display:flex;align-items:center;gap:12px">'
    +   '<button onclick="setView(\'board\')" class="hs" style="background:transparent;border:none;cursor:pointer;padding:4px;display:flex">'
    +     '<span class="material-symbols-outlined" style="font-size:20px;color:rgba(250,250,250,0.5)">arrow_back</span>'
    +   '</button>'
    +   '<div style="flex:1;min-width:0">'
    +     '<div style="font-size:15px;font-weight:700;color:#fafafa;font-family:Space Grotesk,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + post.title + '</div>'
    +     '<div style="display:flex;align-items:center;gap:6px;margin-top:1px">'
    +       (client ? window.clientAvatar(client, 14) : '')
    +       '<span style="font-size:11px;color:rgba(250,250,250,0.4);font-family:Space Grotesk,sans-serif">' + (client ? client.company : 'Unassigned') + '</span>'
    +       window.badge(post.status)
    +     '</div>'
    +   '</div>'
    + '</div>'

    + (post.image ? '<img src="' + post.image + '" style="width:100%;max-height:240px;object-fit:cover;display:block" alt="">' : '')

    + '<div style="padding:14px 16px">'
    +   '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
    +     '<span class="material-symbols-outlined" style="font-size:14px;color:rgba(250,250,250,0.3)">' + icon + '</span>'
    +     '<span style="font-size:11px;color:rgba(250,250,250,0.4);font-family:Space Grotesk,sans-serif">' + post.platform + '</span>'
    +   '</div>'
    +   '<div style="font-size:13px;color:rgba(250,250,250,0.7);line-height:1.6;font-family:Space Grotesk,sans-serif;margin-bottom:16px">' + post.caption + '</div>'
    + '</div>'

    + statusBar

    + '<div style="padding:0 16px 12px">'
    +   '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(250,250,250,0.3);margin-bottom:10px;font-family:Space Grotesk,sans-serif">Thread</div>'
    +   (comments || '<div style="font-size:12px;color:rgba(250,250,250,0.2);font-family:Space Grotesk,sans-serif">No comments yet.</div>')
    + '</div>'

    + '<div style="padding:0 16px 12px;display:flex;gap:8px">'
    +   '<input id="creator-comment" type="text" placeholder="Add a note..." style="flex:1;background:#27272a;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:8px 10px;font-size:13px;font-family:Space Grotesk,sans-serif;color:#fafafa;outline:none">'
    +   '<button onclick="addCreatorComment(\'' + post.id + '\')" class="hs" style="background:#22d3ee;color:#18181b;border:none;border-radius:8px;padding:8px 12px;font-weight:700;font-size:13px;cursor:pointer;font-family:Space Grotesk,sans-serif">Send</button>'
    + '</div>'

    + actionBtns
    + '</div>';
}

function addCreatorComment(postId) {
  var post = window.getPost(postId);
  var el   = document.getElementById('creator-comment');
  if (!post || !el || !el.value.trim()) return;
  if (!post.comments) post.comments = [];
  post.comments.push({ from: 'creator', name: 'You', av: 'Y', text: el.value.trim(), time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
  window.saveState();
  window.render();
}

window.postDetailPage     = postDetailPage;
window.addCreatorComment  = addCreatorComment;
