/* The Flow Labs — content and settings overrides. Fails open. */
(function () {
  'use strict';

  var PAGE_MAP = {
    '/': 'home',
    '/about': 'about',
    '/services': 'services',
    '/contact': 'contact',
    '/bhubaneswar': 'bhubaneswar',
    '/lab-report': 'lab_report',
    '/work': 'work',
    '/blog': 'blog_index',
    '/privacy-policy': 'privacy',
    '/terms': 'terms',
    '/services/web-development': 'services_web_dev',
    '/services/custom-software-development': 'services_custom_software',
    '/services/ai-automation': 'services_ai_automation',
    '/services/ai-chatbot-development': 'services_ai_chatbot',
    '/work/droovee': 'work_droovee',
    '/work/bhuverify': 'work_bhuverify',
    '/work/carbon-coach': 'work_carbon_coach',
    '/work/drishti': 'work_drishti',
    '/work/flowops': 'work_flowops',
    '/work/interview-copilot': 'work_interview_copilot',
    '/work/qr-platform': 'work_qr_platform'
  };

  function currentPage() {
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    return PAGE_MAP[path] || null;
  }

  function getJSON(url) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (controller) controller.abort();
    }, 3000);

    return fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      clearTimeout(timer);
      if (!response.ok) throw new Error('request failed');
      return response.json();
    }).catch(function (error) {
      clearTimeout(timer);
      throw error;
    });
  }

  /* Only structural inline tags are allowed in CMS copy. */
  var ALLOWED = { BR: 1, EM: 1, STRONG: 1, B: 1, I: 1, A: 1 };

  function sanitize(html) {
    var template = document.createElement('template');
    template.innerHTML = String(html);

    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType !== 1) return;

        if (!ALLOWED[child.tagName]) {
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
          if (!/^(https?:|mailto:|\/|#)/i.test(href)) {
            child.removeAttribute('href');
          } else {
            child.setAttribute('rel', 'noopener');
          }
        }

        walk(child);
      });
    })(template.content);

    return template.innerHTML;
  }

  function applyContent(values) {
    if (!values || typeof values !== 'object') return;

    Object.keys(values).forEach(function (key) {
      if (!/^[a-z0-9-]+$/.test(key)) return;
      var el = document.querySelector('[data-cms="' + key + '"]');
      if (!el) return;
      var value = values[key];
      if (value === null || value === undefined || value === '') return;
      el.innerHTML = sanitize(value);
    });
  }

  function hexToRgba(hex, alpha) {
    var match = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!match) return null;
    var value = parseInt(match[1], 16);
    return 'rgba(' + ((value >> 16) & 255) + ', ' + ((value >> 8) & 255) + ', ' + (value & 255) + ', ' + alpha + ')';
  }

  function setMeta(name, value) {
    if (!value) return;
    var el = document.querySelector('meta[name="' + name + '"]') ||
             document.querySelector('meta[property="' + name + '"]');
    if (el) el.setAttribute('content', value);
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

  var COUNT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];

  /* Slot meter: month, capacity and taken count all live in site_settings,
     so availability can be updated from HQ without a redeploy. */
  function applySlots(settings) {
    var meters = document.querySelectorAll('[data-slots]');
    if (!meters.length) return;

    var monthMatch = /^(\d{4})-(\d{2})$/.exec(String(settings.slot_month || ''));
    var monthInfo = null;
    if (monthMatch) {
      var idx = parseInt(monthMatch[2], 10) - 1;
      if (idx >= 0 && idx <= 11) {
        monthInfo = {
          value: monthMatch[1] + '-' + monthMatch[2],
          name: MONTHS[idx],
          next: MONTHS[(idx + 1) % 12]
        };
      }
    }

    var total = parseInt(settings.slot_total, 10);
    var taken = parseInt(settings.slot_taken, 10);
    var hasTotal = !isNaN(total) && total > 0;
    var hasTaken = !isNaN(taken) && taken >= 0;

    Array.prototype.forEach.call(meters, function (meter) {
      if (monthInfo) meter.setAttribute('data-month', monthInfo.value);

      var totalEl = meter.querySelector('[data-slots-total]');
      var takenEl = meter.querySelector('[data-slots-taken]');
      var note = meter.querySelector('.slot-note');

      if (hasTotal) {
        meter.setAttribute('data-total', String(total));
        if (totalEl) totalEl.textContent = String(total);
      }
      if (hasTaken) {
        meter.setAttribute('data-taken', String(taken));
        if (takenEl) takenEl.textContent = String(taken);
      }

      if (note && monthInfo && hasTotal && hasTaken) {
        var left = Math.max(0, total - taken);
        if (left <= 0) {
          note.textContent = monthInfo.name + ' is full. The next opening is ' + monthInfo.next + '.';
        } else if (left === 1) {
          note.textContent = 'One ' + monthInfo.name + ' seat is left. After that, the next opening is ' + monthInfo.next + '.';
        } else {
          var word = COUNT_WORDS[left] ? COUNT_WORDS[left].charAt(0).toUpperCase() + COUNT_WORDS[left].slice(1) : String(left);
          note.textContent = word + ' ' + monthInfo.name + ' seats are still open. After those, the next opening is ' + monthInfo.next + '.';
        }
      }
    });

    if (window.FLSlots && typeof window.FLSlots.render === 'function') {
      window.FLSlots.render();
    }
  }

  function applySettings(settings) {
    if (!settings || typeof settings !== 'object') return;
    var root = document.documentElement;
    var page = currentPage();

    var accent = settings.accent_color;
    if (accent && /^#[0-9a-f]{6}$/i.test(accent)) {
      root.style.setProperty('--accent', accent);
      if (window.CSS && CSS.supports && CSS.supports('color', 'color-mix(in srgb, red, white)')) {
        root.style.setProperty('--accent-hover', 'color-mix(in srgb, ' + accent + ' 78%, white)');
      } else {
        root.style.setProperty('--accent-hover', accent);
      }
      var soft = hexToRgba(accent, 0.08);
      var edge = hexToRgba(accent, 0.25);
      if (soft) root.style.setProperty('--accent-soft', soft);
      if (edge) root.style.setProperty('--border-accent', edge);
    }

    if (page) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-section]'), function (el) {
        var key = 'section_' + page + '_' + el.getAttribute('data-section');
        if (!(key in settings)) return;
        el.hidden = settings[key] === 'off';
      });

      var title = settings['seo_title_' + page];
      var description = settings['seo_description_' + page];
      if (title) {
        document.title = title;
        setMeta('og:title', title);
        setMeta('twitter:title', title);
      }
      if (description) {
        setMeta('description', description);
        setMeta('og:description', description);
        setMeta('twitter:description', description);
      }
    }

    applySlots(settings);
  }

  function init() {
    var page = currentPage();
    var requests = [getJSON('/api/settings').catch(function () { return null; })];

    if (page) {
      requests.push(getJSON('/api/content?page=' + encodeURIComponent(page)).catch(function () { return null; }));
    }

    Promise.all(requests).then(function (results) {
      applySettings(results[0]);
      if (page) applyContent(results[1]);
    }).catch(function () {
      /* defaults stay visible */
    });

    /* Live preview bridge for Flow HQ admin iframe */
    window.addEventListener('message', function (event) {
      if (!event.data || event.data.type !== 'cms-preview') return;
      var el = document.querySelector('[data-cms="' + event.data.key + '"]');
      if (el) el.innerHTML = sanitize(event.data.value || event.data.default || '');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
