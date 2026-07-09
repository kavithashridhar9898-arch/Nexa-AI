import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    // Set initial position
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });

    const onMouseMove = (e: MouseEvent) => {
      setHidden(false);
      
      // Update variables in document for background glow selectors
      document.documentElement.style.setProperty('--x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--y', `${e.clientY}px`);

      // GSAP animate dot immediately
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      // GSAP animate ring with slight lag
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: 'power3.out',
      });
    };

    const onMouseLeave = () => {
      setHidden(true);
    };

    const onMouseEnter = () => {
      setHidden(false);
    };

    // Add event listeners
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Dynamic hover effects
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isHoverable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('interactive-hover') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT';

      if (isHoverable) {
        gsap.to(ring, {
          scale: 1.8,
          borderColor: 'rgba(124, 58, 237, 0.6)',
          backgroundColor: 'rgba(124, 58, 237, 0.05)',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, {
          scale: 0.5,
          backgroundColor: '#7c3aed',
          duration: 0.3,
        });
      } else {
        gsap.to(ring, {
          scale: 1,
          borderColor: 'rgba(124, 58, 237, 0.3)',
          backgroundColor: 'transparent',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, {
          scale: 1,
          backgroundColor: '#7c3aed',
          duration: 0.3,
        });
      }
    };

    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return (
    <>
      {/* Small Core Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2.5 h-2.5 bg-violet-600 rounded-full pointer-events-none z-[99999] transition-opacity duration-300 ${
          hidden ? 'opacity-0' : 'opacity-100'
        } hidden md:block`}
      />
      {/* Outer Floating Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-8 h-8 border border-violet-500/30 rounded-full pointer-events-none z-[99998] transition-opacity duration-300 ${
          hidden ? 'opacity-0' : 'opacity-100'
        } hidden md:block`}
      />
    </>
  );
};
