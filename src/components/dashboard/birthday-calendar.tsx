"use client";

import { Tables } from "@/types/supabase";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BirthdayCalendarProps {
  contacts?: Tables<"contacts">[];
}

export function BirthdayCalendar({ contacts = [] }: BirthdayCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [birthdays, setBirthdays] = useState<
    Record<string, Tables<"contacts">[]>
  >({});
  const [selectedDayContacts, setSelectedDayContacts] = useState<
    Tables<"contacts">[]
  >([]);

  // Функция для форматирования даты в строку "YYYY-MM-DD"
  const formatDateKey = (date: Date): string => {
    return `${date.getMonth() + 1}-${date.getDate()}`;
  };

  useEffect(() => {
    if (contacts.length === 0) {
      setBirthdays({});
      return;
    }

    // Группируем контакты по дате рождения (месяц-день)
    const birthdayMap: Record<string, Tables<"contacts">[]> = {};

    contacts.forEach((contact) => {
      const birthDate = new Date(contact.birth_date);
      const key = formatDateKey(birthDate);

      if (!birthdayMap[key]) {
        birthdayMap[key] = [];
      }

      birthdayMap[key].push(contact);
    });

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

  // Функция для отображения дней с днями рождения
  const dayClassName = (day: Date) => {
    return hasBirthday(day) ? "bg-primary/10 rounded-md" : "";
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
      <Card className="bg-card/80 backdrop-blur-sm border-border/80">
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
              birthday: "bg-primary/10 font-bold",
            }}
            components={{
              DayContent: (props) => (
                <div className={dayClassName(props.date)}>
                  {props.date.getDate()}
                  {hasBirthday(props.date) && (
                    <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-border/80">
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
                  <Badge
                    variant="outline"
                    className="border-border/30 bg-card/80"
                  >
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
