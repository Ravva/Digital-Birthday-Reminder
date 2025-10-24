import DashboardNavigation from "@/components/dashboard/navigation";
import { AuthCheck } from "@/components/auth/auth-check";
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
      <div className="min-h-screen bg-theme-pattern transition-all duration-500">
        <div className="min-h-screen bg-background/90 backdrop-blur-sm transition-all duration-500">
          <header className="bg-background/95 border-b border-border backdrop-blur-sm transition-all duration-500">
            <div className="container mx-auto px-4">
              <div className="flex items-center h-16">
                <img src="/cake.svg" alt="Logo" className="h-8 mr-8" />
                <DashboardNavigation />
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </div>
    </AuthCheck>
  );
}