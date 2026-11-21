import type { Metadata } from "next";
import { Geist_Mono, Sarabun, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import "./globals.css";

// Thai-only UI (ADR-0018): Thai web font + <html lang="th">.
const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "CarLog",
  description: "บันทึกและจัดการข้อมูลรถยนต์ของบริษัท",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={cn("h-full antialiased font-sans", geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
