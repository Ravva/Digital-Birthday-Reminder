import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  preload: true,
  display: 'swap'
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
    <html lang="ru">
      <body className={inter.className}>
        {children}
        <TempoInit />
      </body>
    </html>
  );
}