/**
 * THREEUI PRODUCTION SPATIAL ENGINE & INTERACTION SCRIPTS
 * Procedural WebGL Shaders, 3D Tilt Physics, Magnetic Buttons & Scoping Engine
 */

(function () {
  'use strict';

  /* -------------------------------------------------------------
     1. THREEUI 3D HERO SPATIAL FLOW ENGINE (HERO ONLY)
     Defining The Flow Labs: Interactive Spatial Geometry & Nodes
     ------------------------------------------------------------- */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    let glRunning = false;

    function attemptBoot() {
      if (typeof THREE !== 'undefined' && !glRunning) {
        glRunning = bootHeroThreeGL(canvas);
      }
      if (!glRunning) {
        bootHero2DFallback(canvas);
      }
    }

    if (typeof THREE !== 'undefined') {
      attemptBoot();
    } else {
      const stop2D = bootHero2DFallback(canvas);
      let attempts = 0;
      const checker = setInterval(() => {
        attempts++;
        if (typeof THREE !== 'undefined') {
          clearInterval(checker);
          if (stop2D) stop2D();
          bootHeroThreeGL(canvas);
        } else if (attempts >= 15) {
          clearInterval(checker);
        }
      }, 150);
    }
  }

  function bootHeroThreeGL(canvas) {
    try {
      const wrapper = canvas.parentElement || canvas;
      const width = wrapper.clientWidth || 600;
      const height = wrapper.clientHeight || 300;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 160;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);

      // Core Flow Geometry: Dynamic Torus Knot
      const knotGeom = new THREE.TorusKnotGeometry(36, 11, 120, 26, 2, 3);

      // Outer Cyan Hologram Wireframe
      const matWire = new THREE.MeshBasicMaterial({
        color: 0x06B6D4,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const knotMesh = new THREE.Mesh(knotGeom, matWire);
      scene.add(knotMesh);

      // Inner Electric Blue Core
      const matCore = new THREE.MeshBasicMaterial({
        color: 0x3B82F6,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const coreMesh = new THREE.Mesh(knotGeom, matCore);
      coreMesh.scale.set(0.92, 0.92, 0.92);
      scene.add(coreMesh);

      // Particle Stream around Flow Knot
      const particleCount = 450;
      const partGeom = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const posAttr = knotGeom.attributes.position;
      const totalVerts = posAttr.count;

      for (let p = 0; p < particleCount; p++) {
        const vIdx = Math.floor(Math.random() * totalVerts);
        positions[p * 3] = posAttr.getX(vIdx) + (Math.random() - 0.5) * 6;
        positions[p * 3 + 1] = posAttr.getY(vIdx) + (Math.random() - 0.5) * 6;
        positions[p * 3 + 2] = posAttr.getZ(vIdx) + (Math.random() - 0.5) * 6;
      }
      partGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const matPoints = new THREE.PointsMaterial({
        color: 0x67E8F9,
        size: 2.2,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const particles = new THREE.Points(partGeom, matPoints);
      scene.add(particles);

      // 3 Orbital Satellite Nodes: Interfaces (Cyan), Systems (Blue), Intelligence (Indigo)
      const satellitesGroup = new THREE.Group();
      const satDefs = [
        { radius: 68, speed: 0.015, color: 0x06B6D4, size: 2.4, yOffset: 0 },
        { radius: 76, speed: -0.012, color: 0x3B82F6, size: 2.6, yOffset: 8 },
        { radius: 84, speed: 0.018, color: 0x818CF8, size: 2.2, yOffset: -8 }
      ];

      const satMeshes = satDefs.map(def => {
        const sGeom = new THREE.SphereGeometry(def.size, 12, 12);
        const sMat = new THREE.MeshBasicMaterial({ color: def.color });
        const sMesh = new THREE.Mesh(sGeom, sMat);
        satellitesGroup.add(sMesh);
        return { mesh: sMesh, def, angle: Math.random() * Math.PI * 2 };
      });
      scene.add(satellitesGroup);

      // Interaction State: Mouse & Touch Physics
      let rotX = 0, rotY = 0;
      let targetRotX = 0, targetRotY = 0;
      let isInteracting = false;
      let lastTouchX = 0, lastTouchY = 0;
      let clockAngle = 0;
      let isVisible = true;
      let animId = null;

      function onPointerMove(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const y = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        targetRotY = x * 1.2;
        targetRotX = y * 1.2;
      }

      function onTouchStart(e) {
        if (e.touches && e.touches[0]) {
          isInteracting = true;
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
        }
      }

      function onTouchMove(e) {
        if (!e.touches || !e.touches[0]) return;
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        targetRotY += dx * 0.02;
        targetRotX += dy * 0.02;
      }

      canvas.addEventListener('mousemove', onPointerMove, { passive: true });
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchmove', onTouchMove, { passive: true });
      canvas.addEventListener('touchend', () => { isInteracting = false; }, { passive: true });

      // Click or tap burst acceleration
      canvas.addEventListener('click', () => {
        clockAngle += 0.8;
        matWire.opacity = 0.95;
        setTimeout(() => { matWire.opacity = 0.65; }, 400);
      });

      // Pause when out of view
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          isVisible = entries[0].isIntersecting;
        }, { threshold: 0.1 });
        obs.observe(wrapper);
      }

      // Responsive Resize
      function onResize() {
        const w = wrapper.clientWidth || 600;
        const h = wrapper.clientHeight || 300;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);

      // Render Loop
      function render() {
        animId = requestAnimationFrame(render);
        if (!isVisible) return;

        clockAngle += 0.012;

        rotX += (targetRotX - rotX) * 0.08;
        rotY += (targetRotY - rotY) * 0.08;

        knotMesh.rotation.x = rotX + clockAngle * 0.5;
        knotMesh.rotation.y = rotY + clockAngle * 0.7;
        coreMesh.rotation.x = rotX + clockAngle * 0.5;
        coreMesh.rotation.y = rotY + clockAngle * 0.7;

        particles.rotation.x = knotMesh.rotation.x;
        particles.rotation.y = knotMesh.rotation.y;

        satMeshes.forEach(sat => {
          sat.angle += sat.def.speed;
          sat.mesh.position.x = Math.cos(sat.angle) * sat.def.radius;
          sat.mesh.position.z = Math.sin(sat.angle) * (sat.def.radius * 0.7);
          sat.mesh.position.y = Math.sin(sat.angle * 2) * sat.def.yOffset;
        });

        renderer.render(scene, camera);
      }

      render();
      return true;
    } catch (err) {
      console.warn('Hero Three.js boot failure, falling back to 2D:', err);
      return false;
    }
  }

  function bootHero2DFallback(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const wrapper = canvas.parentElement || canvas;
    let width = 0, height = 0;
    let count = 0;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let isVisible = true;
    let animId = null;

    function resize() {
      width = canvas.width = wrapper.clientWidth || 600;
      height = canvas.height = wrapper.clientHeight || 300;
    }
    resize();
    window.addEventListener('resize', resize);

    function onPointer(e) {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      targetX = cx - rect.left - width / 2;
      targetY = cy - rect.top - height / 2;
    }
    canvas.addEventListener('mousemove', onPointer, { passive: true });
    canvas.addEventListener('touchmove', onPointer, { passive: true });

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.1 });
      obs.observe(wrapper);
    }

    function draw2D() {
      animId = requestAnimationFrame(draw2D);
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;

      const centerX = width / 2 + mouseX * 0.15;
      const centerY = height / 2 + mouseY * 0.15;

      // 3 Harmonic Flow Waves
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const pts = 60;
        const color = w === 0 ? 'rgba(6, 182, 212, 0.7)' : w === 1 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(99, 102, 241, 0.4)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8 - w * 0.3;

        for (let i = 0; i <= pts; i++) {
          const t = (i / pts) * Math.PI * 2;
          const r = 50 + w * 18 + Math.sin(t * 3 + count + w) * 12;
          const x = centerX + Math.cos(t) * r * 1.5;
          const y = centerY + Math.sin(t) * r * 0.85 + Math.sin(count * 2 + i * 0.2) * 8;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Orbital Satellites
      for (let s = 0; s < 3; s++) {
        const sAngle = count * (0.8 + s * 0.3) + s * 2.1;
        const sDist = 65 + s * 22;
        const sx = centerX + Math.cos(sAngle) * sDist * 1.5;
        const sy = centerY + Math.sin(sAngle) * sDist * 0.85;

        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = s === 0 ? '#06B6D4' : s === 1 ? '#3B82F6' : '#818CF8';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      count += 0.025;
    }

    draw2D();

    return function cleanup() {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }

  function initThreeCanvas() {
    // Disabled full-page background canvas in favor of focused hero spatial engine
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
    initHeroCanvas();
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
