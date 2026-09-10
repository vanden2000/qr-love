"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResponse } from "@/types/gift";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * 1. Create a new Stream Phrase Category
 */
export async function createPhraseCategoryAction(
  name: string,
  description?: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin(false);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length > 100) {
      return { success: false, error: "Tên bộ câu không được để trống (tối đa 100 ký tự)." };
    }

    const slug = slugify(cleanName);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("stream_phrase_categories")
      .insert({
        name: cleanName,
        slug,
        description: description?.trim() || null,
        is_active: true,
        sort_order: 0,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/stream-phrases");
    return { success: true, data: { id: data.id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * 2. Update a Stream Phrase Category
 */
export async function updatePhraseCategoryAction(
  categoryId: string,
  name: string,
  description?: string
): Promise<ActionResponse> {
  try {
    await requireAdmin(false);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length > 100) {
      return { success: false, error: "Tên bộ câu không hợp lệ." };
    }

    const slug = slugify(cleanName);
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("stream_phrase_categories")
      .update({
        name: cleanName,
        slug,
        description: description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/stream-phrases");
    revalidatePath(`/admin/stream-phrases/${categoryId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * 3. Toggle Category Active / Inactive
 */
export async function togglePhraseCategoryAction(
  categoryId: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin(false);

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("stream_phrase_categories")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/stream-phrases");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * 4. Delete a Stream Phrase Category (cascades to its phrases)
 */
export async function deletePhraseCategoryAction(
  categoryId: string
): Promise<ActionResponse> {
  try {
    await requireAdmin(false);

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("stream_phrase_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/stream-phrases");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * 5. Add Phrase to a Category
 */
export async function createStreamPhraseAction(
  categoryId: string,
  content: string,
  sortOrder = 0
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin(false);

    const cleanContent = content.trim();
    if (!cleanContent) {
      return { success: false, error: "Nội dung câu không được để trống." };
    }
    if (cleanContent.length > 80) {
      return { success: false, error: "Câu phải ngắn dưới 80 ký tự (khuyến nghị <= 60 ký tự)." };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("stream_phrases")
      .insert({
        category_id: categoryId,
        content: cleanContent,
        sort_order: sortOrder,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/stream-phrases/${categoryId}`);
    return { success: true, data: { id: data.id } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * 6. Update a Phrase
 */
export async function updateStreamPhraseAction(
  phraseId: string,
  categoryId: string,
  content: string,
  sortOrder?: number
): Promise<ActionResponse> {
  try {
    await requireAdmin(false);

    const cleanContent = content.trim();
    if (!cleanContent || cleanContent.length > 80) {
      return { success: false, error: "Nội dung câu không hợp lệ (tối đa 80 ký tự)." };
    }

    const supabase = createAdminClient();
    const payload: { content: string; sort_order?: number; updated_at: string } = {
      content: cleanContent,
      updated_at: new Date().toISOString(),
    };
    if (sortOrder !== undefined) {
      payload.sort_order = sortOrder;
    }

    const { error } = await supabase
      .from("stream_phrases")
      .update(payload)
      .eq("id", phraseId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/stream-phrases/${categoryId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * 7. Toggle Phrase Active / Inactive
 */
export async function toggleStreamPhraseAction(
  phraseId: string,
  categoryId: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin(false);

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("stream_phrases")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", phraseId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/stream-phrases/${categoryId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * 8. Delete a Phrase
 */
export async function deleteStreamPhraseAction(
  phraseId: string,
  categoryId: string
): Promise<ActionResponse> {
  try {
    await requireAdmin(false);

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("stream_phrases")
      .delete()
      .eq("id", phraseId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/stream-phrases/${categoryId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
