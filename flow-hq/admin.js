/* The Flow Labs — Flow HQ admin logic. Client-side only. */
(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var SCHEMA = window.CONTENT_SCHEMA || {};
  var SETTINGS_DEFAULTS = window.SETTINGS_DEFAULTS || {};

  var $ = function (id) { return document.getElementById(id); };
  var state = {
    session: null,
    profile: null,
    role: null,
    tab: 'dashboard',
    leadsPage: 0,
    leadsPageSize: 25,
    leadsTotal: 0,
    contentPage: 'home',
    contentCounts: null,
    contentSnapshot: {},
    contentDirty: false,
    settings: {},
    settingsSnapshot: {},
    settingsDirty: false,
    blogPosts: [],
    blogEditing: null,
    blogSlugTouched: false,
    projects: [],
    projectId: null,
    project: null,
    modules: [],
    tasks: [],
    people: [],
    team: []
  };

  var TAB_META = {
    dashboard: ['Dashboard', 'Site health at a glance.'],
    leads: ['Leads', 'Every enquiry, newest first.'],
    visitors: ['Visitors', 'Cookie-less page views and traffic sources.'],
    content: ['Content', 'The words on your public pages.'],
    blog: ['Blog', 'Write, draft and publish posts.'],
    projects: ['Projects', 'Your projects, progress and modules.'],
    project: ['Project', 'Modules, tasks and progress.'],
    team: ['Team', 'Create logins, set roles, suspend access.'],
    settings: ['Settings', 'Brand colour, homepage blocks and search listings.']
  };

  // What each role is allowed to open. The server (RLS) is the real
  // gate; this only keeps the interface honest.
  var TAB_ACCESS = {
    owner: ['dashboard', 'leads', 'visitors', 'content', 'blog', 'projects', 'project', 'team', 'settings'],
    admin: ['dashboard', 'leads', 'visitors', 'content', 'blog', 'projects', 'project', 'team', 'settings'],
    manager: ['projects', 'project'],
    member: ['projects', 'project'],
    client: []
  };

  function allowedTabs(role) {
    return TAB_ACCESS[role] || [];
  }

  function canOpen(tab) {
    return allowedTabs(state.role).indexOf(tab) !== -1;
  }

  function isAdmin() {
    return state.role === 'owner' || state.role === 'admin';
  }

  var SECTION_LABELS = window.SECTION_LABELS || {};

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripTags(value) {
    return String(value == null ? '' : value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function fmtDate(value) {
    if (!value) return '—';
    var date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  var toastTimer = null;
  function toast(message, isError) {
    var el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('error', !!isError);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3200);
  }

  function fail(message) {
    toast(message || 'Something went wrong.', true);
  }

  /* ---------------- auth ---------------- */
  if (!window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    if ($('authError')) {
      $('authError').textContent = 'Supabase client or site.config.js is missing.';
      $('authError').classList.add('show');
    }
    return;
  }

  var db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

  function showAuth(message) {
    $('appView').hidden = true;
    $('authView').hidden = false;
    $('loginPassword').value = '';
    if (message) {
      $('authError').textContent = message;
      $('authError').classList.add('show');
    } else {
      $('authError').classList.remove('show');
    }
  }

  async function enter(session) {
    var result = await db.from('profiles').select('*').eq('id', session.user.id).maybeSingle();

    if (result.error) {
      var code = result.error.code || '';
      var text = String(result.error.message || '');
      await db.auth.signOut();
      if (code === 'PGRST205' || /schema cache|does not exist/i.test(text)) {
        showAuth('Database setup is incomplete. Run supabase/migrations/0001_identity.sql in the Supabase SQL editor, then sign in again.');
      } else {
        showAuth('Could not load your profile: ' + text);
      }
      return;
    }

    if (!result.data) {
      await db.auth.signOut();
      showAuth('No Flow HQ profile exists for this account.');
      return;
    }

    var profile = result.data;

    if (profile.status !== 'active') {
      await db.auth.signOut();
      showAuth('This account is ' + (profile.status === 'invited' ? 'still an invite.' : 'suspended. Ask an admin to restore access.'));
      return;
    }

    if (profile.role === 'client') {
      await db.auth.signOut();
      showAuth('Client accounts use the client portal, which is not built yet. Ask an admin for a team account.');
      return;
    }

    if (!allowedTabs(profile.role).length) {
      await db.auth.signOut();
      showAuth('This account has no Flow HQ access.');
      return;
    }

    state.session = session;
    state.profile = profile;
    state.role = profile.role;

    $('authView').hidden = true;
    $('appView').hidden = false;
    $('adminUser').textContent = (profile.full_name || session.user.email || '') +
      ' · ' + profile.role;
    $('authError').classList.remove('show');

    applyRole();

    var route = readHash();
    if (route.tab === 'project') {
      if (route.id) state.projectId = route.id;
      else route.tab = 'projects';
    }
    if (!canOpen(route.tab)) route.tab = allowedTabs(profile.role)[0];
    activateTab(route.tab);
  }

  function readHash() {
    var raw = (window.location.hash || '').replace(/^#/, '');
    var parts = raw.split('/');
    return { tab: parts[0] || '', id: parts[1] || null };
  }

  function applyRole() {
    var tabs = allowedTabs(state.role);
    Array.prototype.forEach.call(document.querySelectorAll('#adminNav [data-tab]'), function (button) {
      var tab = button.getAttribute('data-tab');
      button.hidden = tabs.indexOf(tab) === -1;
    });

    Array.prototype.forEach.call(document.querySelectorAll('.admin-nav-group'), function (group) {
      var visibleButtons = group.querySelectorAll('[data-tab]:not([hidden])');
      group.hidden = visibleButtons.length === 0;
    });

    // Creating projects and accounts is admin-only at the database level.
    if ($('projectNew')) $('projectNew').hidden = !isAdmin();
  }

  // Privileged calls that need the service role go through the one
  // catch-all function. Everything else talks to PostgREST directly
  // and is protected by RLS.
  async function api(path, options) {
    options = options || {};

    var session = state.session;
    var current = await db.auth.getSession();
    if (current.data && current.data.session) {
      session = current.data.session;
      state.session = session;
    }
    if (!session || !session.access_token) throw new Error('Sign in required.');

    var response = await fetch('/api/platform' + path, {
      method: options.method || 'GET',
      headers: Object.assign({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token
      }, options.headers || {}),
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    var data = null;
    try { data = await response.json(); } catch (error) { data = null; }

    if (response.status === 404) {
      throw new Error('The platform API is only available on the deployed site.');
    }
    if (!response.ok) {
      var error = new Error((data && data.error) || ('Request failed (' + response.status + ')'));
      error.status = response.status;
      throw error;
    }
    return data || {};
  }

  async function boot() {
    var result = await db.auth.getSession();
    if (result.data && result.data.session) {
      await enter(result.data.session);
    } else {
      showAuth();
    }

    db.auth.onAuthStateChange(function (event) {
      if (event === 'SIGNED_OUT') showAuth();
    });
  }

  $('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    var email = $('loginEmail').value.trim();
    var password = $('loginPassword').value;
    var button = $('loginBtn');

    button.disabled = true;
    $('authError').classList.remove('show');

    var result = await db.auth.signInWithPassword({ email: email, password: password });
    button.disabled = false;

    if (result.error || !result.data.session) {
      showAuth('Invalid email or password.');
      return;
    }

    await enter(result.data.session);
  });

  $('logoutBtn').addEventListener('click', async function () {
    await db.auth.signOut();
    showAuth();
  });

  /* ---------------- tabs ---------------- */
  var GROUP_NAMES = {
    dashboard: 'Workspace',
    projects: 'Workspace',
    project: 'Workspace',
    team: 'Workspace',
    content: 'Content',
    blog: 'Content',
    leads: 'Site',
    visitors: 'Site',
    settings: 'System'
  };

  function updateBreadcrumb(tab, detailLabel) {
    var bc = $('adminBreadcrumb');
    if (!bc) return;
    var group = GROUP_NAMES[tab] || 'Workspace';
    var title = TAB_META[tab] ? TAB_META[tab][0] : tab;

    if (tab === 'project') {
      var projName = detailLabel || (state.project && state.project.name) || 'Project';
      bc.innerHTML = '<a href="#projects" class="breadcrumb-link">' + esc(group) + '</a>' +
        '<span class="breadcrumb-sep">/</span>' +
        '<a href="#projects" class="breadcrumb-link">Projects</a>' +
        '<span class="breadcrumb-sep">/</span>' +
        '<span class="breadcrumb-current">' + esc(projName) + '</span>';
    } else if (tab === 'blog' && detailLabel) {
      bc.innerHTML = '<a href="#blog" class="breadcrumb-link">' + esc(group) + '</a>' +
        '<span class="breadcrumb-sep">/</span>' +
        '<a href="#blog" class="breadcrumb-link">Blog</a>' +
        '<span class="breadcrumb-sep">/</span>' +
        '<span class="breadcrumb-current">' + esc(detailLabel) + '</span>';
    } else {
      bc.innerHTML = '<span class="breadcrumb-group">' + esc(group) + '</span>' +
        '<span class="breadcrumb-sep">/</span>' +
        '<span class="breadcrumb-current">' + esc(title) + '</span>';
    }
  }

  function confirmLeaveTab(next) {
    if (next === state.tab) return true;

    if (state.tab === 'content' && state.contentDirty) {
      return window.confirm('You have unsaved content changes. Leave without saving?');
    }

    if (state.tab === 'settings' && state.settingsDirty) {
      return window.confirm('You have unsaved settings. Leave without saving?');
    }

    return true;
  }

  function activateTab(tab) {
    if (!TAB_META[tab]) tab = 'dashboard';
    if (!canOpen(tab)) tab = allowedTabs(state.role)[0] || 'dashboard';
    if (!confirmLeaveTab(tab)) return false;
    state.tab = tab;

    var navTab = tab === 'project' ? 'projects' : tab;
    Array.prototype.forEach.call(document.querySelectorAll('#adminNav [data-tab]'), function (button) {
      var isActive = button.getAttribute('data-tab') === navTab;
      button.classList.toggle('active', isActive);
      if (isActive) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('.admin-view'), function (view) {
      view.classList.toggle('active', view.id === 'view-' + tab);
    });

    $('viewTitle').textContent = TAB_META[tab][0];
    $('viewSubtitle').textContent = TAB_META[tab][1];
    updateBreadcrumb(tab);

    var hash = (tab === 'project' && state.projectId)
      ? '#project/' + state.projectId
      : '#' + tab;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }

    if (tab === 'dashboard') loadDashboard();
    if (tab === 'leads') loadLeads();
    if (tab === 'visitors') loadVisitors();
    if (tab === 'content') loadContent();
    if (tab === 'blog') loadBlog();
    if (tab === 'projects') loadProjects();
    if (tab === 'project') loadProjectScreen();
    if (tab === 'team') loadTeam();
    if (tab === 'settings') loadSettings();

    return true;
  }

  $('adminNav').addEventListener('click', function (event) {
    var button = event.target.closest('[data-tab]');
    if (button) activateTab(button.getAttribute('data-tab'));
  });

  document.addEventListener('click', function (event) {
    var go = event.target.closest('[data-goto]');
    if (go) activateTab(go.getAttribute('data-goto'));
  });

  window.addEventListener('hashchange', function () {
    var route = readHash();

    if (route.tab === 'project') {
      if (!route.id) {
        activateTab('projects');
        return;
      }
      state.projectId = route.id;
      if (state.tab === 'project') loadProjectScreen();
      else activateTab('project');
      return;
    }

    if (TAB_META[route.tab] && canOpen(route.tab) && route.tab !== state.tab) {
      if (activateTab(route.tab) === false) {
        history.replaceState(null, '', '#' + state.tab);
      }
    }
  });

  /* ---------------- shared queries ---------------- */
  async function countRows(table, filter) {
    var query = db.from(table).select('*', { count: 'exact', head: true });
    if (filter) query = filter(query);
    var result = await query;
    return result.error ? null : result.count;
  }

  function statCard(value, label) {
    return '<div class="admin-stat"><strong>' + esc(value == null ? '—' : value) + '</strong><span>' + esc(label) + '</span></div>';
  }

  function renderBars(container, items, labelKey, valueKey) {
    if (!container) return;
    if (!items || !items.length) {
      container.innerHTML = '<p class="admin-empty">No data yet.</p>';
      return;
    }

    var max = 1;
    items.forEach(function (item) {
      max = Math.max(max, Number(item[valueKey]) || 0);
    });

    container.innerHTML = items.map(function (item) {
      var value = Number(item[valueKey]) || 0;
      var pct = Math.max(2, Math.round((value / max) * 100));
      var label = item[labelKey] == null ? '—' : item[labelKey];
      return '<div class="admin-bar-row">' +
        '<span class="admin-bar-label" title="' + esc(label) + '">' + esc(label) + '</span>' +
        '<div class="admin-bar-track"><div class="admin-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="admin-bar-value">' + esc(value) + '</span>' +
        '</div>';
    }).join('');
  }

  /* ---------------- dashboard ---------------- */
  async function loadDashboard() {
    var statsEl = $('dashboardStats');
    var recentEl = $('recentLeads');
    var trafficEl = $('dashboardTraffic');

    statsEl.innerHTML = '<div class="admin-stat"><strong>…</strong><span>Loading</span></div>';
    recentEl.innerHTML = '<p class="admin-empty">Loading…</p>';
    trafficEl.innerHTML = '<p class="admin-empty">Loading…</p>';

    try {
      var results = await Promise.all([
        countRows('site_leads'),
        countRows('site_leads', function (q) { return q.eq('status', 'new'); }),
        db.rpc('visitor_stats'),
        db.from('site_leads')
          .select('id,name,contact,project_type,created_at,status')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      var totalLeads = results[0];
      var newLeads = results[1];
      var visitors = results[2].data || {};
      var recent = results[3].data || [];

      statsEl.innerHTML =
        statCard(totalLeads, 'Total leads') +
        statCard(newLeads, 'New leads') +
        statCard(visitors.today, 'Views today') +
        statCard(visitors.week, 'Views 7 days') +
        statCard(visitors.month, 'Views 30 days');

      var attentionStrip = $('attentionStrip');
      var attentionItems = $('attentionItems');
      if (attentionStrip && attentionItems) {
        var items = [];
        if (newLeads > 0) {
          items.push('<button type="button" class="attention-link" data-goto="leads"><strong>' + newLeads + '</strong> new lead' + (newLeads === 1 ? '' : 's') + ' awaiting review &rarr;</button>');
        }
        try {
          var pendingInvites = await countRows('profiles', function (q) { return q.eq('status', 'invited'); });
          if (pendingInvites > 0) {
            items.push('<button type="button" class="attention-link" data-goto="team"><strong>' + pendingInvites + '</strong> pending team invite' + (pendingInvites === 1 ? '' : 's') + ' &rarr;</button>');
          }
        } catch (_) {}

        if (items.length) {
          attentionItems.innerHTML = items.join('<span class="attention-sep">&middot;</span>');
          attentionStrip.hidden = false;
        } else {
          attentionStrip.hidden = true;
        }
      }

      renderBars(trafficEl, [
        { label: 'Today', value: visitors.today || 0 },
        { label: '7 days', value: visitors.week || 0 },
        { label: '30 days', value: visitors.month || 0 },
        { label: 'All time', value: visitors.total || 0 }
      ], 'label', 'value');

      if (!recent.length) {
        recentEl.innerHTML = '<p class="admin-empty">No leads yet.</p>';
      } else {
        recentEl.innerHTML = '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
          '<th>Name</th><th>Contact</th><th>Project</th><th>Date</th><th>Status</th>' +
          '</tr></thead><tbody>' + recent.map(function (lead) {
            return '<tr><td><strong>' + esc(lead.name) + '</strong></td>' +
              '<td>' + esc(lead.contact) + '</td>' +
              '<td>' + esc(lead.project_type) + '</td>' +
              '<td class="mono">' + esc(fmtDate(lead.created_at)) + '</td>' +
              '<td><span class="badge ' + esc(lead.status || 'new') + '">' + esc(lead.status || 'new') + '</span></td></tr>';
          }).join('') + '</tbody></table></div>';
      }
    } catch (error) {
      fail('Could not load dashboard.');
    }
  }

  /* ---------------- leads ---------------- */
  function statusSelect(lead) {
    var current = lead.status || 'new';
    return '<select class="admin-select" data-status="' + esc(lead.id) + '" aria-label="Lead status">' +
      ['new', 'contacted', 'converted', 'lost'].map(function (value) {
        return '<option value="' + value + '"' + (current === value ? ' selected' : '') + '>' +
          value.charAt(0).toUpperCase() + value.slice(1) + '</option>';
      }).join('') + '</select>';
  }

  function renderLeadsTable(leads) {
    var container = $('leadsTable');
    if (!leads || !leads.length) {
      container.innerHTML = '<p class="admin-empty">No leads yet.</p>';
      return;
    }

    container.innerHTML = '<table class="admin-table"><thead><tr>' +
      '<th>Name</th><th>Contact</th><th>Project</th><th>Message</th><th>Date</th><th>Status</th><th></th>' +
      '</tr></thead><tbody>' + leads.map(function (lead) {
        var idea = lead.idea || '';
        return '<tr>' +
          '<td><strong>' + esc(lead.name) + '</strong></td>' +
          '<td>' + esc(lead.contact) + '</td>' +
          '<td>' + esc(lead.project_type) + '</td>' +
          '<td class="truncate" title="' + esc(idea) + '">' + esc(idea.slice(0, 90)) + (idea.length > 90 ? '…' : '') + '</td>' +
          '<td class="mono">' + esc(fmtDate(lead.created_at)) + '</td>' +
          '<td>' + statusSelect(lead) + '</td>' +
          '<td class="mono">' +
            '<button type="button" class="admin-btn ghost" data-view="' + esc(lead.id) + '">View</button> ' +
            '<button type="button" class="admin-btn danger" data-delete="' + esc(lead.id) + '">Delete</button>' +
          '</td>' +
          '</tr>';
      }).join('') + '</tbody></table>';
  }

  async function loadLeads() {
    var container = $('leadsTable');
    container.innerHTML = '<p class="admin-empty">Loading…</p>';

    var from = state.leadsPage * state.leadsPageSize;
    var to = from + state.leadsPageSize - 1;

    var result = await db.from('site_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (result.error) {
      container.innerHTML = '<p class="admin-empty">Could not load leads. Check RLS policies.</p>';
      return;
    }

    state.leadsTotal = result.count || 0;
    renderLeadsTable(result.data || []);

    var pages = Math.max(1, Math.ceil(state.leadsTotal / state.leadsPageSize));
    $('leadsPageLabel').textContent = 'Page ' + (state.leadsPage + 1) + ' of ' + pages + ' · ' + state.leadsTotal + ' total';
    $('leadsPrev').disabled = state.leadsPage <= 0;
    $('leadsNext').disabled = state.leadsPage + 1 >= pages;
  }

  $('refreshLeads').addEventListener('click', loadLeads);
  $('leadsPrev').addEventListener('click', function () {
    if (state.leadsPage > 0) {
      state.leadsPage -= 1;
      loadLeads();
    }
  });
  $('leadsNext').addEventListener('click', function () {
    if (state.leadsPage + 1 < Math.ceil(state.leadsTotal / state.leadsPageSize)) {
      state.leadsPage += 1;
      loadLeads();
    }
  });

  $('leadsTable').addEventListener('change', async function (event) {
    var select = event.target.closest('[data-status]');
    if (!select) return;

    var id = select.getAttribute('data-status');
    var status = select.value;
    var result = await db.from('site_leads')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (result.error) {
      fail('Status update failed.');
    } else {
      toast('Status updated.');
      loadDashboard();
    }
  });

  $('leadsTable').addEventListener('click', async function (event) {
    var view = event.target.closest('[data-view]');
    var remove = event.target.closest('[data-delete]');

    if (view) {
      var id = view.getAttribute('data-view');
      var result = await db.from('site_leads').select('*').eq('id', id).single();
      if (result.error) {
        fail('Could not load lead.');
      } else {
        renderLeadDetail(result.data);
      }
    }

    if (remove) {
      var leadId = remove.getAttribute('data-delete');
      if (!window.confirm('Delete this lead permanently?')) return;
      var deleted = await db.from('site_leads').delete().eq('id', leadId);
      if (deleted.error) {
        fail('Delete failed.');
      } else {
        toast('Lead deleted.');
        $('leadDetail').innerHTML = '';
        loadLeads();
        loadDashboard();
      }
    }
  });

  function renderLeadDetail(lead) {
    $('leadDetail').innerHTML =
      '<div class="lead-detail">' +
        '<div class="lead-detail-grid">' +
          '<div class="lead-detail-item"><span>Name</span><strong>' + esc(lead.name) + '</strong></div>' +
          '<div class="lead-detail-item"><span>Contact</span><strong>' + esc(lead.contact) + '</strong></div>' +
          '<div class="lead-detail-item"><span>Project</span><strong>' + esc(lead.project_type) + '</strong></div>' +
          '<div class="lead-detail-item"><span>Budget</span><strong>' + esc(lead.budget || 'Not specified') + '</strong></div>' +
          '<div class="lead-detail-item"><span>Source</span><strong>' + esc(lead.source || 'site') + '</strong></div>' +
          '<div class="lead-detail-item"><span>Received</span><strong>' + esc(fmtDate(lead.created_at)) + '</strong></div>' +
        '</div>' +
        '<div class="lead-message">' + esc(lead.idea || '') + '</div>' +
        '<div class="admin-field" style="margin-bottom:0.75rem">' +
          '<label for="leadNotes">Internal notes</label>' +
          '<textarea class="admin-textarea" id="leadNotes">' + esc(lead.notes || '') + '</textarea>' +
        '</div>' +
        '<div class="admin-actions">' +
          '<button type="button" class="admin-btn primary" data-save-notes="' + esc(lead.id) + '">Save notes</button>' +
          '<button type="button" class="admin-btn ghost" data-close-detail>Close</button>' +
        '</div>' +
      '</div>';
  }

  $('leadDetail').addEventListener('click', async function (event) {
    var save = event.target.closest('[data-save-notes]');
    var close = event.target.closest('[data-close-detail]');

    if (close) $('leadDetail').innerHTML = '';

    if (save) {
      var id = save.getAttribute('data-save-notes');
      var notes = $('leadNotes').value;
      var result = await db.from('site_leads')
        .update({ notes: notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (result.error) fail('Could not save notes.');
      else toast('Notes saved.');
    }
  });

  /* ---------------- visitors ---------------- */
  async function loadVisitors() {
    var statsEl = $('visitorStats');
    statsEl.innerHTML = '<div class="admin-stat"><strong>…</strong><span>Loading</span></div>';

    var result = await db.rpc('visitor_stats');
    if (result.error) {
      statsEl.innerHTML = '<div class="admin-stat"><strong>—</strong><span>Stats unavailable</span></div>';
      $('topPages').innerHTML = '<p class="admin-empty">Run the supabase-schema.sql update to enable visitor_stats().</p>';
      $('topReferrers').innerHTML = '';
      $('deviceSplit').innerHTML = '';
      return;
    }

    var data = result.data || {};
    statsEl.innerHTML =
      statCard(data.today, 'Views today') +
      statCard(data.week, 'Views 7 days') +
      statCard(data.month, 'Views 30 days') +
      statCard(data.total, 'All-time views');

    renderBars($('topPages'), data.top_pages || [], 'page_url', 'views');
    renderBars($('topReferrers'), data.top_referrers || [], 'referrer', 'views');

    var devices = data.devices || {};
    renderBars($('deviceSplit'), [
      { label: 'Mobile', value: devices.mobile || 0 },
      { label: 'Tablet', value: devices.tablet || 0 },
      { label: 'Desktop', value: devices.desktop || 0 }
    ], 'label', 'value');
  }

  $('refreshVisitors').addEventListener('click', loadVisitors);

  /* ---------------- content ---------------- */
  var CMS_TAGS = { BR: 1, EM: 1, STRONG: 1, B: 1, I: 1, A: 1 };

  /* Inline tags only — the same allowlist the public overlay uses. */
  function cmsSanitize(value) {
    var box = document.createElement('div');
    box.innerHTML = String(value == null ? '' : value);

    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType !== 1) return;

        if (!CMS_TAGS[child.tagName]) {
          if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|LINK|META)$/.test(child.tagName)) {
            child.remove();
            return;
          }
          while (child.firstChild) node.insertBefore(child.firstChild, child);
          child.remove();
          return;
        }

        Array.prototype.slice.call(child.attributes).forEach(function (attr) {
          if (child.tagName === 'A' && attr.name === 'href') return;
          child.removeAttribute(attr.name);
        });

        if (child.tagName === 'A') {
          var href = child.getAttribute('href') || '';
          if (!/^(https?:|mailto:|\/|#)/i.test(href)) child.removeAttribute('href');
        }

        walk(child);
      });
    })(box);

    return box.innerHTML;
  }

  function contentGroups(schema) {
    var order = [];
    var groups = {};

    schema.fields.forEach(function (field) {
      var name = field.group || 'Copy';
      if (!groups[name]) {
        groups[name] = [];
        order.push(name);
      }
      groups[name].push(field);
    });

    return order.map(function (name) {
      return { name: name, fields: groups[name] };
    });
  }

  function contentInput(field, value) {
    var id = 'cms-' + field.key;
    var placeholder = esc(stripTags(field.default).slice(0, 90));

    if (field.type === 'text') {
      return '<input class="admin-input" id="' + id + '" data-key="' + esc(field.key) +
        '" type="text" placeholder="' + placeholder + '" value="' + esc(value) + '">';
    }

    return '<textarea class="admin-textarea" id="' + id + '" data-key="' + esc(field.key) +
      '" rows="' + (field.type === 'html' ? 3 : 2) + '" placeholder="' + placeholder + '">' +
      esc(value) + '</textarea>';
  }

  function contentField(field) {
    var input = document.getElementById('cms-' + field.key);
    if (!input) return null;
    return { input: input, value: input.value.trim() };
  }

  function contentResolved(field) {
    var read = contentField(field);
    return (read ? read.value : '') || field.default;
  }

  function renderContentRail() {
    var counts = state.contentCounts || {};

    $('contentPages').innerHTML = Object.keys(SCHEMA).map(function (key) {
      var edits = counts[key] || 0;
      return '<button type="button" class="rail-item' + (key === state.contentPage ? ' active' : '') +
        '" data-page="' + esc(key) + '"' + (key === state.contentPage ? ' aria-current="page"' : '') + '>' +
        '<span>' + esc(SCHEMA[key].label) + '</span>' +
        '<em class="rail-count' + (edits ? ' on' : '') + '">' +
          (edits ? edits + (edits === 1 ? ' edit' : ' edits') : 'Default') +
        '</em>' +
        '</button>';
    }).join('');
  }

  async function refreshContentCounts() {
    var result = await db.from('site_content').select('page');
    var counts = {};

    if (!result.error) {
      (result.data || []).forEach(function (row) {
        counts[row.page] = (counts[row.page] || 0) + 1;
      });
    }

    state.contentCounts = counts;
    renderContentRail();
  }

  async function loadContent() {
    var page = state.contentPage || 'home';
    var schema = SCHEMA[page];
    if (!schema) return;

    if (state.contentCounts === null) await refreshContentCounts();

    $('contentPath').textContent = schema.path;
    $('contentPageTitle').textContent = schema.label;
    $('contentOpen').href = schema.path;
    $('contentForm').innerHTML = '<p class="admin-empty">Loading…</p>';
    $('contentPreview').innerHTML = '';
    $('contentPageMeta').textContent = 'Loading…';

    var result = await db.from('site_content').select('field_key,field_value').eq('page', page);
    var overrides = {};

    if (result.error) {
      fail('Could not load this page. Check that you are still signed in.');
    } else {
      (result.data || []).forEach(function (row) {
        overrides[row.field_key] = row.field_value;
      });
    }

    var snapshot = {};
    var edited = 0;

    snapshotFromOverrides(schema, overrides, snapshot);
    schema.fields.forEach(function (field) {
      if (snapshot[field.key]) edited += 1;
    });

    $('contentForm').innerHTML = contentGroups(schema).map(function (group) {
      return '<section class="fieldblock">' +
        '<h3 class="fieldblock-title">' + esc(group.name) + '</h3>' +
        group.fields.map(function (field) {
          var stored = Object.prototype.hasOwnProperty.call(overrides, field.key) ? overrides[field.key] : '';
          var allowHtml = field.type === 'html';

          return '<div class="fieldrow" data-field="' + esc(field.key) + '">' +
            '<div class="fieldrow-head">' +
              '<label for="cms-' + esc(field.key) + '">' + esc(field.label) + '</label>' +
              '<span class="fieldrow-flag" data-flag="' + esc(field.key) + '"></span>' +
            '</div>' +
            contentInput(field, stored) +
            '<div class="fieldrow-foot">' +
              '<span>' + (allowHtml ? 'Line breaks and italic emphasis are allowed.' : '') + '</span>' +
              '<button type="button" class="linkbtn" data-revert="' + esc(field.key) + '">Use default</button>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</section>';
    }).join('');

    $('contentPageMeta').textContent = edited
      ? edited + (edited === 1 ? ' field' : ' fields') + ' rewritten on this page'
      : 'Everything on this page is still the original copy';

    state.contentSnapshot = snapshot;
    state.contentDirty = false;

    refreshContentFlags();
    renderContentPreview();
    updateContentState();
    renderContentRail();
  }

  function snapshotFromOverrides(schema, overrides, into) {
    schema.fields.forEach(function (field) {
      var stored = Object.prototype.hasOwnProperty.call(overrides, field.key) ? overrides[field.key] : '';
      into[field.key] = String(stored == null ? '' : stored).trim();
    });
    return into;
  }

  function refreshContentFlags() {
    Array.prototype.forEach.call(document.querySelectorAll('#contentForm .fieldrow'), function (row) {
      var key = row.getAttribute('data-field');
      var input = document.getElementById('cms-' + key);
      var flag = row.querySelector('[data-flag]');
      var revert = row.querySelector('[data-revert]');
      if (!input || !flag) return;

      var value = input.value.trim();
      var stored = state.contentSnapshot[key] || '';

      if (value !== stored) {
        flag.textContent = 'Unsaved';
        flag.className = 'fieldrow-flag pending';
      } else if (value) {
        flag.textContent = 'Custom copy';
        flag.className = 'fieldrow-flag custom';
      } else {
        flag.textContent = '';
        flag.className = 'fieldrow-flag';
      }

      if (revert) revert.hidden = value === '';
    });
  }

  function renderContentPreview() {
    var schema = SCHEMA[state.contentPage];
    if (!schema) return;

    var groups = contentGroups(schema);
    var hero = groups.length ? groups[0].fields : [];
    var eyebrow = hero[0] ? contentResolved(hero[0]) : '';
    var headline = hero[1] ? contentResolved(hero[1]) : '';
    var standfirst = hero[2] ? contentResolved(hero[2]) : '';

    $('contentPreview').innerHTML =
      '<div class="cms-preview-body">' +
        (eyebrow ? '<p class="cms-eyebrow">' + esc(stripTags(eyebrow)) + '</p>' : '') +
        '<p class="cms-headline">' + cmsSanitize(headline) + '</p>' +
        (standfirst ? '<p class="cms-standfirst">' + esc(stripTags(standfirst)) + '</p>' : '') +
      '</div>' +
      '<span class="cms-preview-tag">Top of page · ' + esc(schema.label) + '</span>';
  }

  function updateContentState() {
    if (!SCHEMA[state.contentPage]) return;

    var changed = 0;
    var seen = {};

    Array.prototype.forEach.call(document.querySelectorAll('#contentForm [data-key]'), function (input) {
      var key = input.getAttribute('data-key');
      if (seen[key]) return;
      seen[key] = true;
      if (input.value.trim() !== (state.contentSnapshot[key] || '')) changed += 1;
    });

    state.contentDirty = changed > 0;

    $('contentState').textContent = changed
      ? changed + (changed === 1 ? ' unsaved change' : ' unsaved changes')
      : 'No unsaved changes';
    $('contentState').classList.toggle('dirty', changed > 0);

    $('contentSave').disabled = !changed;
    $('contentDiscard').disabled = !changed;
  }

  $('contentPages').addEventListener('click', function (event) {
    var item = event.target.closest('[data-page]');
    if (!item) return;

    var page = item.getAttribute('data-page');
    if (page === state.contentPage) return;
    if (state.contentDirty && !window.confirm('Leave this page without saving your changes?')) return;

    state.contentPage = page;
    loadContent();
  });

  $('contentForm').addEventListener('input', function (event) {
    if (!event.target.closest('[data-key]')) return;
    refreshContentFlags();
    updateContentState();
    renderContentPreview();
  });

  $('contentForm').addEventListener('click', function (event) {
    var button = event.target.closest('[data-revert]');
    if (!button) return;

    var input = document.getElementById('cms-' + button.getAttribute('data-revert'));
    if (!input) return;

    input.value = '';
    refreshContentFlags();
    updateContentState();
    renderContentPreview();
    input.focus();
  });

  $('contentForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    await saveContent();
  });

  $('contentDiscard').addEventListener('click', function () {
    loadContent();
    toast('Changes discarded.');
  });

  async function saveContent() {
    var page = state.contentPage;
    var schema = SCHEMA[page];
    if (!schema) return;

    var rows = [];
    var removeKeys = [];
    var now = new Date().toISOString();

    schema.fields.forEach(function (field) {
      var read = contentField(field);
      if (!read) return;

      if (read.value === '') {
        if (state.contentSnapshot[field.key]) removeKeys.push(field.key);
      } else if (read.value !== (state.contentSnapshot[field.key] || '')) {
        rows.push({
          page: page,
          field_key: field.key,
          field_value: read.value,
          updated_at: now
        });
      }
    });

    if (!rows.length && !removeKeys.length) {
      toast('Nothing to save.');
      return;
    }

    var button = $('contentSave');
    button.disabled = true;

    try {
      if (rows.length) {
        var upsert = await db.from('site_content').upsert(rows, { onConflict: 'page,field_key' });
        if (upsert.error) throw upsert.error;
      }

      if (removeKeys.length) {
        var removed = await db.from('site_content')
          .delete()
          .eq('page', page)
          .in('field_key', removeKeys);
        if (removed.error) throw removed.error;
      }

      await refreshContentCounts();
      await loadContent();
      toast('Saved. The live page picks this up within a minute.');
    } catch (error) {
      fail('Could not save. Check that you are still signed in as an admin.');
      updateContentState();
    }
  }

  $('contentReset').addEventListener('click', async function () {
    var page = state.contentPage;
    var schema = SCHEMA[page];
    if (!schema) return;
    if (!window.confirm('Restore every field on ' + schema.label + ' to the copy written into the page?')) return;

    var result = await db.from('site_content').delete().eq('page', page);
    if (result.error) {
      fail('Could not restore this page.');
      return;
    }

    await refreshContentCounts();
    await loadContent();
    toast(schema.label + ' restored to the original copy.');
  });

  /* ---------------- blog ---------------- */

  var BLOG_FALLBACK = /relation .* does not exist|schema cache/i;

  function blogSlug(value) {
    var text = String(value || '').split('|')[0];
    if (text.normalize) text = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  function mdInline(text) {
    var out = esc(text);
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" loading="lazy">');
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return out;
  }

  function mdToHtml(markdown) {
    var lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    var html = [];
    var para = [];
    var list = null;
    var quote = [];
    var code = null;

    function flushPara() {
      if (para.length) { html.push('<p>' + mdInline(para.join(' ')) + '</p>'); para = []; }
    }
    function flushList() {
      if (!list) return;
      html.push('<' + list.type + '>' + list.items.map(function (item) {
        return '<li>' + mdInline(item) + '</li>';
      }).join('') + '</' + list.type + '>');
      list = null;
    }
    function flushQuote() {
      if (quote.length) {
        html.push('<blockquote>' + quote.map(mdInline).join('<br>') + '</blockquote>');
        quote = [];
      }
    }
    function flushAll() { flushPara(); flushList(); flushQuote(); }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (code !== null) {
        if (/^```/.test(line.trim())) {
          html.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
          code = null;
        } else {
          code.push(line);
        }
        continue;
      }

      if (/^```/.test(line.trim())) { flushAll(); code = []; continue; }
      if (!line.trim()) { flushAll(); continue; }

      var heading = line.match(/^(#{2,4})\s+(.*)$/);
      if (heading) {
        flushAll();
        var level = heading[1].length;
        html.push('<h' + level + '>' + mdInline(heading[2]) + '</h' + level + '>');
        continue;
      }

      if (/^>\s?/.test(line)) {
        flushPara(); flushList();
        quote.push(line.replace(/^>\s?/, ''));
        continue;
      }

      var bullet = line.match(/^\s*[-*]\s+(.*)$/);
      var numbered = line.match(/^\s*\d+\.\s+(.*)$/);
      if (bullet || numbered) {
        flushPara(); flushQuote();
        var type = bullet ? 'ul' : 'ol';
        if (!list || list.type !== type) { flushList(); list = { type: type, items: [] }; }
        list.items.push((bullet || numbered)[1]);
        continue;
      }

      flushList(); flushQuote();
      para.push(line.trim());
    }

    if (code !== null) html.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
    flushAll();
    return html.join('\n');
  }

  function updateBlogPreview() {
    var body = $('bp-body').value;
    var words = body.trim() ? body.trim().split(/\s+/).length : 0;
    $('blogWordCount').textContent = words ? words + ' words · ' + Math.max(1, Math.round(words / 220)) + ' min read' : '';
    $('blogPreview').innerHTML = body.trim()
      ? mdToHtml(body)
      : '<p class="admin-empty">Start typing to see the rendered post.</p>';
  }

  function renderBlogTable() {
    var container = $('blogTable');
    var posts = state.blogPosts || [];

    if (!posts.length) {
      container.innerHTML = '<p class="admin-empty">No posts yet. Create the first one.</p>';
      $('blogMeta').textContent = 'No posts yet.';
      return;
    }

    var published = posts.filter(function (post) { return post.status === 'published'; }).length;
    $('blogMeta').textContent = posts.length + ' post' + (posts.length === 1 ? '' : 's') + ' · ' +
      published + ' published · ' + (posts.length - published) + ' draft' + (posts.length - published === 1 ? '' : 's');

    container.innerHTML = '<table class="admin-table"><thead><tr>' +
      '<th>Title</th><th>Slug</th><th>Status</th><th>Published</th><th>Updated</th><th></th>' +
      '</tr></thead><tbody>' + posts.map(function (post) {
        return '<tr>' +
          '<td><strong>' + esc(post.title) + '</strong></td>' +
          '<td class="mono">/blog/' + esc(post.slug) + '/</td>' +
          '<td><span class="badge ' + (post.status === 'published' ? 'converted' : 'contacted') + '">' + esc(post.status) + '</span></td>' +
          '<td class="mono">' + esc(post.published_at ? fmtDate(post.published_at) : '—') + '</td>' +
          '<td class="mono">' + esc(fmtDate(post.updated_at)) + '</td>' +
          '<td class="mono">' +
            '<button type="button" class="admin-btn ghost" data-blog-edit="' + esc(post.id) + '">Edit</button> ' +
            (post.status === 'published'
              ? '<a class="admin-btn ghost" href="/blog/' + esc(post.slug) + '/" target="_blank" rel="noopener">View ↗</a> '
              : '') +
            '<button type="button" class="admin-btn danger" data-blog-del="' + esc(post.id) + '">Delete</button>' +
          '</td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  async function loadBlog() {
    var container = $('blogTable');
    container.innerHTML = '<p class="admin-empty">Loading…</p>';

    var result = await db.from('site_blog_posts')
      .select('id,slug,title,description,status,published_at,updated_at')
      .order('updated_at', { ascending: false });

    if (result.error) {
      var message = result.error.message || '';
      container.innerHTML = '<p class="admin-empty">Could not load posts. ' +
        (BLOG_FALLBACK.test(message) ? 'Run <code>supabase-blog.sql</code> in the Supabase SQL editor first.' : 'Check your connection and RLS policies.') +
        '</p>';
      $('blogMeta').textContent = 'Blog unavailable.';
      return;
    }

    state.blogPosts = result.data || [];
    renderBlogTable();
  }

  function setBlogField(id, value) {
    $(id).value = value == null ? '' : value;
  }

  function openBlogEditor(row, silent) {
    state.blogEditing = row || null;
    state.blogSlugTouched = !!(row && row.slug);

    $('blogEditorCard').hidden = false;
    $('blogEditorTitle').textContent = row ? 'Edit post' : 'New post';
    updateBreadcrumb('blog', row ? ('Edit: ' + (row.title || 'Untitled')) : 'New post');
    $('blogEditorMeta').textContent = row
      ? (row.status === 'published'
        ? 'Published — save to push a new build.'
        : 'Draft — only admins can see this.')
      : 'Not saved yet.';

    setBlogField('bp-title', row && row.title);
    setBlogField('bp-slug', row && row.slug);
    setBlogField('bp-description', row && row.description);
    setBlogField('bp-h1', row && row.h1);
    setBlogField('bp-crumb', row && row.crumb);
    setBlogField('bp-subtitle', row && row.subtitle);
    setBlogField('bp-pill', row && row.pill);
    setBlogField('bp-cta-h2', row && row.cta_h2);
    setBlogField('bp-cta-p', row && row.cta_p);
    setBlogField('bp-body', row && row.body);

    var isPublished = !!(row && row.status === 'published');
    $('blogDelete').hidden = !row;
    $('blogUnpublish').hidden = !isPublished;
    $('blogViewLive').hidden = !isPublished;
    if (isPublished) $('blogViewLive').href = '/blog/' + row.slug + '/';

    updateBlogPreview();
    if (!silent) $('blogEditorCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeBlogEditor() {
    state.blogEditing = null;
    $('blogEditorCard').hidden = true;
    updateBreadcrumb('blog');
  }

  function collectBlogFields() {
    return {
      title: $('bp-title').value.trim(),
      slug: blogSlug($('bp-slug').value || $('bp-title').value),
      description: $('bp-description').value.trim(),
      body: $('bp-body').value.trim(),
      h1: $('bp-h1').value.trim(),
      subtitle: $('bp-subtitle').value.trim(),
      pill: $('bp-pill').value.trim(),
      crumb: $('bp-crumb').value.trim(),
      cta_h2: $('bp-cta-h2').value.trim(),
      cta_p: $('bp-cta-p').value.trim()
    };
  }

  async function saveBlog(status) {
    var values = collectBlogFields();
    if (!values.title) { fail('Add a title first.'); return null; }
    if (!values.slug) { fail('Add a URL slug first.'); return null; }
    if (!values.body) { fail('The post needs a body.'); return null; }
    if (values.slug.length < 3) { fail('The slug is too short.'); return null; }

    var payload = Object.assign({}, values);
    if (status) {
      payload.status = status;
      if (status === 'published') {
        payload.published_at = (state.blogEditing && state.blogEditing.published_at) || new Date().toISOString();
      }
    } else if (!state.blogEditing) {
      payload.status = 'draft';
    }

    var button = $('blogSave');
    button.disabled = true;
    var result;
    try {
      result = state.blogEditing
        ? await db.from('site_blog_posts').update(payload).eq('id', state.blogEditing.id).select().single()
        : await db.from('site_blog_posts').insert(payload).select().single();
    } finally {
      button.disabled = false;
    }

    if (result.error) {
      var message = result.error.message || '';
      if (/duplicate key|unique/i.test(message)) {
        fail('That slug is already used by another post. Pick a different one.');
      } else if (BLOG_FALLBACK.test(message)) {
        fail('The blog table is missing. Run supabase-blog.sql in Supabase first.');
      } else {
        fail('Could not save the post.');
      }
      return null;
    }

    openBlogEditor(result.data, true);
    loadBlog();
    return result.data;
  }

  async function triggerRebuild() {
    var sessionResult = await db.auth.getSession();
    var token = sessionResult.data && sessionResult.data.session
      ? sessionResult.data.session.access_token
      : '';
    if (!token) { fail('Session expired. Sign in again.'); return false; }

    try {
      var response = await fetch('/api/rebuild', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      });
      var data = await response.json().catch(function () { return {}; });
      if (response.ok) {
        toast('Rebuild started. Live in about a minute.');
        return true;
      }
      fail(data.error || 'Could not start the rebuild.');
    } catch (error) {
      fail('Could not reach the rebuild endpoint.');
    }
    return false;
  }

  async function removeBlogPost(id) {
    if (!window.confirm('Delete this post permanently?')) return;
    var result = await db.from('site_blog_posts').delete().eq('id', id);
    if (result.error) {
      fail('Delete failed.');
      return;
    }
    if (state.blogEditing && state.blogEditing.id === id) closeBlogEditor();
    toast('Post deleted.');
    loadBlog();
    triggerRebuild();
  }

  $('blogRefresh').addEventListener('click', loadBlog);
  $('blogRebuild').addEventListener('click', triggerRebuild);
  $('blogNew').addEventListener('click', function () { openBlogEditor(null); });
  $('blogClose').addEventListener('click', closeBlogEditor);

  $('bp-body').addEventListener('input', updateBlogPreview);
  $('bp-subtitle').addEventListener('input', updateBlogPreview);

  $('bp-title').addEventListener('input', function () {
    if (!state.blogSlugTouched) {
      $('bp-slug').value = blogSlug($('bp-title').value);
    }
  });

  $('bp-slug').addEventListener('input', function () {
    state.blogSlugTouched = $('bp-slug').value.trim() !== '';
  });

  $('blogForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    var row = await saveBlog(null);
    if (!row) return;
    if (row.status === 'published') {
      triggerRebuild();
    } else {
      toast('Draft saved.');
    }
  });

  $('blogPublish').addEventListener('click', async function () {
    var row = await saveBlog('published');
    if (row) triggerRebuild();
  });

  $('blogUnpublish').addEventListener('click', async function () {
    if (!state.blogEditing) return;
    if (!window.confirm('Move this post back to draft? It leaves the public blog after the next rebuild.')) return;

    var result = await db.from('site_blog_posts')
      .update({ status: 'draft' })
      .eq('id', state.blogEditing.id)
      .select()
      .single();

    if (result.error) {
      fail('Could not unpublish.');
      return;
    }
    openBlogEditor(result.data, true);
    loadBlog();
    triggerRebuild();
  });

  $('blogDelete').addEventListener('click', function () {
    if (state.blogEditing) removeBlogPost(state.blogEditing.id);
  });

  $('blogTable').addEventListener('click', async function (event) {
    var edit = event.target.closest('[data-blog-edit]');
    var remove = event.target.closest('[data-blog-del]');

    if (edit) {
      var result = await db.from('site_blog_posts').select('*').eq('id', edit.getAttribute('data-blog-edit')).single();
      if (result.error) fail('Could not load the post.');
      else openBlogEditor(result.data);
    }

    if (remove) removeBlogPost(remove.getAttribute('data-blog-del'));
  });

  /* ---------------- projects ---------------- */
  var PROJECT_STATUS = {
    planning: 'Planning',
    active: 'Active',
    on_hold: 'On hold',
    completed: 'Completed',
    archived: 'Archived'
  };

  var ROLE_LABELS = {
    owner: 'Owner',
    admin: 'Admin',
    manager: 'Manager',
    member: 'Member',
    client: 'Client'
  };

  function slugify(value) {
    return String(value == null ? '' : value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  function missingSchema(error, migration) {
    var code = (error && error.code) || '';
    var text = String((error && error.message) || '');
    if (code !== 'PGRST205' && code !== '42P01' && !/schema cache|does not exist/i.test(text)) {
      return false;
    }
    return migration;
  }

  async function loadProjects() {
    var grid = $('projectsGrid');
    grid.innerHTML = '<p class="admin-empty">Loading…</p>';

    var result = await db
      .from('projects')
      .select('id,key,name,summary,status,priority,due_date,updated_at')
      .order('updated_at', { ascending: false });

    if (result.error) {
      var migration = missingSchema(result.error, 'supabase/migrations/0002_work.sql');
      if (migration) {
        grid.innerHTML = '<div class="invite-result"><strong>Projects table is missing</strong>' +
          '<p class="admin-empty" style="text-align:left;margin:0">Run <code>' + esc(migration) + '</code> in the Supabase SQL editor, then press Refresh.</p></div>';
      } else {
        grid.innerHTML = '<p class="admin-empty">Could not load projects: ' + esc(result.error.message) + '</p>';
      }
      return;
    }

    state.projects = result.data || [];

    if (!state.projects.length) {
      grid.innerHTML = '<p class="admin-empty">No projects yet.' +
        (isAdmin() ? ' Use “New project” to create the first one.' : '') + '</p>';
      return;
    }

    var progress = await Promise.all(state.projects.map(function (project) {
      return db.rpc('project_progress', { p_project: project.id });
    }));

    grid.innerHTML = state.projects.map(function (project, index) {
      var info = (progress[index] && progress[index].data) || {};
      var percent = Math.max(0, Math.min(100, Number(info.percent) || 0));
      var total = Number(info.total) || 0;
      var done = Number(info.done) || 0;

      return '<article class="project-card" role="button" tabindex="0" data-project-id="' + esc(project.id) + '">' +
        '<div class="project-foot">' +
          '<span class="project-key">' + esc(project.key) + '</span>' +
          '<span class="badge ' + esc(project.status) + '">' + esc(PROJECT_STATUS[project.status] || project.status) + '</span>' +
        '</div>' +
        '<h3>' + esc(project.name) + '</h3>' +
        '<p class="project-summary">' + esc(project.summary || 'No summary yet.') + '</p>' +
        '<div class="progress-track"><span style="width:' + percent + '%"></span></div>' +
        '<div class="project-foot">' +
          '<span>' + percent + '% · ' + done + '/' + total + ' tasks</span>' +
          '<span>' + esc(project.due_date ? 'Due ' + project.due_date : 'No due date') + '</span>' +
        '</div>' +
        '</article>';
    }).join('');

    fillProjectOptions(state.projects);
  }

  function fillProjectOptions(projects, force) {
    var box = $('tm-projects');
    if (!box) return;
    if (!force && box.querySelector('input[type="checkbox"]')) return;

    var list = projects || state.projects || [];
    if (!list.length) {
      box.innerHTML = '<p class="admin-empty">No projects yet.</p>';
      return;
    }

    box.innerHTML = list.map(function (project) {
      return '<label><input type="checkbox" value="' + esc(project.id) + '">' +
        '<span>' + esc(project.name) + ' <span class="project-key">' + esc(project.key) + '</span></span></label>';
    }).join('');
  }

  $('projectsRefresh').addEventListener('click', function () {
    loadProjects();
  });

  $('projectNew').addEventListener('click', function () {
    $('projectFormCard').hidden = false;
    $('projectFormCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('pp-name').focus();
  });

  $('projectCancel').addEventListener('click', function () {
    $('projectForm').reset();
    $('pp-status').value = 'active';
    $('projectFormCard').hidden = true;
  });

  $('projectForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    var key = $('pp-key').value.trim().toUpperCase();
    var name = $('pp-name').value.trim();

    if (!/^[A-Z][A-Z0-9]{1,7}$/.test(key)) {
      fail('Key needs 2 to 8 characters: a letter, then letters or digits.');
      return;
    }
    if (!name) {
      fail('Give the project a name.');
      return;
    }

    var base = slugify(name) || key.toLowerCase();
    var payload = {
      key: key,
      name: name,
      slug: base,
      summary: $('pp-summary').value.trim() || null,
      status: $('pp-status').value,
      due_date: $('pp-due').value || null,
      owner_id: state.profile.id,
      created_by: state.profile.id
    };

    var button = $('projectSave');
    button.disabled = true;

    var result = await db.from('projects').insert(payload).select('id').single();

    if (result.error && result.error.code === '23505' && /slug/i.test(result.error.message || '')) {
      payload.slug = base + '-' + Math.random().toString(36).slice(2, 6);
      result = await db.from('projects').insert(payload).select('id').single();
    }

    button.disabled = false;

    if (result.error) {
      fail(result.error.message || 'Could not create the project.');
      return;
    }

    toast('Project created.');
    $('projectForm').reset();
    $('pp-status').value = 'active';
    $('projectFormCard').hidden = true;
    loadProjects();
  });

  /* ---------------- project workspace ---------------- */
  var STATUS_COLUMNS = [
    ['backlog', 'Backlog'],
    ['todo', 'To do'],
    ['in_progress', 'In progress'],
    ['review', 'Review'],
    ['blocked', 'Blocked'],
    ['done', 'Done']
  ];

  function openProject(id) {
    state.projectId = id;
    activateTab('project');
  }

  function myProjectRole() {
    if (!state.project || !state.profile) return null;
    if (isAdmin()) return 'manager';
    if (state.project.owner_id === state.profile.id) return 'manager';
    for (var i = 0; i < state.people.length; i += 1) {
      if (state.people[i].user_id === state.profile.id) return state.people[i].project_role;
    }
    return null;
  }

  function canManageProject() {
    return myProjectRole() === 'manager';
  }

  async function loadProjectScreen() {
    if (!state.projectId) {
      activateTab('projects');
      return;
    }

    $('projectName').textContent = 'Loading…';
    $('projectKey').textContent = '—';
    $('projectSummary').textContent = '';
    $('projectMeta').innerHTML = '';
    $('moduleList').innerHTML = '<p class="admin-empty">Loading…</p>';
    $('projectMembers').innerHTML = '<p class="admin-empty">Loading…</p>';
    $('kanban').innerHTML = '<p class="admin-empty">Loading…</p>';

    var results = await Promise.all([
      db.from('projects').select('*').eq('id', state.projectId).maybeSingle(),
      db.from('modules').select('*').eq('project_id', state.projectId).order('position', { ascending: true }),
      db.from('tasks').select('*').eq('project_id', state.projectId).order('position', { ascending: true }),
      db.rpc('project_member_directory', { p_project: state.projectId })
    ]);

    if (results[0].error || !results[0].data) {
      fail(results[0].error ? results[0].error.message : 'Project not found.');
      activateTab('projects');
      return;
    }

    state.project = results[0].data;
    state.modules = results[1].data || [];
    state.tasks = results[2].data || [];
    state.people = results[3].error ? [] : (results[3].data || []);
    updateBreadcrumb('project');

    if (results[3].error) {
      toast('Run supabase/migrations/0003_collab.sql to show project people.', true);
    }

    renderProjectHeader();
    renderModules();
    renderMembers();
    renderBoard();
  }

  function renderProjectHeader() {
    var project = state.project;
    $('projectKey').textContent = project.key;
    $('projectName').textContent = project.name;
    $('projectSummary').textContent = project.summary || 'No summary yet.';

    var done = state.tasks.filter(function (task) { return task.status === 'done'; }).length;
    var total = state.tasks.length;
    var percent = total ? Math.round(done * 100 / total) : 0;

    $('projectProgressBar').style.width = percent + '%';
    $('projectProgressText').innerHTML =
      '<span>' + percent + '% · ' + done + '/' + total + ' tasks</span>' +
      '<span>' + esc(project.due_date ? 'Due ' + project.due_date : 'No due date') + '</span>';

    $('projectMeta').innerHTML = [
      '<span class="badge ' + esc(project.status) + '">' + esc(PROJECT_STATUS[project.status] || project.status) + '</span>',
      '<span><strong>Key</strong> ' + esc(project.key) + '</span>',
      '<span><strong>Modules</strong> ' + state.modules.length + '</span>',
      '<span><strong>People</strong> ' + state.people.length + '</span>',
      project.start_date ? '<span><strong>Started</strong> ' + esc(project.start_date) + '</span>' : '',
      project.due_date ? '<span><strong>Due</strong> ' + esc(project.due_date) + '</span>' : ''
    ].join('');
  }

  function renderModules() {
    var box = $('moduleList');
    $('moduleNew').hidden = !canManageProject();

    if (!state.modules.length) {
      box.innerHTML = '<p class="admin-empty">No modules yet.' +
        (canManageProject() ? ' Create one to group tasks.' : '') + '</p>';
      return;
    }

    box.innerHTML = state.modules.map(function (module) {
      var tasks = state.tasks.filter(function (task) { return task.module_id === module.id; });
      var done = tasks.filter(function (task) { return task.status === 'done'; }).length;
      var percent = tasks.length ? Math.round(done * 100 / tasks.length) : 0;

      return '<div class="module-row">' +
        '<div class="module-row-head">' +
          '<strong>' + esc(module.name) + '</strong>' +
          '<span class="badge ' + esc(module.status) + '">' + esc(PROJECT_STATUS[module.status] || module.status) + '</span>' +
        '</div>' +
        (module.description ? '<p>' + esc(module.description) + '</p>' : '') +
        '<div class="progress-track"><span style="width:' + percent + '%"></span></div>' +
        '<div class="module-foot">' +
          '<span>' + done + '/' + tasks.length + ' tasks</span>' +
          '<button type="button" class="admin-btn ghost" data-add-task="' + esc(module.id) + '">Add task</button>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  function renderMembers() {
    var box = $('projectMembers');
    $('memberForm').hidden = !isAdmin();

    if (!state.people.length) {
      box.innerHTML = '<p class="admin-empty">Nobody assigned yet. The project owner still has access.</p>';
      return;
    }

    box.innerHTML = state.people.map(function (person) {
      return '<div class="member-row">' +
        '<div><strong>' + esc(person.full_name || person.email || 'Member') + '</strong>' +
        '<span>' + esc(person.email || '') + '</span></div>' +
        '<span class="badge">' + esc(person.project_role) + '</span>' +
        '</div>';
    }).join('');
  }

  function renderBoard() {
    var filter = $('boardModuleFilter').value || '';

    $('boardModuleFilter').innerHTML = '<option value="">All modules</option>' +
      state.modules.map(function (module) {
        return '<option value="' + esc(module.id) + '">' + esc(module.name) + '</option>';
      }).join('');
    $('boardModuleFilter').value = filter;

    var byId = {};
    state.people.forEach(function (person) { byId[person.user_id] = person; });

    var tasks = state.tasks.filter(function (task) {
      return !filter || task.module_id === filter;
    });

    $('kanban').innerHTML = STATUS_COLUMNS.map(function (column) {
      var items = tasks.filter(function (task) { return task.status === column[0]; });

      var cards = items.length ? items.map(function (task) {
        var person = byId[task.assignee_id];
        var who = person ? (person.full_name || person.email) : 'Unassigned';
        return '<div class="kanban-card" draggable="true" data-task-id="' + esc(task.id) + '">' +
          '<div class="kanban-foot">' +
            '<span class="kanban-key">' + esc(task.key || '') + '</span>' +
            '<span class="prio ' + esc(task.priority) + '" title="' + esc(task.priority) + '"></span>' +
          '</div>' +
          '<strong>' + esc(task.title) + '</strong>' +
          '<div class="kanban-foot">' +
            '<small>' + esc(task.due_date || '—') + '</small>' +
            '<small>' + esc(who) + '</small>' +
          '</div>' +
          '</div>';
      }).join('') : '<p class="admin-empty" style="font-size:0.7rem">Empty</p>';

      return '<div class="kanban-col" data-status="' + column[0] + '">' +
        '<div class="kanban-col-head"><span>' + column[1] + '</span><b>' + items.length + '</b></div>' +
        '<div class="kanban-cards">' + cards + '</div>' +
        '</div>';
    }).join('');
  }

  function fillTaskSelectors() {
    $('task-module').innerHTML = '<option value="">Project level</option>' +
      state.modules.map(function (module) {
        return '<option value="' + esc(module.id) + '">' + esc(module.name) + '</option>';
      }).join('');

    $('task-assignee').innerHTML = '<option value="">Unassigned</option>' +
      state.people.map(function (person) {
        return '<option value="' + esc(person.user_id) + '">' +
          esc(person.full_name || person.email) + '</option>';
      }).join('');
  }

  function openTask(task) {
    fillTaskSelectors();

    $('taskEditorCard').hidden = false;
    $('taskId').value = task ? task.id : '';
    $('taskEditorKey').textContent = task ? (task.key || 'Task') : 'New task';
    $('task-title').value = task ? task.title : '';
    $('task-desc').value = task && task.description ? task.description : '';
    $('task-module').value = task && task.module_id ? task.module_id : '';
    $('task-assignee').value = task && task.assignee_id ? task.assignee_id : '';
    $('task-status').value = task ? task.status : 'todo';
    $('task-priority').value = task ? task.priority : 'medium';
    $('task-due').value = task && task.due_date ? task.due_date : '';
    $('task-estimate').value = task && task.estimate_hours ? task.estimate_hours : '';
    $('taskDelete').hidden = !(task && canManageProject());

    $('taskEditorCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('task-title').focus();
  }

  async function fillMemberCandidates() {
    if (!state.team.length) {
      try {
        var data = await api('/team');
        state.team = data.members || [];
      } catch (error) {
        state.team = [];
      }
    }

    var existing = state.people.map(function (person) { return person.user_id; });
    var options = state.team.filter(function (member) {
      return member.status === 'active'
        && member.role !== 'client'
        && existing.indexOf(member.id) === -1;
    });

    $('member-select').innerHTML = options.length
      ? options.map(function (member) {
          return '<option value="' + esc(member.id) + '">' +
            esc((member.full_name || member.email) + ' · ' + member.role) + '</option>';
        }).join('')
      : '<option value="">No one left to add</option>';
  }

  $('projectsGrid').addEventListener('click', function (event) {
    var card = event.target.closest('[data-project-id]');
    if (card) openProject(card.getAttribute('data-project-id'));
  });

  $('projectsGrid').addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    var card = event.target.closest('[data-project-id]');
    if (!card) return;
    event.preventDefault();
    openProject(card.getAttribute('data-project-id'));
  });

  $('projectBack').addEventListener('click', function () {
    state.projectId = null;
    activateTab('projects');
  });

  $('moduleNew').addEventListener('click', function () {
    $('moduleForm').reset();
    $('mod-status').value = 'active';
    $('moduleForm').hidden = false;
    $('mod-name').focus();
  });

  $('moduleCancel').addEventListener('click', function () {
    $('moduleForm').reset();
    $('moduleForm').hidden = true;
  });

  $('moduleForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    var result = await db.from('modules').insert({
      project_id: state.projectId,
      name: $('mod-name').value.trim(),
      description: $('mod-desc').value.trim() || null,
      status: $('mod-status').value,
      due_date: $('mod-due').value || null,
      position: state.modules.length + 1
    });

    if (result.error) {
      fail(result.error.message);
      return;
    }

    toast('Module created.');
    $('moduleForm').reset();
    $('moduleForm').hidden = true;
    loadProjectScreen();
  });

  $('moduleList').addEventListener('click', function (event) {
    var button = event.target.closest('[data-add-task]');
    if (!button) return;
    openTask(null);
    $('task-module').value = button.getAttribute('data-add-task');
  });

  $('memberForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    var userId = $('member-select').value;
    if (!userId) return;

    var result = await db.from('project_members').insert({
      project_id: state.projectId,
      user_id: userId,
      role: $('member-role').value,
      added_by: state.profile.id
    });

    if (result.error) {
      fail(result.error.message);
      return;
    }

    toast('Added to project.');
    loadProjectScreen();
  });

  $('memberForm').addEventListener('focusin', function () {
    if (!$('member-select').options.length) fillMemberCandidates();
  });

  $('taskNew').addEventListener('click', function () { openTask(null); });
  $('taskEditorClose').addEventListener('click', function () { $('taskEditorCard').hidden = true; });

  $('taskForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    var id = $('taskId').value;
    var estimate = $('task-estimate').value;

    var payload = {
      title: $('task-title').value.trim(),
      description: $('task-desc').value.trim() || null,
      module_id: $('task-module').value || null,
      assignee_id: $('task-assignee').value || null,
      status: $('task-status').value,
      priority: $('task-priority').value,
      due_date: $('task-due').value || null,
      estimate_hours: estimate ? Number(estimate) : null
    };

    var result;
    if (id) {
      result = await db.from('tasks').update(payload).eq('id', id);
    } else {
      payload.project_id = state.projectId;
      payload.reporter_id = state.profile.id;
      payload.position = (state.tasks.length + 1) * 1000;
      result = await db.from('tasks').insert(payload);
    }

    if (result.error) {
      fail(result.error.message);
      return;
    }

    toast(id ? 'Task saved.' : 'Task created.');
    $('taskEditorCard').hidden = true;
    loadProjectScreen();
  });

  $('taskDelete').addEventListener('click', async function () {
    var id = $('taskId').value;
    if (!id || !window.confirm('Delete this task and its comments?')) return;

    var result = await db.from('tasks').delete().eq('id', id);
    if (result.error) {
      fail(result.error.message);
      return;
    }

    toast('Task deleted.');
    $('taskEditorCard').hidden = true;
    loadProjectScreen();
  });

  $('boardModuleFilter').addEventListener('change', renderBoard);

  $('kanban').addEventListener('click', function (event) {
    var card = event.target.closest('[data-task-id]');
    if (!card) return;
    var id = card.getAttribute('data-task-id');
    var task = state.tasks.find(function (item) { return item.id === id; });
    if (task) openTask(task);
  });

  $('kanban').addEventListener('dragstart', function (event) {
    var card = event.target.closest('[data-task-id]');
    if (!card) return;
    event.dataTransfer.setData('text/plain', card.getAttribute('data-task-id'));
    event.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
  });

  $('kanban').addEventListener('dragend', function (event) {
    var card = event.target.closest('[data-task-id]');
    if (card) card.classList.remove('dragging');
  });

  $('kanban').addEventListener('dragover', function (event) {
    var column = event.target.closest('.kanban-col');
    if (!column) return;
    event.preventDefault();
    column.classList.add('drop');
  });

  $('kanban').addEventListener('dragleave', function (event) {
    var column = event.target.closest('.kanban-col');
    if (column && !column.contains(event.relatedTarget)) column.classList.remove('drop');
  });

  $('kanban').addEventListener('drop', async function (event) {
    var column = event.target.closest('.kanban-col');
    if (!column) return;

    event.preventDefault();
    column.classList.remove('drop');

    var id = event.dataTransfer.getData('text/plain');
    var status = column.getAttribute('data-status');
    var task = state.tasks.find(function (item) { return item.id === id; });

    if (!task || task.status === status) return;

    var result = await db.from('tasks').update({ status: status }).eq('id', id);
    if (result.error) {
      fail(result.error.message);
      return;
    }

    task.status = status;
    renderBoard();
    renderProjectHeader();
  });

  /* ---------------- team ---------------- */
  function randomPassword() {
    var alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%*';
    var bytes = new Uint32Array(20);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    var out = '';
    for (var i = 0; i < bytes.length; i += 1) {
      out += alphabet.charAt(bytes[i] % alphabet.length);
    }
    return out;
  }

  function syncTeamMode() {
    var invite = $('tm-mode').value === 'invite';
    var client = $('tm-role').value === 'client';

    if (client) {
      $('tm-mode').value = 'password';
      invite = false;
    }

    var inviteOption = $('tm-mode').querySelector('option[value="invite"]');
    if (inviteOption) inviteOption.disabled = client;

    $('tm-password-field').hidden = invite;
  }

  async function loadTeam() {
    var wrap = $('teamTable');
    wrap.innerHTML = '<p class="admin-empty">Loading…</p>';

    var data;
    try {
      data = await api('/team');
    } catch (error) {
      wrap.innerHTML = '<div class="invite-result"><strong>Could not load accounts</strong>' +
        '<p class="admin-empty" style="text-align:left;margin:0">' + esc(error.message) + '</p>' +
        (error.status === 503 ? '<p class="admin-empty" style="text-align:left;margin:0">Set <code>SUPABASE_SERVICE_KEY</code> in Vercel, then redeploy.</p>' : '') +
        '</div>';
      return;
    }

    var members = data.members || [];
    state.team = members;

    if (!members.length) {
      wrap.innerHTML = '<p class="admin-empty">No accounts yet.</p>';
      return;
    }

    wrap.innerHTML = '<table class="admin-table"><thead><tr>' +
      '<th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th></th>' +
      '</tr></thead><tbody>' +
      members.map(function (member) {
        var self = member.id === state.profile.id;
        var options = ['owner', 'admin', 'manager', 'member', 'client'].map(function (role) {
          var disabled = (role === 'owner' && state.role !== 'owner') ? ' disabled' : '';
          return '<option value="' + role + '"' + (member.role === role ? ' selected' : '') + disabled + '>' +
            ROLE_LABELS[role] + '</option>';
        }).join('');

        var next = member.status === 'suspended' ? 'active' : 'suspended';
        var action = member.status === 'suspended' ? 'Restore' : 'Suspend';

        return '<tr>' +
          '<td><strong>' + esc(member.full_name || '—') + '</strong></td>' +
          '<td>' + esc(member.email) + '</td>' +
          '<td><select class="admin-select" data-role-for="' + esc(member.id) + '"' +
            (self ? ' disabled title="You cannot change your own role"' : '') + '>' + options + '</select></td>' +
          '<td><span class="badge ' + esc(member.status) + '">' + esc(member.status) + '</span></td>' +
          '<td class="mono">' + esc(fmtDate(member.created_at)) + '</td>' +
          '<td class="mono">' +
            (self ? '' :
              '<button type="button" class="admin-btn ghost" data-status-for="' + esc(member.id) + '" data-next="' + next + '">' + action + '</button> ' +
              '<button type="button" class="admin-btn ghost" data-delete-for="' + esc(member.id) + '">Delete</button>') +
          '</td>' +
          '</tr>';
      }).join('') +
      '</tbody></table>';
  }

  $('teamNew').addEventListener('click', async function () {
    $('teamForm').reset();
    $('tm-role').value = 'member';
    $('tm-mode').value = 'password';
    $('teamResult').innerHTML = '';
    $('teamFormCard').hidden = false;
    syncTeamMode();

    if (!state.projects.length) {
      var result = await db.from('projects').select('id,key,name').order('name');
      if (!result.error) state.projects = result.data || [];
    }
    fillProjectOptions(state.projects, true);

    $('tm-name').focus();
  });

  $('teamCancel').addEventListener('click', function () {
    $('teamForm').reset();
    $('teamResult').innerHTML = '';
    $('teamFormCard').hidden = true;
  });

  $('tm-mode').addEventListener('change', syncTeamMode);
  $('tm-role').addEventListener('change', syncTeamMode);

  $('tm-generate').addEventListener('click', function () {
    $('tm-password').value = randomPassword();
    $('tm-password').focus();
  });

  $('teamForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    var role = $('tm-role').value;
    var invite = $('tm-mode').value === 'invite' && role !== 'client';
    var password = invite ? '' : $('tm-password').value;

    if (!invite && password.length < 10) {
      fail('Temporary passwords need at least 10 characters.');
      return;
    }

    var projectIds = Array.prototype.map.call(
      $('tm-projects').querySelectorAll('input[type="checkbox"]:checked'),
      function (input) { return input.value; }
    );

    var button = $('teamSave');
    button.disabled = true;

    try {
      var data = await api('/team/invite', {
        method: 'POST',
        body: {
          full_name: $('tm-name').value.trim(),
          email: $('tm-email').value.trim(),
          role: role,
          password: password,
          project_ids: projectIds
        }
      });

      $('teamResult').innerHTML = '<div class="invite-result">' +
        '<strong>Account created — ' + esc(data.email) + ' (' + esc(ROLE_LABELS[data.role] || data.role) + ')</strong>' +
        (data.password
          ? '<p class="admin-empty" style="text-align:left;margin:0">Share this password once. It is never shown again.</p>' +
            '<code>' + esc(data.password) + '</code>'
          : '<p class="admin-empty" style="text-align:left;margin:0">Supabase sent an invite email. The account stays “invited” until they set a password.</p>') +
        '</div>';

      $('teamForm').reset();
      $('tm-role').value = 'member';
      $('tm-mode').value = 'password';
      syncTeamMode();
      toast('Account created.');
      loadTeam();
      loadProjects();
    } catch (error) {
      fail(error.message);
    }

    button.disabled = false;
  });

  $('teamTable').addEventListener('change', async function (event) {
    var select = event.target.closest('[data-role-for]');
    if (!select) return;

    var id = select.getAttribute('data-role-for');
    select.disabled = true;

    try {
      await api('/team/' + id, { method: 'PATCH', body: { role: select.value } });
      toast('Role updated.');
    } catch (error) {
      fail(error.message);
    }

    loadTeam();
  });

  $('teamTable').addEventListener('click', async function (event) {
    var statusButton = event.target.closest('[data-status-for]');
    var deleteButton = event.target.closest('[data-delete-for]');

    if (statusButton) {
      statusButton.disabled = true;
      try {
        await api('/team/' + statusButton.getAttribute('data-status-for'), {
          method: 'PATCH',
          body: { status: statusButton.getAttribute('data-next') }
        });
        toast('Account updated.');
      } catch (error) {
        fail(error.message);
      }
      loadTeam();
      return;
    }

    if (deleteButton) {
      var id = deleteButton.getAttribute('data-delete-for');
      if (!window.confirm('Delete this account permanently? Their auth user is removed too.')) return;

      deleteButton.disabled = true;
      try {
        await api('/team/' + id, { method: 'DELETE' });
        toast('Account deleted.');
      } catch (error) {
        fail(error.message);
      }
      loadTeam();
    }
  });

  /* ---------------- settings ---------------- */
  var SEO_PAGES = [
    ['home', 'Homepage', '/'],
    ['about', 'About', '/about/'],
    ['services', 'Services', '/services/'],
    ['contact', 'Contact', '/contact/']
  ];

  var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  var COUNT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];

  function rgbaFromHex(hex, alpha) {
    var match = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!match) return 'transparent';
    var value = parseInt(match[1], 16);
    return 'rgba(' + ((value >> 16) & 255) + ', ' + ((value >> 8) & 255) + ', ' + (value & 255) + ', ' + alpha + ')';
  }

  function paintAccent(hex) {
    var box = $('accentPreview');
    if (!box) return;

    var colour = /^#[0-9a-f]{6}$/i.test(hex) ? hex : SETTINGS_DEFAULTS.accent_color;
    box.style.setProperty('--accent', colour);
    box.style.setProperty('--accent-hover', 'color-mix(in srgb, ' + colour + ' 78%, white)');
    box.style.setProperty('--accent-soft', rgbaFromHex(colour, 0.08));
    box.style.setProperty('--border-accent', rgbaFromHex(colour, 0.25));
  }

  function renderSectionSwitches() {
    $('sectionToggles').innerHTML = Object.keys(SECTION_LABELS).map(function (key) {
      var meta = SECTION_LABELS[key];
      var on = (state.settings[key] || 'on') !== 'off';

      return '<div class="switch-row">' +
        '<div class="switch-copy">' +
          '<label for="set-' + esc(key) + '">' + esc(meta.label) + '</label>' +
          '<p>' + esc(meta.note) + '</p>' +
        '</div>' +
        '<input class="switch" type="checkbox" id="set-' + esc(key) + '" data-setting="' + esc(key) + '"' + (on ? ' checked' : '') + '>' +
      '</div>';
    }).join('');
  }

  function seoValue(key) {
    var value = state.settings[key];
    return value == null || value === '' ? (SETTINGS_DEFAULTS[key] || '') : value;
  }

  function renderSeoFields() {
    $('seoFields').innerHTML = SEO_PAGES.map(function (page) {
      var key = page[0];

      return '<section class="seo-item" data-seo-page="' + esc(key) + '">' +
        '<div class="seo-item-head">' +
          '<h3>' + esc(page[1]) + '</h3>' +
          '<span class="mono">' + esc(page[2]) + '</span>' +
        '</div>' +
        '<div class="admin-field">' +
          '<label for="seo-title-' + esc(key) + '">Page title</label>' +
          '<input class="admin-input" id="seo-title-' + esc(key) + '" data-seo="seo_title_' + esc(key) +
            '" type="text" maxlength="90" value="' + esc(seoValue('seo_title_' + key)) + '">' +
          '<span class="counter" data-counter="seo-title-' + esc(key) + '"></span>' +
        '</div>' +
        '<div class="admin-field">' +
          '<label for="seo-desc-' + esc(key) + '">Description</label>' +
          '<textarea class="admin-textarea" id="seo-desc-' + esc(key) + '" data-seo="seo_description_' + esc(key) +
            '" rows="2" maxlength="240">' + esc(seoValue('seo_description_' + key)) + '</textarea>' +
          '<span class="counter" data-counter="seo-desc-' + esc(key) + '"></span>' +
        '</div>' +
        '<div class="seo-snippet">' +
          '<p class="seo-snippet-title" data-snippet-title></p>' +
          '<p class="seo-snippet-url">theflowlabs.online' + esc(page[2]) + '</p>' +
          '<p class="seo-snippet-desc" data-snippet-desc></p>' +
        '</div>' +
      '</section>';
    }).join('');

    updateSeoUi();
  }

  function updateSeoUi() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-seo]'), function (input) {
      var limit = input.getAttribute('data-seo').indexOf('seo_title_') === 0 ? 60 : 155;
      var length = input.value.trim().length;
      var counter = document.querySelector('[data-counter="' + input.id + '"]');

      if (counter) {
        counter.textContent = length + ' / ' + limit;
        counter.className = 'counter' + (length > limit ? ' over' : (length > limit * 0.9 ? ' near' : ''));
      }
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-seo-page]'), function (item) {
      var page = item.getAttribute('data-seo-page');
      var titleInput = document.getElementById('seo-title-' + page);
      var descInput = document.getElementById('seo-desc-' + page);
      var titleEl = item.querySelector('[data-snippet-title]');
      var descEl = item.querySelector('[data-snippet-desc]');

      if (titleEl) {
        titleEl.textContent = (titleInput && titleInput.value.trim()) ||
          SETTINGS_DEFAULTS['seo_title_' + page] || '';
      }
      if (descEl) {
        descEl.textContent = (descInput && descInput.value.trim()) ||
          SETTINGS_DEFAULTS['seo_description_' + page] || '';
      }
    });
  }

  function slotNote() {
    var month = String($('slotMonth').value || '');
    var total = parseInt($('slotTotal').value, 10);
    var taken = parseInt($('slotTaken').value, 10);

    var match = /^(\d{4})-(\d{2})$/.exec(month);
    if (!match) return 'Pick a month to describe availability.';

    var index = parseInt(match[2], 10) - 1;
    if (index < 0 || index > 11) return 'Pick a valid month.';

    var name = MONTH_NAMES[index];
    var next = MONTH_NAMES[(index + 1) % 12];

    if (isNaN(total) || total <= 0 || isNaN(taken) || taken < 0) {
      return 'Set how many seats the month offers and how many are taken.';
    }

    var left = Math.max(0, total - taken);

    if (left <= 0) return name + ' is full. The next opening is ' + next + '.';
    if (left === 1) return 'One ' + name + ' seat is left. After that, the next opening is ' + next + '.';

    var word = COUNT_WORDS[left] ? COUNT_WORDS[left].charAt(0).toUpperCase() + COUNT_WORDS[left].slice(1) : String(left);
    return word + ' ' + name + ' seats are still open. After those, the next opening is ' + next + '.';
  }

  function updateSlotPreview() {
    $('slotPreview').innerHTML = '<span>Public copy:</span> ' + esc(slotNote());
  }

  function collectSettings() {
    var values = {};

    values.accent_color = String($('accentHex').value || '').trim().toUpperCase();

    Array.prototype.forEach.call(document.querySelectorAll('[data-setting]'), function (input) {
      var key = input.getAttribute('data-setting');
      values[key] = input.type === 'checkbox'
        ? (input.checked ? 'on' : 'off')
        : String(input.value || '').trim();
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-seo]'), function (input) {
      values[input.getAttribute('data-seo')] = input.value.trim();
    });

    return values;
  }

  function updateSettingsState() {
    var current = collectSettings();
    var changed = 0;

    Object.keys(current).forEach(function (key) {
      if (current[key] !== (state.settingsSnapshot[key] || '')) changed += 1;
    });

    state.settingsDirty = changed > 0;

    $('settingsState').textContent = changed
      ? changed + (changed === 1 ? ' unsaved change' : ' unsaved changes')
      : 'No unsaved changes';
    $('settingsState').classList.toggle('dirty', changed > 0);

    $('settingsSave').disabled = !changed;
  }

  async function loadSettings() {
    var result = await db.from('site_settings').select('*');
    var stored = {};

    if (result.error) {
      fail('Could not load settings. Check that you are still signed in.');
    } else {
      (result.data || []).forEach(function (row) { stored[row.key] = row.value; });
    }

    state.settings = Object.assign({}, SETTINGS_DEFAULTS, stored);

    var accent = /^#[0-9a-f]{6}$/i.test(state.settings.accent_color || '')
      ? state.settings.accent_color
      : SETTINGS_DEFAULTS.accent_color;

    $('accentColor').value = accent.toLowerCase();
    $('accentHex').value = accent.toUpperCase();
    paintAccent(accent);

    renderSectionSwitches();

    $('slotMonth').value = state.settings.slot_month || '';
    $('slotTotal').value = state.settings.slot_total || '';
    $('slotTaken').value = state.settings.slot_taken || '';
    updateSlotPreview();

    renderSeoFields();

    state.settingsSnapshot = collectSettings();
    state.settingsDirty = false;
    updateSettingsState();
  }

  $('accentColor').addEventListener('input', function () {
    $('accentHex').value = $('accentColor').value.toUpperCase();
    paintAccent($('accentColor').value);
    updateSettingsState();
  });

  $('accentHex').addEventListener('input', function () {
    var value = $('accentHex').value.trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) $('accentColor').value = value.toLowerCase();
    paintAccent(value);
    updateSettingsState();
  });

  $('accentReset').addEventListener('click', function () {
    var fallback = SETTINGS_DEFAULTS.accent_color;
    $('accentColor').value = fallback.toLowerCase();
    $('accentHex').value = fallback.toUpperCase();
    paintAccent(fallback);
    updateSettingsState();
  });

  $('settingsForm').addEventListener('input', function (event) {
    if (event.target.closest('[data-seo]')) updateSeoUi();
    if (event.target.id === 'slotMonth' || event.target.id === 'slotTotal' || event.target.id === 'slotTaken') {
      updateSlotPreview();
    }
    updateSettingsState();
  });

  $('settingsForm').addEventListener('change', function (event) {
    if (event.target.type === 'checkbox' || event.target.type === 'month') updateSettingsState();
    if (event.target.type === 'month') updateSlotPreview();
  });

  $('settingsForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    var values = collectSettings();

    if (!/^#[0-9A-F]{6}$/.test(values.accent_color)) {
      fail('Accent must be a six-digit hex colour, for example #3B82F6.');
      return;
    }

    var total = parseInt(values.slot_total, 10);
    var taken = parseInt(values.slot_taken, 10);

    if (isNaN(total) || total < 0 || isNaN(taken) || taken < 0) {
      fail('Availability needs a whole number of seats.');
      return;
    }

    if (taken > total) {
      fail('Seats taken cannot be higher than seats offered.');
      return;
    }

    var now = new Date().toISOString();
    var rows = [];

    Object.keys(values).forEach(function (key) {
      if (values[key] === (state.settingsSnapshot[key] || '')) return;
      rows.push({ key: key, value: values[key], updated_at: now });
    });

    if (!rows.length) {
      toast('Nothing to save.');
      return;
    }

    var button = $('settingsSave');
    button.disabled = true;

    var result = await db.from('site_settings').upsert(rows, { onConflict: 'key' });
    if (result.error) {
      button.disabled = false;
      fail('Could not save settings. Check that you are still signed in as an admin.');
      return;
    }

    await loadSettings();
    toast('Settings saved. The live site picks this up within a minute.');
  });

  /* ---------------- start ---------------- */

  boot().catch(function () {
    showAuth('Could not reach Supabase. Check the project URL and anon key.');
  });
})();
