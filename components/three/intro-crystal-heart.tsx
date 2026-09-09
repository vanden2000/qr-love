"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

function CrystalHeartScene() {
  const heartGroupRef = useRef<THREE.Group>(null);
  const heartMeshRef = useRef<THREE.Mesh>(null);
  const outerSphereRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const sparkGroupRef = useRef<THREE.Group>(null);

  // Mouse / Pointer Parallax Target
  const targetRotation = useRef({ x: 0, y: 0 });

  // 1. Create a 3D Extruded Beveled Heart Geometry
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Centered smooth parametric heart shape
    shape.moveTo(0, 0.35);
    shape.bezierCurveTo(0, 0.65, -0.45, 0.95, -0.85, 0.95);
    shape.bezierCurveTo(-1.3, 0.95, -1.3, 0.45, -1.3, 0.45);
    shape.bezierCurveTo(-1.3, 0.1, -0.95, -0.35, 0, -1.05);
    shape.bezierCurveTo(0.95, -0.35, 1.3, 0.1, 1.3, 0.45);
    shape.bezierCurveTo(1.3, 0.45, 1.3, 0.95, 0.85, 0.95);
    shape.bezierCurveTo(0.45, 0.95, 0, 0.65, 0, 0.35);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.14,
      bevelThickness: 0.18,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // 2. Precompute Sparkling Orbit Particles with deterministic PRNG
  const sparkPositions = useMemo(() => {
    const rng = createSeededRandom(777);
    const count = 38;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 1.1 + rng() * 1.3;
      const theta = rng() * Math.PI * 2;
      const phi = (rng() - 0.5) * Math.PI;

      pos[i * 3 + 0] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }

    return pos;
  }, []);

  // 3. Pointer move listener for interactive 3D tilt
  React.useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotation.current = {
        x: y * 0.35,
        y: x * 0.45,
      };
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  // 4. Smooth Animation Loop in useFrame
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (heartGroupRef.current) {
      // Parallax smooth interpolation
      heartGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        heartGroupRef.current.rotation.x,
        targetRotation.current.x + Math.sin(time * 0.8) * 0.06,
        0.05
      );
      heartGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        heartGroupRef.current.rotation.y,
        targetRotation.current.y + time * 0.35,
        0.05
      );
      heartGroupRef.current.position.y = Math.sin(time * 1.2) * 0.08;
    }

    // Heart rhythmic breathing pulse
    if (heartMeshRef.current) {
      const pulse = 1.0 + Math.sin(time * 2.8) * 0.045 + Math.sin(time * 5.6) * 0.015;
      heartMeshRef.current.scale.set(pulse * 0.92, pulse * 0.92, pulse * 0.92);
    }

    // Outer Glass Orb subtle counter spin
    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y = -time * 0.15;
      outerSphereRef.current.rotation.z = Math.sin(time * 0.5) * 0.08;
    }

    // Orbital Ring 1 rotation (Ruby luminous orbit)
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = 1.15 + Math.sin(time * 0.7) * 0.15;
      ring1Ref.current.rotation.y = time * 0.85;
      ring1Ref.current.rotation.z = time * 0.45;
    }

    // Orbital Ring 2 rotation (Golden pink tilted orbit)
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -0.85 + Math.cos(time * 0.6) * 0.12;
      ring2Ref.current.rotation.y = -time * 0.75;
      ring2Ref.current.rotation.z = time * 0.55;
    }

    // Sparkling particles gentle drift
    if (sparkGroupRef.current) {
      sparkGroupRef.current.rotation.y = time * 0.2;
      sparkGroupRef.current.rotation.x = Math.sin(time * 0.4) * 0.1;
    }
  });

  return (
    <group ref={heartGroupRef}>
      {/* Dynamic Lighting Setup for Gem Refraction */}
      <ambientLight intensity={0.75} />
      <pointLight position={[0, 0, 0]} intensity={3.5} color="#ff1744" distance={5} />
      <pointLight position={[3, 4, 3]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={1.8} color="#fda4af" />
      <directionalLight position={[0, 5, 2]} intensity={1.2} color="#ffe4e6" />

      {/* Primary 3D Crystal Gem Heart */}
      <mesh ref={heartMeshRef} geometry={heartGeometry}>
        <meshPhysicalMaterial
          color="#ff0055"
          emissive="#be123c"
          emissiveIntensity={0.45}
          roughness={0.06}
          metalness={0.12}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          transmission={0.65}
          ior={1.65}
          reflectivity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer Crystal Glass Bubble Orb */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[1.72, 48, 48]} />
        <meshPhysicalMaterial
          color="#ffe4e6"
          roughness={0.04}
          transmission={0.94}
          ior={1.48}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
        />
      </mesh>

      {/* Orbital Ring 1: Ruby Radiant Halo */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.02, 0.028, 16, 80]} />
        <meshStandardMaterial
          color="#f43f5e"
          emissive="#e11d48"
          emissiveIntensity={2.0}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Orbital Ring 2: Golden Rose Halo */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.9, 0.022, 16, 80]} />
        <meshStandardMaterial
          color="#fda4af"
          emissive="#fb7185"
          emissiveIntensity={1.8}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* Orbiting Sparkle Points */}
      <points ref={sparkGroupRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparkPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          color="#fff1f2"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function IntroCrystalHeart() {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full"
      >
        <CrystalHeartScene />
      </Canvas>
    </div>
  );
}
