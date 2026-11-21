import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="text-muted-foreground">หน้านี้อาจถูกย้ายหรือไม่มีอยู่</p>
      <Link href="/cars" className="font-medium text-primary underline underline-offset-4">
        กลับไปหน้ารายการรถ
      </Link>
    </main>
  );
}
