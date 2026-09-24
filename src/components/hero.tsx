import { ArrowUpRight, Check, Gift } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      <div className="pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Gift className="h-16 w-16 text-primary" />
            </div>
            <h1 className="mb-8 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Never Forget a{" "}
              <span className="text-primary">
                Birthday
              </span>{" "}
              Again
            </h1>

            <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Автоматические напоминания о днях рождения отправляются прямо в
              ваш Telegram. Отслеживайте важные даты и никогда не упускайте
              возможность поздравить близких.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Начать бесплатно
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center rounded-md border bg-background px-8 py-4 text-lg font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Как это работает
              </Link>
            </div>

            <div className="mt-16 flex flex-col items-center justify-center gap-8 text-sm text-muted-foreground sm:flex-row">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Telegram integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Unlimited contacts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
