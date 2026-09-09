"use client";

import { useFrame } from "@react-three/fiber";
import { getCameraPose } from "@/components/three/scene-timeline";

interface LoveCameraProps {
  timelineTime: number;
}

export function LoveCamera({ timelineTime }: LoveCameraProps) {
  useFrame((state) => {
    const pose = getCameraPose(timelineTime);

    state.camera.position.x = pose.position[0];
    state.camera.position.y = pose.position[1];
    state.camera.position.z = pose.position[2];

    state.camera.lookAt(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2]);
  });

  return null;
}
