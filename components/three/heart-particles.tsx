"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HeartData {
  sideX: number;
  centerX: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  phase: number;
  tiltSpeed: number;
  driftX: number;
  colorHex: string;
  tier: "bg" | "mid" | "fg";
}

interface HeartParticlesProps {
  count?: number;
  timelineTime?: number;
}

const HEART_PALETTE = [
  "#9F1239", // Deep rose ruby
  "#BE123C", // Ruby crimson
  "#E11D48", // Vibrant rose
  "#F43F5E", // Romantic pink rose
  "#FB7185", // Soft glow rose
  "#FDA4AF", // Tender rose glow
];

function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function HeartParticles({
  count = 90,
  timelineTime = 0,
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

    const geom = new THREE.ShapeGeometry(shape, 10);
    geom.center();
    return geom;
  }, []);

  // 2. Precompute 3-tier deterministic particles (20% FG, 50% Mid, 30% BG)
  // Dynamic transition: Side corridor during text reading -> Full cosmic bloom at ending
  const particles = useMemo<HeartData[]>(() => {
    const rng = createSeededRandom(3042);
    const list: HeartData[] = [];

    const fgCount = Math.floor(count * 0.22); // 22% Foreground
    const bgCount = Math.floor(count * 0.3); // 30% Background
    const midCount = count - fgCount - bgCount; // 48% Midground

    const generateParticle = (tier: "bg" | "mid" | "fg"): HeartData => {
      let z: number;
      let scale: number;
      let speed: number;

      if (tier === "fg") {
        // Foreground (Z: +1.0 to +7.0)
        z = 1.0 + rng() * 6.0;
        scale = 0.18 + rng() * 0.07;
        speed = 0.18 + rng() * 0.28;
      } else if (tier === "bg") {
        // Background (Z: -14.0 to -34.0)
        z = -14.0 - rng() * 20.0;
        scale = 0.07 + rng() * 0.04;
        speed = 0.12 + rng() * 0.22;
      } else {
        // Midground (Z: -14.0 to +1.0)
        z = -14.0 + rng() * 15.0;
        scale = 0.13 + rng() * 0.06;
        speed = 0.16 + rng() * 0.32;
      }

      // Reading Phase: Pushed to Left/Right Wings
      const sideSign = rng() > 0.5 ? 1 : -1;
      const sideX = sideSign * (1.85 + rng() * 4.6);

      // Ending Phase: Full Screen natural distribution
      const centerX = (rng() - 0.5) * 8.5;

      // Vertical distribution across Y [-5.5, +5.5]
      const y = (rng() - 0.5) * 11.0;

      const colorHex = HEART_PALETTE[Math.floor(rng() * HEART_PALETTE.length)];

      return {
        sideX,
        centerX,
        y,
        z,
        scale,
        speed,
        phase: rng() * Math.PI * 2,
        tiltSpeed: 0.25 + rng() * 0.5,
        driftX: 0.1 + rng() * 0.25,
        colorHex,
        tier,
      };
    };

    for (let i = 0; i < fgCount; i++) list.push(generateParticle("fg"));
    for (let i = 0; i < midCount; i++) list.push(generateParticle("mid"));
    for (let i = 0; i < bgCount; i++) list.push(generateParticle("bg"));

    return list;
  }, [count]);

  // 3. Initialize InstancedMesh individual colors
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

  // 4. Update instanced mesh per frame
  // Uses continuous clock for endless organic floating + timeline transition
  useFrame((state) => {
    if (!meshRef.current) return;

    const clockTime = state.clock.getElapsedTime();
    // Ending transition progress: 0 (during messages) -> 1 (when ending is reached >= 52s)
    const endingProgress = THREE.MathUtils.smoothstep(timelineTime, 49.0, 58.0);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Smoothly interpolate from side corridors to full screen distribution
      const baseX = THREE.MathUtils.lerp(p.sideX, p.centerX, endingProgress);

      // Continuous gentle floating oscillation
      const floatY = Math.sin(clockTime * p.speed + p.phase) * 0.45;
      const floatX = Math.cos(clockTime * p.driftX + p.phase) * 0.3;

      const currentX = baseX + floatX;
      const currentY = p.y + floatY;

      // Subtle pulse and gentle tilt
      const pulseScale = p.scale * (1 + Math.sin(clockTime * 1.2 + p.phase) * 0.08);

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
