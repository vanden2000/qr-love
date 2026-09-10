"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSeededRNG } from "@/lib/love-stream/scheduler";
import type { RelationshipType } from "@/lib/presets/occasions";

interface ParticleData {
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

interface ThematicParticlesProps {
  relationship?: RelationshipType;
  count?: number;
  isPaused?: boolean;
}

// 1. PALETTES PER RELATIONSHIP
const PALETTES: Record<RelationshipType, string[]> = {
  COUPLE: [
    "#9F1239", // Deep ruby rose
    "#BE123C", // Ruby crimson
    "#E11D48", // Vibrant rose
    "#F43F5E", // Glossy pink ruby
    "#FB7185", // Romantic soft rose
  ],
  FRIENDSHIP: [
    "#F59E0B", // Vibrant Gold
    "#FBBF24", // Luminous Amber
    "#38BDF8", // Cyan Ice
    "#10B981", // Emerald Glow
    "#FDE68A", // Bright Star
  ],
  FAMILY: [
    "#D97706", // Warm Amber
    "#F59E0B", // Radiant Gold
    "#F43F5E", // Warm Rose
    "#FB923C", // Sunset Glow
    "#FEF08A", // Pearl Light
  ],
  CRUSH: [
    "#FB7185", // Soft Rose
    "#FDA4AF", // Pastel Pink
    "#38BDF8", // Ice Cyan
    "#E11D48", // Crimson Spark
    "#FFF1F2", // Pure Sparkle
  ],
  COLLEAGUE: [
    "#0284C7", // Royal Azure
    "#38BDF8", // Electric Cyan
    "#6366F1", // Indigo Modern
    "#E0F2FE", // Platinum Blue
    "#F59E0B", // Golden Accent
  ],
};

export function HeartParticles({
  relationship = "COUPLE",
  count = 42,
  isPaused = false,
}: ThematicParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 2. Create Dynamic 3D Geometry Based on Relationship
  const thematicGeometry = useMemo(() => {
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      curveSegments: 16,
    };

    // A. FRIENDSHIP: 3D 5-Pointed Star
    if (relationship === "FRIENDSHIP") {
      const shape = new THREE.Shape();
      const points = 5;
      const outerRadius = 0.72;
      const innerRadius = 0.35;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();

      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geom.center();
      geom.computeVertexNormals();
      return geom;
    }

    // B. FAMILY: 3D 6-Petal Lotus / Blossom
    if (relationship === "FAMILY") {
      const shape = new THREE.Shape();
      const petals = 6;
      for (let deg = 0; deg <= 360; deg += 6) {
        const rad = (deg * Math.PI) / 180;
        const r = 0.44 + 0.26 * Math.cos(petals * rad);
        const x = r * Math.cos(rad);
        const y = r * Math.sin(rad);
        if (deg === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();

      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geom.center();
      geom.computeVertexNormals();
      return geom;
    }

    // C. COLLEAGUE: 3D Octahedron / Diamond Crystal
    if (relationship === "COLLEAGUE") {
      const geom = new THREE.OctahedronGeometry(0.58, 0);
      geom.computeVertexNormals();
      return geom;
    }

    // D. CRUSH / COUPLE: Iconic 3D Extruded Crystal Heart
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.24);
    shape.bezierCurveTo(0, 0.48, -0.42, 0.72, -0.72, 0.72);
    shape.bezierCurveTo(-1.08, 0.72, -1.08, 0.38, -1.08, 0.38);
    shape.bezierCurveTo(-1.08, 0.08, -0.82, -0.28, 0, -0.78);
    shape.bezierCurveTo(0.82, -0.28, 1.08, 0.08, 1.08, 0.38);
    shape.bezierCurveTo(1.08, 0.38, 1.08, 0.72, 0.72, 0.72);
    shape.bezierCurveTo(0.42, 0.72, 0, 0.48, 0, 0.24);

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }, [relationship]);

  // 3. Precompute layered 4-tier particles
  const particles = useMemo<ParticleData[]>(() => {
    const rng = createSeededRNG(`thematic-particles-${relationship}-2026`);
    const list: ParticleData[] = [];
    const palette = PALETTES[relationship] || PALETTES.COUPLE;

    const fgCount = 2;
    const nearCount = 8;
    const distantCount = 16;
    const midCount = Math.max(12, count - fgCount - nearCount - distantCount);

    const generateParticle = (tier: "distant" | "mid" | "near" | "fg"): ParticleData => {
      let z: number;
      let scale: number;
      let fallSpeed: number;
      let baseX: number;

      if (tier === "fg") {
        z = 3.8 + rng() * 1.7;
        scale = 0.45 + rng() * 0.15;
        fallSpeed = 1.8 + rng() * 0.4;
        const side = rng() > 0.5 ? 1 : -1;
        baseX = side * (3.0 + rng() * 1.8);
      } else if (tier === "near") {
        z = 1.2 + rng() * 1.6;
        scale = 0.24 + rng() * 0.08;
        fallSpeed = 1.4 + rng() * 0.4;
        const side = rng() > 0.5 ? 1 : -1;
        baseX = side * (2.0 + rng() * 2.5);
      } else if (tier === "distant") {
        z = -4.5 - rng() * 2.5;
        scale = 0.08 + rng() * 0.04;
        fallSpeed = 0.8 + rng() * 0.3;
        baseX = (rng() - 0.5) * 11.0;
      } else {
        z = -0.5 - rng() * 1.8;
        scale = 0.15 + rng() * 0.06;
        fallSpeed = 1.1 + rng() * 0.3;
        baseX = (rng() - 0.5) * 8.0;
      }

      return {
        baseX,
        initialY: rng() * 16.0 - 8.0,
        z,
        scale,
        fallSpeed,
        swaySpeed: 0.8 + rng() * 0.7,
        swayAmp: 0.18 + rng() * 0.22,
        phase: rng() * Math.PI * 2,
        tiltSpeed: 0.5 + rng() * 0.5,
        rotSpeedY: 0.8 + rng() * 0.8,
        colorHex: palette[Math.floor(rng() * palette.length)],
        tier,
      };
    };

    for (let i = 0; i < fgCount; i++) list.push(generateParticle("fg"));
    for (let i = 0; i < nearCount; i++) list.push(generateParticle("near"));
    for (let i = 0; i < midCount; i++) list.push(generateParticle("mid"));
    for (let i = 0; i < distantCount; i++) list.push(generateParticle("distant"));

    return list;
  }, [relationship, count]);

  // 4. Initialize InstancedMesh colors
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

  // 5. Smooth continuous animation frame loop
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

      // Slow 3D rotation highlighting specular crystal reflections
      const rotZ = Math.sin(clockTime * p.tiltSpeed + p.phase) * 0.22;
      const rotY = Math.sin(clockTime * p.rotSpeedY + p.phase) * 0.35;
      const rotX = Math.cos(clockTime * p.tiltSpeed + p.phase) * 0.16;

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
      args={[thematicGeometry, undefined, particles.length]}
    >
      <meshPhysicalMaterial
        roughness={0.2}
        metalness={0.1}
        clearcoat={0.9}
        clearcoatRoughness={0.12}
        transmission={0.14}
        ior={1.48}
        transparent
        opacity={0.95}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
