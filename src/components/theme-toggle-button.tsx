"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-4 rounded-full w-10 h-10 shadow-lg z-50 bg-background/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:scale-110 hover:shadow-xl"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Переключить тему"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-amber-400 animate-fadeIn" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600 animate-fadeIn" />
        )}
      </div>
    </Button>
  );
}
