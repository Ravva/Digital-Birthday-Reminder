"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Inbox,
  User,
  Users,
  Plus,
  LogOut,
  Settings,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";

export default function SidebarClient() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="w-64 h-screen bg-[#1e1f21] text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center">
        <img src="/logo.svg" alt="Логотип" className="h-8 mr-2" />
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex items-center bg-[#2c2d30] rounded-md px-3 py-1.5">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Поиск"
            className="bg-transparent border-none text-sm text-gray-200 focus:outline-none w-full"
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
                "flex items-center px-2 py-1.5 text-sm rounded-md",
                pathname === "/dashboard"
                  ? "bg-[#525567] text-white"
                  : "text-gray-300 hover:bg-[#2c2d30]",
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
                "flex items-center px-2 py-1.5 text-sm rounded-md",
                pathname.includes("/dashboard/contacts")
                  ? "bg-[#525567] text-white"
                  : "text-gray-300 hover:bg-[#2c2d30]",
              )}
            >
              <User className="h-4 w-4 mr-3" />
              <span>Контакты</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/contacts/new"
              className={cn(
                "flex items-center px-2 py-1.5 text-sm rounded-md",
                pathname === "/dashboard/contacts/new"
                  ? "bg-[#525567] text-white"
                  : "text-gray-300 hover:bg-[#2c2d30]",
              )}
            >
              <Plus className="h-4 w-4 mr-3" />
              <span>Добавить контакт</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/telegram"
              className={cn(
                "flex items-center px-2 py-1.5 text-sm rounded-md",
                pathname.includes("/dashboard/telegram")
                  ? "bg-[#525567] text-white"
                  : "text-gray-300 hover:bg-[#2c2d30]",
              )}
            >
              <Users className="h-4 w-4 mr-3" />
              <span>Настройки Telegram</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full px-3 py-1.5 text-sm bg-[#2c2d30] rounded-md hover:bg-[#3c3d40] text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
}
