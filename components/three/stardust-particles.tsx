"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StardustParticlesProps {
  count?: number;
  timelineTime?: number;
}

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

export function StardustParticles({
  count = 140,
  timelineTime = 0,
}: StardustParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rng = createSeededRandom(42);
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Wide ambient cloud surrounding the romantic pathway
      pos[i * 3 + 0] = (rng() - 0.5) * 15;
      pos[i * 3 + 1] = (rng() - 0.5) * 12;
      pos[i * 3 + 2] = 9 - rng() * 40; // Z from +9 down to -31
    }

    return pos;
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    if (!material) return;

    // Gentle breathing pulse across timeline
    const pulse = Math.sin(timelineTime * 0.75) * 0.15 + 0.6;
    material.opacity = pulse;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#ffe4e6"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
