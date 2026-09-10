import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StreamPhraseCategory, StreamPhrase } from "@/types/phrase";

export const DEFAULT_FALLBACK_PHRASES = [
  "Anh yêu em",
  "Thương em nhiều lắm",
  "Có em là đủ",
  "Mãi bên nhau nhé",
  "Luôn nhớ đến em",
  "Ở bên anh nhé",
  "Anh luôn thương em",
  "Em thật đặc biệt",
];

/**
 * Loads active stream phrases for a specific category (or default fallback).
 */
export async function getActiveStreamPhrases(
  categoryId?: string | null
): Promise<string[]> {
  try {
    const supabase = createAdminClient();

    let targetCategoryId = categoryId;

    // If no categoryId provided, lookup the default 'yeu-thuong' category
    if (!targetCategoryId) {
      const { data: defaultCat } = await supabase
        .from("stream_phrase_categories")
        .select("id")
        .eq("slug", "yeu-thuong")
        .eq("is_active", true)
        .maybeSingle();

      if (defaultCat?.id) {
        targetCategoryId = defaultCat.id;
      }
    }

    if (targetCategoryId) {
      const { data: phrases, error } = await supabase
        .from("stream_phrases")
        .select("content")
        .eq("category_id", targetCategoryId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && phrases && phrases.length > 0) {
        return phrases.map((p) => p.content.trim()).filter(Boolean);
      }
    }

    // Fallback if DB query fails or table empty
    return DEFAULT_FALLBACK_PHRASES;
  } catch (err) {
    console.warn("Failed to load active stream phrases, using default fallback:", err);
    return DEFAULT_FALLBACK_PHRASES;
  }
}

/**
 * Fetches all phrase categories for Admin management or selector dropdowns.
 */
export async function getAllPhraseCategories(): Promise<StreamPhraseCategory[]> {
  try {
    const supabase = createAdminClient();
    const { data: categories, error } = await supabase
      .from("stream_phrase_categories")
      .select("id, name, slug, description, is_active, sort_order, created_at, updated_at")
      .order("sort_order", { ascending: true });

    if (error || !categories) {
      return [];
    }

    // Count active phrases per category
    const { data: counts } = await supabase
      .from("stream_phrases")
      .select("category_id");

    const countMap = new Map<string, number>();
    (counts || []).forEach((item) => {
      countMap.set(item.category_id, (countMap.get(item.category_id) || 0) + 1);
    });

    return categories.map((cat) => ({
      ...cat,
      phrases_count: countMap.get(cat.id) || 0,
    }));
  } catch (err) {
    console.error("Error in getAllPhraseCategories:", err);
    return [];
  }
}

/**
 * Fetches single category with its full list of phrases for Admin editing.
 */
export async function getCategoryWithPhrases(
  categoryId: string
): Promise<{ category: StreamPhraseCategory | null; phrases: StreamPhrase[] }> {
  try {
    const supabase = createAdminClient();

    const [{ data: category, error: catError }, { data: phrases, error: phraseError }] =
      await Promise.all([
        supabase
          .from("stream_phrase_categories")
          .select("*")
          .eq("id", categoryId)
          .maybeSingle(),
        supabase
          .from("stream_phrases")
          .select("*")
          .eq("category_id", categoryId)
          .order("sort_order", { ascending: true }),
      ]);

    if (catError || !category) {
      if (catError) console.error("Error fetching category:", catError);
      return { category: null, phrases: [] };
    }
    if (phraseError) {
      console.error("Error fetching phrases for category:", phraseError);
    }

    return {
      category: category as StreamPhraseCategory,
      phrases: (phrases as StreamPhrase[]) || [],
    };
  } catch (err) {
    console.error("Error in getCategoryWithPhrases:", err);
    return { category: null, phrases: [] };
  }
}
