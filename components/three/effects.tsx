"use client";

import React from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

interface SceneEffectsProps {
  enabled?: boolean;
  intensity?: number;
}

export function SceneEffects({
  enabled = true,
  intensity = 0.55,
}: SceneEffectsProps) {
  if (!enabled) return null;

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        luminanceThreshold={0.8}
        luminanceSmoothing={0.3}
        intensity={intensity}
        mipmapBlur={false}
      />
    </EffectComposer>
  );
}
