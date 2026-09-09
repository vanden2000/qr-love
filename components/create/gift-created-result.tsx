"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { generateQRCodeDataURL, getGiftUrl } from "@/lib/qr/generateQR";
import { downloadLuxuryGiftCard } from "@/lib/qr/generateGiftCardImage";

interface GiftCreatedResultProps {
  slug: string;
  receiverName: string;
  title: string;
  onReset?: () => void;
}

export function GiftCreatedResult({
  slug,
  receiverName,
  title,
  onReset,
}: GiftCreatedResultProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrGenError, setQrGenError] = useState<string | null>(null);

  const { giftUrl, urlError } = useMemo(() => {
    try {
      const url = getGiftUrl(slug);
      return { giftUrl: url, urlError: null };
    } catch (err) {
      return {
        giftUrl: "",
        urlError:
          err instanceof Error
            ? err.message
            : "Không thể lấy đường dẫn ứng dụng. Vui lòng kiểm tra NEXT_PUBLIC_APP_URL.",
      };
    }
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    if (!giftUrl) return;

    generateQRCodeDataURL(giftUrl, {
      width: 600,
      margin: 1,
      darkColor: "#BE123C", // Ruby Crimson
      lightColor: "#FFFDFE", // Pearl White
      withHeartCenter: true,
    })
      .then((dataUrl) => {
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setQrGenError(
            err instanceof Error ? err.message : "Không thể tạo mã QR."
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [giftUrl]);

  const activeError = urlError || qrGenError;

  const handleCopyLink = async () => {
    if (!giftUrl) return;
    try {
      await navigator.clipboard.writeText(giftUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleDownloadQR = async () => {
    if (!giftUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadLuxuryGiftCard({
        slug,
        receiverName,
        title,
        giftUrl,
      });
    } catch (err) {
      console.error("Failed to download gift card:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center text-center space-y-6 sm:space-y-7 w-full animate-in fade-in zoom-in-95 duration-500">
      {/* 1. Luxury Success Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/70 border border-rose-500/40 text-xs font-medium text-rose-200 shadow-[0_0_20px_rgba(225,29,72,0.25)] backdrop-blur-md">
        <span className="text-rose-400 animate-pulse">✨ ♡</span>
        <span className="tracking-wide">Tạo món quà thành công!</span>
      </div>

      {/* 2. Heading Section (Playfair Serif typography) */}
      <div className="space-y-2 px-2">
        <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.25em] text-rose-300/85">
          Món quà dành cho
        </p>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#FFF4F6] font-medium tracking-tight drop-shadow-[0_2px_12px_rgba(225,29,72,0.35)]"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {receiverName}
        </h1>
        <p className="text-xs sm:text-sm text-rose-200/90 italic font-serif max-w-sm mx-auto leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          &ldquo;{title}&rdquo;
        </p>
      </div>

      {/* 3. QR Hero Card with Multi-layer Glow */}
      <div className="relative group w-full max-w-[280px] sm:max-w-[310px] mx-auto">
        {/* Outer Aura Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-rose-600/30 via-pink-500/25 to-rose-600/30 rounded-[32px] blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hero Card Container */}
        <div className="relative p-5 sm:p-6 rounded-[28px] bg-gradient-to-b from-[#FFFDFE] to-[#FFF5F7] border border-rose-200/80 shadow-[0_14px_45px_-10px_rgba(225,29,72,0.35)] flex flex-col items-center justify-center">
          {/* Top Card Label */}
          <div className="flex items-center gap-1.5 mb-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-rose-700/85 uppercase">
            <span>♡</span>
            <span>QR LOVE • SECRET GIFT</span>
            <span>♡</span>
          </div>

          {/* QR Image */}
          {qrDataUrl ? (
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1 shadow-inner">
              <Image
                src={qrDataUrl}
                alt={`Mã QR món quà cho ${receiverName}`}
                width={300}
                height={300}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>
          ) : activeError ? (
            <div className="w-52 h-52 flex items-center justify-center text-xs text-rose-700 p-4 font-medium">
              {activeError}
            </div>
          ) : (
            <div className="w-52 h-52 flex flex-col items-center justify-center text-xs text-rose-400 gap-2">
              <span className="text-2xl animate-spin">✨</span>
              <span>Đang tạo mã QR lãng mạn...</span>
            </div>
          )}

          {/* Bottom Card Note */}
          <p className="mt-3 text-[10px] sm:text-[11px] font-medium text-rose-600/90 tracking-wide text-center">
            Quét mã bằng camera để mở quà bí mật
          </p>
        </div>
      </div>

      {/* 4. Capsule Link & Copy Box */}
      {giftUrl && (
        <div className="w-full max-w-md flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-zinc-900/85 border border-rose-500/25 text-left shadow-lg backdrop-blur-md">
          <div className="pl-2.5 text-rose-400 text-sm select-none">🔗</div>
          <input
            type="text"
            readOnly
            value={giftUrl}
            className="flex-1 bg-transparent px-1 text-xs sm:text-[13px] text-zinc-200 focus:outline-none select-all truncate font-mono"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
              copied
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
                : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 hover:border-rose-400"
            }`}
          >
            <span>{copied ? "✓" : "📋"}</span>
            <span>{copied ? "Đã chép" : "Sao chép"}</span>
          </button>
        </div>
      )}

      {/* 5. CTA Action Buttons */}
      <div className="w-full max-w-md flex flex-col gap-3 pt-1">
        {/* Primary CTA: Xem món quà ngay */}
        <Link href={`/gift/${slug}`} className="w-full">
          <button
            type="button"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm sm:text-base shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:shadow-[0_6px_30px_rgba(225,29,72,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>✨</span>
            <span>Xem món quà ngay</span>
            <span className="text-xs">→</span>
          </button>
        </Link>

        {/* Secondary CTA: Tải thiệp ảnh QR (1080p) */}
        {giftUrl && (
          <button
            type="button"
            onClick={handleDownloadQR}
            disabled={isDownloading}
            className="w-full py-3 px-6 rounded-2xl bg-zinc-900/80 hover:bg-rose-950/40 border border-rose-500/40 hover:border-rose-400 text-rose-200 font-medium text-xs sm:text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{isDownloading ? "⏳" : "📷"}</span>
            <span>
              {isDownloading ? "Đang xuất thiệp ảnh..." : "Tải thiệp ảnh QR (1080p)"}
            </span>
          </button>
        )}

        {/* Tertiary CTA: Tạo món quà khác */}
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            + Tạo thêm món quà khác
          </button>
        ) : (
          <Link href="/create" className="w-full">
            <button
              type="button"
              className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              + Tạo thêm món quà khác
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
