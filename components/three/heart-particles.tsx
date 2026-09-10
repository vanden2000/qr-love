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
  tier: "bg" | "mid" | "near" | "fg";
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
  count = 72,
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

  // 2. Precompute 4-tier deterministic particles (Distant, Mid, Near, Giant Foreground Pass)
  const particles = useMemo<HeartData[]>(() => {
    const rng = createSeededRNG("heart-perspective-field-seed-504");
    const list: HeartData[] = [];

    const fgCount = 5; // Giant foreground swoops
    const nearCount = 14; // Near layer
    const bgCount = 26; // Distant layer
    const midCount = count - fgCount - nearCount - bgCount; // Mid layer

    const generateParticle = (tier: "bg" | "mid" | "near" | "fg"): HeartData => {
      let z: number;
      let scale: number;
      let fallSpeed: number;
      let baseX: number;

      if (tier === "fg") {
        // Giant Foreground pass (Z: +4.0 to +7.0) — Massive swooping elements!
        z = 4.0 + rng() * 3.0;
        scale = 0.75 + rng() * 0.65; // Massive size 0.75 - 1.40!
        fallSpeed = 3.2 + rng() * 1.8;
        const side = rng() > 0.5 ? 1 : -1;
        baseX = side * (2.8 + rng() * 2.5);
      } else if (tier === "near") {
        // Near Layer (Z: +1.0 to +3.5)
        z = 1.0 + rng() * 2.5;
        scale = 0.22 + rng() * 0.12;
        fallSpeed = 2.0 + rng() * 1.2;
        const side = rng() > 0.5 ? 1 : -1;
        baseX = side * (1.8 + rng() * 3.2);
      } else if (tier === "bg") {
        // Background (Z: -14.0 to -32.0)
        z = -14.0 - rng() * 18.0;
        scale = 0.05 + rng() * 0.04;
        fallSpeed = 0.7 + rng() * 0.6;
        baseX = (rng() - 0.5) * 16.0;
      } else {
        // Midground (Z: -6.0 to +0.8)
        z = -6.0 + rng() * 6.8;
        scale = 0.12 + rng() * 0.07;
        fallSpeed = 1.3 + rng() * 0.9;
        baseX = (rng() - 0.5) * 12.0;
      }

      const initialY = (rng() - 0.5) * 16.0;
      const colorHex = HEART_PALETTE[Math.floor(rng() * HEART_PALETTE.length)];

      return {
        baseX,
        initialY,
        z,
        scale,
        fallSpeed,
        swaySpeed: 0.7 + rng() * 1.4,
        swayAmp: 0.18 + rng() * 0.35,
        phase: rng() * Math.PI * 2,
        tiltSpeed: 0.3 + rng() * 0.7,
        colorHex,
        tier,
      };
    };

    for (let i = 0; i < fgCount; i++) list.push(generateParticle("fg"));
    for (let i = 0; i < nearCount; i++) list.push(generateParticle("near"));
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
    const streamHeight = 16.0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Downward fall wrap: initialY - clockTime * fallSpeed
      const rawY = p.initialY - clockTime * p.fallSpeed;
      const normalizedY = ((rawY % streamHeight) + streamHeight) % streamHeight;
      const currentY = normalizedY - 8.0;

      // Horizontal organic sway
      const currentX = p.baseX + Math.sin(clockTime * p.swaySpeed + p.phase) * p.swayAmp;

      // Subtle pulse and gentle tilt
      const pulseScale = p.scale * (1 + Math.sin(clockTime * 1.5 + p.phase) * 0.08);

      dummy.position.set(currentX, currentY, p.z);
      dummy.rotation.set(
        0,
        0,
        Math.sin(clockTime * p.tiltSpeed + p.phase) * 0.28
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
        opacity={0.92}
      />
    </instancedMesh>
  );
}
