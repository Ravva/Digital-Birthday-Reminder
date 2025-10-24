"use client";

import { Tables } from "@/types/supabase";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatFullName } from "@/utils/name-formatter";

interface UpcomingBirthdaysProps {
  contacts?: Tables<"contacts">[];
  daysAhead?: number;
}

interface ContactWithDays extends Tables<"contacts"> {
  daysUntil: number;
}

export function UpcomingBirthdays({
  contacts = [],
  daysAhead = 30,
}: UpcomingBirthdaysProps) {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<ContactWithDays[]>(
    [],
  );

  useEffect(() => {
    if (contacts.length === 0) {
      setUpcomingBirthdays([]);
      return;
    }

    // Функция для расчета дней до дня рождения
    const calculateDaysUntilBirthday = (birthDateStr: string): number => {
      const today = new Date();
      const birthDate = new Date(birthDateStr);

      // Создаем дату следующего дня рождения в текущем году
      const nextBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate(),
      );

      // Если день рождения уже прошел в этом году, берем следующий год
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      // Вычисляем разницу в днях
      const diffTime = nextBirthday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    };

    // Добавляем информацию о днях до дня рождения и фильтруем
    const contactsWithDays = contacts
      .map((contact) => ({
        ...contact,
        daysUntil: calculateDaysUntilBirthday(contact.birth_date),
      }))
      .filter((contact) => contact.daysUntil <= daysAhead)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      // Ограничиваем до 5 ближайших дней рождения
      .slice(0, 5);

    setUpcomingBirthdays(contactsWithDays);
  }, [contacts, daysAhead]);

  // Функция для получения текста о днях до дня рождения
  const getDaysText = (days: number): string => {
    if (days === 0) return "Сегодня!";
    if (days === 1) return "Завтра";

    // Правильное склонение для русского языка
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) {
      return `Через ${days} день`;
    } else if (
      [2, 3, 4].includes(lastDigit) &&
      ![12, 13, 14].includes(lastTwoDigits)
    ) {
      return `Через ${days} дня`;
    } else {
      return `Через ${days} дней`;
    }
  };

  // Функция для получения цвета бейджа в зависимости от дней
  const getBadgeVariant = (
    days: number,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (days === 0) return "destructive";
    if (days <= 3) return "default";
    if (days <= 7) return "secondary";
    return "outline";
  };

  return (
    <ScrollArea className="h-[300px] pr-4">
      {upcomingBirthdays.length > 0 ? (
        <div className="space-y-6">
          {upcomingBirthdays.map((contact) => (
            <div key={contact.id} className="flex items-center">
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {formatFullName(contact.name)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(contact.birth_date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant={getBadgeVariant(contact.daysUntil)}>
                  {getDaysText(contact.daysUntil)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Нет предстоящих дней рождения в ближайшие {daysAhead} дней
        </div>
      )}
    </ScrollArea>
  );
}
