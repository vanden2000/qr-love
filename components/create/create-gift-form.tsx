"use client";

import React, { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createGiftAction } from "@/app/actions/gift";
import {
  optimizeImageFile,
  IMAGE_OPTIMIZATION_CONFIG,
} from "@/lib/media/optimizeImage";
import { AudioStartEditor } from "@/components/admin/audio-start-editor";
import {
  RelationshipType,
  OccasionType,
  PronounType,
  RELATIONSHIP_OPTIONS,
  OCCASION_OPTIONS,
  PRONOUN_OPTIONS,
  getPresetSuggestion,
} from "@/lib/presets/occasions";

interface SelectedImage {
  file: File;
  previewUrl: string;
}

const MAX_IMAGES = 5;
const MAX_STORY_MESSAGES = 25;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // Allow up to 10MB input before client compression
const MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function CreateGiftForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOptimizingImages, setIsOptimizingImages] = useState(false);

  // Relationship & Occasion & Pronouns States
  const [relationship, setRelationship] = useState<RelationshipType>("COUPLE");
  const [occasion, setOccasion] = useState<OccasionType>("ANNIVERSARY");
  const [pronoun, setPronoun] = useState<PronounType>("HE_TO_SHE");

  const currentPreset = getPresetSuggestion(relationship, occasion, pronoun);

  const [formData, setFormData] = useState({
    senderName: "",
    receiverName: "",
    startDate: "",
    title: currentPreset.defaultTitle,
    message: currentPreset.sampleMessage,
    streamPhraseCategoryId: "a1111111-1111-1111-1111-111111111111",
  });

  const [storyMessages, setStoryMessages] = useState<string[]>([
    ...currentPreset.storyMessages.slice(0, 15),
  ]);

  const [images, setImages] = useState<SelectedImage[]>([]);
  const [audio, setAudio] = useState<{ file: File; previewUrl: string } | null>(null);
  const [audioStartSeconds, setAudioStartSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on component unmount to prevent memory leaks
  const imagesRef = useRef(images);
  const audioRef = useRef(audio);

  React.useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  React.useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  React.useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        URL.revokeObjectURL(img.previewUrl);
      });
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.previewUrl);
      }
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  // Quick Apply Smart Suggestions
  const handleApplyPreset = (rel = relationship, occ = occasion, pro = pronoun) => {
    const p = getPresetSuggestion(rel, occ, pro);
    setFormData((prev) => ({
      ...prev,
      title: p.defaultTitle,
      message: p.sampleMessage,
    }));
    setStoryMessages([...p.storyMessages.slice(0, 15)]);
    if (error) setError(null);
  };

  const handleRelationshipChange = (newRel: RelationshipType) => {
    setRelationship(newRel);
    handleApplyPreset(newRel, occasion, pronoun);
  };

  const handleOccasionChange = (newOcc: OccasionType) => {
    setOccasion(newOcc);
    handleApplyPreset(relationship, newOcc, pronoun);
  };

  const handlePronounChange = (newPro: PronounType) => {
    setPronoun(newPro);
    handleApplyPreset(relationship, occasion, newPro);
  };

  // Story Messages Handlers
  const handleStoryMessageChange = (index: number, value: string) => {
    setStoryMessages((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (error) setError(null);
  };

  const handleAddStoryMessage = () => {
    if (storyMessages.length >= MAX_STORY_MESSAGES) return;
    const pool = currentPreset.storyMessages;
    const nextSuggestion = pool[storyMessages.length % pool.length] || "Yêu thương đong đầy";
    setStoryMessages((prev) => [...prev, nextSuggestion]);
  };

  const handleApplyAllSuggestions = () => {
    setStoryMessages([...currentPreset.storyMessages.slice(0, 18)]);
  };

  const handleRemoveStoryMessage = (index: number) => {
    if (storyMessages.length <= 1) return;
    setStoryMessages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveStoryMessage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= storyMessages.length) return;

    setStoryMessages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError(null);

    const files = Array.from(e.target.files);
    const availableSlots = MAX_IMAGES - images.length;

    if (files.length > availableSlots) {
      setError(`Chỉ có thể thêm tối đa ${MAX_IMAGES} hình ảnh.`);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    setIsOptimizingImages(true);
    const validNewImages: SelectedImage[] = [];
    const optimizationErrors: string[] = [];

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        optimizationErrors.push(`Ảnh "${file.name}" vượt quá 10MB.`);
        continue;
      }

      const isAllowed =
        (IMAGE_OPTIMIZATION_CONFIG.ALLOWED_INPUT_TYPES as readonly string[]).includes(
          file.type
        ) || /\.(jpe?g|png|webp)$/i.test(file.name);

      if (!isAllowed) {
        optimizationErrors.push(
          `Ảnh "${file.name}" định dạng không hợp lệ (chỉ nhận JPG, PNG, WEBP).`
        );
        continue;
      }

      try {
        const optimizedFile = await optimizeImageFile(file);
        const previewUrl = URL.createObjectURL(optimizedFile);
        validNewImages.push({
          file: optimizedFile,
          previewUrl,
        });
      } catch (err) {
        console.error("Lỗi tối ưu ảnh:", err);
        const previewUrl = URL.createObjectURL(file);
        validNewImages.push({
          file,
          previewUrl,
        });
      }
    }

    setIsOptimizingImages(false);

    if (optimizationErrors.length > 0) {
      setError(optimizationErrors.join(" "));
    }

    if (validNewImages.length > 0) {
      setImages((prev) => [...prev, ...validNewImages]);
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError(null);

    const file = e.target.files[0];

    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      setError("File âm thanh không được vượt quá 15MB.");
      if (audioInputRef.current) audioInputRef.current.value = "";
      return;
    }

    const isAllowedAudio =
      file.type === "audio/mpeg" ||
      file.type === "audio/mp3" ||
      file.type === "audio/wav" ||
      file.type === "audio/x-wav" ||
      file.type === "audio/m4a" ||
      file.type === "audio/x-m4a" ||
      file.type === "audio/aac" ||
      file.type === "audio/ogg" ||
      /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);

    if (!isAllowedAudio) {
      setError("Định dạng âm thanh không hợp lệ. Vui lòng chọn file MP3, M4A, WAV, AAC hoặc OGG.");
      if (audioInputRef.current) audioInputRef.current.value = "";
      return;
    }

    if (audio) {
      URL.revokeObjectURL(audio.previewUrl);
    }

    setAudio({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setAudioStartSeconds(0);

    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const handleRemoveAudio = () => {
    if (audio) {
      URL.revokeObjectURL(audio.previewUrl);
    }
    setAudio(null);
    setAudioStartSeconds(0);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Client-side length checks
    if (formData.senderName.trim().length > 100) {
      setError("Tên người gửi không được vượt quá 100 ký tự.");
      return;
    }
    if (formData.receiverName.trim().length > 100) {
      setError("Tên người nhận không được vượt quá 100 ký tự.");
      return;
    }
    if (formData.title.trim().length > 200) {
      setError("Tiêu đề không được vượt quá 200 ký tự.");
      return;
    }
    if (formData.message.trim().length > 3000) {
      setError("Lời nhắn không được vượt quá 3000 ký tự.");
      return;
    }

    const cleanedStoryMessages = storyMessages
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < cleanedStoryMessages.length; i++) {
      if (cleanedStoryMessages[i].length > 160) {
        setError(`Lời nhắn số ${i + 1} vượt quá 160 ký tự.`);
        return;
      }
    }

    startTransition(async () => {
      try {
        const dataPayload = new FormData();
        dataPayload.append("senderName", formData.senderName.trim());
        dataPayload.append("receiverName", formData.receiverName.trim());
        dataPayload.append("title", formData.title.trim());
        dataPayload.append("message", formData.message.trim());
        dataPayload.append("relationshipType", relationship);
        dataPayload.append("occasionType", occasion);
        dataPayload.append("pronounType", pronoun);

        if (formData.startDate) {
          dataPayload.append("startDate", formData.startDate);
        }
        if (formData.streamPhraseCategoryId) {
          dataPayload.append("streamPhraseCategoryId", formData.streamPhraseCategoryId);
        }

        // Append story messages
        for (const msg of cleanedStoryMessages) {
          dataPayload.append("storyMessages", msg);
        }

        // Append images
        for (const img of images) {
          dataPayload.append("images", img.file);
        }

        // Append audio and start offset
        if (audio) {
          dataPayload.append("audio", audio.file);
          dataPayload.append("audioStartSeconds", audioStartSeconds.toFixed(2));
        }

        const response = await createGiftAction(dataPayload);

        if (!response.success || !response.data) {
          setError(response.error || "Không thể tạo món quà. Vui lòng thử lại.");
          return;
        }

        // Clean up object URLs
        for (const img of images) {
          URL.revokeObjectURL(img.previewUrl);
        }
        if (audio) {
          URL.revokeObjectURL(audio.previewUrl);
        }

        // Redirect to /create/success/[slug]
        router.push(`/create/success/${response.data.slug}`);
      } catch (err) {
        console.error("Form submit error:", err);
        const errMsg = err instanceof Error ? err.message : "";
        if (
          errMsg.includes("was not found on the server") ||
          errMsg.includes("Failed to find Server Action")
        ) {
          setError(
            "Hệ thống vừa được cập nhật phiên bản mới. Vui lòng tải lại trang (F5) để tiếp tục."
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Đã xảy ra lỗi khi tạo món quà. Vui lòng thử lại sau."
          );
        }
      }
    });
  };

  const selectedPronounOption =
    PRONOUN_OPTIONS.find((p) => p.value === pronoun) || PRONOUN_OPTIONS[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: SMART PRESET SELECTOR (Relationship + Occasion + Pronouns) */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-zinc-900/80 to-cyan-950/30 border border-rose-500/20 shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                Chủ đề & Gợi ý thông minh
              </h2>
              <p className="text-[11px] text-zinc-400">
                Tự động tối ưu tiêu đề, nhãn ngày và bộ câu 3D theo đúng đối tượng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleApplyPreset()}
            disabled={isPending}
            className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[11px] text-rose-200 hover:text-white font-medium transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span>
            <span>Áp dụng toàn bộ gợi ý</span>
          </button>
        </div>

        {/* 1.1 Relationship Choice */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-300">
            1. Mối quan hệ với người nhận:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {RELATIONSHIP_OPTIONS.map((opt) => {
              const active = relationship === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleRelationshipChange(opt.value)}
                  disabled={isPending}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                    active
                      ? "bg-rose-600/25 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.25)] font-semibold"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.2 Occasion Choice & Pronouns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-300">
              2. Dịp kỷ niệm / Sự kiện:
            </label>
            <select
              value={occasion}
              onChange={(e) => handleOccasionChange(e.target.value as OccasionType)}
              disabled={isPending}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
            >
              {OCCASION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-300">
              3. Ngôi xưng / Giới tính:
            </label>
            <select
              value={pronoun}
              onChange={(e) => handlePronounChange(e.target.value as PronounType)}
              disabled={isPending}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
            >
              {PRONOUN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: BASIC INFO (Recipient & Sender & Date & Title) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`Tên người nhận (${selectedPronounOption.receiverPlaceholder})`}
            id="receiverName"
            name="receiverName"
            placeholder={`Ví dụ: ${selectedPronounOption.receiverPlaceholder}`}
            maxLength={100}
            value={formData.receiverName}
            onChange={handleChange}
            required
            disabled={isPending}
          />

          <Input
            label={`Tên người gửi (${selectedPronounOption.senderPlaceholder})`}
            id="senderName"
            name="senderName"
            placeholder={`Ví dụ: ${selectedPronounOption.senderPlaceholder}`}
            maxLength={100}
            value={formData.senderName}
            onChange={handleChange}
            required
            disabled={isPending}
          />
        </div>

        <Input
          label={`${currentPreset.dateLabel} (Tùy chọn)`}
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          disabled={isPending}
        />

        <Input
          label="Tiêu đề món quà"
          id="title"
          name="title"
          placeholder="Nhập tiêu đề món quà..."
          maxLength={200}
          value={formData.title}
          onChange={handleChange}
          required
          disabled={isPending}
        />

        {/* Section: Bộ câu hiển thị 3D */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <span>💬 Bộ danh mục câu nền 3D bổ trợ</span>
          </label>
          <select
            name="streamPhraseCategoryId"
            value={formData.streamPhraseCategoryId}
            onChange={handleChange}
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
          >
            <option value="a1111111-1111-1111-1111-111111111111">
              ❤️ Yêu thương (Anh yêu em, Thương em nhiều lắm, Có em là đủ...)
            </option>
            <option value="a2222222-2222-2222-2222-222222222222">
              💪 Cổ vũ & Đồng hành (Cố lên nhé, Vững vàng bước tiếp, Bạn thân tri kỷ...)
            </option>
            <option value="a3333333-3333-3333-3333-333333333333">
              🌟 Động viên & Biết ơn (Luôn ở đây bên bạn, Tự hào về bạn, Gia đình bình an...)
            </option>
            <option value="a4444444-4444-4444-4444-444444444444">
              🍃 Chữa lành & Bình an (Không sao đâu, Chậm lại một chút nhé, Hãy thương lấy mình...)
            </option>
          </select>
          <p className="text-[11px] text-zinc-400">
            Các câu ngắn này sẽ hiển thị xen kẽ cùng với các câu bạn nhập ở mục &ldquo;Lời muốn nói&rdquo; bên dưới.
          </p>
        </div>

        {/* Section: Lời muốn nói (3D Waterfall Phrases) */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center flex-wrap gap-1">
            <label className="text-xs font-medium uppercase tracking-wider text-cyan-300/90 flex items-center gap-1.5">
              <span>💬 Quản lý lời muốn nói ({storyMessages.length}/{MAX_STORY_MESSAGES})</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyAllSuggestions}
                disabled={isPending}
                className="px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-400 text-[11px] text-cyan-300 hover:text-cyan-200 font-medium transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                title="Tự động điền danh sách câu mẫu theo chủ đề đã chọn"
              >
                <span>✨</span>
                <span>Điền nhanh theo chủ đề ({relationship})</span>
              </button>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">• Chữ chạy trong không gian 3D</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Các câu ngắn này sẽ cùng hình ảnh và trái tim phát sáng trôi từ trên xuống trong không gian 3D.
          </p>

          <div className="space-y-2.5">
            {storyMessages.map((msg, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/70 border border-zinc-800"
              >
                <span className="w-5 text-center text-xs font-serif text-cyan-400/80 select-none">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={msg}
                  maxLength={80}
                  placeholder={`Câu ngắn ${idx + 1}...`}
                  onChange={(e) => handleStoryMessageChange(idx, e.target.value)}
                  disabled={isPending}
                  className="flex-1 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />

                <div className="flex items-center gap-1">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveStoryMessage(idx, "up")}
                      disabled={isPending}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs cursor-pointer"
                      title="Chuyển lên"
                    >
                      ▲
                    </button>
                  )}
                  {idx < storyMessages.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveStoryMessage(idx, "down")}
                      disabled={isPending}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs cursor-pointer"
                      title="Chuyển xuống"
                    >
                      ▼
                    </button>
                  )}
                  {storyMessages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStoryMessage(idx)}
                      disabled={isPending}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 text-xs cursor-pointer"
                      title="Xóa câu này"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              {storyMessages.length < MAX_STORY_MESSAGES && (
                <button
                  type="button"
                  onClick={handleAddStoryMessage}
                  disabled={isPending}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-zinc-800 hover:border-cyan-500/50 bg-zinc-900/30 hover:bg-zinc-900/60 text-xs text-cyan-300/80 hover:text-cyan-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>+</span>
                  <span>Thêm câu chạy 3D ({storyMessages.length}/{MAX_STORY_MESSAGES})</span>
                </button>
              )}
              {storyMessages.length < MAX_STORY_MESSAGES && (
                <button
                  type="button"
                  onClick={handleApplyAllSuggestions}
                  disabled={isPending}
                  className="py-2.5 px-3 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-950/30 hover:bg-cyan-950/60 text-xs text-cyan-300 hover:text-cyan-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                >
                  <span>✨</span>
                  <span>Điền đủ 15 câu mẫu</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <Textarea
          label="Bức thư trọn vẹn (Dành cho trang Đọc Thư)"
          id="message"
          name="message"
          placeholder="Viết những lời chân thành nhất gửi đến người ấy..."
          rows={5}
          maxLength={3000}
          value={formData.message}
          onChange={handleChange}
          required
          disabled={isPending}
        />

        {/* Media Upload: Images */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <span>Hình ảnh kỷ niệm ({images.length}/{MAX_IMAGES})</span>
              {isOptimizingImages && (
                <span className="text-[11px] font-normal text-rose-400 animate-pulse lowercase">
                  (Đang tối ưu ảnh...)
                </span>
              )}
            </label>
            <span className="text-[11px] text-zinc-400">Tối đa 5 ảnh</span>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
            disabled={isPending || isOptimizingImages || images.length >= MAX_IMAGES}
          />

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isPending || isOptimizingImages}
              className="w-full p-4 rounded-2xl border border-dashed border-zinc-800 hover:border-rose-500/50 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                📷
              </div>
              <span className="text-xs font-medium text-zinc-300">
                Thêm hình ảnh kỷ niệm
              </span>
              <span className="text-[11px] text-zinc-400">
                Chấp nhận JPG, PNG, WEBP (tối đa 10MB/ảnh, tự động nén tối ưu)
              </span>
            </button>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative group aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800"
                >
                  <Image
                    src={img.previewUrl}
                    alt={`Ảnh ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, "up")}
                        disabled={isPending}
                        className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 text-xs"
                        title="Chuyển sang trái"
                      >
                        ◀
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isPending}
                      className="p-1.5 rounded-full bg-rose-600/80 text-white hover:bg-rose-600 text-xs"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, "down")}
                        disabled={isPending}
                        className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 text-xs"
                        title="Chuyển sang phải"
                      >
                        ▶
                      </button>
                    )}
                  </div>
                  <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-zinc-300">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Upload: Audio */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Nhạc nền trải nghiệm (Tùy chọn)
            </label>
            <span className="text-[11px] text-zinc-400">Tối đa 15MB</span>
          </div>

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleAudioSelect}
            disabled={isPending}
          />

          {!audio ? (
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={isPending}
              className="w-full p-4 rounded-2xl border border-dashed border-zinc-800 hover:border-rose-500/50 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                🎵
              </div>
              <span className="text-xs font-medium text-zinc-300">
                Chọn file nhạc nền
              </span>
              <span className="text-[11px] text-zinc-400">
                Chấp nhận MP3, M4A, WAV, AAC, OGG
              </span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-rose-400 text-lg flex-shrink-0">🎵</span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      {audio.file.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {(audio.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    disabled={isPending}
                    className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Đổi file
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAudio}
                    disabled={isPending}
                    className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title="Xóa file nhạc"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Audio Seek / Music Start Position Editor */}
              <div className="pt-2 border-t border-zinc-800/80">
                <AudioStartEditor
                  audioSrc={audio.previewUrl}
                  audioName={audio.file.name}
                  value={audioStartSeconds}
                  onChange={(newSeconds) => setAudioStartSeconds(newSeconds)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all cursor-pointer text-sm"
        disabled={isPending || isOptimizingImages}
      >
        {isPending ? "Đang khởi tạo món quà..." : "✨ Tạo Món Quà Yêu Thương"}
      </Button>
    </form>
  );
}
