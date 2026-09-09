"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getFadeOpacity } from "@/components/three/scene-timeline";
import { useResponsive3D } from "@/components/three/responsive-3d";

interface HeroCrystalHeartProps {
  timelineTime: number;
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

export function HeroCrystalHeart({ timelineTime }: HeroCrystalHeartProps) {
  const { getHeroHeartScale } = useResponsive3D();
  const heartScales = getHeroHeartScale();

  const heartMesh1Ref = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const sparksRef = useRef<THREE.Points>(null);

  const heartMesh2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  // 1. Extruded 3D Heart Geometry
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.35);
    shape.bezierCurveTo(0, 0.65, -0.45, 0.95, -0.85, 0.95);
    shape.bezierCurveTo(-1.3, 0.95, -1.3, 0.45, -1.3, 0.45);
    shape.bezierCurveTo(-1.3, 0.1, -0.95, -0.35, 0, -1.05);
    shape.bezierCurveTo(0.95, -0.35, 1.3, 0.1, 1.3, 0.45);
    shape.bezierCurveTo(1.3, 0.45, 1.3, 0.95, 0.85, 0.95);
    shape.bezierCurveTo(0.45, 0.95, 0, 0.65, 0, 0.35);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.12,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // 2. Sparkling Particles Positions
  const sparkPositions = useMemo(() => {
    const rng = createSeededRandom(888);
    const count = 30;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 0.85 + rng() * 0.95;
      const theta = rng() * Math.PI * 2;
      const phi = (rng() - 0.5) * Math.PI;

      pos[i * 3 + 0] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }

    return pos;
  }, []);

  // Chapter 1/2 instance opacity: 0.5s to 15.5s
  const opacity1 = getFadeOpacity(timelineTime, 0.8, 15.5, 2.0, 1.8);
  const isVisible1 = opacity1 > 0.005;

  // Chapter 5 instance opacity: 50.0s to 65.0s
  const opacity2 = getFadeOpacity(timelineTime, 49.5, 65.0, 2.5, 0.5);
  const isVisible2 = opacity2 > 0.005;

  // Animate rotations & breathing pulses
  useFrame(() => {
    const t = timelineTime;

    // Pulse & rotation for Instance 1 (Opening Hero Heart)
    if (isVisible1 && heartMesh1Ref.current) {
      const pulse = 1.0 + Math.sin(t * 3.0) * 0.04;
      const s = pulse * heartScales.opening;
      heartMesh1Ref.current.scale.set(s, s, s);
      heartMesh1Ref.current.rotation.y = t * 0.35;
      heartMesh1Ref.current.rotation.x = Math.sin(t * 0.7) * 0.08;
    }

    if (isVisible1 && ring1Ref.current && ring2Ref.current) {
      ring1Ref.current.rotation.x = 1.1 + Math.sin(t * 0.8) * 0.15;
      ring1Ref.current.rotation.y = t * 0.7;
      ring2Ref.current.rotation.x = -0.9 + Math.cos(t * 0.6) * 0.12;
      ring2Ref.current.rotation.y = -t * 0.65;
    }

    if (isVisible1 && sparksRef.current) {
      sparksRef.current.rotation.y = t * 0.25;
    }

    // Pulse & rotation for Instance 2 (Ending Hero Heart Backdrop)
    if (isVisible2 && heartMesh2Ref.current) {
      const pulse = 1.0 + Math.sin(t * 2.2) * 0.045;
      const s = pulse * heartScales.ending;
      heartMesh2Ref.current.scale.set(s, s, s);
      heartMesh2Ref.current.rotation.y = t * 0.2;
    }

    if (isVisible2 && ring3Ref.current) {
      ring3Ref.current.rotation.x = 1.2 + Math.sin(t * 0.5) * 0.1;
      ring3Ref.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group>
      {/* 1. Chapter 1 & 2 Opening Hero Heart (Z = 4.2) */}
      {isVisible1 && (
        <group position={[0, 0.1, 4.2]}>
          {/* Crystal Ruby Heart Mesh */}
          <mesh ref={heartMesh1Ref} geometry={heartGeometry}>
            <meshPhysicalMaterial
              color="#ff0055"
              emissive="#be123c"
              emissiveIntensity={0.55 * opacity1}
              roughness={0.08}
              metalness={0.15}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              transmission={0.65}
              ior={1.6}
              transparent
              opacity={opacity1 * 0.95}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Halo Orbit Ring 1 */}
          <mesh ref={ring1Ref}>
            <torusGeometry args={[heartScales.ringOpening, 0.02, 12, 64]} />
            <meshStandardMaterial
              color="#f43f5e"
              emissive="#e11d48"
              emissiveIntensity={2.2 * opacity1}
              transparent
              opacity={opacity1 * 0.9}
            />
          </mesh>

          {/* Halo Orbit Ring 2 */}
          <mesh ref={ring2Ref}>
            <torusGeometry args={[heartScales.ringOpening * 0.9, 0.016, 12, 64]} />
            <meshStandardMaterial
              color="#fda4af"
              emissive="#fb7185"
              emissiveIntensity={1.9 * opacity1}
              transparent
              opacity={opacity1 * 0.85}
            />
          </mesh>

          {/* Sparkles */}
          <points ref={sparksRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[sparkPositions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.06}
              color="#fff1f2"
              transparent
              opacity={opacity1 * 0.75}
              sizeAttenuation
              depthWrite={false}
            />
          </points>
        </group>
      )}

      {/* 2. Chapter 5 Forever Ending Hero Heart Backdrop (Z = -28.8) */}
      {isVisible2 && (
        <group position={[0, 0.35, -28.8]}>
          <mesh ref={heartMesh2Ref} geometry={heartGeometry}>
            <meshPhysicalMaterial
              color="#e11d48"
              emissive="#881337"
              emissiveIntensity={0.65 * opacity2}
              roughness={0.12}
              metalness={0.2}
              clearcoat={1.0}
              transmission={0.6}
              transparent
              opacity={opacity2 * 0.85}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Big Golden Rose Orbit */}
          <mesh ref={ring3Ref}>
            <torusGeometry args={[heartScales.ringEnding, 0.03, 12, 64]} />
            <meshStandardMaterial
              color="#fda4af"
              emissive="#fb7185"
              emissiveIntensity={2.0 * opacity2}
              transparent
              opacity={opacity2 * 0.8}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
