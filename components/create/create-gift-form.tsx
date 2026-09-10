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

interface SelectedImage {
  file: File;
  previewUrl: string;
}

const MAX_IMAGES = 5;
const MAX_STORY_MESSAGES = 25;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // Allow up to 10MB input before client compression
const MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const SUGGESTED_STORY_MESSAGES = [
  "Em yêu anh",
  "vững vàng",
  "thành công",
  "Chúc anh luôn vui vẻ",
  "Mãi bên nhau nhé",
  "Anh luôn ở đây",
  "Tự hào về em",
  "Bình yên bên nhau",
  "Cố lên nhé",
  "Hạnh phúc mãi mãi",
  "Yêu thương đong đầy",
  "Nắm chặt tay nhau",
  "Cảm ơn vì có em",
  "Luôn tin vào em",
  "Đừng lo lắng nhé",
  "Ở bên anh thật lâu",
  "Nụ cười của em",
  "Thế giới của anh",
  "Dành trọn yêu thương",
  "Thương em nhiều lắm",
  "Cùng nhau già đi",
  "Hôm nay thật vui nhé",
  "Mỗi ngày đều yêu em",
  "Hạnh phúc giản đơn",
  "Mãi là của nhau",
];

export function CreateGiftForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOptimizingImages, setIsOptimizingImages] = useState(false);

  const [formData, setFormData] = useState({
    senderName: "",
    receiverName: "",
    startDate: "",
    title: "",
    message: "",
    streamPhraseCategoryId: "a1111111-1111-1111-1111-111111111111",
  });

  const [storyMessages, setStoryMessages] = useState<string[]>([
    "Em yêu anh",
    "vững vàng",
    "thành công",
    "Chúc anh luôn vui vẻ",
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
    const nextSuggestion =
      SUGGESTED_STORY_MESSAGES[storyMessages.length % SUGGESTED_STORY_MESSAGES.length] || "";
    setStoryMessages((prev) => [...prev, nextSuggestion]);
  };

  const handleApplyAllSuggestions = () => {
    setStoryMessages([...SUGGESTED_STORY_MESSAGES.slice(0, 15)]);
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
          `Ảnh "${file.name}" không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP.`
        );
        continue;
      }

      try {
        const optimizedFile = await optimizeImageFile(file);
        validNewImages.push({
          file: optimizedFile,
          previewUrl: URL.createObjectURL(optimizedFile),
        });
      } catch (err) {
        console.warn(`Lỗi tối ưu ảnh ${file.name}:`, err);
        optimizationErrors.push(
          `Không thể tối ưu ảnh "${file.name}". Vui lòng thử ảnh khác.`
        );
      }
    }

    if (optimizationErrors.length > 0) {
      setError(optimizationErrors.join(" "));
    }

    if (validNewImages.length > 0) {
      setImages((prev) => [...prev, ...validNewImages]);
    }

    setIsOptimizingImages(false);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      const target = prev[indexToRemove];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError(null);

    const file = e.target.files[0];

    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      setError(`File nhạc "${file.name}" vượt quá 15MB.`);
      return;
    }

    const isMp3 =
      file.type === "audio/mpeg" ||
      file.type === "audio/mp3" ||
      /\.mp3$/i.test(file.name);

    if (!isMp3) {
      setError(`File nhạc "${file.name}" không hợp lệ. Chỉ chấp nhận định dạng MP3.`);
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

      {/* Recipient & Sender & Date & Title */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tên người nhận (ví dụ: Ánh Dương)"
            id="receiverName"
            name="receiverName"
            placeholder="Nhập tên người nhận..."
            maxLength={100}
            value={formData.receiverName}
            onChange={handleChange}
            required
            disabled={isPending}
          />

          <Input
            label="Tên người gửi (ví dụ: Thế Điểm)"
            id="senderName"
            name="senderName"
            placeholder="Nhập tên người gửi..."
            maxLength={100}
            value={formData.senderName}
            onChange={handleChange}
            required
            disabled={isPending}
          />
        </div>

        <Input
          label="Ngày kỷ niệm (Tùy chọn)"
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          disabled={isPending}
        />

        <Input
          label="Tiêu đề"
          id="title"
          name="title"
          placeholder="Ví dụ: Gửi người con gái anh yêu"
          maxLength={200}
          value={formData.title}
          onChange={handleChange}
          required
          disabled={isPending}
        />

        {/* Section: Bộ câu hiển thị 3D */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <span>💬 Bộ câu hiển thị trong không gian 3D</span>
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
                title="Tự động điền 15 câu mẫu ngắn gọn"
              >
                <span>✨</span>
                <span>Điền nhanh 15 câu mẫu</span>
              </button>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">• Chữ chạy trong không gian 3D</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Các câu ngắn này sẽ cùng hình ảnh và trái tim phát sáng trôi từ trên xuống trong không gian 3D (ví dụ: Em yêu anh, vững vàng, thành công...).
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
                      className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs"
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
                      className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs"
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
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 text-xs"
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
            <span className="text-[11px] text-zinc-500">Tối đa 10MB/ảnh gốc</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group"
              >
                <Image
                  src={img.previewUrl}
                  alt={`Ảnh kỷ niệm ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  disabled={isPending || isOptimizingImages}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors"
                  title="Xóa ảnh"
                >
                  ✕
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isPending || isOptimizingImages}
                className="aspect-square rounded-xl border border-dashed border-zinc-700 hover:border-rose-500/60 bg-zinc-900/40 hover:bg-zinc-900/80 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors disabled:opacity-50"
              >
                <span className="text-lg">{isOptimizingImages ? "⏳" : "📷"}</span>
                <span className="text-[10px] font-medium">
                  {isOptimizingImages ? "Đang xử lý..." : "+ Thêm ảnh"}
                </span>
              </button>
            )}
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImageSelect}
            disabled={isPending || isOptimizingImages}
          />
        </div>

        {/* Media Upload: Audio */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Nhạc nền kỷ niệm (Tối đa 1 file MP3)
            </label>
            <span className="text-[11px] text-zinc-500">Tối đa 15MB</span>
          </div>

          {audio ? (
            <AudioStartEditor
              audioSrc={audio.previewUrl}
              audioName={audio.file.name}
              value={audioStartSeconds}
              onChange={setAudioStartSeconds}
              onRemoveAudio={handleRemoveAudio}
              disabled={isPending || isOptimizingImages}
            />
          ) : (
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={isPending || isOptimizingImages}
              className="w-full py-3.5 px-4 rounded-xl border border-dashed border-zinc-700 hover:border-rose-500/60 bg-zinc-900/40 hover:bg-zinc-900/80 flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-rose-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>🎵</span>
              <span>Chọn file nhạc MP3</span>
            </button>
          )}

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,.mp3"
            className="hidden"
            onChange={handleAudioSelect}
            disabled={isPending || isOptimizingImages}
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs text-center leading-relaxed">
          {error}
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isPending || isOptimizingImages}
        >
          {isOptimizingImages
            ? "Đang tối ưu ảnh..."
            : isPending
            ? "Đang tải lên & tạo món quà..."
            : "Tạo món quà"}
        </Button>
      </div>
    </form>
  );
}
