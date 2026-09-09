import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { GiftCreatedResult } from "@/components/create/gift-created-result";
import { getGiftBySlug } from "@/lib/gifts/getGift";

interface SuccessPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: SuccessPageProps) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);

  if (!gift) {
    return {
      title: "Món quà không tồn tại | QR Love",
    };
  }

  return {
    title: `Món quà cho ${gift.receiver_name} đã sẵn sàng | QR Love`,
    description: `Mã QR và đường dẫn món quà "${gift.title}".`,
  };
}

export default async function CreateSuccessPage({ params }: SuccessPageProps) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);

  if (!gift) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8 flex flex-col justify-center items-center">
      <main className="w-full">
        <Container size="sm" className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <GiftCreatedResult
              slug={gift.slug}
              receiverName={gift.receiver_name}
              title={gift.title}
            />
          </div>
        </Container>
      </main>
    </div>
  );
}
