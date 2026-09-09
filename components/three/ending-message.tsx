"use client";

import React from "react";
import { Text, Billboard } from "@react-three/drei";
import type { GiftWithMedia } from "@/types/gift";
import { getFadeOpacity } from "@/components/three/scene-timeline";
import { useResponsive3D } from "@/components/three/responsive-3d";

interface EndingMessageProps {
  gift: GiftWithMedia;
  timelineTime: number;
  position?: [number, number, number];
}

export function EndingMessage({
  gift,
  timelineTime,
  position = [0, 0, -28.0],
}: EndingMessageProps) {
  const { getTextScale, getMaxTextWidth, isMobile } = useResponsive3D();

  // On Mobile: Return null so MobileStoryStream handles crystal-clear HTML ending poster
  if (isMobile) {
    return null;
  }

  // Visible during CHAPTER 5: FOREVER (52-65s)
  const opacity = getFadeOpacity(timelineTime, 51.5, 65.0, 2.5, 0.5);
  const isVisible = opacity > 0.001;

  if (!isVisible) return null;

  const sender = gift.sender_name || "Người thương";
  const receiver = gift.receiver_name;
  const endingTitle = `${sender}  ♡  ${receiver}`;

  return (
    <Billboard position={position}>
      {/* Top Floating Glow Heart Symbol */}
      <Text
        position={[0, 1.05, 0]}
        fontSize={getTextScale(0.44)}
        color="#fb7185"
        anchorX="center"
        anchorY="middle"
        fillOpacity={opacity * 0.95}
        material-toneMapped={false}
      >
        ♥
      </Text>

      {/* Primary Big Couple Sign-off */}
      <Text
        position={[0, 0.45, 0]}
        fontSize={getTextScale(0.48)}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
        fillOpacity={opacity * 0.98}
        material-toneMapped={false}
        outlineWidth={0.018}
        outlineColor="#000000"
        outlineOpacity={opacity * 0.75}
        maxWidth={getMaxTextWidth(5.4)}
      >
        {endingTitle}
      </Text>

      {/* Secondary Label: FOREVER & ALWAYS */}
      <Text
        position={[0, -0.15, 0]}
        fontSize={getTextScale(0.24)}
        color="#fecdd3"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.14}
        fillOpacity={opacity * 0.9}
        material-toneMapped={false}
      >
        FOREVER & ALWAYS
      </Text>

      {/* Subtitle / Romantic Ending Note */}
      <Text
        position={[0, -0.62, 0]}
        fontSize={getTextScale(0.26)}
        color="#fda4af"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        fillOpacity={opacity * 0.92}
        material-toneMapped={false}
        outlineWidth={0.012}
        outlineColor="#000000"
        outlineOpacity={opacity * 0.65}
        maxWidth={getMaxTextWidth(4.8)}
      >
        “Hành trình của chúng ta • Mãi mãi đong đầy yêu thương”
      </Text>
    </Billboard>
  );
}
