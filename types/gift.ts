export type MediaType = "image" | "audio";

export interface Gift {
  id: string;
  slug: string;
  sender_name: string;
  receiver_name: string;
  title: string;
  message: string;
  start_date: string | null;
  theme: string | null;
  created_at: string;
  updated_at: string;
}

export interface GiftMedia {
  id: string;
  gift_id: string;
  type: MediaType;
  url: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface GiftMessage {
  id?: string;
  gift_id?: string;
  content: string;
  sort_order: number;
  created_at?: string;
}

export interface GiftWithMedia extends Gift {
  media?: GiftMedia[];
  story_messages?: GiftMessage[];
}

export interface CreateGiftInput {
  senderName: string;
  receiverName: string;
  startDate?: string;
  title: string;
  message: string;
  storyMessages?: string[];
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
