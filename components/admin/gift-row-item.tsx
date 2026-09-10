"use client";

import React, { useState, useTransition, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GiftWithMedia, GiftStatus } from "@/types/gift";
import { updateGiftStatusAction, updateGiftAction, deleteGiftAction } from "@/app/actions/admin-gifts";
import { generateQRCodeDataURL, getGiftUrl } from "@/lib/qr/generateQR";
import { downloadLuxuryGiftCard } from "@/lib/qr/generateGiftCardImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AudioStartEditor } from "@/components/admin/audio-start-editor";

interface GiftRowItemProps {
  gift: GiftWithMedia;
  onDeleted?: (giftId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (giftId: string) => void;
  onRequestDelete?: (gift: GiftWithMedia) => void;
}

export function GiftRowItem({
  gift,
  onDeleted,
  isSelected = false,
  onToggleSelect,
  onRequestDelete,
}: GiftRowItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<GiftStatus>(gift.status || "draft");
  const [isStatusPending, startStatusTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);

  const [activeTab, setActiveTab] = useState<"edit" | "qr" | "media">("edit");
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    senderName: gift.sender_name || "",
    receiverName: gift.receiver_name || "",
    title: gift.title || "",
    message: gift.message || "",
    startDate: gift.start_date || "",
    status: gift.status || "draft",
    relationshipType: gift.relationship_type || "COUPLE",
    occasionType: gift.occasion_type || "ANNIVERSARY",
    pronounType: gift.pronoun_type || "HE_TO_SHE",
    streamPhraseCategoryId: gift.stream_phrase_category_id || "a1111111-1111-1111-1111-111111111111",
  });

  const [storyMessages, setStoryMessages] = useState<string[]>(
    gift.story_messages && gift.story_messages.length > 0
      ? gift.story_messages.map((m) => m.content)
      : [gift.message.slice(0, 100)]
  );

  const [existingImages, setExistingImages] = useState(
    (gift.media || []).filter((m) => m.type === "image")
  );
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<{ file: File; preview: string }[]>([]);

  const existingAudio = (gift.media || []).find((m) => m.type === "audio");
  const [newAudio, setNewAudio] = useState<{ file: File; preview: string } | null>(null);
  const [audioStartSeconds, setAudioStartSeconds] = useState<number>(
    gift.audio_start_seconds || 0
  );

  const newAudioRef = useRef(newAudio);
  const newImagesRef = useRef(newImageFiles);

  React.useEffect(() => {
    newAudioRef.current = newAudio;
  }, [newAudio]);

  React.useEffect(() => {
    newImagesRef.current = newImageFiles;
  }, [newImageFiles]);

  React.useEffect(() => {
    return () => {
      newImagesRef.current.forEach((img: { file: File; preview: string }) => {
        URL.revokeObjectURL(img.preview);
      });
      if (newAudioRef.current) {
        URL.revokeObjectURL(newAudioRef.current.preview);
      }
    };
  }, []);

  const handleSelectNewAudio = (file: File) => {
    if (newAudio) {
      URL.revokeObjectURL(newAudio.preview);
    }
    setNewAudio({
      file,
      preview: URL.createObjectURL(file),
    });
    setAudioStartSeconds(0);
  };

  const handleRemoveNewAudio = () => {
    if (newAudio) {
      URL.revokeObjectURL(newAudio.preview);
    }
    setNewAudio(null);
    if (existingAudio && !deletedMediaIds.includes(existingAudio.id)) {
      setAudioStartSeconds(gift.audio_start_seconds || 0);
    } else {
      setAudioStartSeconds(0);
    }
  };

  // QR Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const giftUrl = useMemo(() => {
    try {
      return getGiftUrl(gift.slug);
    } catch {
      return "";
    }
  }, [gift.slug]);

  // Load QR on expanded
  const handleToggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && !qrDataUrl && giftUrl) {
      generateQRCodeDataURL(giftUrl, {
        width: 480,
        margin: 1,
        darkColor: "#BE123C",
        lightColor: "#FFFDFE",
        withHeartCenter: true,
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  };

  // Quick Status Switcher
  const handleStatusChange = (newStatus: GiftStatus) => {
    setStatus(newStatus);
    setFormData((prev) => ({ ...prev, status: newStatus }));

    startStatusTransition(async () => {
      const res = await updateGiftStatusAction(gift.id, newStatus);
      if (!res.success) {
        setStatus(gift.status); // revert on error
        setFeedback({ type: "error", text: res.error || "Không thể đổi trạng thái." });
      } else {
        setFeedback({ type: "success", text: `Đã đổi trạng thái sang "${newStatus}".` });
        setTimeout(() => setFeedback(null), 2500);
      }
    });
  };

  const handleCopyLink = async () => {
    if (!giftUrl) return;
    try {
      await navigator.clipboard.writeText(giftUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadQR = async () => {
    if (!giftUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadLuxuryGiftCard({
        slug: gift.slug,
        receiverName: formData.receiverName || gift.receiver_name,
        title: formData.title || gift.title,
        giftUrl,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Edit Story Messages
  const handleAddStoryMessage = () => {
    if (storyMessages.length >= 25) return;
    setStoryMessages((prev) => [...prev, ""]);
  };

  const handleRemoveStoryMessage = (idx: number) => {
    setStoryMessages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStoryMessageChange = (idx: number, val: string) => {
    setStoryMessages((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  // Image Management
  const handleRemoveExistingImage = (mediaId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== mediaId));
    setDeletedMediaIds((prev) => [...prev, mediaId]);
  };

  const handleSelectNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const totalCurrent = existingImages.length + newImageFiles.length;
    const slots = 10 - totalCurrent;
    const added = files.slice(0, Math.max(0, slots)).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImageFiles((prev) => [...prev, ...added]);
    e.target.value = "";
  };

  const handleRemoveNewImage = (idx: number) => {
    setNewImageFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Submit Save Changes
  const handleSaveGift = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payload = new FormData();
    payload.append("giftId", gift.id);
    payload.append("senderName", formData.senderName.trim());
    payload.append("receiverName", formData.receiverName.trim());
    payload.append("title", formData.title.trim());
    payload.append("message", formData.message.trim());
    if (formData.startDate) payload.append("startDate", formData.startDate);
    payload.append("status", formData.status);
    payload.append("relationshipType", formData.relationshipType);
    payload.append("occasionType", formData.occasionType);
    payload.append("pronounType", formData.pronounType);
    if (formData.streamPhraseCategoryId) {
      payload.append("streamPhraseCategoryId", formData.streamPhraseCategoryId);
    }

    storyMessages
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .forEach((msg) => payload.append("storyMessages", msg));

    if (newAudio) {
      payload.append("newAudio", newAudio.file);
    }
    payload.append("audioStartSeconds", audioStartSeconds.toFixed(2));

    startSaveTransition(async () => {
      const res = await updateGiftAction(payload);
      if (!res.success) {
        setFeedback({ type: "error", text: res.error || "Không thể cập nhật món quà." });
      } else {
        setFeedback({ type: "success", text: "Đã lưu cập nhật thành công!" });
        setNewImageFiles([]);
        setDeletedMediaIds([]);
        if (newAudio) {
          URL.revokeObjectURL(newAudio.preview);
          setNewAudio(null);
        }
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  // Submit Delete
  const handleDelete = () => {
    startDeleteTransition(async () => {
      const res = await deleteGiftAction(gift.id);
      if (!res.success) {
        setFeedback({ type: "error", text: res.error || "Không thể xóa món quà." });
        setShowDeleteConfirm(false);
      } else {
        onDeleted?.(gift.id);
      }
    });
  };

  return (
    <div
      className={`border-b border-zinc-800/60 transition-all last:border-b-0 ${
        isSelected ? "bg-rose-950/20" : "hover:bg-zinc-900/30"
      }`}
    >
      {/* 1. Main Row / Card Content */}
      <div className="p-3.5 sm:p-4 space-y-2.5">
        {/* Top Header: Checkbox + Avatar + Receiver/Sender + Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {onToggleSelect && (
              <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(gift.id)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-rose-600 focus:ring-rose-500/30 focus:ring-offset-0 cursor-pointer accent-rose-600 shrink-0"
                  title="Chọn món quà"
                />
              </div>
            )}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/30 flex items-center justify-center text-xs font-bold text-rose-300 shrink-0 uppercase">
              {gift.receiver_name ? gift.receiver_name.charAt(0) : "❤️"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-bold text-zinc-100 text-sm tracking-tight truncate">
                  {gift.receiver_name}
                </span>
                <span className="text-zinc-400 text-xs truncate">
                  • từ <span className="text-zinc-300 font-medium">{gift.sender_name || "—"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Status Dropdown Badge */}
          <div className="shrink-0">
            <select
              value={status}
              disabled={isStatusPending}
              onChange={(e) => handleStatusChange(e.target.value as GiftStatus)}
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-all ${
                status === "active"
                  ? "bg-emerald-950/90 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900/90"
                  : status === "draft"
                  ? "bg-amber-950/90 text-amber-300 border-amber-600/60 hover:bg-amber-900/90"
                  : "bg-rose-950/90 text-rose-300 border-rose-600/60 hover:bg-rose-900/90"
              }`}
            >
              <option value="active" className="bg-zinc-900 text-emerald-300">
                🟢 ACTIVE
              </option>
              <option value="draft" className="bg-zinc-900 text-amber-300">
                🟡 DRAFT
              </option>
              <option value="hidden" className="bg-zinc-900 text-rose-300">
                🔴 HIDDEN
              </option>
            </select>
          </div>
        </div>

        {/* Middle Info: Title & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs pl-0 sm:pl-9">
          <p className="text-zinc-300 line-clamp-1 font-medium text-xs">
            {gift.title || "Không có tiêu đề"}
          </p>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
              /{gift.slug}
            </span>
            {gift.media && gift.media.filter((m) => m.type === "image").length > 0 && (
              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                📷 {gift.media.filter((m) => m.type === "image").length} ảnh
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center gap-2 pt-1.5 border-t border-zinc-800/40">
          <button
            type="button"
            onClick={handleToggleExpand}
            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isExpanded
                ? "bg-rose-950/70 border-rose-800 text-rose-200 shadow-sm"
                : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200"
            }`}
          >
            <span>{isExpanded ? "▲ Thu gọn bảng sửa" : "▼ Xem & Sửa"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onRequestDelete) {
                onRequestDelete(gift);
              } else {
                setShowDeleteConfirm(true);
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-rose-950/80 border border-zinc-800 hover:border-rose-800 text-zinc-400 hover:text-rose-300 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Xóa nhanh món quà này"
          >
            <span>🗑️</span>
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* 2. Expanded Detail & Quick Edit Panel */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-zinc-950/90 border-t border-zinc-800/80 animate-in fade-in duration-300 space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "edit"
                  ? "bg-rose-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              ✏️ Sửa nội dung & Lời nhắn
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "media"
                  ? "bg-rose-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              📷 Quản lý Ảnh & Nhạc
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "qr"
                  ? "bg-rose-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              ✨ Mã QR & Chia sẻ
            </button>
          </div>

          {/* Feedback message banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs text-center border font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                  : "bg-rose-950/60 text-rose-300 border-rose-800/60"
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* TAB 1: EDIT CONTENT & STORY MESSAGES */}
          {activeTab === "edit" && (
            <form onSubmit={handleSaveGift} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Tên người nhận"
                  value={formData.receiverName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, receiverName: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Tên người gửi"
                  value={formData.senderName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, senderName: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Tiêu đề món quà"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Ngày kỷ niệm"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>

              {/* 3D Stream Phrases Category Selector */}
              <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <label className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <span>💬 Bộ câu hiển thị trong không gian 3D</span>
                </label>
                <select
                  value={formData.streamPhraseCategoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      streamPhraseCategoryId: e.target.value,
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="a1111111-1111-1111-1111-111111111111">
                    ❤️ Yêu thương (Anh yêu em, Thương em nhiều lắm, Có em là đủ...)
                  </option>
                  <option value="a2222222-2222-2222-2222-222222222222">
                    💪 Cổ vũ (Cố lên nhé, Em làm được mà, Đừng bỏ cuộc nha...)
                  </option>
                  <option value="a3333333-3333-3333-3333-333333333333">
                    🌟 Động viên (Anh luôn ở đây, Mọi chuyện rồi sẽ ổn, Bình yên rồi sẽ đến...)
                  </option>
                  <option value="a4444444-4444-4444-4444-444444444444">
                    🍃 Chữa lành (Không sao đâu, Chậm lại một chút nhé, Hãy thương lấy mình...)
                  </option>
                </select>
                <p className="text-[11px] text-zinc-400">
                  Các câu ngắn thuộc bộ này sẽ xuất hiện ngẫu nhiên trong không gian 3D. Lời nhắn riêng chỉ hiển thị trong phần &ldquo;Đọc thư&rdquo;.
                </p>
              </div>

              <Textarea
                label="Bức thư trọn vẹn (Dành cho trang Đọc Thư)"
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                required
              />

              {/* Story Messages Section (3D Waterfall Phrases) */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium uppercase tracking-wider text-cyan-300/90">
                    💬 Quản lý lời muốn nói ({storyMessages.length}/25)
                  </label>
                  <span className="text-[11px] text-zinc-400">• Chữ chạy trong không gian 3D</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Các câu ngắn này sẽ trôi từ trên xuống trong không gian 3D cùng ảnh kỷ niệm và trái tim phát sáng.
                </p>

                <div className="space-y-2">
                  {storyMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800"
                    >
                      <span className="w-5 text-center text-xs font-serif text-cyan-400">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={msg}
                        maxLength={80}
                        placeholder={`Câu ngắn ${idx + 1}...`}
                        onChange={(e) => handleStoryMessageChange(idx, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-zinc-100 focus:outline-none"
                      />
                      {storyMessages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStoryMessage(idx)}
                          className="text-zinc-500 hover:text-rose-400 text-xs px-1.5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {storyMessages.length < 25 && (
                    <button
                      type="button"
                      onClick={handleAddStoryMessage}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-zinc-800 hover:border-cyan-500/50 text-xs text-cyan-300/80 hover:text-cyan-200 transition-colors"
                    >
                      + Thêm câu chạy 3D ({storyMessages.length}/25)
                    </button>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-3 flex items-center justify-between">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSavePending}
                >
                  {isSavePending ? "Đang lưu thay đổi..." : "Lưu cập nhật nội dung"}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-rose-500 hover:text-rose-400 underline underline-offset-2"
                >
                  🗑️ Xóa món quà này
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MEDIA MANAGEMENT (PHOTOS & AUDIO) */}
          {activeTab === "media" && (
            <form onSubmit={handleSaveGift} className="space-y-5">
              {/* Existing & New Images */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-300">
                    Ảnh kỷ niệm ({existingImages.length + newImageFiles.length}/5)
                  </label>
                  <span className="text-[11px] text-zinc-500">Tối đa 5 ảnh</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {/* Existing Images */}
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group"
                    >
                      <Image
                        src={img.url}
                        alt="Ảnh kỷ niệm"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-950/90 text-rose-200 flex items-center justify-center text-xs hover:bg-rose-600 transition-colors"
                        title="Gỡ ảnh này"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* New Selected Images */}
                  {newImageFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-rose-500/50 group"
                    >
                      <Image
                        src={item.preview}
                        alt="Ảnh mới"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors"
                        title="Hủy ảnh mới"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Upload button */}
                  {existingImages.length + newImageFiles.length < 5 && (
                    <label className="aspect-square rounded-xl border border-dashed border-zinc-700 hover:border-rose-500/60 bg-zinc-900/40 hover:bg-zinc-900/80 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer">
                      <span className="text-base">📷</span>
                      <span className="text-[10px]">+ Thêm ảnh</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleSelectNewImages}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Audio Management */}
              <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-300">
                    Nhạc nền MP3
                  </label>
                  {(newAudio || (existingAudio && !deletedMediaIds.includes(existingAudio.id))) && (
                    <label className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-medium">
                      + Thay file khác
                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp3,.mp3"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleSelectNewAudio(e.target.files[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>

                {newAudio ? (
                  <AudioStartEditor
                    audioSrc={newAudio.preview}
                    audioName={`${newAudio.file.name} (File mới)`}
                    value={audioStartSeconds}
                    onChange={setAudioStartSeconds}
                    onRemoveAudio={handleRemoveNewAudio}
                    disabled={isSavePending}
                  />
                ) : existingAudio && !deletedMediaIds.includes(existingAudio.id) ? (
                  <AudioStartEditor
                    audioSrc={existingAudio.url}
                    audioName="Nhạc nền hiện tại"
                    value={audioStartSeconds}
                    onChange={setAudioStartSeconds}
                    onRemoveAudio={() => {
                      setDeletedMediaIds((prev) => [...prev, existingAudio.id]);
                      setAudioStartSeconds(0);
                    }}
                    disabled={isSavePending}
                  />
                ) : (
                  <label className="w-full py-3.5 px-4 rounded-xl border border-dashed border-zinc-700 hover:border-rose-500/60 bg-zinc-900/40 flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-rose-400 cursor-pointer">
                    <span>🎵</span>
                    <span>Tải lên file nhạc MP3</span>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3,.mp3"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleSelectNewAudio(e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <Button type="submit" variant="primary" disabled={isSavePending}>
                  {isSavePending ? "Đang lưu thay đổi..." : "Lưu cập nhật Media"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: QR CODE & SHARING */}
          {activeTab === "qr" && (
            <div className="flex flex-col sm:flex-row items-center gap-6 p-2">
              {/* QR Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#FFFDFE] to-[#FFF5F7] border border-rose-200/90 shadow-lg flex flex-col items-center justify-center shrink-0">
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt="Mã QR"
                    width={180}
                    height={180}
                    className="w-40 h-40 object-contain rounded-lg"
                    unoptimized
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-zinc-400 animate-pulse">
                    Đang tạo QR...
                  </div>
                )}
                <span className="text-[10px] font-semibold tracking-wider text-rose-700 mt-2">
                  QR LOVE • CODE
                </span>
              </div>

              {/* Link Details & Actions */}
              <div className="flex-1 space-y-3 w-full text-left">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Đường dẫn món quà
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <input
                      type="text"
                      readOnly
                      value={giftUrl}
                      className="flex-1 bg-transparent text-xs text-zinc-200 focus:outline-none truncate font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors shrink-0 cursor-pointer"
                    >
                      {copied ? "✓ Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <Link
                    href={`/gift/${gift.slug}`}
                    target="_blank"
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    ↗ Mở xem trực tiếp
                  </Link>

                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    disabled={isDownloading}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-colors cursor-pointer"
                  >
                    {isDownloading ? "Đang xuất thiệp..." : "📷 Tải thiệp ảnh QR (1080p)"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 space-y-3">
              <p className="text-xs text-rose-200 leading-relaxed font-medium">
                ⚠️ Bạn có chắc chắn muốn xóa món quà dành cho &ldquo;{gift.receiver_name}&rdquo;? Toàn bộ dữ liệu, lời nhắn và các file ảnh/nhạc trên Storage sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeletePending}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                >
                  {isDeletePending ? "Đang xóa..." : "Xác nhận xóa vĩnh viễn"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletePending}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
