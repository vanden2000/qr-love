import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GiftWithMedia, GiftMedia, GiftMessage } from "@/types/gift";
import { getActiveStreamPhrases } from "@/lib/phrases/getStreamPhrases";

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
      .select("*")
      .eq("slug", slug.trim())
      .maybeSingle();

    if (giftError) {
      console.error("Supabase error fetching gift by slug:", giftError.message);
      return null;
    }

    if (!giftData) {
      return null;
    }

    // 24-hour auto-expiration: active gifts automatically transition to draft after 24h
    if (giftData.status === "active" && giftData.created_at) {
      const createdAtMs = new Date(giftData.created_at).getTime();
      const ageHours = (Date.now() - createdAtMs) / (1000 * 60 * 60);
      if (ageHours >= 24) {
        giftData.status = "draft";
        try {
          await supabase
            .from("gifts")
            .update({ status: "draft" })
            .eq("id", giftData.id);
        } catch (updateErr) {
          console.warn("Could not auto-update expired gift status to draft:", updateErr);
        }
      }
    }

    // Public view: ONLY render if status is active (draft & hidden return null -> 404)
    if (!options?.allowAnyStatus && giftData.status !== "active") {
      return null;
    }

    // Fetch active stream phrases for 3D experience
    const streamPhrases = await getActiveStreamPhrases(giftData.stream_phrase_category_id);

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

    // Fetch user-defined story messages from gift_messages table for Letter View
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
        storyMessages = [];
      }
    } catch {
      storyMessages = [];
    }

    // 1. Resolve Relationship & Occasion (Fallback to theme column)
    let relationshipType = (giftData.relationship_type as string) || "";
    let occasionType = (giftData.occasion_type as string) || "";
    let pronounType = (giftData.pronoun_type as string) || "";

    if (!relationshipType && giftData.theme) {
      const themeParts = giftData.theme.split(":");
      const rawRel = (themeParts[0] || "").trim().toUpperCase();
      if (["FRIENDSHIP", "FAMILY", "COLLEAGUE", "CRUSH", "COUPLE"].includes(rawRel)) {
        relationshipType = rawRel;
      }
      if (themeParts[1]?.trim()) {
        occasionType = themeParts[1].trim();
      }
      if (themeParts[2]?.trim()) {
        pronounType = themeParts[2].trim();
      }
    }

    if (!relationshipType) {
      relationshipType = "COUPLE";
    }

    // 2. Resolve Embedded Story Messages if gift_messages table was empty
    let cleanMessage = giftData.message || "";
    if ((!storyMessages || storyMessages.length === 0) && cleanMessage) {
      const match = cleanMessage.match(/<!--QR_STORY_MESSAGES_JSON:(.*?)-->/);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(match[1]) as string[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            storyMessages = parsed.map((content, idx) => ({
              gift_id: giftData.id,
              content,
              sort_order: idx,
            }));
          }
        } catch (err) {
          console.warn("Could not parse embedded story messages:", err);
        }
      }
    }
    // Clean out the hidden marker from public display message
    cleanMessage = cleanMessage.replace(/<!--QR_STORY_MESSAGES_JSON:.*?-->/g, "").trim();

    return {
      ...giftData,
      relationship_type: relationshipType,
      occasion_type: occasionType || giftData.occasion_type || "ANNIVERSARY",
      pronoun_type: pronounType || giftData.pronoun_type || "HE_TO_SHE",
      message: cleanMessage,
      media: resolvedMedia,
      story_messages: storyMessages,
      stream_phrases: streamPhrases,
    } as GiftWithMedia;
  } catch (err) {
    console.error("Unexpected error in getGiftBySlug:", err);
    throw err;
  }
}

export interface GetAdminGiftsOptions {
  status?: string;
  search?: string;
  limit?: number;
}

/**
 * Fetches all gifts with media and story messages for Admin Dashboard & Management.
 */
export async function getAllGiftsForAdmin(
  options?: GetAdminGiftsOptions
): Promise<GiftWithMedia[]> {
  try {
    const supabase = createAdminClient();

    // Auto-update active gifts created more than 24h ago to draft
    try {
      const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("gifts")
        .update({ status: "draft" })
        .eq("status", "active")
        .lt("created_at", cutoff24h);
    } catch (syncErr) {
      console.warn("Could not batch sync 24h expired active gifts:", syncErr);
    }

    let query = supabase
      .from("gifts")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.status && ["active", "draft", "hidden"].includes(options.status)) {
      query = query.eq("status", options.status);
    }

    if (options?.search && options.search.trim().length > 0) {
      const q = options.search.trim();
      query = query.or(
        `receiver_name.ilike.%${q}%,sender_name.ilike.%${q}%,title.ilike.%${q}%,slug.ilike.%${q}%`
      );
    }

    if (options?.limit && options.limit > 0) {
      query = query.limit(options.limit);
    }

    const { data: giftsData, error: giftsError } = await query;

    if (giftsError || !giftsData) {
      console.error("Error fetching gifts for admin:", giftsError?.message);
      return [];
    }

    // Fetch media and story messages for all returned gifts
    const giftIds = giftsData.map((g) => g.id);
    if (giftIds.length === 0) return [];

    const [{ data: allMedia }, { data: allMessages }] = await Promise.all([
      supabase
        .from("gift_media")
        .select("id, gift_id, type, url, storage_path, sort_order")
        .in("gift_id", giftIds)
        .order("sort_order", { ascending: true }),
      supabase
        .from("gift_messages")
        .select("id, gift_id, content, sort_order, created_at")
        .in("gift_id", giftIds)
        .order("sort_order", { ascending: true }),
    ]);

    const mediaMap = new Map<string, GiftMedia[]>();
    ((allMedia as GiftMedia[]) || []).forEach((m) => {
      const list = mediaMap.get(m.gift_id) || [];
      const bucket = m.type === "image" ? "gift-images" : "gift-audio";
      let relativePath = m.storage_path || "";
      if (relativePath.startsWith(`${bucket}/`)) {
        relativePath = relativePath.slice(bucket.length + 1);
      }
      const publicUrl = relativePath ? getPublicStorageUrl(bucket, relativePath) : (m.url || "");
      list.push({
        ...m,
        url: publicUrl || m.url,
      });
      mediaMap.set(m.gift_id, list);
    });

    const messagesMap = new Map<string, GiftMessage[]>();
    ((allMessages as GiftMessage[]) || []).forEach((msg) => {
      const list = messagesMap.get(msg.gift_id || "") || [];
      list.push(msg);
      messagesMap.set(msg.gift_id || "", list);
    });

    return giftsData.map((gift) => {
      const media = mediaMap.get(gift.id) || [];
      const userStoryMsgs = messagesMap.get(gift.id);
      let storyMessages =
        userStoryMsgs && userStoryMsgs.length > 0
          ? userStoryMsgs
          : [];

      let relationshipType = (gift.relationship_type as string) || "";
      let occasionType = (gift.occasion_type as string) || "";
      let pronounType = (gift.pronoun_type as string) || "";

      if (!relationshipType && gift.theme) {
        const themeParts = gift.theme.split(":");
        const rawRel = (themeParts[0] || "").trim().toUpperCase();
        if (["FRIENDSHIP", "FAMILY", "COLLEAGUE", "CRUSH", "COUPLE"].includes(rawRel)) {
          relationshipType = rawRel;
        }
        if (themeParts[1]?.trim()) occasionType = themeParts[1].trim();
        if (themeParts[2]?.trim()) pronounType = themeParts[2].trim();
      }

      if (!relationshipType) {
        relationshipType = "COUPLE";
      }

      let cleanMessage = gift.message || "";
      if (storyMessages.length === 0 && cleanMessage) {
        const match = cleanMessage.match(/<!--QR_STORY_MESSAGES_JSON:(.*?)-->/);
        if (match && match[1]) {
          try {
            const parsed = JSON.parse(match[1]) as string[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              storyMessages = parsed.map((content, idx) => ({
                gift_id: gift.id,
                content,
                sort_order: idx,
              }));
            }
          } catch (e) {
            // ignore
          }
        }
      }
      cleanMessage = cleanMessage.replace(/<!--QR_STORY_MESSAGES_JSON:.*?-->/g, "").trim();

      return {
        ...gift,
        relationship_type: relationshipType,
        occasion_type: occasionType || gift.occasion_type || "ANNIVERSARY",
        pronoun_type: pronounType || gift.pronoun_type || "HE_TO_SHE",
        message: cleanMessage,
        media,
        story_messages: storyMessages,
      } as GiftWithMedia;
    });
  } catch (err) {
    console.error("Unexpected error in getAllGiftsForAdmin:", err);
    return [];
  }
}
