/* The Flow Labs — public site behaviour.
   Nav, reveal, motion, intro, slots, work filter, services, Lab Report.
   No dependencies. Every module fails silently if its DOM is absent. */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  /* ---------------------------------------------------------- nav */
  var nav = document.getElementById('nav') || document.getElementById('header');
  var toggle = document.getElementById('nav-toggle') || document.getElementById('navToggle');
  var links = document.getElementById('nav-links') || document.getElementById('navLinks');

  if (nav) {
    var setScrolled = function () {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  var closeMenu = function () {
    if (!links || !toggle) return;
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = !links.classList.contains('open');
      links.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    });

    links.addEventListener('click', function (event) {
      if (event.target && event.target.tagName === 'A') closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', function (event) {
      if (!links.classList.contains('open')) return;
      if (links.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });
  }

  /* ------------------------------------------------------- reveals */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (revealEls.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('visible', 'in'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible', 'in');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

      revealEls.forEach(function (el) { observer.observe(el); });
    }
  }

  /* --------------------------------------------------------- year */
  Array.prototype.forEach.call(document.querySelectorAll('#year'), function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --------------------------------------------------- scroll rail */
  if (!reduced) {
    var rail = document.createElement('div');
    rail.className = 'scroll-rail';
    rail.setAttribute('aria-hidden', 'true');
    document.body.appendChild(rail);

    var railTick = false;
    var paintRail = function () {
      railTick = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      rail.style.width = pct.toFixed(2) + '%';
    };
    window.addEventListener('scroll', function () {
      if (railTick) return;
      railTick = true;
      window.requestAnimationFrame(paintRail);
    }, { passive: true });
    paintRail();
  }

  /* ------------------------------------------------------- intro */
  (function () {
    var intro = document.getElementById('intro');
    if (!intro) return;
    if (!document.documentElement.classList.contains('intro-on')) return;
    if (reduced) { document.documentElement.classList.remove('intro-on'); return; }

    var text = document.getElementById('introText');
    if (text) {
      var raw = text.getAttribute('data-text') || text.textContent || '';
      var out = '';
      for (var i = 0; i < raw.length; i++) {
        var ch = raw.charAt(i);
        if (ch === ' ') {
          out += '<span class="intro-letter space" style="--i:' + i + '">&nbsp;</span>';
        } else {
          out += '<span class="intro-letter" style="--i:' + i + '">' + ch + '</span>';
        }
      }
      text.innerHTML = out;
    }

    var finished = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      document.documentElement.classList.remove('intro-on');
      window.clearTimeout(timer);
      events.forEach(function (name) {
        window.removeEventListener(name, finish);
      });
    };
    var events = ['click', 'keydown', 'wheel', 'touchstart', 'scroll'];
    events.forEach(function (name) {
      window.addEventListener(name, finish, { passive: true });
    });
    var timer = window.setTimeout(finish, 1900);
  })();

  /* ---------------------------------------------------- flow field */
  (function () {
    var canvas = document.getElementById('flowField');
    if (!canvas || reduced || !canvas.getContext) return;
    if (navigator.connection && navigator.connection.saveData) return;

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var parts = [];
    var pointer = { x: -9999, y: -9999 };
    var running = false, raf = 0;
    var count = window.innerWidth < 760 ? 46 : 110;

    var resize = function () {
      var rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = w < 760 ? 46 : 110;
      seed();
    };

    var seed = function () {
      parts = [];
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.1 + 0.3
        });
      }
    };

    var step = function () {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      var isBright = document.body && (document.body.getAttribute('data-theme') === 'bright' || document.documentElement.getAttribute('data-theme') === 'bright');
      ctx.strokeStyle = isBright ? 'rgba(37,99,235,0.14)' : 'rgba(59,130,246,0.15)';
      ctx.fillStyle = isBright ? 'rgba(37,99,235,0.48)' : 'rgba(96,165,250,0.55)';
      ctx.lineWidth = isBright ? 0.75 : 0.6;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;

        if (finePointer) {
          var dx = p.x - pointer.x;
          var dy = p.y - pointer.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 16000 && d2 > 0.01) {
            var d = Math.sqrt(d2);
            var f = (1 - d / 126) * 0.55;
            p.x += (dx / d) * f;
            p.y += (dy / d) * f;
          }
        }

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j];
          var ax = p.x - q.x, ay = p.y - q.y;
          var dist = ax * ax + ay * ay;
          if (dist < 9000) {
            ctx.globalAlpha = (1 - dist / 9000) * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }
      raf = window.requestAnimationFrame(step);
    };

    var start = function () {
      if (running) return;
      running = true;
      step();
    };
    var stop = function () {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    window.addEventListener('resize', function () {
      window.clearTimeout(canvas._rt);
      canvas._rt = window.setTimeout(resize, 150);
    }, { passive: true });

    window.addEventListener('pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (inView) start();
    });

    var inView = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    }

    resize();
    start();
  })();

  /* ------------------------------------------------------ magnetic */
  if (finePointer && !reduced) {
    Array.prototype.forEach.call(document.querySelectorAll('.magnetic'), function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.10;
        var y = (e.clientY - r.top - r.height / 2) * 0.14;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------- tilt */
  if (finePointer && !reduced) {
    Array.prototype.forEach.call(document.querySelectorAll('.work-card'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-py * 1.1).toFixed(2) + 'deg) rotateY(' + (px * 1.1).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------- work filter */
  (function () {
    var bar = document.querySelector('[data-work-filter]');
    if (!bar) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-cat]'));
    var buttons = Array.prototype.slice.call(bar.querySelectorAll('button'));

    var apply = function (filter) {
      var before = {};
      cards.forEach(function (card) {
        if (!card.classList.contains('is-hidden')) {
          before[card.getAttribute('data-cat') + card.dataset.name] = card.getBoundingClientRect();
        }
      });

      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(/\s+/);
        var show = filter === 'all' || cats.indexOf(filter) !== -1;
        card.classList.toggle('is-hidden', !show);
      });

      if (!reduced) {
        cards.forEach(function (card) {
          if (card.classList.contains('is-hidden')) return;
          var key = card.getAttribute('data-cat') + card.dataset.name;
          var prev = before[key];
          if (!prev) {
            card.classList.remove('flip-in');
            void card.offsetWidth;
            card.classList.add('flip-in');
            return;
          }
          var now = card.getBoundingClientRect();
          var dx = prev.left - now.left;
          var dy = prev.top - now.top;
          if (!dx && !dy) return;
          card.style.transition = 'none';
          card.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
          window.requestAnimationFrame(function () {
            card.style.transition = '';
            card.style.transform = '';
          });
        });
      }
    };

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        apply(btn.getAttribute('data-filter') || 'all');
      });
    });
  })();

  /* ------------------------------------------------ services stack */
  (function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('.stack-item'));
    if (!items.length) return;

    items.forEach(function (item) {
      var head = item.querySelector('.stack-head');
      if (!head) return;
      head.addEventListener('click', function () {
        var open = !item.classList.contains('open');
        if (window.innerWidth < 900) {
          items.forEach(function (other) {
            other.classList.remove('open');
            var h = other.querySelector('.stack-head');
            if (h) h.setAttribute('aria-expanded', 'false');
          });
        }
        item.classList.toggle('open', open);
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    var toggle = document.querySelector('[data-compare]');
    var table = document.getElementById('compareTable');
    if (toggle && table) {
      toggle.addEventListener('click', function () {
        var open = !table.classList.contains('open');
        table.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var chooser = document.querySelector('[data-chooser]');
    if (chooser) {
      var out = chooser.querySelector('[data-chooser-result]');
      var opts = Array.prototype.slice.call(chooser.querySelectorAll('button[data-layer]'));
      opts.forEach(function (btn) {
        btn.addEventListener('click', function () {
          opts.forEach(function (b) { b.classList.remove('sel'); });
          btn.classList.add('sel');
          if (!out) return;
          out.classList.add('show');
          out.innerHTML = btn.getAttribute('data-answer');
        });
      });
    }
  })();

  /* ---------------------------------------------------- slot meter */
  (function () {
    var meters = Array.prototype.slice.call(document.querySelectorAll('[data-slots]'));
    if (!meters.length) return;
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var renderMeter = function (meter) {
      var now = new Date();
      var month = meter.getAttribute('data-month') || '';
      var totalEl = meter.querySelector('[data-slots-total]');
      var takenEl = meter.querySelector('[data-slots-taken]');
      var bars = meter.querySelector('[data-slots-bars]');
      var total = parseInt(totalEl ? totalEl.textContent : meter.getAttribute('data-total'), 10) || 0;
      var taken = parseInt(takenEl ? takenEl.textContent : meter.getAttribute('data-taken'), 10) || 0;

      var m = /^(\d{4})-(\d{2})$/.exec(month);
      if (m) {
        var y = parseInt(m[1], 10);
        var mo = parseInt(m[2], 10) - 1;
        if (y < now.getFullYear() || (y === now.getFullYear() && mo < now.getMonth())) {
          meter.hidden = true;
          return;
        }
        var label = meter.querySelector('[data-slots-label]');
        if (label && !label.getAttribute('data-cms')) label.textContent = monthNames[mo];
      }

      total = Math.max(1, Math.min(total, 12));
      taken = Math.max(0, Math.min(taken, total));
      var left = total - taken;

      if (bars) {
        bars.innerHTML = '';
        for (var i = 0; i < total; i++) {
          var bit = document.createElement('i');
          if (i < taken) bit.className = 'on';
          bars.appendChild(bit);
        }
      }

      if (left <= 0) {
        meter.classList.add('is-full');
        var count = meter.querySelector('.slot-count');
        if (count) count.innerHTML = 'This month is full — <b>join the next list</b>';
      }
    };

    meters.forEach(renderMeter);

    window.FLSlots = {
      render: function () {
        meters.forEach(function (meter) {
          meter.classList.remove('is-full');
          renderMeter(meter);
        });
      }
    };
  })();

  /* ------------------------------------------------- email assembly */
  (function () {
    var slots = Array.prototype.slice.call(document.querySelectorAll('[data-email]'));
    slots.forEach(function (slot) {
      var user = slot.getAttribute('data-user');
      var domain = slot.getAttribute('data-domain');
      if (!user || !domain) return;
      var address = user + '@' + domain;
      var a = document.createElement('a');
      a.href = 'mailto:' + address;
      a.textContent = address;
      slot.innerHTML = '';
      slot.appendChild(a);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-copy-email]'), function (btn) {
      btn.addEventListener('click', function () {
        var user = btn.getAttribute('data-user');
        var domain = btn.getAttribute('data-domain');
        if (!user || !domain) return;
        var address = user + '@' + domain;
        var done = function () {
          var old = btn.textContent;
          btn.textContent = 'Copied';
          btn.classList.add('done');
          window.setTimeout(function () {
            btn.textContent = old;
            btn.classList.remove('done');
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(address).then(done).catch(function () {});
        } else {
          var tmp = document.createElement('textarea');
          tmp.value = address;
          document.body.appendChild(tmp);
          tmp.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          document.body.removeChild(tmp);
        }
      });
    });
  })();

  /* ---------------------------------------------------- live clock */
  Array.prototype.forEach.call(document.querySelectorAll('[data-clock]'), function (el) {
    var paint = function () {
      try {
        el.textContent = new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false
        });
      } catch (e) {
        el.textContent = '';
      }
    };
    paint();
    window.setInterval(paint, 30000);
  });

  /* ------------------------------------------------------ counters */
  (function () {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) { el.textContent = el.getAttribute('data-count'); io.unobserve(el); return; }
        var start = performance.now();
        var tick = function (t) {
          var p = Math.min((t - start) / 700, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------- lab report */
  (function () {
    var form = document.getElementById('labForm');
    if (!form) return;
    var input = document.getElementById('labUrl');
    var out = document.getElementById('labReport');
    var err = document.getElementById('labError');
    var btn = form.querySelector('button[type="submit"]');

    var esc = function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    };

    var render = function (data) {
      if (!out) return;
      var grade = data.grade || '—';
      var host = data.host || input.value;
      var rows = (data.scores || []).map(function (s) {
        var cls = s.value < 50 ? 'warn' : (s.value < 75 ? 'mid' : '');
        return '<div class="bar-row"><span>' + esc(s.label) + '</span>' +
          '<div class="bar ' + cls + '"><i data-w="' + s.value + '"></i></div>' +
          '<span>' + s.value + '</span></div>';
      }).join('');
      var findings = (data.findings || []).slice(0, 3).map(function (f) {
        return '<li>' + esc(f) + '</li>';
      }).join('');

      out.innerHTML =
        '<div class="report-card">' +
          '<div class="report-head">' +
            '<div class="report-host">Lab report<strong>' + esc(host) + '</strong></div>' +
            '<div class="grade" id="labGrade">' + esc(grade) + '<small>OVERALL</small></div>' +
          '</div>' +
          '<div class="bars">' + rows + '</div>' +
          (findings ? '<ul class="report-findings">' + findings + '</ul>' : '') +
          '<div class="report-cta">' +
            '<a class="btn btn-primary" href="/contact/">Fix these with us</a>' +
            '<span class="lab-note">No signup. Scores cached for 24h.</span>' +
          '</div>' +
        '</div>';
      out.classList.add('show');

      window.requestAnimationFrame(function () {
        Array.prototype.forEach.call(out.querySelectorAll('.bar i'), function (bar) {
          bar.style.width = bar.getAttribute('data-w') + '%';
        });
        var g = document.getElementById('labGrade');
        if (g) g.classList.add('stamp');
      });
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();
      if (!value) return;
      if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
      try { new URL(value); } catch (ex) { value = ''; }
      if (!value) {
        if (err) { err.textContent = 'That does not look like a URL.'; err.hidden = false; }
        return;
      }
      if (err) err.hidden = true;
      if (btn) { btn.disabled = true; btn.textContent = 'Scanning…'; }
      if (out) out.classList.remove('show');

      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value })
      }).then(function (r) {
        if (!r.ok) throw new Error('audit failed');
        return r.json();
      }).then(render).catch(function () {
        if (err) {
          err.hidden = false;
          err.textContent = 'The scanner is busy right now. Try again in a minute, or email us and we will run it by hand.';
        }
      }).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Run the report'; }
      });
    });
  })();

  /* ------------------------------------------------ form check draw */
  (function () {
    var success = document.getElementById('successView');
    if (!success) return;
    var mo = new MutationObserver(function () {
      if (success.classList.contains('show')) success.classList.add('drawn');
    });
    mo.observe(success, { attributes: true, attributeFilter: ['class'] });
  })();
})();
