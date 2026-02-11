import DashboardNavigation from "@/components/dashboard/navigation";
import { AuthCheck } from "@/components/auth/auth-check";
import { ThemeToggle } from "@/components/theme-toggle";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl gradient-border transition-colors duration-300">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center mr-8">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg gradient-bg">
                    <img
                      src="/cake.svg"
                      alt="Logo"
                      className="h-5 w-5 brightness-0 invert"
                    />
                  </div>
                  <span className="ml-3 text-lg font-semibold tracking-tight hidden sm:inline-block">
                    Birthday
                    <span className="gradient-text ml-1">Reminder</span>
                  </span>
                </div>
                <DashboardNavigation />
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthCheck>
  );
}
