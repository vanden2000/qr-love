import { notFound } from "next/navigation";
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
    <div className="relative min-h-screen py-10 sm:py-16 px-4 flex flex-col justify-center items-center bg-[#060308] overflow-hidden">
      {/* 1. Ambient Background Glowing Orbs */}
      <div className="absolute top-10 -left-28 w-96 h-96 rounded-full bg-rose-600/15 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 -right-28 w-[420px] h-[420px] rounded-full bg-pink-700/12 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-rose-500/10 blur-[90px] pointer-events-none" />

      {/* 2. Floating Romantic Heart Particles */}
      <div className="absolute left-[12%] bottom-[-10px] text-rose-400/30 text-lg select-none pointer-events-none animate-float-heart-1">
        ♥
      </div>
      <div className="absolute left-[84%] bottom-[-10px] text-pink-400/25 text-xl select-none pointer-events-none animate-float-heart-2">
        ♥
      </div>
      <div className="absolute left-[28%] bottom-[-10px] text-rose-300/20 text-sm select-none pointer-events-none animate-float-heart-3">
        ♥
      </div>
      <div className="absolute left-[70%] bottom-[-10px] text-rose-500/20 text-base select-none pointer-events-none animate-float-heart-4">
        ♥
      </div>

      {/* 3. Delicate Sparkles Grid Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#fb7185_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      {/* 4. Main Glass Gift Card Presentation Container */}
      <main className="relative z-10 w-full max-w-[480px] mx-auto">
        <div className="p-6 sm:p-9 rounded-[32px] sm:rounded-[36px] bg-zinc-950/75 border border-rose-500/25 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(225,29,72,0.12)]">
          <GiftCreatedResult
            slug={gift.slug}
            receiverName={gift.receiver_name}
            title={gift.title}
          />
        </div>
      </main>
    </div>
  );
}
