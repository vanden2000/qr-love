"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { GiftMedia } from "@/types/gift";

interface GiftGalleryProps {
  images: GiftMedia[];
}

export function GiftGallery({ images }: GiftGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GiftMedia | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageError = (idOrIndex: string) => {
    setFailedImages((prev) => ({ ...prev, [idOrIndex]: true }));
  };

  return (
    <div className="w-full space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
        <span>Khoảnh khắc kỷ niệm</span>
        <span className="text-zinc-500">
          {images.length} {images.length > 1 ? "bức ảnh" : "ảnh"}
        </span>
      </div>

      {/* Gallery Grid */}
      <div
        className={`grid gap-3 ${
          images.length === 1
            ? "grid-cols-1"
            : images.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {images.map((img, index) => {
          const imgKey = img.id || `${img.url}-${index}`;
          const isFailed = failedImages[imgKey];

          return (
            <div
              key={imgKey}
              onClick={() => !isFailed && setSelectedImage(img)}
              className={`relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-sm transition-transform ${
                isFailed ? "cursor-default opacity-80" : "cursor-pointer group active:scale-[0.98]"
              } ${
                images.length === 1
                  ? "aspect-[4/3] w-full"
                  : images.length === 3 && index === 0
                  ? "col-span-2 sm:col-span-1 aspect-[4/3] sm:aspect-square"
                  : "aspect-square"
              }`}
            >
              {!isFailed ? (
                <>
                  <Image
                    src={img.url}
                    alt={`Ảnh kỷ niệm ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(imgKey)}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-900 text-zinc-500 gap-1.5">
                  <span className="text-xl">🖼️</span>
                  <span className="text-[11px] text-zinc-400">
                    Không thể hiển thị ảnh
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-lg w-full max-h-[85vh] aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.url}
              alt="Xem ảnh kỷ niệm chi tiết"
              fill
              className="object-contain"
              unoptimized
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 border border-zinc-700 text-white flex items-center justify-center text-sm hover:bg-rose-600 transition-colors"
              aria-label="Đóng ảnh"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
