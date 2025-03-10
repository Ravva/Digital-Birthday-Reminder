import {
  Bell,
  Calendar,
  Gift,
  MessageCircle,
  UserCircle,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { createClient } from "../../../supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/supabase";
import { formatMonthDay } from "@/utils/utils";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch contacts for the current user
  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .order("name");

  // Fetch telegram settings
  const { data: telegramSettings, error: telegramError } = await supabase
    .from("telegram_settings")
    .select("*")
    .eq("user_id", user?.id || "")
    .maybeSingle();

  // Calculate upcoming birthdays
  const today = new Date();
  const upcomingBirthdays = contacts
    ? (contacts as Tables<"contacts">[])
        .map((contact) => {
          const birthDate = new Date(contact.birth_date);
          const birthDateThisYear = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate(),
          );

          // If birthday has already occurred this year, set to next year
          if (birthDateThisYear < today) {
            birthDateThisYear.setFullYear(today.getFullYear() + 1);
          }

          // Calculate difference in days
          const diffTime = birthDateThisYear.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return {
            ...contact,
            daysUntil: diffDays,
          };
        })
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 5)
    : [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Проекты</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Завершено</span>
          <select className="border rounded px-2 py-1 text-sm bg-white">
            <option>Всегда</option>
            <option>Последние 7 дней</option>
            <option>Последние 30 дней</option>
          </select>
        </div>
      </div>

      {/* Teams Filter */}
      <div className="flex items-center mb-6 space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Команды</span>
          <span className="text-sm">любая из</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex items-center">
            <span className="mr-1">@</span>Личные
          </span>
        </div>
        <span className="text-sm text-gray-500">И</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Тип</span>
          <span className="border rounded px-2 py-0.5 text-xs">Задача</span>
          <span className="border rounded px-2 py-0.5 text-xs">ИЛИ</span>
          <span className="border rounded px-2 py-0.5 text-xs">Проект</span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 border-b pb-2 text-sm text-gray-500">
        <div className="col-span-4">Задачи</div>
        <div className="col-span-1">Исполнители</div>
        <div className="col-span-2">Команды</div>
        <div className="col-span-2">Процент выполнения</div>
        <div className="col-span-1">Статус</div>
        <div className="col-span-2">Тип</div>
      </div>

      {/* Table Content */}
      <div className="mt-2 space-y-1">
        {/* Completed Task */}
        <div className="grid grid-cols-12 gap-4 py-2 items-center hover:bg-gray-50 rounded-md">
          <div className="col-span-4 flex items-center">
            <input type="checkbox" className="mr-2" checked readOnly />
            <span className="text-gray-400 line-through">
              Редизайн экрана покупок
            </span>
          </div>
          <div className="col-span-1">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                ИИ
              </div>
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                ТК
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex items-center">
              <span className="mr-1">@</span>Личные
            </span>
          </div>
          <div className="col-span-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
          <div className="col-span-1">
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
              Готово
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-sm">Проект</span>
          </div>
        </div>

        {/* In Progress Task */}
        <div className="grid grid-cols-12 gap-4 py-2 items-center hover:bg-gray-50 rounded-md">
          <div className="col-span-4 flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Редизайн главной страницы</span>
          </div>
          <div className="col-span-1">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
              АС
            </div>
          </div>
          <div className="col-span-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex items-center">
              <span className="mr-1">@</span>Личные
            </span>
          </div>
          <div className="col-span-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
          <div className="col-span-1">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
              В процессе
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-sm">Проект</span>
          </div>
        </div>

        {/* On Hold Task */}
        <div className="grid grid-cols-12 gap-4 py-2 items-center hover:bg-gray-50 rounded-md">
          <div className="col-span-4 flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Активация вовлеченности</span>
          </div>
          <div className="col-span-1">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              АБ
            </div>
          </div>
          <div className="col-span-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex items-center">
              <span className="mr-1">@</span>Личные
            </span>
          </div>
          <div className="col-span-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-500 h-2 rounded-full"
                style={{ width: "30%" }}
              ></div>
            </div>
          </div>
          <div className="col-span-1">
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
              На паузе
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-sm">Проект</span>
          </div>
        </div>

        {/* Upcoming Birthdays Section */}
        <div className="mt-8 mb-4">
          <h2 className="text-xl font-semibold mb-4">
            Предстоящие дни рождения
          </h2>

          {upcomingBirthdays && upcomingBirthdays.length > 0 ? (
            <div className="space-y-2">
              {upcomingBirthdays.map((contact) => (
                <div
                  key={contact.id}
                  className="grid grid-cols-12 gap-4 py-2 items-center hover:bg-gray-50 rounded-md"
                >
                  <div className="col-span-4 flex items-center">
                    <Gift className="mr-2 h-4 w-4 text-pink-500" />
                    <span>
                      {contact.name.split(" ").length > 1
                        ? contact.name.split(" ").slice(1).join(" ") +
                          " " +
                          contact.name.split(" ")[0]
                        : contact.name}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-gray-500">
                      {formatMonthDay(contact.birth_date)}
                    </span>
                  </div>
                  <div className="col-span-5">
                    {contact.daysUntil === 0 ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="mr-1 h-4 w-4" /> Сегодня!
                      </span>
                    ) : contact.daysUntil === 1 ? (
                      <span className="flex items-center text-orange-500 text-sm">
                        <Clock className="mr-1 h-4 w-4" /> Завтра
                      </span>
                    ) : (
                      <span className="flex items-center text-blue-600 text-sm">
                        <AlertCircle className="mr-1 h-4 w-4" /> Через{" "}
                        {contact.daysUntil} дней
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Нет предстоящих дней рождения
              </h3>
              <p className="text-gray-600 mb-4">
                Добавьте контакты, чтобы отслеживать дни рождения
              </p>
              <Link href="/dashboard/contacts/new">
                <Button size="sm">Добавить первый контакт</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Telegram Status */}
        {telegramSettings ? (
          <div className="mt-8 p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-blue-600" />
                <span className="font-medium">Telegram подключен</span>
              </div>
              <Link href="/dashboard/telegram">
                <Button variant="outline" size="sm">
                  Управление настройками
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-gray-500" />
                <span className="font-medium">Telegram не подключен</span>
              </div>
              <Link href="/dashboard/telegram">
                <Button size="sm">Подключить Telegram</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
