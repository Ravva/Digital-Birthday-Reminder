import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
// import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default async function SignUp(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
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
            <h1 className="text-title mb-1 mt-4 text-xl font-semibold">Создать аккаунт</h1>
            <p className="text-sm">Добро пожаловать! Создайте аккаунт, чтобы начать</p>
          </div>

          <div className="mt-6">
            <OAuthButtons />
          </div>

          <hr className="my-4 border-dashed" />

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="block text-sm">
                Полное имя
              </Label>
              <Input 
                type="text" 
                required 
                name="full_name" 
                id="full_name"
                placeholder="Иван Иванов"
              />
            </div>

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
              <Label htmlFor="password" className="text-sm">
                Пароль
              </Label>
              <Input 
                type="password" 
                required 
                name="password" 
                id="password"
                placeholder="Ваш пароль"
                minLength={6}
              />
            </div>

            <SubmitButton
              formAction={signUpAction}
              pendingText="Регистрация..."
              className="w-full"
            >
              Зарегистрироваться
            </SubmitButton>

            <FormMessage message={searchParams} />
          </div>
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Уже есть аккаунт?
            <Button asChild variant="link" className="px-2">
              <Link href="/sign-in">Войти</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
