'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroFlowBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number | null = null;
    let isVisible = true;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || 600;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
      camera.position.set(0, 35, 120);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);

      // Flow grid geometry: 70 x 40 points
      const cols = 70;
      const rows = 40;
      const numParticles = cols * rows;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(numParticles * 3);
      const originalY = new Float32Array(numParticles);

      const spacingX = 4.2;
      const spacingZ = 3.6;
      const offsetX = (cols * spacingX) / 2;
      const offsetZ = (rows * spacingZ) / 2;

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacingX - offsetX;
          const z = r * spacingZ - offsetZ;
          const y = Math.sin(c * 0.18) * Math.cos(r * 0.18) * 4;
          positions[idx * 3] = x;
          positions[idx * 3 + 1] = y;
          positions[idx * 3 + 2] = z;
          originalY[idx] = y;
          idx++;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Elegant, quiet slate-cyan particles
      const material = new THREE.PointsMaterial({
        color: 0x06b6d4,
        size: 1.8,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      // Flow wave lines running along rows
      const linesGroup = new THREE.Group();
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.15,
      });

      for (let r = 0; r < rows; r += 2) {
        const linePoints: THREE.Vector3[] = [];
        for (let c = 0; c < cols; c++) {
          const pIdx = r * cols + c;
          linePoints.push(new THREE.Vector3(positions[pIdx * 3], positions[pIdx * 3 + 1], positions[pIdx * 3 + 2]));
        }
        const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
        const line = new THREE.Line(lineGeom, lineMat);
        linesGroup.add(line);
      }
      scene.add(linesGroup);

      // Mouse & touch interaction
      let mouseX = 0;
      let mouseY = 0;
      let targetRotX = 0;
      let targetRotY = 0;

      const handlePointer = (clientX: number, clientY: number) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = mouseX * 0.25;
        targetRotX = -mouseY * 0.15;
      };

      const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });

      const onResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      // Animation loop
      let clock = 0;
      const posArray = geometry.attributes.position.array as Float32Array;

      const render = () => {
        animId = requestAnimationFrame(render);
        if (!isVisible) return;

        clock += 0.018;

        // Wave dynamics
        let p = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wave1 = Math.sin(c * 0.15 + clock * 1.2) * 5;
            const wave2 = Math.cos(r * 0.2 + clock * 0.8) * 4;
            const wave3 = Math.sin((c + r) * 0.1 + clock) * 3;
            posArray[p * 3 + 1] = originalY[p] + wave1 + wave2 + wave3;
            p++;
          }
        }
        geometry.attributes.position.needsUpdate = true;

        // Update lines to match particle points
        linesGroup.children.forEach((child, lIdx) => {
          const line = child as THREE.Line;
          const r = lIdx * 2;
          const linePos = line.geometry.attributes.position.array as Float32Array;
          for (let c = 0; c < cols; c++) {
            const pIdx = r * cols + c;
            linePos[c * 3] = posArray[pIdx * 3];
            linePos[c * 3 + 1] = posArray[pIdx * 3 + 1];
            linePos[c * 3 + 2] = posArray[pIdx * 3 + 2];
          }
          line.geometry.attributes.position.needsUpdate = true;
        });

        // Smooth camera tilt
        camera.position.x += (targetRotY * 30 - camera.position.x) * 0.05;
        camera.position.y += (35 + targetRotX * 20 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };

      render();

      return () => {
        if (animId) cancelAnimationFrame(animId);
        observer.disconnect();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
      };
    } catch (e) {
      console.warn('Hero WebGL background fallback:', e);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden select-none"
      style={{
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 95%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 95%)',
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
