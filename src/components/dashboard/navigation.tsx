"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Users, MessageCircle, LogOut } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DashboardNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const links = [
    {
      href: "/dashboard",
      label: "Панель",
      icon: Inbox,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/contacts",
      label: "Контакты",
      icon: Users,
      active: pathname?.startsWith("/dashboard/contacts"),
    },
    {
      href: "/dashboard/telegram",
      label: "Telegram",
      icon: MessageCircle,
      active: pathname === "/dashboard/telegram",
    },
  ];

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 text-muted-foreground hover:text-foreground transition-colors",
              link.active &&
              "bg-accent text-foreground shadow-sm",
            )}
          >
            <link.icon className="h-4 w-4" />
            <span className="hidden sm:inline-block">{link.label}</span>
          </Button>
        </Link>
      ))}
      <div className="ml-2 h-6 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="gap-2 text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline-block">Выйти</span>
      </Button>
    </nav>
  );
}
