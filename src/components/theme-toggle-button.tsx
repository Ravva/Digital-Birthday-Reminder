"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setIsChanging(true);
    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark");
      setIsChanging(false);
    }, 300);
  };

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      className={`
        fixed bottom-4 right-4 rounded-full w-12 h-12 z-50
        ${isChanging ? 'animate-scaleIn' : 'animate-slideInFromBottom'}
        shadow-lg hover:shadow-xl
        ${isDark
          ? 'bg-gray-800/90 hover:bg-gray-700/90 border-gray-700'
          : 'bg-white/90 hover:bg-gray-50/90 border-gray-200'
        }
        backdrop-blur-sm transition-all duration-300
        hover:scale-110
      `}
      onClick={toggleTheme}
      aria-label="Переключить тему"
    >
      <div className={`relative w-6 h-6 ${isChanging ? 'animate-rotate' : ''}`}>
        {isDark ? (
          <Sun className="h-6 w-6 text-amber-400 animate-scaleIn" />
        ) : (
          <Moon className="h-6 w-6 text-indigo-600 animate-scaleIn" />
        )}
      </div>
      <span className="sr-only">
        {isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      </span>
    </Button>
  );
}
