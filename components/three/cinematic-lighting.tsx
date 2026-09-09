"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineChapter } from "@/components/three/scene-timeline";

interface CinematicLightingProps {
  timelineTime: number;
}

export function CinematicLighting({ timelineTime }: CinematicLightingProps) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyLightRef = useRef<THREE.PointLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const chapter = getTimelineChapter(timelineTime);

    let targetAmbient = 0.8;
    let targetKey = 1.1;
    let targetFill = 0.8;
    let targetRim = 1.0;

    switch (chapter) {
      case "AWAKEN": // 0-8s: mysterious anticipation
        targetAmbient = 0.45;
        targetKey = 0.8;
        targetFill = 0.5;
        targetRim = 0.6;
        break;
      case "LOVE_PORTAL": // 8-18s: opening portal glow
        targetAmbient = 0.75;
        targetKey = 1.15;
        targetFill = 0.85;
        targetRim = 0.9;
        break;
      case "MEMORIES": // 18-38s: warm golden-rose memory glow
        targetAmbient = 0.9;
        targetKey = 1.25;
        targetFill = 0.95;
        targetRim = 1.1;
        break;
      case "CONFESSION": // 38-52s: intimate focus on confession text
        targetAmbient = 0.5;
        targetKey = 0.95;
        targetFill = 0.45;
        targetRim = 0.7;
        break;
      case "FOREVER": // 52-65s: radiant climax celebration
        targetAmbient = 1.05;
        targetKey = 1.35;
        targetFill = 1.1;
        targetRim = 1.7;
        break;
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        targetAmbient,
        0.05
      );
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.lerp(
        keyLightRef.current.intensity,
        targetKey,
        0.05
      );
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = THREE.MathUtils.lerp(
        fillLightRef.current.intensity,
        targetFill,
        0.05
      );
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = THREE.MathUtils.lerp(
        rimLightRef.current.intensity,
        targetRim,
        0.05
      );
    }
  });

  return (
    <>
      {/* Dynamic Ambient Light */}
      <ambientLight ref={ambientRef} intensity={0.5} />

      {/* Front Soft Pink Key Light */}
      <pointLight
        ref={keyLightRef}
        position={[0, 4, 8]}
        intensity={0.8}
        color="#ffe4e6"
      />

      {/* Mid-journey Warm Fill Light */}
      <pointLight
        ref={fillLightRef}
        position={[0, -2, -14]}
        intensity={0.5}
        color="#fda4af"
      />

      {/* Dramatic Back Rim Light at Ending Stage */}
      <pointLight
        ref={rimLightRef}
        position={[0, 3, -29]}
        intensity={0.6}
        color="#fb7185"
      />
    </>
  );
}
