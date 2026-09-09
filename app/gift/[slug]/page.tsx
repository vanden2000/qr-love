import { notFound } from "next/navigation";
import { GiftExperience } from "@/components/gift/gift-experience";
import { getGiftBySlug } from "@/lib/gifts/getGift";

interface GiftPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: GiftPageProps) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);

  if (!gift) {
    return {
      title: "Không tìm thấy món quà | QR Love",
      description: "Món quà này không tồn tại hoặc đã bị xóa.",
    };
  }

  return {
    title: `${gift.title} | QR Love`,
    description: `Món quà đặc biệt dành riêng cho ${gift.receiver_name}.`,
  };
}

export default async function GiftPage({ params }: GiftPageProps) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);

  if (!gift) {
    notFound();
  }

  return <GiftExperience gift={gift} />;
}
