import type { Gift } from "@/types/gift";

export const APP_NAME = "QR Love";
export const APP_DESCRIPTION =
  "Trao gửi yêu thương qua từng khoảnh khắc bằng mã QR số.";

export const DEFAULT_DEMO_GIFT: Gift = {
  id: "demo-uuid",
  slug: "demo",
  sender_name: "Người thương",
  receiver_name: "Em yêu",
  title: "Gửi người đặc biệt nhất",
  message:
    "Cảm ơn vì đã luôn ở bên cạnh và mang lại nụ cười rạng rỡ mỗi ngày. Yêu em rất nhiều!",
  start_date: "2024-02-14",
  theme: "romantic-dark",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
