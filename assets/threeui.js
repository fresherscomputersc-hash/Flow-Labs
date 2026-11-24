/**
 * THREEUI PRODUCTION SPATIAL ENGINE & INTERACTION SCRIPTS
 * Procedural WebGL Shaders, 3D Tilt Physics, Magnetic Buttons & Scoping Engine
 */

(function () {
  'use strict';

  /* -------------------------------------------------------------
     1. THREE.JS PROCEDURAL 3D WAVE / PARTICLE ENGINE
     ------------------------------------------------------------- */
  function initThreeCanvas() {
    const canvas = document.getElementById('threeuiCanvas');
    if (!canvas) return;

    let glRunning = false;

    if (typeof THREE !== 'undefined') {
      glRunning = bootThreeGL(canvas);
    }

    if (!glRunning) {
      const stop2D = bootProcedural2DWave(canvas);

      if (typeof THREE === 'undefined') {
        let attempts = 0;
        const checker = setInterval(() => {
          attempts++;
          if (typeof THREE !== 'undefined') {
            clearInterval(checker);
            if (stop2D) stop2D();
            bootThreeGL(canvas);
          } else if (attempts >= 15) {
            clearInterval(checker);
          }
        }, 200);
      }
    }
  }

  function bootThreeGL(canvas) {
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 1200);
      camera.position.z = 440;
      camera.position.y = 135;
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const SEPARATION = 42, AMOUNTX = 65, AMOUNTY = 45;
      const numParticles = AMOUNTX * AMOUNTY;
      const positions = new Float32Array(numParticles * 3);
      const scales = new Float32Array(numParticles);

      let i = 0, j = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
          positions[i + 1] = 0;
          positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
          scales[j] = 1.0;
          i += 3;
          j++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0x3B82F6) },
          color2: { value: new THREE.Color(0x06B6D4) },
        },
        vertexShader: `
          attribute float scale;
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = scale * (260.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform vec3 color2;
          varying vec3 vPosition;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.08, dist);
            float mixVal = clamp((vPosition.y + 40.0) / 80.0, 0.0, 1.0);
            vec3 finalColor = mix(color, color2, mixVal);
            gl_FragColor = vec4(finalColor, alpha * 0.95);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      let count = 0;
      let mouseX = 0, mouseY = 0;
      let targetX = 0, targetY = 0;
      let scrollY = 0;

      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.18;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.18;
      }, { passive: true });

      window.addEventListener('scroll', () => {
        scrollY = window.pageYOffset || document.documentElement.scrollTop;
      }, { passive: true });

      function animate() {
        requestAnimationFrame(animate);

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        camera.position.x = targetX;
        camera.position.y = 135 - targetY + (scrollY * 0.05);
        camera.lookAt(0, 0, 0);

        const positionAttr = particles.geometry.attributes.position;
        const scaleAttr = particles.geometry.attributes.scale;

        let idx = 0, sIdx = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iy = 0; iy < AMOUNTY; iy++) {
            positionAttr.array[idx + 1] = (Math.sin((ix + count) * 0.3) * 45) +
                                         (Math.sin((iy + count) * 0.5) * 45);

            scaleAttr.array[sIdx] = (Math.sin((ix + count) * 0.3) + 1) * 3.5 +
                                   (Math.sin((iy + count) * 0.5) + 1) * 3.5;
            idx += 3;
            sIdx++;
          }
        }

        positionAttr.needsUpdate = true;
        scaleAttr.needsUpdate = true;

        count += 0.038;
        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      return true;
    } catch (err) {
      console.warn('Three.js WebGL boot error:', err);
      return false;
    }
  }

  function bootProcedural2DWave(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let animationId = null;
    let width = 0, height = 0;
    let count = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    const COLS = 42;
    const ROWS = 28;

    function render2D() {
      ctx.clearRect(0, 0, width, height);

      const spacingX = width / (COLS - 1);
      const startY = height * 0.35;
      const spacingY = (height * 0.65) / (ROWS - 1);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const baseX = c * spacingX;
          const baseY = startY + r * spacingY;

          const persX = (baseX - width / 2) * (0.6 + (r / ROWS) * 0.6) + width / 2;
          const persY = baseY;

          const wave = Math.sin((c + count) * 0.3) * 25 + Math.cos((r + count) * 0.45) * 20;
          const dist = Math.hypot(persX - mouseX, persY - mouseY);
          const ripple = Math.max(0, 1 - dist / 220) * Math.sin(count * 3 - dist * 0.04) * 25;

          const finalY = persY + wave + ripple;
          const size = 1.2 + (r / ROWS) * 3.5;

          const mix = (wave + 25) / 50;
          ctx.beginPath();
          ctx.arc(persX, finalY, Math.max(0.8, size), 0, Math.PI * 2);
          ctx.fillStyle = mix > 0.5 ? 'rgba(6, 182, 212, 0.75)' : 'rgba(59, 130, 246, 0.75)';
          ctx.fill();
        }
      }

      count += 0.035;
      animationId = requestAnimationFrame(render2D);
    }

    render2D();

    return function cleanup() {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, width, height);
    };
  }

  /* -------------------------------------------------------------
     2. THREEUI 3D CARD TILT & SPECULAR PERIMETER LIGHT ENGINE
     ------------------------------------------------------------- */
  function init3DCardTilt() {
    const cards = document.querySelectorAll('[data-three-tilt]');

    cards.forEach((card) => {
      let bounds = null;

      card.addEventListener('mouseenter', () => {
        bounds = card.getBoundingClientRect();
      });

      card.addEventListener('mousemove', (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();

        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        card.style.setProperty('--mouse-x', `${mouseX}px`);
        card.style.setProperty('--mouse-y', `${mouseY}px`);

        const xPct = (mouseX / bounds.width) - 0.5;
        const yPct = (mouseY / bounds.height) - 0.5;

        const maxTilt = 7; // degrees
        const tiltY = xPct * maxTilt;
        const tiltX = -yPct * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        bounds = null;
      });
    });
  }

  /* -------------------------------------------------------------
     3. MAGNETIC BUTTON PHYSICS
     ------------------------------------------------------------- */
  function initMagneticButtons() {
    const magneticEls = document.querySelectorAll('[data-magnetic]');

    magneticEls.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const bounds = el.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        const deltaX = (e.clientX - centerX) * 0.28;
        const deltaY = (e.clientY - centerY) * 0.28;

        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  /* -------------------------------------------------------------
     4. INTERACTIVE SCOPING TERMINAL CALCULATOR & DISPATCH
     ------------------------------------------------------------- */
  /* -------------------------------------------------------------
     4. INTERACTIVE SCOPING TERMINAL CALCULATOR & DISPATCH
     ------------------------------------------------------------- */
  function initScopingCalculator() {
    const chips = document.querySelectorAll('[data-scope-type]');
    const featureChips = document.querySelectorAll('.feature-switch-chip');
    const slider = document.getElementById('scopeWeeks');
    const weeksDisplay = document.getElementById('weeksDisplay');
    const costDisplay = document.getElementById('costDisplay');
    let currentType = 'Web Application';
    let baseRate = 50000;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const val = chip.getAttribute('data-scope-type');

        if (val === 'web') { baseRate = 50000; currentType = 'Web Application'; }
        else if (val === 'software') { baseRate = 90000; currentType = 'Custom Platform'; }
        else if (val === 'ai') { baseRate = 85000; currentType = 'Applied AI & Automation'; }
        else if (val === 'audit') { baseRate = 35000; currentType = 'Architecture Audit'; }

        updateCalc();
      });
    });

    featureChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const input = chip.querySelector('input');
        if (input && e.target !== input) {
          input.checked = !input.checked;
        }
        if (input) {
          chip.classList.toggle('selected', input.checked);
          const ind = chip.querySelector('.switch-indicator');
          if (ind) ind.textContent = input.checked ? '✔' : '+';
        }
        updateCalc();
      });
    });

    if (slider) {
      slider.addEventListener('input', updateCalc);
    }

    function getSelectedFeatures() {
      const selected = [];
      featureChips.forEach(chip => {
        const input = chip.querySelector('input');
        if (input && input.checked) {
          const titleEl = chip.querySelector('.switch-title');
          const title = titleEl ? titleEl.textContent : '';
          const price = parseInt(input.getAttribute('data-price') || '0', 10);
          selected.push({ title, price });
        }
      });
      return selected;
    }

    function updateCalc() {
      const weeks = slider ? parseInt(slider.value, 10) : 3;
      if (weeksDisplay) weeksDisplay.textContent = `${weeks} Weeks`;

      const features = getSelectedFeatures();
      const featureTotal = features.reduce((sum, f) => sum + f.price, 0);
      const timelineRate = (weeks - 1) * 18000;
      const estCost = baseRate + timelineRate + featureTotal;

      if (costDisplay) {
        costDisplay.innerHTML = `₹${estCost.toLocaleString('en-IN')} <span>fixed</span>`;
      }
    }

    // Direct inquiry form submission
    const form = document.getElementById('inquiryForm');
    const statusBox = document.getElementById('formStatus');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const nameInput = document.getElementById('inqName');
        const contactInput = document.getElementById('inqContact');
        const reqInput = document.getElementById('inqRequirements');

        const name = nameInput ? nameInput.value.trim() : '';
        const contact = contactInput ? contactInput.value.trim() : '';
        const requirements = reqInput ? reqInput.value.trim() : '';
        const weeks = slider ? slider.value : '3';
        const features = getSelectedFeatures().map(f => f.title).join(', ');

        if (!name || !contact) {
          if (statusBox) {
            statusBox.textContent = 'Please provide your name and contact email/phone.';
            statusBox.style.color = '#F87171';
            statusBox.style.display = 'block';
          }
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Transmitting Scope...</span>';
        }

        const fullIdea = (requirements ? requirements + '\n\n' : '') +
          (features ? 'Selected Features: ' + features : 'Standard Specification');

        const payload = {
          name: name,
          contact: contact,
          project_type: currentType,
          idea: fullIdea,
          budget: costDisplay ? costDisplay.textContent.replace('fixed', '').trim() : '',
          source: 'scoping_cockpit',
          user_agent: navigator.userAgent
        };

        try {
          const cfg = window.SITE_CONFIG || {};
          const supaUrl = cfg.supabaseUrl;
          const supaKey = cfg.supabaseAnonKey || cfg.supabaseKey;

          if (supaUrl && supaKey) {
            const url = supaUrl.replace(/\/+$/, '') + '/rest/v1/site_leads';
            const res = await fetch(url, {
              method: 'POST',
              headers: {
                'apikey': supaKey,
                'Authorization': `Bearer ${supaKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Supabase ' + res.status);
          }

          if (statusBox) {
            statusBox.innerHTML = '<strong style="color:#10B981;">✔ Project Scope Transmitted to Founders!</strong><br><span style="color:#94a3b8;font-size:0.75rem;">Slot reserved in December queue. We will review your specs and respond within 24–48 hours.</span>';
            statusBox.style.display = 'block';
            statusBox.style.background = 'rgba(16, 185, 129, 0.12)';
            statusBox.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          }
          form.reset();
          featureChips.forEach(c => {
            c.classList.remove('selected');
            const inp = c.querySelector('input');
            if (inp) inp.checked = false;
            const ind = c.querySelector('.switch-indicator');
            if (ind) ind.textContent = '+';
          });
          updateCalc();
        } catch (err) {
          console.warn('Inquiry dispatch fallback to mailto:', err);
          window.location.href = `mailto:hello@theflowlabs.online?subject=Build Inquiry: ${encodeURIComponent(currentType)}&body=${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Lock Build Slot</span>';
          }
        }
      });
    }
  }

  /* -------------------------------------------------------------
     5. DOCK ACTIVE SCROLL SPY
     ------------------------------------------------------------- */
  function initDockScrollSpy() {
    const sections = ['services', 'work', 'founders', 'estimator'];
    const dockLinks = document.querySelectorAll('.dock-links .dock-item');
    if (!dockLinks.length) return;

    function onScroll() {
      const scrollPos = (window.pageYOffset || document.documentElement.scrollTop) + 220;
      let currentSection = '';

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentSection = sections[i];
            break;
          }
        }
      }

      dockLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const targetId = href.replace('#', '');
        if (targetId && targetId === currentSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------------------------------------------
     6. TELEMETRY CLOCK
     ------------------------------------------------------------- */
  function initTelemetry() {
    const clockEl = document.querySelectorAll('[data-clock]');
    function updateClock() {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utc + (3600000 * 5.5));
      const hours = String(istTime.getHours()).padStart(2, '0');
      const mins = String(istTime.getMinutes()).padStart(2, '0');
      const secs = String(istTime.getSeconds()).padStart(2, '0');
      const formatted = `${hours}:${mins}:${secs}`;
      clockEl.forEach(el => { el.textContent = formatted; });
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* -------------------------------------------------------------
     INIT ALL MODULES ON DOM READY
     ------------------------------------------------------------- */
  function bootAll() {
    initThreeCanvas();
    init3DCardTilt();
    initMagneticButtons();
    initScopingCalculator();
    initDockScrollSpy();
    initTelemetry();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }
})();
