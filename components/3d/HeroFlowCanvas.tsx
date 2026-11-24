'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroFlowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = containerRef.current;
    if (!canvas || !wrapper) return;

    let animId: number | null = null;
    let isVisible = true;

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.1 }
    );
    observer.observe(wrapper);

    try {
      // 1. WebGL Initialization
      const width = wrapper.clientWidth || 640;
      const height = wrapper.clientHeight || 320;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 160;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);

      // 2. Torus Knot Flow Geometry
      const knotGeom = new THREE.TorusKnotGeometry(36, 11, 120, 26, 2, 3);

      const matWire = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      const knotMesh = new THREE.Mesh(knotGeom, matWire);
      scene.add(knotMesh);

      const matCore = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const coreMesh = new THREE.Mesh(knotGeom, matCore);
      coreMesh.scale.set(0.92, 0.92, 0.92);
      scene.add(coreMesh);

      // 3. Flow Particles Stream
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
        color: 0x67e8f9,
        size: 2.2,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(partGeom, matPoints);
      scene.add(particles);

      // 4. Orbiting Satellite Nodes (Interfaces, Systems, Intelligence)
      const satellitesGroup = new THREE.Group();
      const satDefs = [
        { radius: 68, speed: 0.015, color: 0x06b6d4, size: 2.4, yOffset: 0 },
        { radius: 76, speed: -0.012, color: 0x3b82f6, size: 2.6, yOffset: 8 },
        { radius: 84, speed: 0.018, color: 0x818cf8, size: 2.2, yOffset: -8 },
      ];

      const satMeshes = satDefs.map((def) => {
        const sGeom = new THREE.SphereGeometry(def.size, 12, 12);
        const sMat = new THREE.MeshBasicMaterial({ color: def.color });
        const sMesh = new THREE.Mesh(sGeom, sMat);
        satellitesGroup.add(sMesh);
        return { mesh: sMesh, def, angle: Math.random() * Math.PI * 2 };
      });
      scene.add(satellitesGroup);

      // 5. Interaction State (Desktop cursor & Mobile touch)
      let rotX = 0,
        rotY = 0;
      let targetRotX = 0,
        targetRotY = 0;
      let lastTouchX = 0,
        lastTouchY = 0;
      let clockAngle = 0;

      const onPointerMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        targetRotY = x * 1.2;
        targetRotX = y * 1.2;
      };

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches && e.touches[0]) {
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!e.touches || !e.touches[0]) return;
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        targetRotY += dx * 0.02;
        targetRotX += dy * 0.02;
      };

      const onClick = () => {
        clockAngle += 0.8;
        matWire.opacity = 0.95;
        setTimeout(() => {
          matWire.opacity = 0.65;
        }, 400);
      };

      canvas.addEventListener('mousemove', onPointerMove, { passive: true });
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchmove', onTouchMove, { passive: true });
      canvas.addEventListener('click', onClick);

      // 6. Responsive Resize
      const onResize = () => {
        const w = wrapper.clientWidth || 640;
        const h = wrapper.clientHeight || 320;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      // 7. Render Loop
      const render = () => {
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

        satMeshes.forEach((sat) => {
          sat.angle += sat.def.speed;
          sat.mesh.position.x = Math.cos(sat.angle) * sat.def.radius;
          sat.mesh.position.z = Math.sin(sat.angle) * (sat.def.radius * 0.7);
          sat.mesh.position.y = Math.sin(sat.angle * 2) * sat.def.yOffset;
        });

        renderer.render(scene, camera);
      };

      render();

      return () => {
        if (animId) cancelAnimationFrame(animId);
        observer.disconnect();
        window.removeEventListener('resize', onResize);
        canvas.removeEventListener('mousemove', onPointerMove);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('click', onClick);
        renderer.dispose();
      };
    } catch (err) {
      console.warn('WebGL init failed, using 2D fallback:', err);
      // Fallback 2D canvas flow
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let count = 0;
      const render2D = () => {
        animId = requestAnimationFrame(render2D);
        if (!isVisible) return;
        const w = (canvas.width = wrapper.clientWidth || 600);
        const h = (canvas.height = wrapper.clientHeight || 300);
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        for (let i = 0; i < 60; i++) {
          const t = (i / 60) * Math.PI * 2;
          const r = 50 + Math.sin(t * 3 + count) * 15;
          const x = w / 2 + Math.cos(t) * r * 1.5;
          const y = h / 2 + Math.sin(t) * r * 0.85;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        count += 0.025;
      };
      render2D();
      return () => {
        if (animId) cancelAnimationFrame(animId);
        observer.disconnect();
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl h-[260px] sm:h-[320px] mx-auto my-6 rounded-2xl bg-gradient-to-b from-neon-cyan/10 via-neon-blue/5 to-transparent border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(6,182,212,0.05)] overflow-hidden backdrop-blur-xl flex items-center justify-center select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-grab active:cursor-grabbing" />

      {/* Interactive Helper Hint */}
      <div className="absolute top-3 left-4 font-mono text-[10px] tracking-wider uppercase text-slate-400 flex items-center gap-1.5 pointer-events-none">
        <span className="text-neon-cyan">✦</span> Touch &amp; Drag in 3D Space
      </div>

      {/* Telemetry Status Badge */}
      <div className="absolute bottom-3 right-4 inline-flex items-center gap-2 bg-[#0A0F1A]/85 border border-white/10 rounded-full px-3 py-1 font-mono text-[10px] text-slate-300 pointer-events-none backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-radar shadow-[0_0_8px_#06b6d4]"></span>
        <span>Spatial Flow Engine · 60fps</span>
      </div>
    </div>
  );
}
