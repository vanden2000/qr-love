"use client";

import React, { useMemo } from "react";
import type { GiftMedia } from "@/types/gift";
import { PhotoCard } from "@/components/three/photo-card";
import { useResponsive3D } from "@/components/three/responsive-3d";

interface PhotoGallery3DProps {
  media?: GiftMedia[];
  timelineTime: number;
}

interface PhotoSlot {
  basePosition: [number, number, number];
  rotation: [number, number, number];
  startWindow: number;
  endWindow: number;
}

export function PhotoGallery3D({ media, timelineTime }: PhotoGallery3DProps) {
  const { getLaneX, getPhotoScale } = useResponsive3D();

  // Extract up to 5 image items
  const images = useMemo(() => {
    return (media || [])
      .filter((item) => item.type === "image" && Boolean(item.url))
      .slice(0, 5);
  }, [media]);

  // Timed photo slots during Chapter 3: MEMORIES (18s to 38s)
  // Exactly 1-2 active photos at any time to feel like cinematic memories
  const photoSlots: PhotoSlot[] = useMemo(
    () => [
      // Photo 1: Left slot (17.5s - 26.5s)
      {
        basePosition: [-1.9, 0.25, -2.5],
        rotation: [0, 0.18, -0.02],
        startWindow: 17.5,
        endWindow: 26.5,
      },
      // Photo 2: Right slot (22.0s - 31.0s)
      {
        basePosition: [1.9, -0.2, -6.8],
        rotation: [0, -0.18, 0.02],
        startWindow: 22.0,
        endWindow: 31.0,
      },
      // Photo 3: Left slot (26.5s - 35.5s)
      {
        basePosition: [-1.9, 0.2, -11.5],
        rotation: [0, 0.16, -0.02],
        startWindow: 26.5,
        endWindow: 35.5,
      },
      // Photo 4: Right slot (31.0s - 39.5s)
      {
        basePosition: [1.8, -0.22, -15.5],
        rotation: [0, -0.16, 0.02],
        startWindow: 31.0,
        endWindow: 39.5,
      },
      // Photo 5: Left slot (34.5s - 42.5s)
      {
        basePosition: [-1.8, 0.18, -18.8],
        rotation: [0, 0.14, -0.01],
        startWindow: 34.5,
        endWindow: 42.5,
      },
    ],
    []
  );

  if (images.length === 0) return null;

  const photoScale = getPhotoScale();

  return (
    <group>
      {images.map((img, index) => {
        const slot = photoSlots[index % photoSlots.length];
        const responsiveX = getLaneX(slot.basePosition[0], slot.basePosition[2]);
        const position: [number, number, number] = [
          responsiveX,
          slot.basePosition[1],
          slot.basePosition[2],
        ];

        return (
          <PhotoCard
            key={img.id || `${img.url}-${index}`}
            url={img.url}
            position={position}
            rotation={slot.rotation}
            scale={photoScale}
            startWindow={slot.startWindow}
            endWindow={slot.endWindow}
            timelineTime={timelineTime}
          />
        );
      })}
    </group>
  );
}
