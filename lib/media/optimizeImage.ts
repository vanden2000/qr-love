/**
 * Client-side Image Optimization Utility for QR Love (Phase 8A)
 * Resizes images (max 1920px longest side) preserving aspect ratio and converts to WebP.
 */

export const IMAGE_OPTIMIZATION_CONFIG = {
  MAX_DIMENSION: 1600,
  QUALITY: 0.8,
  OUTPUT_TYPE: "image/webp" as const,
  OUTPUT_EXT: ".webp",
  ALLOWED_INPUT_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
} as const;

export interface ImageDimensions {
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
}

/**
 * Calculates target dimensions preserving aspect ratio without upscaling small images.
 */
export function calculateTargetDimensions(
  width: number,
  height: number,
  maxDimension: number = IMAGE_OPTIMIZATION_CONFIG.MAX_DIMENSION
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: maxDimension, height: maxDimension };
  }

  // Do not upscale images smaller than max dimension
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width >= height) {
    const targetWidth = maxDimension;
    const targetHeight = Math.max(1, Math.round((height * maxDimension) / width));
    return { width: targetWidth, height: targetHeight };
  } else {
    const targetHeight = maxDimension;
    const targetWidth = Math.max(1, Math.round((width * maxDimension) / height));
    return { width: targetWidth, height: targetHeight };
  }
}

/**
 * Loads image from File into ImageBitmap or HTMLImageElement with EXIF orientation handled.
 */
async function loadImageElement(
  file: File
): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  // Use createImageBitmap if available with imageOrientation: 'from-image' (handles EXIF)
  if (typeof window !== "undefined" && "createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Fallback to HTMLImageElement if createImageBitmap fails on certain formats
    }
  }

  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => {
          URL.revokeObjectURL(objectUrl);
          img.src = "";
        },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Không thể đọc file ảnh: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Optimizes an image File: Resizes to max 1920px (preserving aspect ratio) and converts to WebP.
 */
export async function optimizeImageFile(file: File): Promise<File> {
  // Validate input type
  const isAllowed =
    (IMAGE_OPTIMIZATION_CONFIG.ALLOWED_INPUT_TYPES as readonly string[]).includes(
      file.type
    ) || /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!isAllowed) {
    throw new Error(
      `Định dạng ảnh "${file.name}" không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP.`
    );
  }

  const { source, width, height, cleanup } = await loadImageElement(file);

  try {
    const target = calculateTargetDimensions(
      width,
      height,
      IMAGE_OPTIMIZATION_CONFIG.MAX_DIMENSION
    );

    // Create Canvas for rendering
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Không thể khởi tạo Canvas 2D context.");
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, target.width, target.height);

    // Convert Canvas to WebP Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        IMAGE_OPTIMIZATION_CONFIG.OUTPUT_TYPE,
        IMAGE_OPTIMIZATION_CONFIG.QUALITY
      );
    });

    // Cleanup canvas resources
    canvas.width = 0;
    canvas.height = 0;

    if (!blob) {
      // Fallback if browser does not support WebP toBlob conversion
      return file;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const newFileName = `${baseName}${IMAGE_OPTIMIZATION_CONFIG.OUTPUT_EXT}`;

    return new File([blob], newFileName, {
      type: IMAGE_OPTIMIZATION_CONFIG.OUTPUT_TYPE,
      lastModified: Date.now(),
    });
  } finally {
    cleanup();
  }
}
