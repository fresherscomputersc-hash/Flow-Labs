/* The Flow Labs — Flow HQ admin logic. Client-side only. */
(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var SCHEMA = window.CONTENT_SCHEMA || {};
  var SETTINGS_DEFAULTS = window.SETTINGS_DEFAULTS || {};

  var $ = function (id) { return document.getElementById(id); };
  var state = {
    session: null,
    tab: 'dashboard',
    leadsPage: 0,
    leadsPageSize: 25,
    leadsTotal: 0,
    contentPage: 'home',
    settings: {}
  };

  var TAB_META = {
    dashboard: ['Dashboard', 'Site health at a glance.'],
    leads: ['Leads', 'Every enquiry, newest first.'],
    visitors: ['Visitors', 'Cookie-less page views and traffic sources.'],
    content: ['Content', 'Override public copy without a deploy.'],
    settings: ['Settings', 'Accent, sections and SEO defaults.']
  };

  var SECTION_LABELS = {
    section_home_work: 'Selected work',
    section_home_process: 'Process',
    section_home_faq: 'FAQ',
    section_home_team: 'Team',
    section_home_testimonials: 'Testimonials',
    section_home_cta: 'Contact CTA'
  };

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
    var check = await db.rpc('is_admin');
    if (check.error || check.data !== true) {
      await db.auth.signOut();
      showAuth('This account is not authorized for Flow HQ.');
      return;
    }

    state.session = session;
    $('authView').hidden = true;
    $('appView').hidden = false;
    $('adminUser').textContent = (session.user && session.user.email) || '';
    $('authError').classList.remove('show');

    var initial = (window.location.hash || '').replace('#', '');
    activateTab(TAB_META[initial] ? initial : 'dashboard');
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
  function activateTab(tab) {
    if (!TAB_META[tab]) tab = 'dashboard';
    state.tab = tab;

    Array.prototype.forEach.call(document.querySelectorAll('#adminNav [data-tab]'), function (button) {
      button.classList.toggle('active', button.getAttribute('data-tab') === tab);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.admin-view'), function (view) {
      view.classList.toggle('active', view.id === 'view-' + tab);
    });

    $('viewTitle').textContent = TAB_META[tab][0];
    $('viewSubtitle').textContent = TAB_META[tab][1];
    if (window.location.hash !== '#' + tab) {
      history.replaceState(null, '', '#' + tab);
    }

    if (tab === 'dashboard') loadDashboard();
    if (tab === 'leads') loadLeads();
    if (tab === 'visitors') loadVisitors();
    if (tab === 'content') loadContent();
    if (tab === 'settings') loadSettings();
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
    var tab = (window.location.hash || '').replace('#', '');
    if (TAB_META[tab] && tab !== state.tab) activateTab(tab);
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
  function initContentPages() {
    var select = $('contentPage');
    select.innerHTML = Object.keys(SCHEMA).map(function (key) {
      return '<option value="' + esc(key) + '">' + esc(SCHEMA[key].label) + '</option>';
    }).join('');
    select.value = state.contentPage;
  }

  async function loadContent() {
    initContentPages();
    var page = state.contentPage;
    var schema = SCHEMA[page];
    if (!schema) return;

    $('contentOpen').href = schema.path;

    var result = await db.from('site_content').select('*').eq('page', page);
    var overrides = {};
    if (!result.error) {
      (result.data || []).forEach(function (row) { overrides[row.field_key] = row.field_value; });
    }

    $('contentForm').innerHTML = schema.fields.map(function (field) {
      var value = Object.prototype.hasOwnProperty.call(overrides, field.key) ? overrides[field.key] : '';
      var input = field.type === 'longtext'
        ? '<textarea class="admin-textarea" id="cms-' + esc(field.key) + '" data-key="' + esc(field.key) + '" rows="3" placeholder="' + esc(field.default) + '">' + esc(value) + '</textarea>'
        : '<input class="admin-input" id="cms-' + esc(field.key) + '" data-key="' + esc(field.key) + '" type="text" placeholder="' + esc(field.default) + '" value="' + esc(value) + '">';
      return '<div class="admin-field">' +
        '<label for="cms-' + esc(field.key) + '">' + esc(field.label) + ' <span class="mono">' + esc(field.key) + '</span></label>' +
        input +
        '<small>Default: ' + esc(stripTags(field.default).slice(0, 110)) + '</small>' +
        '</div>';
    }).join('');

    renderContentPreview(page, overrides);
  }

  function renderContentPreview(page, overrides) {
    var schema = SCHEMA[page];
    if (!schema) return;

    $('contentPreview').innerHTML = schema.fields.map(function (field) {
      var has = Object.prototype.hasOwnProperty.call(overrides, field.key);
      var value = has ? overrides[field.key] : field.default;
      return '<h4>' + esc(field.label) + (has ? ' · override' : ' · default') + '</h4>' +
        '<p>' + esc(stripTags(value)).slice(0, 500) + '</p>';
    }).join('');
  }

  $('contentPage').addEventListener('change', function () {
    state.contentPage = $('contentPage').value;
    loadContent();
  });

  $('contentForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    await saveContent();
  });

  async function saveContent() {
    var page = state.contentPage;
    var schema = SCHEMA[page];
    if (!schema) return;

    var rows = [];
    var removeKeys = [];
    var now = new Date().toISOString();

    schema.fields.forEach(function (field) {
      var input = document.getElementById('cms-' + field.key);
      if (!input) return;
      var value = input.value.trim();
      if (value === '') {
        removeKeys.push(field.key);
      } else {
        rows.push({
          page: page,
          field_key: field.key,
          field_value: value,
          updated_at: now
        });
      }
    });

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

      toast('Content saved. Public cache clears in about 60 seconds.');
      await loadContent();
    } catch (error) {
      fail('Could not save content. Check that you are an authorized admin.');
    } finally {
      button.disabled = false;
    }
  }

  $('contentReset').addEventListener('click', async function () {
    var page = state.contentPage;
    if (!window.confirm('Remove every override for ' + (SCHEMA[page] ? SCHEMA[page].label : page) + '?')) return;

    var result = await db.from('site_content').delete().eq('page', page);
    if (result.error) {
      fail('Reset failed.');
    } else {
      toast('Page reset to hardcoded defaults.');
      loadContent();
    }
  });

  /* ---------------- settings ---------------- */
  async function loadSettings() {
    var result = await db.from('site_settings').select('*');
    var stored = {};
    if (!result.error) {
      (result.data || []).forEach(function (row) { stored[row.key] = row.value; });
    }
    state.settings = Object.assign({}, SETTINGS_DEFAULTS, stored);

    var accent = state.settings.accent_color || '#3B82F6';
    $('accentColor').value = /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#3B82F6';
    $('accentHex').value = accent;

    $('sectionToggles').innerHTML = Object.keys(SECTION_LABELS).map(function (key) {
      var on = (state.settings[key] || 'on') !== 'off';
      return '<div class="toggle-row">' +
        '<label for="set-' + esc(key) + '">' + esc(SECTION_LABELS[key]) + '</label>' +
        '<input type="checkbox" id="set-' + esc(key) + '" data-setting="' + esc(key) + '"' + (on ? ' checked' : '') + '>' +
        '</div>';
    }).join('');

    var seoPages = [
      ['home', 'Home'],
      ['about', 'About'],
      ['services', 'Services'],
      ['contact', 'Contact']
    ];

    $('seoFields').innerHTML = seoPages.map(function (pair) {
      var key = pair[0];
      var label = pair[1];
      return '<div class="admin-field">' +
        '<label for="seo-title-' + key + '">' + label + ' — meta title</label>' +
        '<input class="admin-input" id="seo-title-' + key + '" data-seo="seo_title_' + key + '" type="text" value="' + esc(state.settings['seo_title_' + key] || '') + '">' +
        '</div>' +
        '<div class="admin-field">' +
        '<label for="seo-desc-' + key + '">' + label + ' — meta description</label>' +
        '<textarea class="admin-textarea" id="seo-desc-' + key + '" data-seo="seo_description_' + key + '" rows="2">' + esc(state.settings['seo_description_' + key] || '') + '</textarea>' +
        '</div>';
    }).join('');
  }

  $('accentColor').addEventListener('input', function () {
    $('accentHex').value = $('accentColor').value.toUpperCase();
  });

  $('accentHex').addEventListener('input', function () {
    var value = $('accentHex').value.trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) $('accentColor').value = value;
  });

  $('settingsForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    var now = new Date().toISOString();
    var rows = [];
    var accent = $('accentHex').value.trim();

    if (!/^#[0-9a-f]{6}$/i.test(accent)) {
      fail('Accent must be a six-digit hex colour, e.g. #3B82F6.');
      return;
    }

    rows.push({ key: 'accent_color', value: accent, updated_at: now });

    Array.prototype.forEach.call(document.querySelectorAll('[data-setting]'), function (input) {
      rows.push({
        key: input.getAttribute('data-setting'),
        value: input.checked ? 'on' : 'off',
        updated_at: now
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-seo]'), function (input) {
      rows.push({
        key: input.getAttribute('data-seo'),
        value: input.value.trim(),
        updated_at: now
      });
    });

    var button = $('settingsSave');
    button.disabled = true;

    var result = await db.from('site_settings').upsert(rows, { onConflict: 'key' });
    button.disabled = false;

    if (result.error) {
      fail('Could not save settings.');
    } else {
      toast('Settings saved. Public cache clears in about 60 seconds.');
      loadSettings();
    }
  });

  /* ---------------- start ---------------- */
  boot().catch(function () {
    showAuth('Could not reach Supabase. Check the project URL and anon key.');
  });
})();
