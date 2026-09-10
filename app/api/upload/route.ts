import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s for file upload

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin authentication
    const { user, profile, isAdmin } = await getCurrentUser();
    if (!user || !profile || !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu quyền quản trị viên." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "image"; // "image" | "audio"
    const customFolder = (formData.get("folder") as string)?.trim() || "";

    if (!file || typeof file !== "object" || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy file để tải lên." },
        { status: 400 }
      );
    }

    const bucket = type === "audio" ? "gift-audio" : "gift-images";
    const folder = customFolder || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`);
    const extension =
      type === "audio"
        ? (file.name.split(".").pop() || "mp3").toLowerCase()
        : file.type === "image/webp"
        ? "webp"
        : (file.name.split(".").pop() || "jpg").toLowerCase();

    const fileId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
    const relativePath = `${folder}/${fileId}.${extension}`;
    const fullStoragePath = `${bucket}/${relativePath}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(relativePath, buffer, {
        contentType: file.type || (type === "audio" ? "audio/mpeg" : "image/webp"),
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error in /api/upload:", uploadError.message);
      return NextResponse.json(
        { success: false, error: `Lỗi tải lên máy chủ: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(relativePath);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrlData.publicUrl,
        storage_path: fullStoragePath,
        type,
        fileName: file.name,
      },
    });
  } catch (err) {
    console.error("Unexpected error in /api/upload:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải lên.",
      },
      { status: 500 }
    );
  }
}
