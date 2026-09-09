"use client";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface ResponsiveConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  aspect: number;
  viewportWidth: number;
  viewportHeight: number;
  // Dynamic positioning helpers
  getLaneX: (baseX: number, depthZ: number) => number;
  getTextScale: (baseScale: number) => number;
  getMaxTextWidth: (baseMaxWidth?: number) => number;
  getPhotoScale: () => [number, number];
  getHeroHeartScale: () => { opening: number; ending: number; ringOpening: number; ringEnding: number };
  getVisibleWidthAtZ: (depthZ: number) => number;
}

/**
 * Calculates frustum visible dimensions and responsive placement
 * Mobile-first logic tailored for 375x812, 390x844, 430x932, tablet, and desktop
 */
export function useResponsive3D(): ResponsiveConfig {
  const { viewport, size, camera } = useThree();

  const aspect = size.width / Math.max(1, size.height);
  const isMobile = size.width <= 640 || aspect < 0.75;
  const isTablet = !isMobile && size.width <= 1024;
  const isDesktop = !isMobile && !isTablet;

  const getVisibleWidthAtZ = (depthZ: number): number => {
    const cam = camera as THREE.PerspectiveCamera;
    const distance = Math.abs(cam.position.z - depthZ);
    if (cam.fov) {
      const vFOV = THREE.MathUtils.degToRad(cam.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
      return visibleHeight * aspect;
    }
    return viewport.width;
  };

  const getLaneX = (baseX: number, depthZ: number): number => {
    if (baseX === 0) return 0;
    const sign = baseX > 0 ? 1 : -1;
    const visibleWidth = getVisibleWidthAtZ(depthZ);

    if (isMobile) {
      // On mobile portrait: keep within 18% - 28% of visible width to avoid cutting
      const maxOffset = Math.min(Math.abs(baseX) * 0.32, visibleWidth * 0.28);
      return sign * Math.max(0.35, maxOffset);
    }

    if (isTablet) {
      return sign * Math.min(Math.abs(baseX) * 0.65, visibleWidth * 0.35);
    }

    // Desktop
    return baseX;
  };

  const getTextScale = (baseScale: number): number => {
    if (isMobile) return baseScale * 0.58; // Calibrated for mobile portrait frustum
    if (isTablet) return baseScale * 0.82;
    return baseScale;
  };

  const getMaxTextWidth = (baseMaxWidth = 4.4): number => {
    if (isMobile) return Math.min(2.35, baseMaxWidth * 0.52);
    if (isTablet) return Math.min(3.6, baseMaxWidth * 0.8);
    return baseMaxWidth;
  };

  const getPhotoScale = (): [number, number] => {
    if (isMobile) return [1.25, 1.6];
    if (isTablet) return [1.55, 1.95];
    return [1.85, 2.35];
  };

  const getHeroHeartScale = () => {
    if (isMobile) {
      return {
        opening: 0.38,
        ending: 0.78,
        ringOpening: 0.95,
        ringEnding: 1.55,
      };
    }
    if (isTablet) {
      return {
        opening: 0.5,
        ending: 1.05,
        ringOpening: 1.25,
        ringEnding: 2.0,
      };
    }
    return {
      opening: 0.62,
      ending: 1.3,
      ringOpening: 1.5,
      ringEnding: 2.4,
    };
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    aspect,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    getLaneX,
    getTextScale,
    getMaxTextWidth,
    getPhotoScale,
    getHeroHeartScale,
    getVisibleWidthAtZ,
  };
}
