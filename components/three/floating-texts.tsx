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

    // 2. Cleanly split gift message into emotional poetic beats for Desktop 3D
    const rawSentences = gift.message
      .split(/[.\n;!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 4);

    let confessionBeats: string[] = [];

    if (rawSentences.length >= 2) {
      confessionBeats = rawSentences.slice(0, 3).map((s) =>
        s.length > 70 ? s.slice(0, 68) + "..." : s
      );
    } else if (rawSentences.length === 1 && rawSentences[0].length > 40) {
      const s = rawSentences[0];
      const mid = Math.floor(s.length / 2);
      const spaceIdx = s.indexOf(" ", mid - 10);
      const splitAt = spaceIdx !== -1 ? spaceIdx : mid;
      confessionBeats = [s.slice(0, splitAt).trim(), s.slice(splitAt).trim()];
    } else {
      confessionBeats = [
        gift.message.length > 5
          ? gift.message
          : "Cảm ơn em vì đã đến và sưởi ấm trái tim anh",
        "Mỗi khoảnh khắc có em đều là điều quý giá nhất",
      ];
    }

    // 3. Assemble curated text moments across 5 chapters
    const items: TimedTextItem[] = [
      // ==========================================
      // CHAPTER 1: AWAKEN (0-8s) - Z: 10.0 -> 7.2
      // ==========================================
      {
        id: "awaken-intro-hint",
        text: "Có một điều dành riêng cho em...",
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
      {
        id: "portal-amb-left",
        text: "Món quà từ trái tim",
        baseX: -1.5,
        baseY: 0.55,
        baseZ: 2.2,
        baseFontSize: 0.22,
        color: "#fecdd3",
        baseOpacity: 0.8,
        tier: "ambient",
        isBillboard: true,
        startWindow: 9.0,
        endWindow: 16.5,
      },
      {
        id: "portal-amb-right",
        text: "with endless love ♡",
        baseX: 1.5,
        baseY: -0.5,
        baseZ: 1.6,
        baseFontSize: 0.22,
        color: "#fb7185",
        baseOpacity: 0.85,
        tier: "ambient",
        isBillboard: true,
        startWindow: 11.0,
        endWindow: 18.0,
      },

      // ==========================================
      // CHAPTER 3: MEMORIES (18-38s) - Z: 2.5 -> -12.5
      // ==========================================
      // Paired with Photo 1 (18-26s)
      {
        id: "mem-title-1",
        text: "Happy Anniversary",
        baseX: 1.4,
        baseY: 0.5,
        baseZ: -2.5,
        baseFontSize: 0.32,
        color: "#ffffff",
        baseOpacity: 0.98,
        tier: "medium",
        isBillboard: true,
        startWindow: 17.5,
        endWindow: 26.5,
      },
      {
        id: "mem-verse-1",
        text: "Nụ cười của em là ánh sáng",
        baseX: -1.4,
        baseY: -0.52,
        baseZ: -4.8,
        baseFontSize: 0.24,
        color: "#fecdd3",
        baseOpacity: 0.85,
        tier: "ambient",
        isBillboard: true,
        startWindow: 19.5,
        endWindow: 28.0,
      },

      // Paired with Photo 2 (22-30s)
      {
        id: "mem-title-2",
        text: "Trọn vẹn từng phút giây",
        baseX: -1.4,
        baseY: 0.46,
        baseZ: -7.2,
        baseFontSize: 0.32,
        color: "#fda4af",
        baseOpacity: 0.98,
        tier: "medium",
        isBillboard: true,
        startWindow: 22.0,
        endWindow: 31.0,
      },
      {
        id: "mem-verse-2",
        text: "bình yên từng khoảnh khắc",
        baseX: 1.4,
        baseY: -0.5,
        baseZ: -9.5,
        baseFontSize: 0.22,
        color: "#ffe4e6",
        baseOpacity: 0.85,
        tier: "ambient",
        isBillboard: true,
        startWindow: 24.0,
        endWindow: 32.5,
      },

      // Paired with Photo 3 & 4 (26-36s)
      {
        id: "mem-title-3",
        text: "Cùng nhau đi qua năm tháng",
        baseX: 1.3,
        baseY: 0.45,
        baseZ: -12.2,
        baseFontSize: 0.32,
        color: "#ffffff",
        baseOpacity: 0.98,
        tier: "medium",
        isBillboard: true,
        startWindow: 27.0,
        endWindow: 36.5,
      },
      {
        id: "mem-verse-3",
        text: "My only one ♡",
        baseX: -1.4,
        baseY: -0.48,
        baseZ: -14.2,
        baseFontSize: 0.26,
        color: "#fb7185",
        baseOpacity: 0.9,
        tier: "medium",
        isBillboard: true,
        startWindow: 29.5,
        endWindow: 38.0,
      },

      // ==========================================
      // CHAPTER 4: CONFESSION (38-52s) - Z: -12.5 -> -22.0
      // ==========================================
      {
        id: "confess-beat-1",
        text: confessionBeats[0],
        baseX: 0,
        baseY: 0.24,
        baseZ: -16.5,
        baseFontSize: 0.36,
        color: "#ffffff",
        baseOpacity: 1.0,
        tier: "primary",
        isBillboard: true,
        startWindow: 37.5,
        endWindow: 45.0,
        baseMaxWidth: 4.2,
      },
      ...(confessionBeats[1]
        ? [
            {
              id: "confess-beat-2",
              text: confessionBeats[1],
              baseX: 0,
              baseY: 0.2,
              baseZ: -19.5,
              baseFontSize: 0.36,
              color: "#ffffff",
              baseOpacity: 1.0,
              tier: "primary" as const,
              isBillboard: true,
              startWindow: 43.0,
              endWindow: 50.5,
              baseMaxWidth: 4.2,
            },
          ]
        : []),
      ...(confessionBeats[2]
        ? [
            {
              id: "confess-beat-3",
              text: confessionBeats[2],
              baseX: 0,
              baseY: 0.18,
              baseZ: -20.8,
              baseFontSize: 0.34,
              color: "#ffffff",
              baseOpacity: 1.0,
              tier: "primary" as const,
              isBillboard: true,
              startWindow: 46.0,
              endWindow: 52.0,
              baseMaxWidth: 4.2,
            },
          ]
        : []),
      {
        id: "confess-amb-1",
        text: "lắng nghe nhịp tim",
        baseX: -1.4,
        baseY: -0.52,
        baseZ: -17.5,
        baseFontSize: 0.22,
        color: "#fda4af",
        baseOpacity: 0.75,
        tier: "ambient",
        isBillboard: true,
        startWindow: 38.0,
        endWindow: 46.0,
      },
      {
        id: "confess-amb-2",
        text: "chân thành & duy nhất",
        baseX: 1.4,
        baseY: -0.52,
        baseZ: -20.0,
        baseFontSize: 0.22,
        color: "#ffe4e6",
        baseOpacity: 0.75,
        tier: "ambient",
        isBillboard: true,
        startWindow: 43.5,
        endWindow: 51.5,
      },
      {
        id: "confess-sender",
        text: `Thương gửi từ ${gift.sender_name || "người thương"}`,
        baseX: 0,
        baseY: -0.32,
        baseZ: -21.8,
        baseFontSize: 0.36,
        color: "#fda4af",
        baseOpacity: 0.98,
        tier: "primary",
        isBillboard: true,
        startWindow: 46.5,
        endWindow: 53.5,
        baseMaxWidth: 4.2,
      },
    ];

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
