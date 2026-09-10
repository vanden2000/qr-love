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
  rotSpeedY: number;
  colorHex: string;
  tier: "distant" | "mid" | "near" | "fg";
}

interface HeartParticlesProps {
  count?: number;
  isPaused?: boolean;
}

const HEART_PALETTE = [
  "#9F1239", // Deep ruby rose
  "#BE123C", // Ruby crimson
  "#E11D48", // Vibrant rose
  "#F43F5E", // Glossy pink ruby
  "#FB7185", // Romantic soft rose
];

export function HeartParticles({
  count = 42,
  isPaused = false,
}: HeartParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 1. Create a true 3D smooth extruded heart geometry with rounded bevels
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.24);
    shape.bezierCurveTo(0, 0.48, -0.42, 0.72, -0.72, 0.72);
    shape.bezierCurveTo(-1.08, 0.72, -1.08, 0.38, -1.08, 0.38);
    shape.bezierCurveTo(-1.08, 0.08, -0.82, -0.28, 0, -0.78);
    shape.bezierCurveTo(0.82, -0.28, 1.08, 0.08, 1.08, 0.38);
    shape.bezierCurveTo(1.08, 0.38, 1.08, 0.72, 0.72, 0.72);
    shape.bezierCurveTo(0.42, 0.72, 0, 0.48, 0, 0.24);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      curveSegments: 16,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }, []);

  // 2. Precompute layered 4-tier particles (Distant: 16, Mid: 16, Near: 8, Foreground: 2)
  const particles = useMemo<HeartData[]>(() => {
    const rng = createSeededRNG("ruby-heart-field-seed-2026");
    const list: HeartData[] = [];

    const fgCount = 2; // Foreground accents (1-3)
    const nearCount = 8; // Near layer (6-10)
    const distantCount = 16; // Distant layer (12-18)
    const midCount = Math.max(12, count - fgCount - nearCount - distantCount); // Mid layer (12-18)

    const generateParticle = (tier: "distant" | "mid" | "near" | "fg"): HeartData => {
      let z: number;
      let scale: number;
      let fallSpeed: number;
      let baseX: number;

      if (tier === "fg") {
        // Foreground (Z: +3.8 to +5.5) — Slow passing accent
        z = 3.8 + rng() * 1.7;
        scale = 0.45 + rng() * 0.15;
        fallSpeed = 1.8 + rng() * 0.4; // 6-8s traversal
        const side = rng() > 0.5 ? 1 : -1;
        baseX = side * (3.0 + rng() * 1.8);
      } else if (tier === "near") {
        // Near Layer (Z: +1.2 to +2.8)
        z = 1.2 + rng() * 1.6;
        scale = 0.24 + rng() * 0.08;
        fallSpeed = 1.4 + rng() * 0.4; // 7-9s traversal
        const side = rng() > 0.5 ? 1 : -1;
        baseX = side * (2.0 + rng() * 2.5);
      } else if (tier === "distant") {
        // Distant (Z: -14.0 to -26.0)
        z = -14.0 - rng() * 12.0;
        scale = 0.07 + rng() * 0.04;
        fallSpeed = 0.8 + rng() * 0.3; // 10-14s traversal
        baseX = (rng() - 0.5) * 16.0;
      } else {
        // Midground (Z: -5.0 to +0.5)
        z = -5.0 + rng() * 5.5;
        scale = 0.14 + rng() * 0.06;
        fallSpeed = 1.1 + rng() * 0.4; // 8-11s traversal
        baseX = (rng() - 0.5) * 11.0;
      }

      const initialY = (rng() - 0.5) * 16.0;
      const colorHex = HEART_PALETTE[Math.floor(rng() * HEART_PALETTE.length)];

      return {
        baseX,
        initialY,
        z,
        scale,
        fallSpeed,
        swaySpeed: 0.4 + rng() * 0.6, // Slow gentle sway
        swayAmp: tier === "distant" ? 0.08 + rng() * 0.08 : 0.15 + rng() * 0.2,
        phase: rng() * Math.PI * 2,
        tiltSpeed: 0.15 + rng() * 0.25, // Very slow rotation (10-20s period)
        rotSpeedY: 0.1 + rng() * 0.2,
        colorHex,
        tier,
      };
    };

    for (let i = 0; i < fgCount; i++) list.push(generateParticle("fg"));
    for (let i = 0; i < nearCount; i++) list.push(generateParticle("near"));
    for (let i = 0; i < midCount; i++) list.push(generateParticle("mid"));
    for (let i = 0; i < distantCount; i++) list.push(generateParticle("distant"));

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

  // 4. Smooth continuous useFrame loop without state allocation
  useFrame((state) => {
    if (!meshRef.current || isPaused) return;

    const clockTime = state.clock.getElapsedTime();
    const streamHeight = 16.0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Downward waterfall fall wrap
      const rawY = p.initialY - clockTime * p.fallSpeed;
      const normalizedY = ((rawY % streamHeight) + streamHeight) % streamHeight;
      const currentY = normalizedY - 8.0;

      // Gentle horizontal organic sway
      const currentX = p.baseX + Math.sin(clockTime * p.swaySpeed + p.phase) * p.swayAmp;

      // Slow elegant 3D rotation highlighting specular sheen
      const rotZ = Math.sin(clockTime * p.tiltSpeed + p.phase) * 0.18;
      const rotY = Math.sin(clockTime * p.rotSpeedY + p.phase) * 0.28;
      const rotX = Math.cos(clockTime * p.tiltSpeed + p.phase) * 0.12;

      dummy.position.set(currentX, currentY, p.z);
      dummy.rotation.set(rotX, rotY, rotZ);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[heartGeometry, undefined, particles.length]}
    >
      <meshPhysicalMaterial
        roughness={0.22}
        metalness={0.08}
        clearcoat={0.9}
        clearcoatRoughness={0.12}
        transmission={0.12}
        ior={1.45}
        transparent
        opacity={0.94}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

