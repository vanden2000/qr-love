"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSeededRNG } from "@/lib/love-stream/scheduler";

interface HeartData {
  baseX: number;
  initialY: number;
  z: number;
  scale: number;
  fallSpeed: number;
  swaySpeed: number;
  swayAmp: number;
  phase: number;
  tiltSpeed: number;
  colorHex: string;
  tier: "bg" | "mid" | "fg";
}

interface HeartParticlesProps {
  count?: number;
  isPaused?: boolean;
}

const HEART_PALETTE = [
  "#9F1239", // Deep rose ruby
  "#BE123C", // Ruby crimson
  "#E11D48", // Vibrant rose
  "#F43F5E", // Romantic pink rose
  "#FB7185", // Soft glow rose
  "#FDA4AF", // Tender rose glow
];

export function HeartParticles({
  count = 65,
  isPaused = false,
}: HeartParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 1. Create a 2D smooth heart shape geometry centered at origin
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.22);
    shape.bezierCurveTo(0, 0.48, -0.42, 0.72, -0.72, 0.72);
    shape.bezierCurveTo(-1.12, 0.72, -1.12, 0.36, -1.12, 0.36);
    shape.bezierCurveTo(-1.12, 0.05, -0.86, -0.32, 0, -0.82);
    shape.bezierCurveTo(0.86, -0.32, 1.12, 0.05, 1.12, 0.36);
    shape.bezierCurveTo(1.12, 0.36, 1.12, 0.72, 0.72, 0.72);
    shape.bezierCurveTo(0.42, 0.72, 0, 0.48, 0, 0.22);

    const geom = new THREE.ShapeGeometry(shape, 8);
    geom.center();
    return geom;
  }, []);

  // 2. Precompute 3-tier deterministic particles with safe center corridor
  const particles = useMemo<HeartData[]>(() => {
    const rng = createSeededRNG("heart-cascade-seed-3042");
    const list: HeartData[] = [];

    const fgCount = Math.floor(count * 0.2); // 20% Foreground (edges)
    const bgCount = Math.floor(count * 0.35); // 35% Background (distant)
    const midCount = count - fgCount - bgCount; // 45% Midground

    const generateParticle = (tier: "bg" | "mid" | "fg"): HeartData => {
      let z: number;
      let scale: number;
      let fallSpeed: number;
      let baseX: number;

      if (tier === "fg") {
        // Foreground (Z: +1.5 to +6.0) - Swept to Left/Right Wings for safe corridor
        z = 1.5 + rng() * 4.5;
        scale = 0.19 + rng() * 0.08;
        fallSpeed = 1.8 + rng() * 1.2;
        const side = rng() > 0.5 ? 1 : -1;
        baseX = side * (2.2 + rng() * 3.5); // Safe center corridor
      } else if (tier === "bg") {
        // Background (Z: -12.0 to -28.0) - Distributed across full screen
        z = -12.0 - rng() * 16.0;
        scale = 0.08 + rng() * 0.05;
        fallSpeed = 0.8 + rng() * 0.7;
        baseX = (rng() - 0.5) * 14.0;
      } else {
        // Midground (Z: -6.0 to +1.0)
        z = -6.0 + rng() * 7.0;
        scale = 0.13 + rng() * 0.06;
        fallSpeed = 1.2 + rng() * 1.0;
        const side = rng() > 0.5 ? 1 : -1;
        baseX = side * (1.6 + rng() * 4.0);
      }

      // Initial Y staggered across vertical stream [-7.5, +7.5]
      const initialY = (rng() - 0.5) * 15.0;

      const colorHex = HEART_PALETTE[Math.floor(rng() * HEART_PALETTE.length)];

      return {
        baseX,
        initialY,
        z,
        scale,
        fallSpeed,
        swaySpeed: 0.8 + rng() * 1.2,
        swayAmp: 0.15 + rng() * 0.3,
        phase: rng() * Math.PI * 2,
        tiltSpeed: 0.3 + rng() * 0.6,
        colorHex,
        tier,
      };
    };

    for (let i = 0; i < fgCount; i++) list.push(generateParticle("fg"));
    for (let i = 0; i < midCount; i++) list.push(generateParticle("mid"));
    for (let i = 0; i < bgCount; i++) list.push(generateParticle("bg"));

    return list;
  }, [count]);

  // 3. Initialize InstancedMesh colors once
  useEffect(() => {
    if (!meshRef.current) return;
    const colorObj = new THREE.Color();

    for (let i = 0; i < particles.length; i++) {
      colorObj.set(particles[i].colorHex);
      meshRef.current.setColorAt(i, colorObj);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [particles]);

  // 4. Continuous 60fps downward waterfall update via useFrame (Immutable purely mathematical wrap)
  useFrame((state) => {
    if (!meshRef.current || isPaused) return;

    const clockTime = state.clock.getElapsedTime();
    const streamHeight = 15.0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Pure functional wrap without mutating `p`: (initialY - clockTime * speed + offset) mod height
      const rawY = p.initialY - clockTime * p.fallSpeed;
      const normalizedY = ((rawY % streamHeight) + streamHeight) % streamHeight;
      const currentY = normalizedY - 7.5;

      // Horizontal organic sway
      const currentX = p.baseX + Math.sin(clockTime * p.swaySpeed + p.phase) * p.swayAmp;

      // Subtle pulse and gentle tilt
      const pulseScale = p.scale * (1 + Math.sin(clockTime * 1.4 + p.phase) * 0.06);

      dummy.position.set(currentX, currentY, p.z);
      dummy.rotation.set(
        0,
        0,
        Math.sin(clockTime * p.tiltSpeed + p.phase) * 0.25
      );
      dummy.scale.set(pulseScale, pulseScale, pulseScale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[heartGeometry, undefined, particles.length]}>
      <meshBasicMaterial
        side={THREE.DoubleSide}
        transparent
        opacity={0.88}
      />
    </instancedMesh>
  );
}
