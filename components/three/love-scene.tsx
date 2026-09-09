"use client";

import React, { Component, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { GiftWithMedia } from "@/types/gift";
import { LoveCamera } from "@/components/three/love-camera";
import { CinematicLighting } from "@/components/three/cinematic-lighting";
import { HeartParticles } from "@/components/three/heart-particles";
import { StardustParticles } from "@/components/three/stardust-particles";
import { FloatingTexts } from "@/components/three/floating-texts";
import { PhotoGallery3D } from "@/components/three/photo-gallery-3d";
import { EndingMessage } from "@/components/three/ending-message";
import { SceneEffects } from "@/components/three/effects";
import { SceneLoader } from "@/components/three/scene-loader";
import { useAdaptivePerformance } from "@/components/three/adaptive-perf";

import { useFrame, useThree } from "@react-three/fiber";

function WebGLDiagnostics() {
  const { gl } = useThree();
  const lastLogRef = React.useRef(0);

  useFrame(() => {
    if (process.env.NODE_ENV !== "development") return;
    const now = performance.now();
    if (now - lastLogRef.current > 5000) {
      lastLogRef.current = now;
      console.log("[WebGL Diagnostics (Throttled 5s)]", {
        textures: gl.info.memory.textures,
        geometries: gl.info.memory.geometries,
        renderCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      });
    }
  });

  return null;
}

function ContextLossManager({
  onContextLost,
}: {
  onContextLost: () => void;
}) {
  const { gl } = useThree();

  React.useEffect(() => {
    const canvasDom = gl.domElement;
    if (!canvasDom) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };

    canvasDom.addEventListener("webglcontextlost", handleContextLost, false);

    return () => {
      canvasDom.removeEventListener("webglcontextlost", handleContextLost, false);
    };
  }, [gl, onContextLost]);

  return null;
}

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("WebGL Scene encountered an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface LoveSceneProps {
  gift: GiftWithMedia;
  timelineTime: number;
  fallbackContent?: React.ReactNode;
}

export function LoveScene({
  gift,
  timelineTime,
  fallbackContent,
}: LoveSceneProps) {
  const perf = useAdaptivePerformance();
  const [hasContextLost, setHasContextLost] = React.useState(false);

  const handleContextLost = React.useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[WebGL Diagnostic] Context Lost detected at timelineTime: ${timelineTime}s`
      );
    } else {
      setHasContextLost(true);
    }
  }, [timelineTime]);

  if (hasContextLost) {
    return <>{fallbackContent}</>;
  }

  return (
    <WebGLErrorBoundary fallback={<>{fallbackContent}</>}>
      <div className="fixed inset-0 z-20 w-full h-full bg-zinc-950 overflow-hidden select-none">
        <Suspense fallback={<SceneLoader />}>
          <Canvas
            dpr={perf.dpr}
            camera={{ position: [0, 0, 10], fov: 60 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              preserveDrawingBuffer: false,
              depth: true,
              stencil: false,
            }}
            className="w-full h-full"
          >
            {/* Stable Context Loss Manager with clean removeEventListener on unmount */}
            <ContextLossManager onContextLost={handleContextLost} />

            {/* Cinematic Background Atmosphere (Deep Burgundy Night) */}
            <color attach="background" args={["#0c0207"]} />

            {/* Depth Fog: Objects gently fade into romantic mist */}
            <fog attach="fog" args={["#0c0207", 10, 50]} />

            {/* Throttled Diagnostics logger (Dev only) */}
            {process.env.NODE_ENV === "development" && <WebGLDiagnostics />}

            {/* Dynamic 5-Chapter Cinematic Lighting Setup */}
            <CinematicLighting timelineTime={timelineTime} />

            {/* Timeline-driven Smooth Camera Trajectory */}
            <LoveCamera timelineTime={timelineTime} />

            {/* Visual Layers focused purely on Heart Stream & Messages */}
            <StardustParticles
              count={perf.stardustCount}
              timelineTime={timelineTime}
            />
            <HeartParticles
              count={perf.heartCount}
              timelineTime={timelineTime}
            />
            <PhotoGallery3D
              media={gift.media}
              timelineTime={timelineTime}
            />
            <FloatingTexts gift={gift} timelineTime={timelineTime} />
            <EndingMessage gift={gift} timelineTime={timelineTime} />

            {/* Adaptive Post-Processing Bloom */}
            <SceneEffects
              enabled={perf.enableBloom}
              intensity={perf.bloomIntensity}
            />
          </Canvas>
        </Suspense>
      </div>
    </WebGLErrorBoundary>
  );
}
