"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Tables } from "@/types/supabase";
import { ru } from "date-fns/locale";
import { useEffect, useState } from "react";

interface BirthdayCalendarProps {
  contacts?: Tables<"contacts">[];
}

const formatDateKey = (date: Date): string =>
  `${date.getMonth() + 1}-${date.getDate()}`;

export function BirthdayCalendar({ contacts = [] }: BirthdayCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [birthdays, setBirthdays] = useState<
    Record<string, Tables<"contacts">[]>
  >({});
  const [selectedDayContacts, setSelectedDayContacts] = useState<
    Tables<"contacts">[]
  >([]);

  useEffect(() => {
    if (contacts.length === 0) {
      setBirthdays({});
      return;
    }

    // Группируем контакты по дате рождения (месяц-день)
    const birthdayMap: Record<string, Tables<"contacts">[]> = {};

    for (const contact of contacts) {
      const birthDate = new Date(contact.birth_date);
      const key = formatDateKey(birthDate);

      if (!birthdayMap[key]) {
        birthdayMap[key] = [];
      }

      birthdayMap[key].push(contact);
    }

    setBirthdays(birthdayMap);

    // Обновляем список контактов для выбранного дня
    if (date) {
      const key = formatDateKey(date);
      setSelectedDayContacts(birthdayMap[key] || []);
    }
  }, [contacts, date]);

  // Функция для определения, есть ли дни рождения в указанный день
  const hasBirthday = (day: Date): boolean => {
    const key = formatDateKey(day);
    return !!birthdays[key] && birthdays[key].length > 0;
  };

  // Обработчик выбора даты
  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);

    if (selectedDate) {
      const key = formatDateKey(selectedDate);
      setSelectedDayContacts(birthdays[key] || []);
    } else {
      setSelectedDayContacts([]);
    }
  };

  // Функция для расчета возраста
  const calculateAge = (birthDateStr: string): number => {
    const birthDate = new Date(birthDateStr);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Календарь дней рождения</CardTitle>
          <CardDescription>
            Выберите дату, чтобы увидеть дни рождения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={ru}
            className="rounded-md border"
            modifiers={{
              birthday: (date) => hasBirthday(date),
            }}
            modifiersClassNames={{
              birthday:
                "bg-primary/10 font-bold relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {date ? (
              <>
                Дни рождения{" "}
                {date.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
              </>
            ) : (
              "Выберите дату"
            )}
          </CardTitle>
          <CardDescription>
            {selectedDayContacts.length > 0
              ? `${selectedDayContacts.length} контактов`
              : "Нет дней рождения в этот день"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {selectedDayContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(contact.birth_date)} лет
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(contact.birth_date).getFullYear()}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
