"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { generateQRCodeDataURL, getGiftUrl } from "@/lib/qr/generateQR";

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

    generateQRCodeDataURL(giftUrl)
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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-love-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6 w-full animate-in fade-in zoom-in-95 duration-300">
      {/* Success Badge */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
          <span>✨</span>
          <span>Tạo món quà thành công!</span>
        </div>
        <h2 className="text-xl font-light text-zinc-100 tracking-tight">
          Gửi tới {receiverName}
        </h2>
        <p className="text-xs text-zinc-400 italic max-w-xs mx-auto truncate">
          &ldquo;{title}&rdquo;
        </p>
      </div>

      {/* QR Code Card */}
      <div className="p-4 rounded-2xl bg-white shadow-xl shadow-rose-950/20 flex flex-col items-center justify-center">
        {qrDataUrl ? (
          <Image
            src={qrDataUrl}
            alt={`Mã QR món quà cho ${receiverName}`}
            width={240}
            height={240}
            className="w-56 h-56 sm:w-60 sm:h-60 rounded-lg"
            priority
            unoptimized
          />
        ) : activeError ? (
          <div className="w-56 h-56 flex items-center justify-center text-xs text-rose-600 p-4">
            {activeError}
          </div>
        ) : (
          <div className="w-56 h-56 flex items-center justify-center text-xs text-zinc-400 animate-pulse">
            Đang tạo mã QR...
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
        Quét mã QR bằng điện thoại để mở trực tiếp trang món quà bí mật này.
      </p>

      {/* Gift URL & Copy Box */}
      {giftUrl && (
        <div className="w-full flex items-center gap-2 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left">
          <input
            type="text"
            readOnly
            value={giftUrl}
            className="flex-1 bg-transparent px-2 text-xs text-zinc-300 focus:outline-none select-all truncate"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:scale-95 transition-all"
          >
            {copied ? "Đã sao chép" : "Sao chép"}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="w-full flex flex-col gap-2.5 pt-2">
        <Link href={`/gift/${slug}`} className="w-full">
          <Button variant="primary" fullWidth>
            Xem món quà
          </Button>
        </Link>

        {qrDataUrl && (
          <Button
            variant="outline"
            fullWidth
            onClick={handleDownloadQR}
          >
            Tải ảnh QR
          </Button>
        )}

        {onReset ? (
          <Button
            variant="ghost"
            fullWidth
            className="text-xs text-zinc-400 hover:text-zinc-200"
            onClick={onReset}
          >
            Tạo món quà khác
          </Button>
        ) : (
          <Link href="/create" className="w-full">
            <Button
              variant="ghost"
              fullWidth
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Tạo món quà khác
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
