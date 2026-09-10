"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { optimizeImageFile } from "@/lib/media/optimizeImage";
import type { ActionResponse, GiftStatus } from "@/types/gift";

const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_IMAGES_COUNT = 5;

/**
 * Quick status switcher action for Admin
 */
export async function updateGiftStatusAction(
  giftId: string,
  status: GiftStatus
): Promise<ActionResponse<{ status: GiftStatus }>> {
  try {
    await requireAdmin(false);

    if (!["active", "draft", "hidden"].includes(status)) {
      return { success: false, error: "Trạng thái không hợp lệ." };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("gifts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", giftId);

    if (error) {
      console.error("Error updating gift status:", error.message);
      return { success: false, error: "Không thể cập nhật trạng thái." };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/gifts");

    return { success: true, data: { status } };
  } catch (err) {
    console.error("updateGiftStatusAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật trạng thái.",
    };
  }
}

/**
 * Full update gift action for Admin (content, story messages, photos, audio, status)
 */
export async function updateGiftAction(
  formData: FormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin(false);

    const giftId = (formData.get("giftId") as string)?.trim();
    if (!giftId) {
      return { success: false, error: "Thiếu ID món quà." };
    }

    const senderName = (formData.get("senderName") as string)?.trim() || "";
    const receiverName = (formData.get("receiverName") as string)?.trim() || "";
    const title = (formData.get("title") as string)?.trim() || "";
    const message = (formData.get("message") as string)?.trim() || "";
    const startDate = (formData.get("startDate") as string)?.trim() || null;
    const status = ((formData.get("status") as string) || "draft").toLowerCase() as GiftStatus;

    if (!senderName || senderName.length > 100) {
      return { success: false, error: "Tên người gửi không được vượt quá 100 ký tự." };
    }
    if (!receiverName || receiverName.length > 100) {
      return { success: false, error: "Tên người nhận không được vượt quá 100 ký tự." };
    }
    if (!title || title.length > 200) {
      return { success: false, error: "Tiêu đề không được vượt quá 200 ký tự." };
    }
    if (!message || message.length > 3000) {
      return { success: false, error: "Lời nhắn không được vượt quá 3000 ký tự." };
    }

    const streamPhraseCategoryId = (formData.get("streamPhraseCategoryId") as string)?.trim() || null;

    const audioStartSecondsRaw = formData.get("audioStartSeconds");
    let audioStartSeconds: number | undefined = undefined;
    if (audioStartSecondsRaw !== null) {
      const num = Number(audioStartSecondsRaw);
      audioStartSeconds = isFinite(num) && num >= 0 ? num : 0;
    }

    const supabase = createAdminClient();

    // 1. Update basic gift fields
    const updateGiftPayload: Record<string, unknown> = {
      sender_name: senderName,
      receiver_name: receiverName,
      title,
      message,
      start_date: startDate || null,
      status: ["active", "draft", "hidden"].includes(status) ? status : "draft",
      stream_phrase_category_id: streamPhraseCategoryId,
      updated_at: new Date().toISOString(),
    };

    if (audioStartSeconds !== undefined) {
      updateGiftPayload.audio_start_seconds = audioStartSeconds;
    }

    const { error: giftUpdateError } = await supabase
      .from("gifts")
      .update(updateGiftPayload)
      .eq("id", giftId);

    if (giftUpdateError) {
      console.error("Error updating gift:", giftUpdateError.message);
      return { success: false, error: "Không thể cập nhật thông tin món quà." };
    }

    // 2. Update Story Messages in gift_messages table
    const storyMessagesRaw = formData.getAll("storyMessages") as string[];
    const storyMessages = storyMessagesRaw.map((s) => s.trim()).filter((s) => s.length > 0);

    // Delete existing messages and re-insert
    await supabase.from("gift_messages").delete().eq("gift_id", giftId);

    if (storyMessages.length > 0) {
      const messagesToInsert = storyMessages.slice(0, 10).map((content, idx) => ({
        gift_id: giftId,
        content: content.slice(0, 160),
        sort_order: idx,
      }));
      await supabase.from("gift_messages").insert(messagesToInsert);
    }

    // 3. Handle Deleted Images
    const deletedMediaIds = formData.getAll("deletedMediaIds") as string[];
    if (deletedMediaIds.length > 0) {
      const { data: mediaToDelete } = await supabase
        .from("gift_media")
        .select("id, type, storage_path")
        .in("id", deletedMediaIds)
        .eq("gift_id", giftId);

      if (mediaToDelete && mediaToDelete.length > 0) {
        for (const item of mediaToDelete) {
          const bucket = item.type === "image" ? "gift-images" : "gift-audio";
          let path = item.storage_path;
          if (path.startsWith(`${bucket}/`)) {
            path = path.slice(bucket.length + 1);
          }
          await supabase.storage.from(bucket).remove([path]);
        }

        await supabase.from("gift_media").delete().in("id", deletedMediaIds);
      }
    }

    // 4. Handle New Images Upload
    const newImageFiles = formData.getAll("newImages") as File[];
    const validNewImages = newImageFiles.filter(
      (f) => f && typeof f === "object" && f.size > 0 && f.name
    );

    if (validNewImages.length > 0) {
      // Check current images count
      const { count: currentImgCount } = await supabase
        .from("gift_media")
        .select("*", { count: "exact", head: true })
        .eq("gift_id", giftId)
        .eq("type", "image");

      const availableSlots = MAX_IMAGES_COUNT - (currentImgCount ?? 0);
      const imagesToUpload = validNewImages.slice(0, availableSlots);

      for (let i = 0; i < imagesToUpload.length; i++) {
        const file = imagesToUpload[i];
        let fileToUpload: File | Blob = file;

        // Try client or server optimization if possible
        try {
          if (typeof window !== "undefined") {
            fileToUpload = await optimizeImageFile(file);
          }
        } catch {
          fileToUpload = file;
        }

        const fileExt = file.name.split(".").pop() || "webp";
        const storagePath = `${giftId}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("gift-images")
          .upload(storagePath, fileToUpload, {
            contentType: file.type || "image/webp",
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("gift-images")
            .getPublicUrl(storagePath);

          await supabase.from("gift_media").insert({
            gift_id: giftId,
            type: "image",
            url: publicUrlData.publicUrl,
            storage_path: `gift-images/${storagePath}`,
            sort_order: (currentImgCount ?? 0) + i,
          });
        }
      }
    }

    // 5. Handle Audio Replacement
    const newAudio = formData.get("newAudio") as File | null;
    if (newAudio && typeof newAudio === "object" && newAudio.size > 0 && newAudio.name) {
      if (newAudio.size <= MAX_AUDIO_SIZE) {
        // Remove existing audio
        const { data: existingAudio } = await supabase
          .from("gift_media")
          .select("id, storage_path")
          .eq("gift_id", giftId)
          .eq("type", "audio");

        if (existingAudio && existingAudio.length > 0) {
          for (const item of existingAudio) {
            let path = item.storage_path;
            if (path.startsWith("gift-audio/")) {
              path = path.slice("gift-audio/".length);
            }
            await supabase.storage.from("gift-audio").remove([path]);
          }
          await supabase.from("gift_media").delete().eq("gift_id", giftId).eq("type", "audio");
        }

        // Upload new audio
        const storagePath = `${giftId}/${Date.now()}-bgm.mp3`;
        const { error: audioUploadError } = await supabase.storage
          .from("gift-audio")
          .upload(storagePath, newAudio, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        if (!audioUploadError) {
          const { data: audioUrlData } = supabase.storage
            .from("gift-audio")
            .getPublicUrl(storagePath);

          await supabase.from("gift_media").insert({
            gift_id: giftId,
            type: "audio",
            url: audioUrlData.publicUrl,
            storage_path: `gift-audio/${storagePath}`,
            sort_order: 0,
          });
        }
      }
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/gifts");

    return { success: true, data: { id: giftId } };
  } catch (err) {
    console.error("updateGiftAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật món quà.",
    };
  }
}

/**
 * Deletes a gift and cleans up ALL associated storage files
 */
export async function deleteGiftAction(
  giftId: string
): Promise<ActionResponse<boolean>> {
  try {
    await requireAdmin(false);

    if (!giftId) {
      return { success: false, error: "Thiếu ID món quà." };
    }

    const supabase = createAdminClient();

    // 1. Fetch all media for this gift to delete from Storage
    const { data: mediaItems } = await supabase
      .from("gift_media")
      .select("id, type, storage_path")
      .eq("gift_id", giftId);

    if (mediaItems && mediaItems.length > 0) {
      for (const item of mediaItems) {
        const bucket = item.type === "image" ? "gift-images" : "gift-audio";
        let path = item.storage_path;
        if (path.startsWith(`${bucket}/`)) {
          path = path.slice(bucket.length + 1);
        }
        await supabase.storage.from(bucket).remove([path]);
      }
    }

    // 2. Also try removing the entire gift folder from buckets
    try {
      const { data: imageFiles } = await supabase.storage
        .from("gift-images")
        .list(giftId);
      if (imageFiles && imageFiles.length > 0) {
        const paths = imageFiles.map((f) => `${giftId}/${f.name}`);
        await supabase.storage.from("gift-images").remove(paths);
      }

      const { data: audioFiles } = await supabase.storage
        .from("gift-audio")
        .list(giftId);
      if (audioFiles && audioFiles.length > 0) {
        const paths = audioFiles.map((f) => `${giftId}/${f.name}`);
        await supabase.storage.from("gift-audio").remove(paths);
      }
    } catch (cleanupErr) {
      console.warn("Storage folder cleanup warning:", cleanupErr);
    }

    // 3. Delete database records (gift_messages and gift_media cascade on delete)
    const { error: deleteError } = await supabase
      .from("gifts")
      .delete()
      .eq("id", giftId);

    if (deleteError) {
      console.error("Error deleting gift record:", deleteError.message);
      return { success: false, error: "Không thể xóa món quà trong cơ sở dữ liệu." };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/gifts");

    return { success: true, data: true };
  } catch (err) {
    console.error("deleteGiftAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa món quà.",
    };
  }
}
