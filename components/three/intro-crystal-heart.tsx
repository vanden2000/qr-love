"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { RelationshipType } from "@/lib/presets/occasions";

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

interface CrystalObjectSceneProps {
  relationship?: RelationshipType;
}

function CrystalObjectScene({ relationship = "COUPLE" }: CrystalObjectSceneProps) {
  const heartGroupRef = useRef<THREE.Group>(null);
  const heartMeshRef = useRef<THREE.Mesh>(null);
  const outerSphereRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const sparkGroupRef = useRef<THREE.Group>(null);

  // Mouse / Pointer Parallax Target
  const targetRotation = useRef({ x: 0, y: 0 });

  // 1. Create Dynamic Procedural 3D Geometry Based on Relationship
  const thematicGeometry = useMemo(() => {
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.12,
      bevelThickness: 0.14,
      curveSegments: 20,
    };

    // A. FRIENDSHIP: 3D 5-Pointed Star
    if (relationship === "FRIENDSHIP") {
      const shape = new THREE.Shape();
      const points = 5;
      const outerRadius = 1.25;
      const innerRadius = 0.58;
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
      for (let deg = 0; deg <= 360; deg += 4) {
        const rad = (deg * Math.PI) / 180;
        const r = 0.72 + 0.44 * Math.cos(petals * rad);
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

    // C. COLLEAGUE: 3D Diamond Crystal (Octahedron)
    if (relationship === "COLLEAGUE") {
      const geom = new THREE.OctahedronGeometry(1.22, 0);
      geom.computeVertexNormals();
      return geom;
    }

    // D. CRUSH / COUPLE: Iconic 3D Extruded Gem Heart
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.35);
    shape.bezierCurveTo(0, 0.65, -0.45, 0.95, -0.85, 0.95);
    shape.bezierCurveTo(-1.3, 0.95, -1.3, 0.45, -1.3, 0.45);
    shape.bezierCurveTo(-1.3, 0.1, -0.95, -0.35, 0, -1.05);
    shape.bezierCurveTo(0.95, -0.35, 1.3, 0.1, 1.3, 0.45);
    shape.bezierCurveTo(1.3, 0.45, 1.3, 0.95, 0.85, 0.95);
    shape.bezierCurveTo(0.45, 0.95, 0, 0.65, 0, 0.35);

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }, [relationship]);

  // Color configurations per theme
  const themeConfig = useMemo(() => {
    switch (relationship) {
      case "FRIENDSHIP":
        return {
          gemColor: "#F59E0B",
          gemEmissive: "#D97706",
          emissiveIntensity: 0.5,
          outerColor: "#FEF3C7",
          ring1Color: "#FBBF24",
          ring1Emissive: "#F59E0B",
          ring2Color: "#38BDF8",
          ring2Emissive: "#0284C7",
          light1: "#F59E0B",
          light2: "#38BDF8",
          sparkColor: "#FEF3C7",
        };
      case "FAMILY":
        return {
          gemColor: "#F59E0B",
          gemEmissive: "#EA580C",
          emissiveIntensity: 0.45,
          outerColor: "#FFFBEB",
          ring1Color: "#FB923C",
          ring1Emissive: "#EA580C",
          ring2Color: "#F43F5E",
          ring2Emissive: "#E11D48",
          light1: "#F97316",
          light2: "#F43F5E",
          sparkColor: "#FFF7ED",
        };
      case "COLLEAGUE":
        return {
          gemColor: "#0284C7",
          gemEmissive: "#0369A1",
          emissiveIntensity: 0.55,
          outerColor: "#F0F9FF",
          ring1Color: "#38BDF8",
          ring1Emissive: "#0284C7",
          ring2Color: "#6366F1",
          ring2Emissive: "#4F46E5",
          light1: "#0284C7",
          light2: "#38BDF8",
          sparkColor: "#E0F2FE",
        };
      case "CRUSH":
        return {
          gemColor: "#FB7185",
          gemEmissive: "#E11D48",
          emissiveIntensity: 0.45,
          outerColor: "#FFF1F2",
          ring1Color: "#FDA4AF",
          ring1Emissive: "#FB7185",
          ring2Color: "#38BDF8",
          ring2Emissive: "#0284C7",
          light1: "#FB7185",
          light2: "#38BDF8",
          sparkColor: "#FFE4E6",
        };
      default: // COUPLE
        return {
          gemColor: "#ff0055",
          gemEmissive: "#be123c",
          emissiveIntensity: 0.45,
          outerColor: "#ffe4e6",
          ring1Color: "#f43f5e",
          ring1Emissive: "#e11d48",
          ring2Color: "#fda4af",
          ring2Emissive: "#fb7185",
          light1: "#ff1744",
          light2: "#ffffff",
          sparkColor: "#fff1f2",
        };
    }
  }, [relationship]);

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

    // Rhythmic breathing pulse
    if (heartMeshRef.current) {
      const pulse = 1.0 + Math.sin(time * 2.8) * 0.045 + Math.sin(time * 5.6) * 0.015;
      heartMeshRef.current.scale.set(pulse * 0.92, pulse * 0.92, pulse * 0.92);
    }

    // Outer Glass Orb subtle counter spin
    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y = -time * 0.15;
      outerSphereRef.current.rotation.z = Math.sin(time * 0.5) * 0.08;
    }

    // Orbital Ring 1 rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = 1.15 + Math.sin(time * 0.7) * 0.15;
      ring1Ref.current.rotation.y = time * 0.85;
      ring1Ref.current.rotation.z = time * 0.45;
    }

    // Orbital Ring 2 rotation
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
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={3.5} color={themeConfig.light1} distance={5} />
      <pointLight position={[3, 4, 3]} intensity={2.6} color={themeConfig.light2} />
      <pointLight position={[-3, -2, -3]} intensity={1.8} color={themeConfig.outerColor} />
      <directionalLight position={[0, 5, 2]} intensity={1.2} color="#ffffff" />

      {/* Primary 3D Crystal Gem Object (Star / Lotus / Diamond / Heart) */}
      <mesh ref={heartMeshRef} geometry={thematicGeometry}>
        <meshPhysicalMaterial
          color={themeConfig.gemColor}
          emissive={themeConfig.gemEmissive}
          emissiveIntensity={themeConfig.emissiveIntensity}
          roughness={0.08}
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
          color={themeConfig.outerColor}
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

      {/* Orbital Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.02, 0.028, 16, 80]} />
        <meshStandardMaterial
          color={themeConfig.ring1Color}
          emissive={themeConfig.ring1Emissive}
          emissiveIntensity={2.0}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Orbital Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.9, 0.022, 16, 80]} />
        <meshStandardMaterial
          color={themeConfig.ring2Color}
          emissive={themeConfig.ring2Emissive}
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
          color={themeConfig.sparkColor}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export interface IntroCrystalHeartProps {
  relationship?: RelationshipType;
}

export function IntroCrystalHeart({ relationship = "COUPLE" }: IntroCrystalHeartProps) {
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
        <CrystalObjectScene relationship={relationship} />
      </Canvas>
    </div>
  );
}
