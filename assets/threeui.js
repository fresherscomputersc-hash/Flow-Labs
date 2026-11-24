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

    if (typeof THREE === 'undefined') {
      init2DFallback(canvas);
      return;
    }

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.z = 400;
      camera.position.y = 120;
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Particle grid
      const SEPARATION = 40, AMOUNTX = 65, AMOUNTY = 45;
      const numParticles = AMOUNTX * AMOUNTY;
      const positions = new Float32Array(numParticles * 3);
      const scales = new Float32Array(numParticles);

      let i = 0, j = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
          positions[i + 1] = 0; // y
          positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z
          scales[j] = 1;
          i += 3;
          j++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

      // Shader Material for luminous neon dots
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
            gl_PointSize = scale * (180.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform vec3 color2;
          varying vec3 vPosition;
          void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
            float mixVal = clamp((vPosition.y + 30.0) / 60.0, 0.0, 1.0);
            vec3 finalColor = mix(color, color2, mixVal);
            gl_FragColor = vec4(finalColor, 0.7);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      let count = 0;
      let mouseX = 0, mouseY = 0;
      let targetX = 0, targetY = 0;

      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.15;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.15;
      }, { passive: true });

      function animate() {
        requestAnimationFrame(animate);

        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;

        camera.position.x = targetX;
        camera.position.y = 120 - targetY;
        camera.lookAt(0, 0, 0);

        const positionAttr = particles.geometry.attributes.position;
        const scaleAttr = particles.geometry.attributes.scale;

        let i = 0, j = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iy = 0; iy < AMOUNTY; iy++) {
            positionAttr.array[i + 1] = (Math.sin((ix + count) * 0.3) * 35) +
                                        (Math.sin((iy + count) * 0.5) * 35);

            scaleAttr.array[j] = (Math.sin((ix + count) * 0.3) + 1) * 3 +
                                 (Math.sin((iy + count) * 0.5) + 1) * 3;
            i += 3;
            j++;
          }
        }

        positionAttr.needsUpdate = true;
        scaleAttr.needsUpdate = true;

        count += 0.035;
        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

    } catch (err) {
      console.warn('Three.js initialization notice:', err);
      init2DFallback(canvas);
    }
  }

  function init2DFallback(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
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
  function initScopingCalculator() {
    const chips = document.querySelectorAll('[data-scope-type]');
    const slider = document.getElementById('scopeWeeks');
    const weeksDisplay = document.getElementById('weeksDisplay');
    const costDisplay = document.getElementById('costDisplay');
    let currentType = 'Web Application';
    let baseRate = 60000;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const val = chip.getAttribute('data-scope-type');

        if (val === 'web') { baseRate = 50000; currentType = 'Web Application'; }
        else if (val === 'software') { baseRate = 90000; currentType = 'Custom Platform'; }
        else if (val === 'ai') { baseRate = 85000; currentType = 'Applied AI'; }
        else if (val === 'audit') { baseRate = 25000; currentType = 'Architecture Audit'; }

        updateCalc();
      });
    });

    if (slider) {
      slider.addEventListener('input', () => {
        updateCalc();
      });
    }

    function updateCalc() {
      const weeks = slider ? parseInt(slider.value, 10) : 3;
      if (weeksDisplay) weeksDisplay.textContent = `${weeks} Weeks`;

      const estCost = baseRate + (weeks - 1) * 20000;
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
          submitBtn.innerHTML = '<span>Transmitting...</span>';
        }

        const payload = {
          name: name,
          contact: contact,
          type: currentType,
          weeks: `${weeks} weeks`,
          requirements: requirements || 'Standard scoping inquiry',
          created_at: new Date().toISOString()
        };

        try {
          const cfg = window.SITE_CONFIG || {};
          const supaUrl = cfg.supabaseUrl;
          const supaKey = cfg.supabaseKey;

          if (supaUrl && supaKey) {
            await fetch(`${supaUrl}/rest/v1/inquiries`, {
              method: 'POST',
              headers: {
                'apikey': supaKey,
                'Authorization': `Bearer ${supaKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(payload)
            });
          }

          if (statusBox) {
            statusBox.textContent = 'Inquiry transmitted directly to founders. We will respond within 48 hours.';
            statusBox.style.color = '#34D399';
            statusBox.style.display = 'block';
          }
          form.reset();
        } catch (err) {
          console.warn('Inquiry dispatch notice:', err);
          // Fallback to mailto
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
     5. TELEMETRY CLOCK
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initThreeCanvas();
      init3DCardTilt();
      initMagneticButtons();
      initScopingCalculator();
      initTelemetry();
    });
  } else {
    initThreeCanvas();
    init3DCardTilt();
    initMagneticButtons();
    initScopingCalculator();
    initTelemetry();
  }
})();
