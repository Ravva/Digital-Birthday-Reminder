import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { forgotPasswordAction } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <section className="auth-bg flex px-4 py-16 md:py-32">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="glass-card m-auto w-full max-w-md rounded-xl p-6 animate-scale-in">
        <form className="flex flex-col space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl gradient-bg">
                <img
                  src="/cake.svg"
                  alt="Logo"
                  className="h-7 brightness-0 invert"
                />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Сброс пароля
            </h1>
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link
                className="gradient-text font-medium hover:underline transition-all"
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
            className="w-full gradient-bg text-white hover:opacity-90 transition-opacity border-0"
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
