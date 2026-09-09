"use client";

import { useMemo } from "react";

export interface PerfSettings {
  dpr: number | [number, number];
  heartCount: number;
  stardustCount: number;
  enableBloom: boolean;
  bloomIntensity: number;
}

/**
 * Adaptive performance detector for mobile and high-spec desktop devices
 */
export function useAdaptivePerformance(): PerfSettings {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        dpr: [1, 1.5],
        heartCount: 160,
        stardustCount: 160,
        enableBloom: true,
        bloomIntensity: 0.55,
      };
    }

    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = window.innerWidth <= 640;
    const isLowPower = cores <= 4;

    if (isMobile || isLowPower) {
      return {
        dpr: 1,
        heartCount: 110,
        stardustCount: 110,
        enableBloom: false,
        bloomIntensity: 0,
      };
    }

    return {
      dpr: [1, 1.5],
      heartCount: 160,
      stardustCount: 160,
      enableBloom: true,
      bloomIntensity: 0.55,
    };
  }, []);
}
