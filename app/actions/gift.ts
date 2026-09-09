"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlug } from "@/lib/gifts/generateSlug";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ActionResponse, GiftStatus } from "@/types/gift";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_IMAGES_COUNT = 5;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function createGiftAction(
  formData: FormData
): Promise<ActionResponse<{ slug: string }>> {
  // Track created resources for rollback on partial failure
  let createdGiftId: string | null = null;
  let createdSlug: string | null = null;
  const uploadedStorageFiles: Array<{ bucket: string; path: string }> = [];

  try {
    // 0. Enforce Server-side Admin Authorization
    await requireAdmin(false);

    // 1. Rate Limiting: Max 20 gifts / 1 hour per IP for admin
    const clientIp = await getClientIp();
    const rateLimitResult = await checkRateLimit(`create_gift:${clientIp}`, 20, 3600);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error:
          "Bạn đã tạo quá số lượng quà tặng cho phép (tối đa 5 quà trong 1 giờ). Vui lòng thử lại sau.",
      };
    }

    // 2. Strict Input Extraction & Validation
    const senderName = (formData.get("senderName") as string)?.trim() || "";
    const receiverName = (formData.get("receiverName") as string)?.trim() || "";
    const title = (formData.get("title") as string)?.trim() || "";
    const message = (formData.get("message") as string)?.trim() || "";
    const startDate = (formData.get("startDate") as string)?.trim() || null;

    // Extract story messages
    const storyMessagesRaw = formData.getAll("storyMessages") as string[];
    const storyMessages = storyMessagesRaw
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!senderName || senderName.length > 100) {
      return {
        success: false,
        error: "Tên người gửi là bắt buộc và không được vượt quá 100 ký tự.",
      };
    }

    if (!receiverName || receiverName.length > 100) {
      return {
        success: false,
        error: "Tên người nhận là bắt buộc và không được vượt quá 100 ký tự.",
      };
    }

    if (!title || title.length > 200) {
      return {
        success: false,
        error: "Tiêu đề là bắt buộc và không được vượt quá 200 ký tự.",
      };
    }

    if (!message || message.length > 3000) {
      return {
        success: false,
        error: "Lời nhắn yêu thương là bắt buộc và không được vượt quá 3000 ký tự.",
      };
    }

    // Validate story messages count and lengths if provided
    if (storyMessages.length > 10) {
      return {
        success: false,
        error: "Chỉ được tạo tối đa 10 lời nhắn trong không gian.",
      };
    }

    for (let i = 0; i < storyMessages.length; i++) {
      if (storyMessages[i].length > 160) {
        return {
          success: false,
          error: `Lời nhắn số ${i + 1} vượt quá 160 ký tự.`,
        };
      }
    }

    if (startDate && (isNaN(Date.parse(startDate)) || !/^\d{4}-\d{2}-\d{2}/.test(startDate))) {
      return { success: false, error: "Ngày kỷ niệm không hợp lệ." };
    }

    // Collect and validate image files
    const imageFiles = (formData.getAll("images") as File[]).filter(
      (file) => file && typeof file === "object" && file.size > 0 && file.name
    );

    if (imageFiles.length > MAX_IMAGES_COUNT) {
      return {
        success: false,
        error: `Chỉ được tải lên tối đa ${MAX_IMAGES_COUNT} hình ảnh.`,
      };
    }

    for (const image of imageFiles) {
      if (image.size > MAX_IMAGE_SIZE) {
        return {
          success: false,
          error: `Hình ảnh vượt quá dung lượng tối đa 5MB.`,
        };
      }
      const isAllowedType =
        ALLOWED_IMAGE_TYPES.includes(image.type) ||
        /\.(jpe?g|png|webp)$/i.test(image.name);
      if (!isAllowedType) {
        return {
          success: false,
          error: `Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP.`,
        };
      }
    }

    // Collect and validate audio file
    const audioFile = formData.get("audio") as File | null;
    const hasAudio =
      audioFile &&
      typeof audioFile === "object" &&
      audioFile.size > 0 &&
      audioFile.name;

    if (hasAudio && audioFile) {
      if (audioFile.size > MAX_AUDIO_SIZE) {
        return {
          success: false,
          error: `File nhạc vượt quá dung lượng tối đa 15MB.`,
        };
      }
      const isMp3 =
        audioFile.type === "audio/mpeg" ||
        audioFile.type === "audio/mp3" ||
        /\.mp3$/i.test(audioFile.name);
      if (!isMp3) {
        return {
          success: false,
          error: `Định dạng nhạc không hợp lệ. Chỉ chấp nhận file MP3.`,
        };
      }
    }

    const supabase = createAdminClient();

    // 3. Insert Gift record with unique slug
    let slug = generateSlug(8);
    let attempts = 0;
    const maxAttempts = 3;

    const statusInput = ((formData.get("status") as string) || "draft").toLowerCase();
    const giftStatus: GiftStatus = ["active", "draft", "hidden"].includes(statusInput)
      ? (statusInput as GiftStatus)
      : "draft";

    while (attempts < maxAttempts) {
      const { data, error } = await supabase
        .from("gifts")
        .insert({
          slug,
          sender_name: senderName,
          receiver_name: receiverName,
          title,
          message,
          start_date: startDate || null,
          status: giftStatus,
        })
        .select("id, slug")
        .single();

      if (!error && data) {
        createdGiftId = data.id;
        createdSlug = data.slug;
        break;
      }

      if (error && error.code === "23505") {
        slug = generateSlug(10);
        attempts++;
        continue;
      }

      console.error("Supabase gift insert error:", error?.message || error);
      return {
        success: false,
        error: "Không thể khởi tạo món quà. Vui lòng thử lại sau.",
      };
    }

    if (!createdGiftId || !createdSlug) {
      return {
        success: false,
        error: "Không thể tạo mã định danh duy nhất cho món quà. Vui lòng thử lại.",
      };
    }

    // 4. Insert story messages to gift_messages table if provided
    if (storyMessages.length > 0) {
      const messagesToInsert = storyMessages.map((content, idx) => ({
        gift_id: createdGiftId,
        content,
        sort_order: idx,
      }));

      try {
        await supabase.from("gift_messages").insert(messagesToInsert);
      } catch (msgErr) {
        console.warn("Could not insert to gift_messages table, fallback to main message:", msgErr);
      }
    }

    // 5. Upload media files and record to gift_media table
    const mediaInserts: Array<{
      gift_id: string;
      type: "image" | "audio";
      url: string;
      storage_path: string;
      sort_order: number;
    }> = [];

    // Upload images to 'gift-images' bucket
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const extension = file.type === "image/webp" ? "webp" : "jpg";
      const fileId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${i}`;
      const relativePath = `${createdGiftId}/${fileId}.${extension}`;
      const fullStoragePath = `gift-images/${relativePath}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("gift-images")
        .upload(relativePath, buffer, {
          contentType: file.type || "image/webp",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Error uploading image to storage:`, uploadError.message);
        throw new Error("Lỗi tải lên hình ảnh lên hệ thống lưu trữ.");
      }

      uploadedStorageFiles.push({ bucket: "gift-images", path: relativePath });

      const { data: publicUrlData } = supabase.storage
        .from("gift-images")
        .getPublicUrl(relativePath);

      mediaInserts.push({
        gift_id: createdGiftId,
        type: "image",
        url: publicUrlData.publicUrl,
        storage_path: fullStoragePath,
        sort_order: i,
      });
    }

    // Upload audio to 'gift-audio' bucket
    if (hasAudio && audioFile) {
      const audioId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_audio`;
      const relativePath = `${createdGiftId}/${audioId}.mp3`;
      const fullStoragePath = `gift-audio/${relativePath}`;

      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("gift-audio")
        .upload(relativePath, buffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Error uploading audio to storage:`, uploadError.message);
        throw new Error("Lỗi tải file nhạc lên hệ thống lưu trữ.");
      }

      uploadedStorageFiles.push({ bucket: "gift-audio", path: relativePath });

      const { data: publicUrlData } = supabase.storage
        .from("gift-audio")
        .getPublicUrl(relativePath);

      mediaInserts.push({
        gift_id: createdGiftId,
        type: "audio",
        url: publicUrlData.publicUrl,
        storage_path: fullStoragePath,
        sort_order: 0,
      });
    }

    // Insert all media metadata records into gift_media
    if (mediaInserts.length > 0) {
      const { error: mediaInsertError } = await supabase
        .from("gift_media")
        .insert(mediaInserts);

      if (mediaInsertError) {
        console.error("Error saving gift_media records:", mediaInsertError.message);
        throw new Error("Lỗi liên kết dữ liệu media cho món quà.");
      }
    }

    return {
      success: true,
      data: { slug: createdSlug },
    };
  } catch (err) {
    console.error("Error in createGiftAction, executing rollback cleanup:", err);

    // Rollback: Clean up partially uploaded files and orphan DB records
    try {
      const supabase = createAdminClient();
      for (const item of uploadedStorageFiles) {
        await supabase.storage.from(item.bucket).remove([item.path]);
      }
      if (createdGiftId) {
        await supabase.from("gift_media").delete().eq("gift_id", createdGiftId);
        try {
          await supabase.from("gift_messages").delete().eq("gift_id", createdGiftId);
        } catch {}
        await supabase.from("gifts").delete().eq("id", createdGiftId);
      }
    } catch (cleanupErr) {
      console.error("Failed during rollback cleanup:", cleanupErr);
    }

    return {
      success: false,
      error:
        err instanceof Error && !err.message.includes("Supabase")
          ? err.message
          : "Đã xảy ra lỗi khi tạo món quà. Vui lòng thử lại sau.",
    };
  }
}
