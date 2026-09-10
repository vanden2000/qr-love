"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTimelineChapter } from "@/components/three/scene-timeline";

interface CinematicLightingProps {
  timelineTime?: number;
}

export function CinematicLighting({ timelineTime = 0 }: CinematicLightingProps) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyLightRef = useRef<THREE.PointLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const clockTime = state.clock.getElapsedTime();
    const chapter = getTimelineChapter(timelineTime || clockTime);

    let targetAmbient = 0.8;
    let targetKey = 1.1;
    let targetFill = 0.8;
    let targetRim = 1.0;

    switch (chapter) {
      case "OPENING": // 0.0 - 3.0s: soft anticipation
        targetAmbient = 0.6;
        targetKey = 0.9;
        targetFill = 0.6;
        targetRim = 0.7;
        break;
      case "LOVE_STREAM_1": // 3.0 - 8.5s: bright blooming rose
        targetAmbient = 0.85;
        targetKey = 1.2;
        targetFill = 0.85;
        targetRim = 1.0;
        break;
      case "MEMORY_WAVE_1": // 8.5 - 14.5s: warm romantic gold-rose
      case "MEMORY_WAVE_2": // 14.5 - 20.5s
        targetAmbient = 0.9;
        targetKey = 1.25;
        targetFill = 0.95;
        targetRim = 1.15;
        break;
      case "EMOTIONAL_PEAK": // 20.5 - 26.5s: intimate radiant focus
        targetAmbient = 0.75;
        targetKey = 1.1;
        targetFill = 0.75;
        targetRim = 1.3;
        break;
      case "ENDING": // 26.5 - 30.0s+: celebratory climax
        targetAmbient = 1.0;
        targetKey = 1.35;
        targetFill = 1.05;
        targetRim = 1.6;
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
      <ambientLight ref={ambientRef} intensity={0.65} />

      {/* Front Soft Pink Key Light */}
      <pointLight
        ref={keyLightRef}
        position={[0, 4, 8]}
        intensity={0.9}
        color="#ffe4e6"
      />

      {/* Mid-journey Warm Fill Light */}
      <pointLight
        ref={fillLightRef}
        position={[0, -2, -10]}
        intensity={0.6}
        color="#fda4af"
      />

      {/* Dramatic Back Rim Light */}
      <pointLight
        ref={rimLightRef}
        position={[0, 3, -20]}
        intensity={0.8}
        color="#fb7185"
      />
    </>
  );
}
