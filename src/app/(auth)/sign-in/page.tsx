import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

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
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form 
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md"
      >
        <div className="p-8 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="go home">
                <img src="/cake.svg" alt="Digital Birthday Reminder" className="h-10" />
              </Link>
              <span className="text-title mb-1 mt-4 text-xl font-semibold">Birthday Reminder</span>
            </div>
            <h1 className="text-title mb-1 mt-4 text-xl font-semibold">Вход в аккаунт</h1>
            <p className="text-sm">Добро пожаловать! Войдите в свой аккаунт</p>
          </div>

          <div className="mt-6">
            <OAuthButtons />
          </div>

          <hr className="my-4 border-dashed" />

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input 
                type="email" 
                required 
                name="email" 
                id="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm">
                  Пароль
                </Label>
                <Link
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all"
                  href="/forgot-password"
                >
                  Забыли пароль?
                </Link>
              </div>
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
              className="w-full"
            >
              Войти
            </SubmitButton>

            <FormMessage message={message} />
          </div>
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Нет аккаунта?
            <Button asChild variant="link" className="px-2">
              <Link href="/sign-up">Регистрация</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
