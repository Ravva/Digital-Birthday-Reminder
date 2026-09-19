import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Contact {
  id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  notes: string | null;
}

interface TelegramSettings {
  user_id: string;
  chat_id: string;
  bot_token: string | null;
  message_template: string | null;
  days_before: number | null;
}

// MSK has no DST (UTC+3 year-round), but resolve via IANA name anyway.
const TIME_ZONE = "Europe/Moscow";

function mskToday(): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

// Days until next birthday, counting "today" (MSK) as 0.
function daysUntilBirthday(birthDateStr: string): number {
  const today = mskToday();
  const dateParts = birthDateStr.split("-").map(Number);
  const birthMonth = dateParts[1];
  const birthDay = dateParts[2];
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  let nextUtc = Date.UTC(today.year, birthMonth - 1, birthDay);
  if (nextUtc < todayUtc) {
    nextUtc = Date.UTC(today.year + 1, birthMonth - 1, birthDay);
  }
  return Math.round((nextUtc - todayUtc) / 86_400_000);
}

function formatBirthdayMessage(
  template: string,
  contact: Contact,
  daysUntilBirthday: number,
): string {
  return template
    .replace(/{{name}}/g, contact.name)
    .replace(/{{days}}/g, String(daysUntilBirthday))
    .replace(/{{notes}}/g, contact.notes ?? "");
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", errorData);
      return { success: false, error: errorData };
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return { success: false, error };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders, "Access-Control-Allow-Methods": "POST" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceRoleKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: "Function misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // pg_cron calls us with `Authorization: Bearer <service_role_key>`.
  if (req.headers.get("authorization") !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: telegramSettings, error: settingsError } = await supabase
      .from("telegram_settings")
      .select("user_id, chat_id, bot_token, message_template, days_before")
      .eq("is_active", true);

    if (settingsError) throw settingsError;

    if (!telegramSettings?.length) {
      return new Response(
        JSON.stringify({
          message: "No active telegram settings found",
          success: true,
          birthdaysFound: false,
          notificationsSent: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let birthdaysFound = false;
    let notificationsSent = false;
    let usersChecked = 0;
    let contactsChecked = 0;

    for (const settings of telegramSettings as TelegramSettings[]) {
      if (!settings.bot_token) continue;
      usersChecked++;

      const { data: contacts, error: contactsError } = await supabase
        .from("contacts")
        .select("id, name, birth_date, notes")
        .eq("user_id", settings.user_id);

      if (contactsError) {
        console.error(
          `Error fetching contacts for user ${settings.user_id}:`,
          contactsError,
        );
        continue;
      }

      for (const contact of (contacts ?? []) as Contact[]) {
        contactsChecked++;
        const days = daysUntilBirthday(contact.birth_date);

        if (days === 0 || days === (settings.days_before ?? 0)) {
          birthdaysFound = true;
          const message = formatBirthdayMessage(
            settings.message_template ?? "Today is {{name}}'s birthday!",
            contact,
            days,
          );
          const result = await sendTelegramMessage(
            settings.bot_token,
            settings.chat_id,
            message,
          );
          if (result.success) {
            notificationsSent = true;
            console.log(`Birthday notification sent for ${contact.name}`);
          } else {
            console.error(
              `Failed to send notification for ${contact.name}:`,
              result.error,
            );
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: birthdaysFound
          ? notificationsSent
            ? "Birthday notifications sent!"
            : "Birthdays found but notifications were not sent"
          : "No birthdays today",
        success: true,
        birthdaysFound,
        notificationsSent,
        usersChecked,
        contactsChecked,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in birthday notifications:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
