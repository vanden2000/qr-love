import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CreateGiftForm } from "@/components/create/create-gift-form";

export const metadata = {
  title: "Tạo món quà | QR Love",
  description: "Thiết kế món quà số và lời nhắn ngọt ngào cho người bạn yêu thương.",
};

export default function CreateGiftPage() {
  return (
    <div className="min-h-screen py-8 flex flex-col">
      <header className="w-full pb-6">
        <Container size="sm" className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 transition-colors min-h-[44px] px-2 -ml-2"
          >
            ← Quay lại
          </Link>
          <span className="text-xs font-medium tracking-wider text-rose-400">
            QR Love
          </span>
          <div className="w-12" /> {/* spacer */}
        </Container>
      </header>

      <main className="flex-1">
        <Container size="sm" className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-light tracking-tight text-zinc-100">
              Tạo món quà kỷ niệm
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Điền thông tin để chuẩn bị không gian bất ngờ cho người thương của bạn.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <CreateGiftForm />
          </div>
        </Container>
      </main>
    </div>
  );
}
