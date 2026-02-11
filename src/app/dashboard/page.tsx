import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "../../components/dashboard/overview";
import { UpcomingBirthdays } from "../../components/dashboard/upcoming-birthdays";
import { NextBirthday } from "../../components/dashboard/next-birthday";
import { createClient } from "../../../supabase/server";

import { Cake, Gift, Users, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Birthday reminder dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch contacts
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("name");

  // Fetch telegram settings
  const { data: telegramSettings } = await supabase
    .from("telegram_settings")
    .select("*")
    .eq("user_id", user?.id || "")
    .maybeSingle();

  // Calculate statistics
  const totalContacts = contacts?.length || 0;

  const recentContacts = contacts
    ? contacts.filter((contact) => {
      const createdDate = new Date(
        contact.created_at || contact.updated_at || new Date(),
      );
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length
    : 0;

  const upcomingBirthdays = contacts
    ? contacts.filter((contact) => {
      const birthDate = new Date(contact.birth_date);
      const today = new Date();
      const nextBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate(),
      );
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      const diffTime = nextBirthday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length
    : 0;

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Панель управления
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Обзор ваших контактов и предстоящих событий
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card animate-slide-up stagger-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего контактов
              </CardTitle>
              <div className="stat-icon">
                <Users />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContacts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{recentContacts} за последние 30 дней
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up stagger-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Дней рождения в этом месяце
              </CardTitle>
              <div className="stat-icon">
                <Gift />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBirthdays}</div>
              <p className="text-xs text-muted-foreground mt-1">
                В ближайшие 30 дней
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up stagger-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Статус уведомлений
              </CardTitle>
              <div className="stat-icon">
                <Bell />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Активны</div>
              <p className="text-xs text-muted-foreground mt-1">
                Telegram бот подключен
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up stagger-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Следующий день рождения
              </CardTitle>
              <div className="stat-icon">
                <Cake />
              </div>
            </CardHeader>
            <CardContent>
              <NextBirthday contacts={contacts || []} variant="compact" />
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 glass-card animate-fade-in">
            <CardHeader>
              <CardTitle>Статистика дней рождения</CardTitle>
              <CardDescription>
                Распределение по месяцам
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview contacts={contacts || []} />
            </CardContent>
          </Card>
          <Card className="col-span-3 glass-card animate-fade-in">
            <CardHeader>
              <CardTitle>Ближайшие дни рождения</CardTitle>
              <CardDescription>5 ближайших дней рождения</CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingBirthdays contacts={contacts || []} daysAhead={365} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
