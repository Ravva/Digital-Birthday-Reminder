import TelegramSettingsForm from "@/components/telegram/telegram-settings-form";
import type { Tables } from "@/types/supabase";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function TelegramSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch existing telegram settings for the user
  const { data: telegramSettings, error } = await supabase
    .from("telegram_settings")
    .select("*")
    .eq("user_id", user?.id || "")
    .maybeSingle();

  if (error) {
    console.error("Error fetching telegram settings:", error);
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Интеграция с Telegram</h1>
      <TelegramSettingsForm
        userId={user.id}
        settings={telegramSettings as Tables<"telegram_settings"> | null}
      />
    </main>
  );
}
