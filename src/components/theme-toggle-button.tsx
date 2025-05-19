"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback, KeyboardEvent } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { theme, setTheme } = useTheme();

  // Определяем функцию toggleTheme перед useEffect с useCallback
  const toggleTheme = useCallback(() => {
    setIsPressed(true);
    setIsChanging(true);

    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark");
      setIsChanging(false);

      setTimeout(() => {
        setIsPressed(false);
      }, 200);
    }, 300);
  }, [theme, setTheme]);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);

    // Добавляем обработчик клавиатуры для переключения темы по Alt+T
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 't') {
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);

    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [toggleTheme]);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";
  const tooltipText = isDark ? 'Переключить на светлую тему (Alt+T)' : 'Переключить на тёмную тему (Alt+T)';

  // Адаптивные размеры для разных экранов
  const buttonSizeClasses = "w-10 h-10";
  const iconSizeClasses = "w-5 h-5";
  const positionClasses = "top-4 right-4";

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`
              fixed ${positionClasses} ${buttonSizeClasses} z-50
              ${isChanging ? 'animate-scaleIn' : 'animate-fadeIn'}
              ${isPressed ? 'animate-press' : ''}
              transition-all duration-300
              rounded-md
              border-2 border-amber-400/50 dark:border-amber-400/50
              bg-background/90 dark:bg-gray-800/90
              hover:bg-accent hover:text-accent-foreground
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isDark ? 'focus:ring-amber-400/50' : 'focus:ring-amber-400/50'}
            `}
            onClick={toggleTheme}
            onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleTheme();
              }
            }}
            aria-label={tooltipText}
            title={tooltipText}
            tabIndex={0}
          >
            <div className={`
              flex items-center justify-center
              ${isChanging ? 'animate-rotate' : ''}
            `}>
              {isDark ? (
                <Sun className={`${iconSizeClasses} text-amber-400`} strokeWidth={2.5} />
              ) : (
                <Moon className={`${iconSizeClasses} text-amber-400`} strokeWidth={2.5} />
              )}
            </div>
            <span className="sr-only">{tooltipText}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-medium">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
