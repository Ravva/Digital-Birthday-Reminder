import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

interface ApiError {
  message: string;
}

interface Contact {
  id: string;
  name: string;
  birth_date: string;
  notes: string | null;
}

interface TelegramSettings {
  chat_id: string;
  bot_token: string | null;
  message_template: string;
  days_before: number;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

function formatBirthdayMessage(
  template: string,
  contact: Contact,
  daysUntilBirthday: number,
) {
  let message = template;
  message = message.replace(/{{name}}/g, contact.name);
  message = message.replace(/{{days}}/g, daysUntilBirthday.toString());
  message = message.replace(/{{notes}}/g, contact.notes || "");
  return message;
}

function calculateDaysUntilBirthday(birthDateStr: string): number {
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  const birthDateThisYear = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  if (birthDateThisYear < today) {
    birthDateThisYear.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = birthDateThisYear.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: telegramSettings, error: settingsError } = await supabase
      .from("telegram_settings")
      .select("*")
      .eq("is_active", true);

    if (settingsError) throw settingsError;

    if (!telegramSettings?.length) {
      return NextResponse.json({ 
        message: "No active telegram settings found",
        success: true 
      });
    }

    for (const settings of telegramSettings) {
      if (!settings.bot_token) continue;

      const { data: contacts, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", settings.user_id);

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError);
        continue;
      }

      for (const contact of contacts) {
        const daysUntilBirthday = calculateDaysUntilBirthday(contact.birth_date);

        if (daysUntilBirthday === 0 || daysUntilBirthday === settings.days_before) {
          const message = formatBirthdayMessage(
            settings.message_template,
            contact,
            daysUntilBirthday,
          );

          await sendTelegramMessage(
            settings.bot_token,
            settings.chat_id,
            message,
          );
        }
      }
    }

    return NextResponse.json({ 
      message: "Birthday notifications sent!",
      success: true 
    });
  } catch (error) {
    console.error("Error in birthday notifications:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}