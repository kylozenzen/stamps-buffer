'use strict';

function render() {
  var content = document.getElementById('page-content');
  if (!content) return;

  // Public portal checks — query params ?client=ID or ?stamp=TOKEN
  var params = new URLSearchParams(window.location.search);
  var clientToken = params.get('client');
  var token  = params.get('stamp');
  if (clientToken || token) {
    var bnav  = document.getElementById('bottom-nav');
    var side  = document.getElementById('desktop-sidebar');
    var shell = document.getElementById('app-shell');
    if (bnav) bnav.style.display = 'none';
    if (side) side.style.display = 'none';
    if (shell) {
      shell.style.display = 'block';
      shell.style.gridTemplateColumns = 'none';
      shell.style.minHeight = '100vh';
      shell.style.background = '#f7f6f1';
    }
    content.style.padding = '0';
    content.style.margin = '0';
    content.style.borderRadius = '0';
    content.style.width = '100vw';
    content.style.maxWidth = 'none';
    content.style.minHeight = '100vh';
    content.style.background = '#f7f6f1';
    content.style.boxShadow = 'none';
    content.style.border = 'none';

    if (clientToken) {
      var client = window.getClient(clientToken);
      var posts = client ? window.postsByClient(client.id) : [];
      content.innerHTML = window.clientApprovalPortalPage(client || null, posts);
      return;
    }

    var match = (window.S.posts || []).find(function(p) { return p.token === token; });
    content.innerHTML = window.singlePostPortalPage(match || null);
    return;
  }

  var v = window.S.view;
  if (v === 'portal') { window.S.view = 'board'; v = 'board'; }

  renderDesktopNav();
  updateNavTabs();

  if (v === 'board') {
    content.innerHTML = window.boardPage();
  } else if (v === 'clients') {
    content.innerHTML = window.clientsPage();
  } else if (v === 'client') {
    content.innerHTML = window.clientDetailPage(window.S.activeClient);
  } else if (v === 'post') {
    content.innerHTML = window.postDetailPage(window.S.activePost);
  } else {
    content.innerHTML = window.boardPage();
  }

  content.scrollTop = 0;

  // Keep the sidebar key manager / last-synced label in sync after any re-render.
  if (window.bkRender) window.bkRender();
}

function updateNavTabs() {
  var v = window.S.view;
  document.querySelectorAll('.nav-tab').forEach(function(tab) {
    tab.classList.toggle('active', tab.dataset.nav === v);
  });
}

function renderDesktopNav() {
  var nav = document.getElementById('desktop-nav');
  if (!nav) return;
  var items = [
    { view: 'board', icon: 'view_kanban', label: 'Board' },
    { view: 'clients', icon: 'group', label: 'Clients' }
  ];
  var v = window.S.view;
  nav.innerHTML = items.map(function(item) {
    var active = item.view === v;
    return '<button onclick="setView(\'' + item.view + '\')" class="hs" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;border:none;background:' + (active ? 'rgba(34,211,238,0.12)' : 'transparent') + ';color:' + (active ? '#22d3ee' : 'rgba(250,250,250,0.4)') + ';font-family:Space Grotesk,sans-serif;font-size:13px;font-weight:' + (active ? '700' : '500') + ';cursor:pointer;text-align:left;width:100%">'
      + '<span class="material-symbols-outlined' + (active ? ' fill-icon' : '') + '" style="font-size:17px">' + item.icon + '</span>'
      + item.label + '</button>';
  }).join('');
}

// ── Actions ───────────────────────────────────────────────────────────────────

function setView(v) {
  window.S.view = v;
  window.saveState();
  render();
}

function openPost(postId) {
  window.S.activePost = postId;
  window.S.view = 'post';
  window.saveState();
  render();
}

function openClient(clientId) {
  window.S.activeClient = clientId;
  window.S.view = 'client';
  window.saveState();
  render();
}

function _stampStatusFromBuffer(bufferStatus) {
  if (bufferStatus === 'scheduled' || bufferStatus === 'needs_approval') return 'review';
  return 'draft';
}

function _setSyncButtonsLoading(isLoading) {
  document.querySelectorAll('[onclick="syncBuffer()"]').forEach(function(btn) {
    if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;

    if (isLoading) {
      btn.innerHTML = '<span class="material-symbols-outlined spinning" style="font-size:14px;color:#22d3ee">sync</span><span style="font-size:12px;font-weight:600;color:#22d3ee;font-family:Space Grotesk,sans-serif">Syncing…</span>';
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
      btn.disabled = false;
    }
  });
}

function _parseFunctionResponse(response) {
  return response.text().then(function(text) {
    var data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error('Buffer function did not return JSON. Status: ' + response.status + '. Body: ' + text.slice(0, 140));
    }

    if (!response.ok) {
      throw new Error(data.error || 'Buffer function failed with status ' + response.status);
    }

    return data;
  });
}

function syncBuffer() {
  _setSyncButtonsLoading(true);
  if (window.bkSetSyncing) window.bkSetSyncing(true);

  var demoKey = (window.StampDemoAccess && window.StampDemoAccess.getKey)
    ? window.StampDemoAccess.getKey()
    : (localStorage.getItem('stampDemoKey') || '');

  var bufferToken = (window.bkGetKey ? window.bkGetKey() : '');

  fetch('/.netlify/functions/buffer-drafts', {
    headers: {
      'x-stamp-demo-key': demoKey,
      'x-buffer-token': bufferToken
    }
  })
    .then(_parseFunctionResponse)
    .then(function(data) {
      if (data.error && !data.posts) {
        window.toast('Sync error: ' + data.error);
        return;
      }

      var posts   = data.posts || [];
      var added   = 0;
      var updated = 0;

      posts.forEach(function(p) {
        var appStatus = _stampStatusFromBuffer(p.bufferStatus);
        var existing = window.S.posts.find(function(x) { return x.bufferId === p.bufferId; });

        var title = (p.caption || '').slice(0, 40).trim() || 'Untitled draft';
        if ((p.caption || '').length > 40) title += '…';

        if (existing) {
          existing.title        = title;
          existing.caption      = p.caption || '';
          existing.image        = p.image || '';
          existing.platform     = p.platform || 'Buffer';
          existing.service      = p.service || '';
          existing.channelId    = p.channelId || '';
          existing.bufferStatus = p.bufferStatus || existing.bufferStatus || 'draft';
          existing.dueAt        = p.dueAt || null;
          existing.status       = appStatus;
          updated++;
          return;
        }

        window.S.posts.push({
          id:           window.makeId('post'),
          bufferId:     p.bufferId,
          bufferStatus: p.bufferStatus || 'draft',
          dueAt:        p.dueAt || null,
          clientId:     null,
          title:        title,
          caption:      p.caption || '',
          image:        p.image || '',
          platform:     p.platform || 'Buffer',
          service:      p.service || '',
          channelId:    p.channelId || '',
          status:       appStatus,
          token:        'STM-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
          createdAt:    p.createdAt || new Date().toISOString(),
          comments:     [],
          feedback:     '',
        });
        added++;
      });

      window.S.bufferSynced = true;
      window.S.lastSync     = new Date().toISOString();
      window.saveState();
      render();

      if (added > 0 && updated > 0) {
        window.toast(added + ' added · ' + updated + ' updated');
      } else if (added > 0) {
        window.toast(added + ' Buffer post' + (added > 1 ? 's' : '') + ' pulled in');
      } else if (updated > 0) {
        window.toast('Board updated from Buffer');
      } else if (posts.length > 0) {
        window.toast('Board already up to date');
      } else {
        window.toast(data.error || 'No draft, approval, or scheduled posts found');
      }
    })
    .catch(function(err) {
      window.toast(err.message || 'Could not reach Buffer sync');
      console.error('[Stamp sync]', err);
    })
    .finally(function() {
      _setSyncButtonsLoading(false);
      if (window.bkSetSyncing) window.bkSetSyncing(false);
    });
}

function resetDemo() {
  window.resetState();
  window.closeModal && window.closeModal();
  render();
  window.toast('Reset done');
}

window.render     = render;
window.setView    = setView;
window.openPost   = openPost;
window.openClient = openClient;
window.syncBuffer = syncBuffer;
window.resetDemo  = resetDemo;

// ── Boot ──────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {
  render();
});
