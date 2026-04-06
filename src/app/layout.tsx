import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ZoomLock } from "@/components/zoom-lock";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  preload: true,
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Напоминание о днях рождения - Никогда не забывайте дни рождения",
  description:
    "Автоматические напоминания о днях рождения отправляются прямо в ваш Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <TempoInit />
        <ZoomLock />
      </body>
    </html>
  );
}
