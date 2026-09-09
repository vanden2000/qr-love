"use client";

import React, { useMemo } from "react";
import { Text, Billboard } from "@react-three/drei";
import type { GiftWithMedia } from "@/types/gift";
import { getFadeOpacity } from "@/components/three/scene-timeline";
import { useResponsive3D } from "@/components/three/responsive-3d";

interface FloatingTextsProps {
  gift: GiftWithMedia;
  timelineTime: number;
}

interface TimedTextItem {
  id: string;
  text: string;
  baseX: number;
  baseY: number;
  baseZ: number;
  baseFontSize: number;
  color: string;
  baseOpacity: number;
  tier: "primary" | "medium" | "ambient";
  isBillboard?: boolean;
  startWindow: number;
  endWindow: number;
  baseMaxWidth?: number;
}

export function FloatingTexts({ gift, timelineTime }: FloatingTextsProps) {
  const { getLaneX, getTextScale, getMaxTextWidth, isMobile } = useResponsive3D();

  const textItems = useMemo<TimedTextItem[]>(() => {
    // 1. Calculate anniversary days deterministically from start_date and created_at
    let anniversaryPhrase = "Hành trình yêu thương";
    if (gift.start_date && gift.created_at) {
      const startTime = new Date(gift.start_date).getTime();
      const createTime = new Date(gift.created_at).getTime();
      if (!isNaN(startTime) && !isNaN(createTime)) {
        const days = Math.max(
          1,
          Math.floor(
            Math.abs(createTime - startTime) / (1000 * 60 * 60 * 24)
          )
        );
        anniversaryPhrase = `${days} NGÀY YÊU THƯƠNG`;
      }
    }

    // 2. Extract user-defined story messages (up to 10) or derive from message
    const storyList =
      gift.story_messages && gift.story_messages.length > 0
        ? gift.story_messages.map((m) => m.content.trim()).filter(Boolean)
        : gift.message
            .split(/[.\n;!?]+/)
            .map((s) => s.trim())
            .filter((s) => s.length >= 3);

    const userMessages =
      storyList.length > 0
        ? storyList.slice(0, 10)
        : [
            "Cảm ơn em vì đã xuất hiện và làm thế giới dịu dàng hơn",
            "Mỗi khoảnh khắc ở cạnh em đều là điều bình yên nhất",
          ];

    // 3. Assemble curated text moments across 5 chapters
    const items: TimedTextItem[] = [
      // ==========================================
      // CHAPTER 1: AWAKEN (0-8s) - Z: 10.0 -> 7.2
      // ==========================================
      {
        id: "awaken-intro-hint",
        text: "MỘT MÓN QUÀ DÀNH RIÊNG CHO EM",
        baseX: 0,
        baseY: 0.75,
        baseZ: 6.5,
        baseFontSize: 0.28,
        color: "#fecdd3",
        baseOpacity: 0.9,
        tier: "medium",
        isBillboard: true,
        startWindow: 1.0,
        endWindow: 7.8,
        baseMaxWidth: 4.2,
      },
      {
        id: "awaken-receiver-hero",
        text: gift.receiver_name,
        baseX: 0,
        baseY: -0.6,
        baseZ: 5.8,
        baseFontSize: 0.52,
        color: "#ffffff",
        baseOpacity: 1.0,
        tier: "primary",
        isBillboard: true,
        startWindow: 2.2,
        endWindow: 8.5,
        baseMaxWidth: 4.6,
      },

      // ==========================================
      // CHAPTER 2: LOVE PORTAL (8-18s) - Z: 7.2 -> 2.5
      // ==========================================
      {
        id: "portal-title",
        text: `“${gift.title}”`,
        baseX: 0,
        baseY: 0.42,
        baseZ: 2.6,
        baseFontSize: 0.4,
        color: "#ffffff",
        baseOpacity: 1.0,
        tier: "primary",
        isBillboard: true,
        startWindow: 8.0,
        endWindow: 17.5,
        baseMaxWidth: 4.2,
      },
      {
        id: "portal-days",
        text: anniversaryPhrase,
        baseX: 0,
        baseY: -0.35,
        baseZ: 0.8,
        baseFontSize: 0.38,
        color: "#fda4af",
        baseOpacity: 0.98,
        tier: "primary",
        isBillboard: true,
        startWindow: 10.5,
        endWindow: 18.5,
        baseMaxWidth: 4.0,
      },
    ];

    // ===================================================
    // CHAPTER 3 & 4: ALL USER STORY MESSAGES (12s - 49s)
    // Z trajectory moves from Z: 0.0 down to Z: -20.0
    // ===================================================
    const msgStartTimeline = 12.0;
    const msgEndTimeline = 48.5;
    const totalMsgDuration = msgEndTimeline - msgStartTimeline;
    const msgDuration = totalMsgDuration / userMessages.length;

    const zStart = 0.5;
    const zEnd = -20.5;

    userMessages.forEach((msg, idx) => {
      const startT = msgStartTimeline + idx * msgDuration;
      const endT = Math.min(50.0, startT + msgDuration + 1.2);

      const progress = idx / Math.max(1, userMessages.length - 1);
      const zPos = zStart + progress * (zEnd - zStart);

      // Alternate slightly left/center/right for rich depth
      const xLane = (idx % 3 === 0 ? 0 : idx % 3 === 1 ? -0.85 : 0.85);
      const yOffset = idx % 2 === 0 ? 0.32 : -0.28;

      items.push({
        id: `story-msg-3d-${idx}`,
        text: msg,
        baseX: xLane,
        baseY: yOffset,
        baseZ: zPos,
        baseFontSize: 0.36,
        color: idx % 2 === 0 ? "#ffffff" : "#fff1f2",
        baseOpacity: 1.0,
        tier: "primary",
        isBillboard: true,
        startWindow: startT,
        endWindow: endT,
        baseMaxWidth: 4.6,
      });
    });

    // Sender Signoff
    items.push({
      id: "confess-sender",
      text: `Thương gửi từ ${gift.sender_name || "người thương"}`,
      baseX: 0,
      baseY: -0.32,
      baseZ: -21.8,
      baseFontSize: 0.38,
      color: "#fda4af",
      baseOpacity: 0.98,
      tier: "primary",
      isBillboard: true,
      startWindow: 48.0,
      endWindow: 53.5,
      baseMaxWidth: 4.4,
    });

    return items;
  }, [gift]);

  // On Mobile: Return null so MobileStoryStream handles crisp HTML overlay without duplication
  if (isMobile) {
    return null;
  }

  return (
    <group>
      {textItems.map((item) => {
        const opacity =
          getFadeOpacity(
            timelineTime,
            item.startWindow,
            item.endWindow,
            1.2,
            1.2
          ) * item.baseOpacity;

        const isVisible = opacity > 0.001;
        if (!isVisible) return null;

        const responsiveX = getLaneX(item.baseX, item.baseZ);
        const responsiveFontSize = getTextScale(item.baseFontSize);
        const responsiveMaxWidth = getMaxTextWidth(item.baseMaxWidth);
        const position: [number, number, number] = [
          responsiveX,
          item.baseY,
          item.baseZ,
        ];

        const textElement = (
          <Text
            fontSize={responsiveFontSize}
            color={item.color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={opacity}
            outlineWidth={item.tier === "primary" ? 0.015 : 0.01}
            outlineColor="#000000"
            outlineOpacity={opacity * 0.9}
            letterSpacing={item.tier === "primary" ? 0.05 : 0.03}
            lineHeight={1.35}
            maxWidth={responsiveMaxWidth}
            material-toneMapped={false}
          >
            {item.text}
          </Text>
        );

        if (item.isBillboard) {
          return (
            <Billboard key={item.id} position={position}>
              {textElement}
            </Billboard>
          );
        }

        return (
          <group key={item.id} position={position}>
            {textElement}
          </group>
        );
      })}
    </group>
  );
}
