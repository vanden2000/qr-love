import { GiftViewer } from "@/components/gift/gift-viewer";
import { DEFAULT_DEMO_GIFT } from "@/lib/constants";

interface GiftPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: GiftPageProps) {
  await params;
  return {
    title: "Món quà kỷ niệm | QR Love",
    description: "Món quà đặc biệt dành riêng cho bạn.",
  };
}

export default async function GiftPage({ params }: GiftPageProps) {
  const { slug } = await params;

  // Bước skeleton: Hiển thị demo gift theo slug
  const gift = {
    ...DEFAULT_DEMO_GIFT,
    slug,
  };

  return <GiftViewer gift={gift} />;
}
