export interface GiftFormData {
  senderName: string;
  recipientName: string;
  anniversaryDate: string;
  title: string;
  message: string;
}

export interface GiftItem {
  id: string;
  slug: string;
  senderName: string;
  recipientName: string;
  anniversaryDate?: string;
  title: string;
  message: string;
  createdAt: string;
}
