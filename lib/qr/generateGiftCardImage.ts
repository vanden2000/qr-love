import { generateQRCodeDataURL } from "@/lib/qr/generateQR";

interface GiftCardDownloadOptions {
  slug: string;
  receiverName: string;
  title: string;
  giftUrl: string;
}

/**
 * Generates and downloads a high-resolution (1080 x 1440) luxury romantic gift card image.
 */
export async function downloadLuxuryGiftCard({
  slug,
  receiverName,
  title,
  giftUrl,
}: GiftCardDownloadOptions): Promise<void> {
  const width = 1080;
  const height = 1440;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Cannot create canvas 2d context");
  }

  // 1. Deep Luxury Romantic Background Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#0B0710");
  bgGradient.addColorStop(0.35, "#1F040E");
  bgGradient.addColorStop(0.7, "#140309");
  bgGradient.addColorStop(1, "#050507");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Glowing Bokeh / Soft Halo
  const halo = ctx.createRadialGradient(
    width / 2,
    height * 0.58,
    50,
    width / 2,
    height * 0.58,
    450
  );
  halo.addColorStop(0, "rgba(225, 29, 72, 0.22)");
  halo.addColorStop(0.6, "rgba(190, 18, 60, 0.08)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  // 3. Subtle Sparkles / Golden-Rose Dust
  const seedSparkles = [
    { x: 140, y: 180, r: 2.5, a: 0.7 },
    { x: 920, y: 220, r: 3.0, a: 0.8 },
    { x: 200, y: 460, r: 2.0, a: 0.5 },
    { x: 880, y: 520, r: 2.8, a: 0.65 },
    { x: 120, y: 880, r: 3.2, a: 0.75 },
    { x: 960, y: 940, r: 2.2, a: 0.6 },
    { x: 180, y: 1240, r: 3.5, a: 0.85 },
    { x: 890, y: 1280, r: 2.6, a: 0.7 },
  ];

  seedSparkles.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(254, 205, 211, ${s.a})`;
    ctx.shadowColor = "#FB7185";
    ctx.shadowBlur = 12;
    ctx.fill();
  });
  ctx.shadowBlur = 0; // reset

  // 4. Elegant Outer Card Border with Rounded Corners
  const pad = 64;
  const radius = 48;
  ctx.beginPath();
  ctx.roundRect(pad, pad, width - pad * 2, height - pad * 2, radius);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(251, 113, 133, 0.35)";
  ctx.stroke();

  // Inner subtle border line
  ctx.beginPath();
  ctx.roundRect(pad + 16, pad + 16, width - (pad + 16) * 2, height - (pad + 16) * 2, radius - 12);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(244, 63, 94, 0.15)";
  ctx.stroke();

  // 5. Header Badge: "QR LOVE • MÓN QUÀ TÌNH YÊU"
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillStyle = "#FB7185";
  ctx.shadowColor = "rgba(244, 63, 94, 0.5)";
  ctx.shadowBlur = 10;
  ctx.fillText("✨ QR LOVE • MÓN QUÀ TÌNH YÊU ✨", width / 2, 170);
  ctx.shadowBlur = 0;

  // 6. "MÓN QUÀ DÀNH CHO" Subtitle
  ctx.font = "400 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillStyle = "#F6C7CF";
  ctx.fillText("MÓN QUÀ DÀNH CHO", width / 2, 240);

  // 7. Large Recipient Name (Playfair / Serif style)
  ctx.font = "bold 64px Georgia, 'Playfair Display', serif";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "#FFF4F6";
  ctx.shadowColor = "rgba(225, 29, 72, 0.6)";
  ctx.shadowBlur = 24;
  ctx.fillText(receiverName, width / 2, 320);
  ctx.shadowBlur = 0;

  // 8. Dedication Title
  ctx.font = "italic 30px Georgia, serif";
  ctx.letterSpacing = "1px";
  ctx.fillStyle = "#FDA4AF";
  const displayTitle = title.length > 45 ? title.slice(0, 42) + "..." : title;
  ctx.fillText(`“${displayTitle}”`, width / 2, 385);

  // 9. QR Code Hero Box
  const qrBoxSize = 560;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = 465;
  const qrBoxRadius = 36;

  // QR Box Shadow & Glow
  ctx.save();
  ctx.shadowColor = "rgba(225, 29, 72, 0.4)";
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxRadius);
  ctx.fillStyle = "#FFFDFE";
  ctx.fill();
  ctx.restore();

  // QR Box Border
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxRadius);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#FFE4E6";
  ctx.stroke();

  // Generate and Draw the Ruby QR Code
  const qrDataUrl = await generateQRCodeDataURL(giftUrl, {
    width: 480,
    margin: 1,
    darkColor: "#BE123C",
    lightColor: "#FFFDFE",
    withHeartCenter: true,
  });

  const qrImage = new Image();
  qrImage.src = qrDataUrl;
  await new Promise<void>((resolve, reject) => {
    qrImage.onload = () => resolve();
    qrImage.onerror = () => reject(new Error("Failed to load QR image on canvas"));
  });

  const qrDrawPadding = 40;
  ctx.drawImage(
    qrImage,
    qrBoxX + qrDrawPadding,
    qrBoxY + qrDrawPadding,
    qrBoxSize - qrDrawPadding * 2,
    qrBoxSize - qrDrawPadding * 2
  );

  // 10. Scan Prompt below QR
  ctx.font = "500 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "#FFF4F6";
  ctx.fillText("Quét mã bằng camera điện thoại để mở quà bí mật", width / 2, 1100);

  // 11. Romantic Footer Note
  ctx.font = "300 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillStyle = "#FB7185";
  ctx.shadowColor = "rgba(244, 63, 94, 0.4)";
  ctx.shadowBlur = 8;
  ctx.fillText("FOREVER & ALWAYS ♡", width / 2, 1160);
  ctx.shadowBlur = 0;

  // 12. Short URL watermark
  ctx.font = "400 18px monospace";
  ctx.fillStyle = "rgba(246, 199, 207, 0.6)";
  const shortUrl = giftUrl.replace(/^https?:\/\//, "");
  ctx.fillText(shortUrl, width / 2, 1260);

  // 13. Trigger Client Download
  const link = document.createElement("a");
  link.download = `qr-love-${slug}-gift-card.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
