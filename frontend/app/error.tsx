"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Unexpected render crash (§7): safe message plus retry, never technical details.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">เกิดข้อผิดพลาดบางอย่าง</h1>
      <p className="text-muted-foreground">ขออภัย ระบบไม่สามารถแสดงหน้านี้ได้ กรุณาลองใหม่อีกครั้ง</p>
      <Button onClick={() => retry()}>ลองใหม่</Button>
    </main>
  );
}
