"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HeartData {
  x: number;
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
  // Strict Central Safe Corridor: 88% pushed to side edges, 0 top-center clustering
  const particles = useMemo<HeartData[]>(() => {
    const rng = createSeededRandom(3042);
    const list: HeartData[] = [];

    const fgCount = Math.floor(count * 0.2); // 20% Foreground
    const bgCount = Math.floor(count * 0.3); // 30% Background
    const midCount = count - fgCount - bgCount; // 50% Midground

    const generateParticle = (tier: "bg" | "mid" | "fg"): HeartData => {
      let z: number;
      let scale: number;
      let speed: number;

      if (tier === "fg") {
        // Foreground (Z: +1.0 to +7.0)
        z = 1.0 + rng() * 6.0;
        scale = 0.18 + rng() * 0.06;
        speed = 0.12 + rng() * 0.25;
      } else if (tier === "bg") {
        // Background (Z: -14.0 to -34.0)
        z = -14.0 - rng() * 20.0;
        scale = 0.065 + rng() * 0.035;
        speed = 0.1 + rng() * 0.2;
      } else {
        // Midground (Z: -14.0 to +1.0)
        z = -14.0 + rng() * 15.0;
        scale = 0.12 + rng() * 0.05;
        speed = 0.15 + rng() * 0.3;
      }

      // Horizontal: 88% pushed into Left Wing [-6.5, -1.8] and Right Wing [1.8, 6.5]
      // Only 12% in center channel (and strictly background/tiny)
      let x: number;
      const isSide = rng() > 0.12;
      if (isSide || tier === "fg") {
        const sideSign = rng() > 0.5 ? 1 : -1;
        x = sideSign * (1.85 + rng() * 4.6);
      } else {
        x = (rng() - 0.5) * 2.6;
      }

      // Vertical: Uniformly distributed across Y [-5.5, +5.5] without top bias
      const y = (rng() - 0.5) * 11.0;

      const colorHex = HEART_PALETTE[Math.floor(rng() * HEART_PALETTE.length)];

      return {
        x,
        y,
        z,
        scale,
        speed,
        phase: rng() * Math.PI * 2,
        tiltSpeed: 0.25 + rng() * 0.5,
        driftX: 0.08 + rng() * 0.2,
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
  useFrame(() => {
    if (!meshRef.current) return;

    const time = timelineTime;
    const speedMultiplier = timelineTime >= 50 ? 0.35 : 1.0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      const currentY =
        p.y + Math.sin(time * p.speed * speedMultiplier + p.phase) * 0.32;
      const currentX =
        p.x + Math.cos(time * p.driftX * speedMultiplier + p.phase) * 0.2;

      dummy.position.set(currentX, currentY, p.z);
      dummy.rotation.set(
        0,
        0,
        Math.sin(time * p.tiltSpeed * speedMultiplier + p.phase) * 0.2
      );
      dummy.scale.set(p.scale, p.scale, p.scale);
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
        opacity={0.85}
      />
    </instancedMesh>
  );
}
