import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const CanvasHero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlAvailable, setWebGlAvailable] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let particleSystem: THREE.Points;
    let animationFrameId: number;

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    try {
      // 1. Initialize Scene, Camera, Renderer
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.z = 30;

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 2. Generate Particles (Spherical distribution)
      const particleCount = window.innerWidth < 768 ? 1000 : 2500;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const color1 = new THREE.Color('#7c3aed'); // Violet
      const color2 = new THREE.Color('#a78bfa'); // Light Violet
      const color3 = new THREE.Color('#3b82f6'); // Blue

      for (let i = 0; i < particleCount; i++) {
        // Spherical distribution
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 10 + Math.random() * 5; // radius between 10 and 15

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Blending colors
        let mixedColor = color1.clone();
        const dice = Math.random();
        if (dice < 0.33) {
          mixedColor = color1.clone().lerp(color2, Math.random());
        } else if (dice < 0.66) {
          mixedColor = color2.clone().lerp(color3, Math.random());
        } else {
          mixedColor = color3.clone().lerp(color1, Math.random());
        }

        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Custom circular particle texture (via canvas)
      const createParticleTexture = () => {
        const c = document.createElement('canvas');
        c.width = 16;
        c.height = 16;
        const ctx = c.getContext('2d');
        if (ctx) {
          const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
          grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
          grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 16, 16);
        }
        return new THREE.CanvasTexture(c);
      };

      const material = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: createParticleTexture()
      });

      particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      // 3. Mouse Parallax Listeners
      const handleMouseMove = (e: MouseEvent) => {
        mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 15;
        mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 15;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // 4. Animation Loop
      const clock = new THREE.Clock();

      const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        // Spin particle system slowly
        particleSystem.rotation.y = elapsedTime * 0.05;
        particleSystem.rotation.x = elapsedTime * 0.02;

        // Smooth mouse follow (lerping)
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Update camera position slightly based on mouse
        camera.position.x = mouse.x;
        camera.position.y = -mouse.y;
        camera.lookAt(scene.position);

        renderer?.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      // 5. Handle Resize
      const handleResize = () => {
        if (!container || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        renderer?.dispose();
      };
    } catch (e) {
      console.warn('Three.js failed to initialize, falling back to 2D Canvas particles:', e);
      setWebGlAvailable(false);
    }
  }, []);

  // Fallback 2D Canvas Simulation
  useEffect(() => {
    if (webGlAvailable) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors2D = ['#7c3aed', '#a78bfa', '#3b82f6'];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = window.innerWidth < 768 ? 60 : 120;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
          color: colors2D[Math.floor(Math.random() * colors2D.length)],
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Connect nearby particles
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#7c3aed';
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [webGlAvailable]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />
    </div>
  );
};
