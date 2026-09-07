import type { GiftItem } from "@/types/gift";

export const DEFAULT_DEMO_GIFT: GiftItem = {
  id: "demo-1",
  slug: "demo",
  senderName: "Người thương",
  recipientName: "Em yêu",
  anniversaryDate: "2024-02-14",
  title: "Gửi người đặc biệt nhất",
  message: "Cảm ơn vì đã luôn ở bên cạnh và mang lại nụ cười rạng rỡ mỗi ngày. Yêu em rất nhiều!",
  createdAt: new Date().toISOString(),
};
