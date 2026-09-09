import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 text-center">
      <Container size="sm" className="space-y-6">
        <div className="text-4xl">🥀</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-light tracking-tight text-zinc-100">
            Không tìm thấy món quà
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Đường dẫn món quà không tồn tại hoặc đã hết hạn. Hãy kiểm tra lại mã QR hoặc tạo món quà mới.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full text-sm font-medium bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors"
          >
            Trở về trang chủ
          </Link>
        </div>
      </Container>
    </div>
  );
}
