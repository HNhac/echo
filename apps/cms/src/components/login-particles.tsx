"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  r: number;
  driftAngle: number;
  driftSpeed: number;
};

const CONNECT_DIST = 130;
const MOUSE_RADIUS = 160;
const MOUSE_FORCE = 3.2;
const SPEED = 1.1;
const RETURN_STRENGTH = 0.045;
const DRIFT_RADIUS = 28;

function createParticles(width: number, height: number, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return {
      x,
      y,
      homeX: x,
      homeY: y,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.8 + 2.2,
      driftAngle: Math.random() * Math.PI * 2,
      driftSpeed: 0.01 + Math.random() * 0.02,
    };
  });
}

export function LoginParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animId = 0;
    let width = 0;
    let height = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(170, Math.floor((width * height) / 9000));
      particles = createParticles(width, height, count);
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };

    const onLeave = () => {
      mouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
    };

    const draw = () => {
      const dark = themeRef.current === "dark";
      const glowColor = dark ? "rgba(224, 86, 140, 0.22)" : "rgba(224, 86, 140, 0.16)";
      const lineAlpha = dark ? 0.4 : 0.46;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        const dxMouse = p.x - mouseX;
        const dyMouse = p.y - mouseY;
        const distMouse = Math.hypot(dxMouse, dyMouse) || 0.001;
        const insideMouse = mouseActive && distMouse < MOUSE_RADIUS;

        if (insideMouse) {
          const nx = dxMouse / distMouse;
          const ny = dyMouse / distMouse;
          const strength = (MOUSE_RADIUS - distMouse) / MOUSE_RADIUS;
          const force = strength * strength * MOUSE_FORCE;
          p.vx += nx * force * 0.28;
          p.vy += ny * force * 0.28;
          if (distMouse < MOUSE_RADIUS * 0.85) {
            const target = MOUSE_RADIUS * 0.92;
            p.x = mouseX + nx * target;
            p.y = mouseY + ny * target;
          }
        } else {
          p.driftAngle += p.driftSpeed;
          const targetX = p.homeX + Math.cos(p.driftAngle) * DRIFT_RADIUS;
          const targetY = p.homeY + Math.sin(p.driftAngle * 0.85) * DRIFT_RADIUS;
          p.vx += (targetX - p.x) * RETURN_STRENGTH;
          p.vy += (targetY - p.y) * RETURN_STRENGTH;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= insideMouse ? 0.92 : 0.9;
        p.vy *= insideMouse ? 0.92 : 0.9;
        p.vx += (Math.random() - 0.5) * 0.04;
        p.vy += (Math.random() - 0.5) * 0.04;

        if (p.x < 0 || p.x > width) {
          p.vx *= -1;
          p.x = Math.max(0, Math.min(width, p.x));
        }
        if (p.y < 0 || p.y > height) {
          p.vy *= -1;
          p.y = Math.max(0, Math.min(height, p.y));
        }

        const speed = Math.hypot(p.vx, p.vy);
        const maxSpeed = insideMouse ? 4.5 : 2.8;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * lineAlpha;
            ctx.beginPath();
            ctx.strokeStyle = dark
              ? `rgba(244, 180, 200, ${alpha})`
              : i % 2 === 0
                ? `rgba(224, 86, 140, ${alpha})`
                : `rgba(201, 137, 58, ${alpha})`;
            ctx.lineWidth = dark ? 1 : 1.35;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const tint = dark
          ? "rgba(255, 186, 206, 0.88)"
          : i % 2 === 0
            ? "rgba(224, 86, 140, 0.85)"
            : "rgba(201, 137, 58, 0.85)";

        if (!dark) {
          ctx.beginPath();
          ctx.fillStyle = i % 2 === 0 ? "rgba(224, 86, 140, 0.18)" : glowColor;
          ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = tint;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="login__particles" />;
}
