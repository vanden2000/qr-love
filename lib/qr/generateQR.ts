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
}

/**
 * Generates a high-contrast, light-background QR Code Data URL with error correction level H.
 * Suitable for mobile display and high-quality image download.
 */
export async function generateQRCodeDataURL(
  url: string,
  options?: QRCodeOptions
): Promise<string> {
  if (!url) {
    throw new Error("URL is required to generate QR code.");
  }

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: options?.width ?? 480,
      margin: options?.margin ?? 2,
      color: {
        dark: options?.darkColor ?? "#09090b",
        light: options?.lightColor ?? "#ffffff",
      },
    });

    return dataUrl;
  } catch (error) {
    console.error("Failed to generate QR code Data URL:", error);
    throw new Error("Không thể tạo mã QR. Vui lòng thử lại sau.");
  }
}
