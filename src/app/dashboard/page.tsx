import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { Overview } from "../../components/dashboard/overview";
import { RecentContacts } from "../../components/dashboard/recent-contacts";
import { MonthlyDistribution } from "../../components/dashboard/monthly-distribution";
import { BirthdayCalendar } from "../../components/dashboard/birthday-calendar";
import { UpcomingBirthdays } from "../../components/dashboard/upcoming-birthdays";
import { NextBirthday } from "../../components/dashboard/next-birthday";
import { createClient } from "../../../supabase/server";

import { Tables } from "@/types/supabase";
import {
  Cake,
  Gift,
  Users,
  Bell,
  CalendarClock,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

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

  // Calculate contacts added in the last 30 days
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
    <>
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Панель управления
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего контактов
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalContacts}</div>
                <p className="text-xs text-muted-foreground">
                  +{recentContacts} за последние 30 дней
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm border-border/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Дней рождения в этом месяце
                </CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingBirthdays}</div>
                <p className="text-xs text-muted-foreground">
                  В ближайшие 30 дней
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm border-border/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Статус уведомлений
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Активны</div>
                <p className="text-xs text-muted-foreground">
                  Telegram бот подключен
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm border-border/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Следующий день рождения
                </CardTitle>
                <Cake className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <NextBirthday contacts={contacts || []} variant="compact" />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 bg-card/80 backdrop-blur-sm border-border/80">
              <CardHeader>
                <CardTitle>Статистика дней рождения</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview contacts={contacts || []} />
              </CardContent>
            </Card>
            <Card className="col-span-3 bg-card/80 backdrop-blur-sm border-border/80">
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
    </>
  );
}
