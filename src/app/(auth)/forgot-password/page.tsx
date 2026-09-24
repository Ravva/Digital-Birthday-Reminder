import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
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
    <section className="flex min-h-svh bg-muted/40 px-4 py-16 md:py-32">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="m-auto w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <form className="flex flex-col space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-primary-foreground">
                <img
                  src="/cake.svg"
                  alt="Logo"
                  className="h-7 invert dark:invert-0"
                />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Сброс пароля
            </h1>
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link
                className="text-primary font-medium hover:underline transition-all"
                href="/sign-in"
              >
                Войти
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>
          </div>

          <SubmitButton
            formAction={forgotPasswordAction}
            pendingText="Отправка ссылки..."
            className="w-full"
          >
            Сбросить пароль
          </SubmitButton>

          <FormMessage message={searchParams} />
        </form>
      </div>
      <SmtpMessage />
    </section>
  );
}
