"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Inbox, Users, MessageCircle, LogOut } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationMenuTriggerStyle = cn(
  "group inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-card hover:text-accent-foreground focus:bg-card focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary data-[active]:text-primary-foreground data-[state=open]:bg-card/80"
);

export default function DashboardNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList className="space-x-2">
        <NavigationMenuItem>
          <Link href="/dashboard" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle}>
              <Inbox className="mr-2 h-4 w-4" />
              Панель управления
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/dashboard/contacts" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle}>
              <Users className="mr-2 h-4 w-4" />
              Контакты
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/dashboard/telegram" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Настройки Telegram
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <button
            onClick={handleSignOut}
            className={cn(
              navigationMenuTriggerStyle,
              "cursor-pointer"
            )}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}