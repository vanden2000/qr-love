import QRCode from "qrcode";

/**
 * Returns the full gift URL for a given slug.
 * Throws an explicit error if NEXT_PUBLIC_APP_URL is not configured and origin cannot be determined.
 */
export function getGiftUrl(slug: string): string {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!baseUrl && typeof window !== "undefined" && window.location?.origin) {
    baseUrl = window.location.origin;
  }

  if (!baseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_APP_URL environment variable. Please configure it in your environment."
    );
  }

  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/+$/, "");
  return `${baseUrl}/gift/${slug.trim()}`;
}

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  withHeartCenter?: boolean;
}

/**
 * Draws a stylized heart on a 2D canvas context
 */
function drawHeartEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Background circular soft glow/white badge for clear contrast
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.72, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = size * 0.08;
  ctx.strokeStyle = "#FFE4E6";
  ctx.stroke();

  // Draw Heart
  const s = size * 0.46;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(0, -s * 0.1, -s * 0.8, -s * 0.75, -s * 0.8, -s * 0.05);
  ctx.bezierCurveTo(-s * 0.8, s * 0.45, 0, s * 0.85, 0, s * 1.05);
  ctx.bezierCurveTo(0, s * 0.85, s * 0.8, s * 0.45, s * 0.8, -s * 0.05);
  ctx.bezierCurveTo(s * 0.8, -s * 0.75, 0, -s * 0.1, 0, s * 0.35);

  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/**
 * Generates a high-contrast, ruby-rose Love QR Code Data URL with Level H error correction.
 */
export async function generateQRCodeDataURL(
  url: string,
  options?: QRCodeOptions
): Promise<string> {
  if (!url) {
    throw new Error("URL is required to generate QR code.");
  }

  const width = options?.width ?? 600;
  const margin = options?.margin ?? 2;
  const darkColor = options?.darkColor ?? "#BE123C"; // Ruby Crimson
  const lightColor = options?.lightColor ?? "#FFFFFF"; // Pure White

  try {
    if (typeof window !== "undefined" && options?.withHeartCenter !== false) {
      // Client-side: Draw on Canvas to add center Heart Emblem
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = width;

      await QRCode.toCanvas(canvas, url, {
        errorCorrectionLevel: "H",
        width,
        margin,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Size of emblem ~ 16% of QR width (well within Level H 30% redundancy)
        const emblemSize = width * 0.16;
        drawHeartEmblem(ctx, width / 2, width / 2, emblemSize, darkColor);
      }

      return canvas.toDataURL("image/png");
    }

    // Fallback direct DataURL
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });

    return dataUrl;
  } catch (error) {
    console.error("Failed to generate QR code Data URL:", error);
    throw new Error("Không thể tạo mã QR. Vui lòng thử lại sau.");
  }
}
