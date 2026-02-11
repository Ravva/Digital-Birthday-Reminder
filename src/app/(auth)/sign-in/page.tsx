import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { ThemeToggle } from "@/components/theme-toggle";

interface LoginProps {
  searchParams: Promise<Message>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = await searchParams;

  if ("message" in message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <section className="auth-bg flex px-4 py-16 md:py-32">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <form className="glass-card m-auto h-fit w-full max-w-sm rounded-xl p-0.5 animate-scale-in">
        <div className="p-8 pb-6">
          <div>
            <div className="relative flex items-center justify-center">
              <Link href="/" aria-label="go home" className="absolute left-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg gradient-bg">
                  <img
                    src="/cake.svg"
                    alt="Digital Birthday Reminder"
                    className="h-6 brightness-0 invert"
                  />
                </div>
              </Link>
              <span className="text-xl font-semibold tracking-tight">
                Birthday
                <span className="gradient-text ml-1">Reminder</span>
              </span>
            </div>
            <h1 className="mb-1 mt-4 text-xl font-semibold text-center">
              Вход в аккаунт
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Добро пожаловать! Войдите в свой аккаунт
            </p>
          </div>

          <div className="mt-6">
            <OAuthButtons />
          </div>

          <hr className="my-4 border-dashed border-border" />

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Link
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  href="/forgot-password"
                >
                  Забыли пароль?
                </Link>
              </div>
              <Input
                type="email"
                required
                name="email"
                id="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Пароль
              </Label>
              <Input
                type="password"
                required
                name="password"
                id="password"
                placeholder="Ваш пароль"
              />
            </div>

            <SubmitButton
              formAction={signInAction}
              pendingText="Вход..."
              className="w-full gradient-bg text-white hover:opacity-90 transition-opacity border-0"
            >
              Войти
            </SubmitButton>

            <FormMessage message={message} />
          </div>
        </div>

        <div className="bg-muted/50 rounded-b-xl border-t border-border/50 p-3">
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?
            <Button asChild variant="link" className="px-2 gradient-text">
              <Link href="/sign-up">Регистрация</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
