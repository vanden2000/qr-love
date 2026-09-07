import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between py-8">
      {/* Navigation */}
      <header className="w-full">
        <Container size="sm" className="flex justify-between items-center py-4">
          <span className="text-base font-medium tracking-wider text-rose-400">
            QR Love
          </span>
          <Link
            href="/gift/demo"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Xem mẫu demo
          </Link>
        </Container>
      </header>

      {/* Hero Section */}
      <main className="my-auto py-12">
        <Container size="sm" className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-rose-300">
            <span>✨</span>
            <span>Món quà số tinh tế & lãng mạn</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-zinc-100 leading-tight">
              Trao gửi yêu thương <br />
              <span className="font-normal text-rose-400">chỉ bằng một mã QR</span>
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Tạo trang kỷ niệm và lời nhắn ngọt ngào dành riêng cho người ấy. Quét mã để mở ra không gian yêu thương bất ngờ.
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <Link
              href="/create"
              className="w-full inline-flex items-center justify-center min-h-[44px] px-6 py-3.5 rounded-full text-sm font-medium tracking-wide bg-rose-600 text-white hover:bg-rose-700 transition-colors active:scale-[0.98]"
            >
              Bắt đầu tạo quà
            </Link>
            <Link
              href="/gift/demo"
              className="w-full inline-flex items-center justify-center min-h-[44px] px-6 py-3.5 rounded-full text-sm font-medium tracking-wide border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              Trải nghiệm mẫu quà
            </Link>
          </div>

          {/* Simple 3-step feature highlight */}
          <div className="w-full pt-10 border-t border-zinc-900 grid grid-cols-3 gap-2 text-center text-xs text-zinc-400">
            <div className="space-y-1">
              <span className="block text-zinc-200 font-medium">1. Nhập</span>
              <span>Lời yêu thương</span>
            </div>
            <div className="space-y-1">
              <span className="block text-zinc-200 font-medium">2. Nhận</span>
              <span>Mã QR duy nhất</span>
            </div>
            <div className="space-y-1">
              <span className="block text-zinc-200 font-medium">3. Quét</span>
              <span>Mở quà bất ngờ</span>
            </div>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <Container size="sm" className="text-center py-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} QR Love. Dành cho những khoảnh khắc đáng nhớ.
          </p>
        </Container>
      </footer>
    </div>
  );
}
