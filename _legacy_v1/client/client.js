(function () {
  'use strict';

  var conf = window.SITE_CONFIG || {};
  var supabaseUrl = conf.supabaseUrl || (conf.supabase && conf.supabase.url);
  var supabaseKey = conf.supabaseAnonKey || (conf.supabase && conf.supabase.anonKey);

  if (!supabaseUrl || !supabaseKey || !window.supabase) {
    var errEl = document.getElementById('cpAuthError');
    if (errEl) {
      errEl.textContent = 'Configuration missing: Supabase credentials not found.';
      errEl.hidden = false;
    }
    return;
  }

  var db = window.supabase.createClient(supabaseUrl, supabaseKey);

  var state = {
    session: null,
    profile: null,
    projects: [],
    currentProject: null,
    modules: [],
    updates: [],
    files: []
  };

  function $(id) {
    return document.getElementById(id);
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (_) {
      return iso;
    }
  }

  function fmtBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return bytes + ' B';
    var kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    var mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  }

  /* ---------------- Auth & Initialization ---------------- */

  async function init() {
    var sessionRes = await db.auth.getSession();
    if (sessionRes.data && sessionRes.data.session) {
      handleSession(sessionRes.data.session);
    } else {
      showAuth();
    }

    db.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_IN' && session) {
        handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        showAuth();
      }
    });

    $('cpAuthForm').addEventListener('submit', handleSignIn);
    $('cpSignOutBtn').addEventListener('click', handleSignOut);
    $('cpProjectSelect').addEventListener('change', function () {
      var pid = this.value;
      var found = state.projects.find(function (p) { return p.id === pid; });
      if (found) {
        state.currentProject = found;
        loadProjectDetails(found.id);
      }
    });
  }

  async function handleSignIn(e) {
    e.preventDefault();
    var email = $('cpEmail').value.trim();
    var password = $('cpPassword').value;
    var btn = $('cpSignInBtn');
    var err = $('cpAuthError');

    err.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    var res = await db.auth.signInWithPassword({
      email: email,
      password: password
    });

    btn.disabled = false;
    btn.textContent = 'Sign In';

    if (res.error) {
      err.textContent = res.error.message || 'Invalid email or password.';
      err.hidden = false;
      return;
    }

    handleSession(res.data.session);
  }

  async function handleSignOut() {
    await db.auth.signOut();
    showAuth();
  }

  function showAuth(errorMessage) {
    state.session = null;
    state.profile = null;
    state.projects = [];
    state.currentProject = null;

    $('cpUserNav').hidden = true;
    $('cpPortalView').hidden = true;
    $('cpAuthView').hidden = false;

    var err = $('cpAuthError');
    if (errorMessage) {
      err.textContent = errorMessage;
      err.hidden = false;
    } else {
      err.hidden = true;
    }
  }

  async function handleSession(session) {
    state.session = session;
    var user = session.user;

    // Load profile
    var profRes = await db.from('profiles').select('*').eq('id', user.id).single();
    if (profRes.error || !profRes.data) {
      await db.auth.signOut();
      showAuth('Account record not found. Please contact support.');
      return;
    }

    var profile = profRes.data;
    state.profile = profile;

    if (profile.status === 'suspended') {
      await db.auth.signOut();
      showAuth('Your account has been suspended. Please contact hello@theflowlabs.online.');
      return;
    }

    $('cpUserName').textContent = profile.full_name || profile.email;
    $('cpUserRole').textContent = profile.role === 'client' ? 'Client' : 'Admin';
    $('cpUserNav').hidden = false;

    // Admin preview banner
    var isAdmin = profile.role === 'admin' || profile.role === 'owner';
    $('cpAdminBanner').hidden = !isAdmin;

    // Fetch projects accessible to this user
    await loadProjects(profile);
  }

  /* ---------------- Project Loading ---------------- */

  async function loadProjects(profile) {
    var projectsRes = await db.from('projects').select('*').order('created_at', { ascending: false });

    // If direct select fails or returns empty for client, check project_members
    if (projectsRes.error || !projectsRes.data || !projectsRes.data.length) {
      try {
        var memberProjRes = await db.from('project_members')
          .select('projects(*)')
          .eq('user_id', profile.id);
        if (memberProjRes.data && memberProjRes.data.length) {
          var pList = memberProjRes.data.map(function(item) { return item.projects; }).filter(Boolean);
          if (pList.length) projectsRes = { data: pList };
        }
      } catch (_) {}
    }

    if (projectsRes.error) {
      showEmptyPortal('Could not load projects. You may not be assigned to any active projects yet.');
      return;
    }

    var projects = projectsRes.data || [];
    state.projects = projects;

    if (!projects.length) {
      showEmptyPortal('No active projects are linked to your client account. Please contact your Flow Labs project lead.');
      return;
    }

    // Populate project selector if more than 1 project
    var sel = $('cpProjectSelect');
    var selWrap = $('cpProjectSelectWrap');
    if (projects.length > 1) {
      sel.innerHTML = projects.map(function (p) {
        return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>';
      }).join('');
      selWrap.hidden = false;
    } else {
      selWrap.hidden = true;
    }

    $('cpAuthView').hidden = true;
    $('cpPortalView').hidden = false;

    state.currentProject = projects[0];
    sel.value = projects[0].id;
    await loadProjectDetails(projects[0].id);
  }

  function showEmptyPortal(message) {
    $('cpAuthView').hidden = true;
    $('cpPortalView').hidden = false;
    $('cpProjectTitle').textContent = 'No Projects Found';
    $('cpProjectDesc').textContent = message;
    $('cpProjectKey').textContent = '—';
    $('cpProjectStatus').textContent = 'Inactive';
    $('cpProjectTarget').textContent = '—';
    $('cpModulesCount').textContent = '0 Modules';
    $('cpProgressPercent').textContent = '0%';
    $('cpProgressBarFill').style.width = '0%';
    $('cpModulesList').innerHTML = '<p class="cp-empty">' + esc(message) + '</p>';
    $('cpFilesList').innerHTML = '<p class="cp-empty">No deliverables available.</p>';
    $('cpUpdatesList').innerHTML = '<p class="cp-empty">No updates published.</p>';
  }

  async function loadProjectDetails(projectId) {
    var project = state.currentProject;
    if (!project) return;

    // Header info
    $('cpProjectTitle').textContent = project.name;
    $('cpProjectDesc').textContent = project.summary || project.description || 'Deliverables and engineering milestones tracked in real time.';
    $('cpProjectKey').textContent = project.key || project.slug || project.name.slice(0, 4).toUpperCase();
    $('cpProjectStatus').textContent = project.status ? (project.status.charAt(0).toUpperCase() + project.status.slice(1)) : 'Active';
    $('cpProjectTarget').textContent = fmtDate(project.due_date || project.target_delivery || project.target_date);

    // Staging Preview Link
    if ($('cpStagingBtn')) {
      var stagingUrl = project.staging_url || project.preview_url;
      if (stagingUrl) {
        $('cpStagingBtn').href = stagingUrl;
        $('cpStagingBtn').textContent = 'Open Staging Preview ↗';
        if ($('cpStagingStatusLabel')) $('cpStagingStatusLabel').textContent = 'Staging Environment Live';
      } else {
        $('cpStagingBtn').href = 'https://www.theflowlabs.online/#work';
        $('cpStagingBtn').textContent = 'View Reference Architecture ↗';
        if ($('cpStagingStatusLabel')) $('cpStagingStatusLabel').textContent = 'Staging Build Active';
      }
    }

    // Parallel fetch for modules, published updates, and client files
    await Promise.all([
      loadModules(projectId),
      loadUpdates(projectId),
      loadFiles(projectId)
    ]);
  }

  /* ---------------- Modules & Milestones ---------------- */

  async function loadModules(projectId) {
    var container = $('cpModulesList');
    container.innerHTML = '<p class="cp-empty">Loading scope modules…</p>';

    var res = await db.from('modules')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });

    if (res.error) {
      container.innerHTML = '<p class="cp-empty">Could not load modules.</p>';
      return;
    }

    var modules = res.data || [];
    state.modules = modules;
    $('cpModulesCount').textContent = modules.length + (modules.length === 1 ? ' Module' : ' Modules');

    if (!modules.length) {
      container.innerHTML = '<p class="cp-empty">No milestone modules defined yet.</p>';
      $('cpProgressPercent').textContent = '0%';
      $('cpProgressBarFill').style.width = '0%';
      return;
    }

    // Calculate progress based on module completion
    var completedCount = modules.filter(function (m) {
      return m.status === 'completed' || m.status === 'done';
    }).length;

    var pct = Math.round((completedCount / modules.length) * 100);
    $('cpProgressPercent').textContent = pct + '%';
    $('cpProgressBarFill').style.width = pct + '%';

    container.innerHTML = modules.map(function (m) {
      var st = (m.status || 'pending').toLowerCase();
      var label = st.charAt(0).toUpperCase() + st.slice(1);
      return '<div class="cp-module-item">' +
        '<div class="cp-module-info">' +
          '<h3>' + esc(m.name) + '</h3>' +
          '<p>' + esc(m.description || 'Deliverable in progress.') + '</p>' +
        '</div>' +
        '<div class="cp-module-status">' +
          '<span class="cp-pill ' + esc(st) + '">' + esc(label) + '</span>' +
          (m.due_date ? '<span class="mono" style="font-size:0.7rem;color:var(--text-muted)">Due ' + esc(fmtDate(m.due_date)) + '</span>' : '') +
        '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------------- Published Updates ---------------- */

  async function loadUpdates(projectId) {
    var container = $('cpUpdatesList');
    container.innerHTML = '<p class="cp-empty">Loading published updates…</p>';

    var res = await db.from('client_updates')
      .select('id, title, body, published_at, created_at, profiles(full_name, email)')
      .eq('project_id', projectId)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (res.error) {
      container.innerHTML = '<p class="cp-empty">Could not load updates.</p>';
      return;
    }

    var updates = res.data || [];
    state.updates = updates;

    if (!updates.length) {
      container.innerHTML = '<p class="cp-empty">No updates published yet. Check back soon for sprint progress reports.</p>';
      return;
    }

    container.innerHTML = updates.map(function (u) {
      var author = u.profiles ? (u.profiles.full_name || u.profiles.email) : 'Founders';
      var dateStr = fmtDate(u.published_at || u.created_at);
      return '<div class="cp-update-card">' +
        '<div class="cp-update-head">' +
          '<h3 class="cp-update-title">' + esc(u.title) + '</h3>' +
          '<span class="cp-update-date">' + esc(dateStr) + '</span>' +
        '</div>' +
        '<div class="cp-update-body">' + esc(u.body) + '</div>' +
        '<div style="font-size:0.7rem;color:var(--text-muted);display:flex;align-items:center;gap:0.4rem;">' +
          '<span>Shared by ' + esc(author) + '</span>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------------- Client Deliverables / Files ---------------- */

  function getFileIcon(filename) {
    var ext = String(filename || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄 PDF';
    if (ext === 'zip' || ext === 'tar' || ext === 'gz') return '📦 ZIP';
    if (['js', 'ts', 'tsx', 'py', 'json', 'sql'].indexOf(ext) !== -1) return '💻 CODE';
    if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'fig'].indexOf(ext) !== -1) return '🎨 ASSET';
    return '📋 DOC';
  }

  async function loadFiles(projectId) {
    var container = $('cpFilesList');
    container.innerHTML = '<p class="cp-empty">Loading files…</p>';

    var res = await db.from('attachments')
      .select('id, file_name, storage_path, size_bytes, created_at')
      .eq('project_id', projectId)
      .eq('client_visible', true)
      .order('created_at', { ascending: false });

    if (res.error) {
      container.innerHTML = '<p class="cp-empty">Could not load files.</p>';
      return;
    }

    var files = res.data || [];
    state.files = files;

    if (!files.length) {
      container.innerHTML = '<p class="cp-empty">No verified handover files or assets published yet.</p>';
      return;
    }

    container.innerHTML = files.map(function (f) {
      var meta = [fmtBytes(f.size_bytes), fmtDate(f.created_at)].filter(Boolean).join(' · ');
      var icon = getFileIcon(f.file_name);
      return '<div class="cp-file-card">' +
        '<div class="cp-file-info">' +
          '<span class="cp-file-icon mono">' + icon + '</span>' +
          '<div>' +
            '<div class="cp-file-title">' + esc(f.file_name) + '</div>' +
            '<div class="cp-file-meta mono">' + esc(meta) + '</div>' +
          '</div>' +
        '</div>' +
        '<a href="' + esc(f.storage_path) + '" class="cp-btn ghost sm" target="_blank" rel="noopener">Download ⬇</a>' +
        '</div>';
    }).join('');
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
