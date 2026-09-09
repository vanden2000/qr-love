import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GiftWithMedia, GiftMedia, GiftMessage } from "@/types/gift";

/**
 * Normalizes and resolves the full public storage URL for a media item.
 * Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
 */
function getPublicStorageUrl(bucket: string, relativePath: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(
    /\/+$/,
    ""
  );
  const cleanPath = relativePath.replace(/^\/+/, "");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Derives clean, human-readable story messages from a full letter text
 */
function deriveStoryMessagesFromText(rawText: string): GiftMessage[] {
  if (!rawText) return [];

  const sentences = rawText
    .split(/[.\n;!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3);

  if (sentences.length === 0) {
    return [{ content: rawText.slice(0, 140), sort_order: 0 }];
  }

  // Cap between 1 and 8 messages, max 140 chars each
  return sentences.slice(0, 8).map((sentence, idx) => ({
    content: sentence.length > 150 ? sentence.slice(0, 147) + "..." : sentence,
    sort_order: idx,
  }));
}

/**
 * Fetches a single gift and its associated media by its unique slug using the server-side admin client.
 * Returns null if the gift does not exist.
 */
export async function getGiftBySlug(
  slug: string,
  options?: { allowAnyStatus?: boolean }
): Promise<GiftWithMedia | null> {
  if (!slug || typeof slug !== "string") {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data: giftData, error: giftError } = await supabase
      .from("gifts")
      .select("id, slug, sender_name, receiver_name, title, message, start_date, status, created_at")
      .eq("slug", slug.trim())
      .maybeSingle();

    if (giftError) {
      console.error("Supabase error fetching gift by slug:", giftError.message);
      return null;
    }

    if (!giftData) {
      return null;
    }

    // Public view: ONLY render if status is active (draft & hidden return null -> 404)
    if (!options?.allowAnyStatus && giftData.status !== "active") {
      return null;
    }

    // Fetch associated media
    const { data: mediaData, error: mediaError } = await supabase
      .from("gift_media")
      .select("id, gift_id, type, url, storage_path, sort_order")
      .eq("gift_id", giftData.id)
      .order("sort_order", { ascending: true });

    if (mediaError) {
      console.error("Supabase error fetching gift_media:", mediaError.message);
    }

    // Resolve media URLs with public URL format and signed URL fallback if private
    const resolvedMedia = await Promise.all(
      ((mediaData as GiftMedia[]) || []).map(async (item) => {
        const bucket = item.type === "image" ? "gift-images" : "gift-audio";
        let relativePath = item.storage_path || "";
        if (relativePath.startsWith(`${bucket}/`)) {
          relativePath = relativePath.slice(bucket.length + 1);
        }

        const publicUrl = getPublicStorageUrl(bucket, relativePath);

        // Try creating signed URL (valid for 30 days) to handle both private and public buckets
        let finalUrl = publicUrl;
        try {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from(bucket)
              .createSignedUrl(relativePath, 60 * 60 * 24 * 30);

          if (!signedError && signedData?.signedUrl) {
            finalUrl = signedData.signedUrl;
          }
        } catch {
          finalUrl = item.url || publicUrl;
        }

        return {
          ...item,
          url: finalUrl,
        };
      })
    );

    // Fetch user-defined story messages from gift_messages table if exists
    let storyMessages: GiftMessage[] = [];
    try {
      const { data: msgData, error: msgError } = await supabase
        .from("gift_messages")
        .select("id, gift_id, content, sort_order, created_at")
        .eq("gift_id", giftData.id)
        .order("sort_order", { ascending: true });

      if (!msgError && msgData && msgData.length > 0) {
        storyMessages = msgData as GiftMessage[];
      } else {
        storyMessages = deriveStoryMessagesFromText(giftData.message);
      }
    } catch {
      storyMessages = deriveStoryMessagesFromText(giftData.message);
    }

    return {
      ...giftData,
      media: resolvedMedia,
      story_messages: storyMessages,
    } as GiftWithMedia;
  } catch (err) {
    console.error("Unexpected error in getGiftBySlug:", err);
    throw err;
  }
}
