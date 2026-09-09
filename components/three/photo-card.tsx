"use client";

import React, { Suspense, useRef } from "react";
import { Image as DreiImage } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getFadeOpacity } from "@/components/three/scene-timeline";

interface PhotoCardProps {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number];
  startWindow?: number;
  endWindow?: number;
  timelineTime?: number;
}

function InnerPhotoCard({
  url,
  position,
  rotation = [0, 0, 0],
  scale = [2.2, 2.8],
  startWindow = 15,
  endWindow = 35,
  timelineTime = 0,
}: PhotoCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];
  const [width, height] = scale;

  const opacity = getFadeOpacity(timelineTime, startWindow, endWindow, 1.8, 1.8);
  const isVisible = opacity > 0.005;

  // Gentle scale in from 0.93 -> 1.0 based on opacity
  const currentScaleFactor = 0.93 + opacity * 0.07;

  useFrame(() => {
    if (!groupRef.current || !isVisible) return;
    groupRef.current.position.y =
      initialY + Math.sin(timelineTime * 0.65 + position[2]) * 0.12;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[currentScaleFactor, currentScaleFactor, 1]}
      visible={isVisible}
    >
      {/* Outer Soft Ambient Glow Backdrop */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[width + 0.32, height + 0.32]} />
        <meshBasicMaterial
          color="#fb7185"
          transparent
          opacity={opacity * 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Luxury Rose-Gold Frame */}
      <mesh position={[0, 0, -0.015]}>
        <planeGeometry args={[width + 0.12, height + 0.12]} />
        <meshBasicMaterial
          color="#fecdd3"
          transparent
          opacity={opacity * 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glass Inner Matting */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width + 0.04, height + 0.04]} />
        <meshBasicMaterial
          color="#1e040c"
          transparent
          opacity={opacity * 0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main Image with rounded corners */}
      <DreiImage
        url={url}
        scale={scale}
        radius={0.12}
        transparent
        opacity={opacity * 0.96}
        side={THREE.DoubleSide}
      />
    </group>
  );
}

function PhotoCardFallback({
  position,
  scale = [2.2, 2.8],
}: {
  position: [number, number, number];
  scale?: [number, number];
}) {
  const [width, height] = scale;
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#18181b" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export function PhotoCard(props: PhotoCardProps) {
  return (
    <Suspense
      fallback={
        <PhotoCardFallback position={props.position} scale={props.scale} />
      }
    >
      <InnerPhotoCard {...props} />
    </Suspense>
  );
}
