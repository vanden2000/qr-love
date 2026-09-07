"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { GiftFormData } from "@/types/gift";

export function CreateGiftForm() {
  const [formData, setFormData] = useState<GiftFormData>({
    senderName: "",
    recipientName: "",
    anniversaryDate: "",
    title: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Giao diện skeleton: chỉ demo trạng thái phản hồi, chưa có database/submit thật
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="space-y-4">
        <Input
          label="Tên người gửi"
          id="senderName"
          name="senderName"
          placeholder="Ví dụ: Hoàng Long"
          value={formData.senderName}
          onChange={handleChange}
          required
        />

        <Input
          label="Tên người nhận"
          id="recipientName"
          name="recipientName"
          placeholder="Ví dụ: Thu Hà"
          value={formData.recipientName}
          onChange={handleChange}
          required
        />

        <Input
          label="Ngày kỷ niệm"
          id="anniversaryDate"
          name="anniversaryDate"
          type="date"
          value={formData.anniversaryDate}
          onChange={handleChange}
        />

        <Input
          label="Tiêu đề"
          id="title"
          name="title"
          placeholder="Ví dụ: Gửi người con gái anh yêu"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Lời nhắn"
          id="message"
          name="message"
          placeholder="Viết những lời chân thành nhất gửi đến người ấy..."
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

      {submitted && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 text-xs text-center leading-relaxed">
          ✨ Giao diện demo đã ghi nhận thông tin. Tính năng tạo mã QR thật sẽ được kết nối ở các bước tiếp theo.
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" variant="primary" fullWidth>
          Tạo món quà
        </Button>
      </div>
    </form>
  );
}
