"use client";

import React, { Component, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { GiftWithMedia } from "@/types/gift";
import { LoveCamera } from "@/components/three/love-camera";
import { CinematicLighting } from "@/components/three/cinematic-lighting";
import { HeartParticles } from "@/components/three/heart-particles";
import { StardustParticles } from "@/components/three/stardust-particles";
import { SceneEffects } from "@/components/three/effects";
import { SceneLoader } from "@/components/three/scene-loader";
import { useAdaptivePerformance } from "@/components/three/adaptive-perf";
import { useThree } from "@react-three/fiber";

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
  isPaused?: boolean;
  fallbackContent?: React.ReactNode;
}

export function LoveScene({
  gift,
  isPaused = false,
  fallbackContent,
}: LoveSceneProps) {
  const perf = useAdaptivePerformance();
  const [hasContextLost, setHasContextLost] = React.useState(false);

  const handleContextLost = React.useCallback(() => {
    setHasContextLost(true);
  }, []);

  if (hasContextLost) {
    return <>{fallbackContent}</>;
  }

  return (
    <WebGLErrorBoundary fallback={<>{fallbackContent}</>}>
      <div className="fixed inset-0 z-20 w-full h-full bg-[#050103] overflow-hidden select-none">
        <Suspense fallback={<SceneLoader />}>
          <Canvas
            dpr={perf.dpr}
            camera={{ position: [0, 0, 8.5], fov: 58 }}
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
            <ContextLossManager onContextLost={handleContextLost} />

            {/* Deep Atmosphere */}
            <color attach="background" args={["#080104"]} />
            <fog attach="fog" args={["#080104", 8, 38]} />

            {/* Dynamic 3D Cinematic Lighting */}
            <CinematicLighting timelineTime={0} />

            {/* Smooth Breathing Camera */}
            <LoveCamera timelineTime={0} />

            {/* Ambient Cosmic Stardust */}
            <StardustParticles count={perf.stardustCount} />

            {/* Thematic 3D Waterfall Stream (Hearts, Stars, Lotus, Diamonds) */}
            <HeartParticles
              relationship={gift?.relationship_type as any}
              count={perf.heartCount}
              isPaused={isPaused}
            />

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
