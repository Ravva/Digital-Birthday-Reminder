"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Inbox, LogOut, Search, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "../../../supabase/client";

export default function SidebarClient() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background text-foreground">
      {/* Logo */}
      <div className="p-4 flex items-center">
        <img src="/logo.svg" alt="Логотип" className="h-8 mr-2" />
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex items-center rounded-md border bg-background px-3 py-1.5">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          <li>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center rounded-md px-2 py-1.5 text-sm",
                pathname === "/dashboard"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Inbox className="h-4 w-4 mr-3" />
              <span>Панель управления</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/contacts"
              className={cn(
                "flex items-center rounded-md px-2 py-1.5 text-sm",
                pathname.includes("/dashboard/contacts")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <User className="h-4 w-4 mr-3" />
              <span>Контакты</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/telegram"
              className={cn(
                "flex items-center rounded-md px-2 py-1.5 text-sm",
                pathname.includes("/dashboard/telegram")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Users className="h-4 w-4 mr-3" />
              <span>Настройки Telegram</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t p-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSignOut}
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Выйти</span>
        </Button>
      </div>
    </div>
  );
}
