// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/supabase-functions

import { createClient } from "@supabase/supabase-js";
import { serve } from "https://deno.land/std@0.217.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

  // Replace placeholders
  message = message.replace(/{{name}}/g, contact.name);
  message = message.replace(/{{days}}/g, daysUntilBirthday.toString());

  if (contact.notes) {
    message = message.replace(/{{notes}}/g, contact.notes);
  } else {
    message = message.replace(/{{notes}}/g, "");
  }

  return message;
}

function calculateDaysUntilBirthday(birthDateStr: string): number {
  const today = new Date();
  const birthDate = new Date(birthDateStr);

  // Set birth date to current year
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

  return diffDays;
}

serve(async (req: Request) => {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting birthday notifications check");

    // Get all active telegram settings
    const { data: telegramSettings, error: settingsError } = await supabase
      .from("telegram_settings")
      .select("*")
      .eq("is_active", true);

    console.log("Active telegram settings:", telegramSettings);

    if (settingsError) {
      console.error("Error fetching telegram settings:", settingsError);
      throw settingsError;
    }

    for (const settings of telegramSettings) {
      console.log(`Processing settings for user ${settings.user_id}`);
      
      // Get contacts for this user
      const { data: contacts, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", settings.user_id);

      console.log(`Found ${contacts?.length || 0} contacts for user ${settings.user_id}`);

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError);
        continue;
      }

      // Process each contact
      for (const contact of contacts) {
        const daysUntilBirthday = calculateDaysUntilBirthday(contact.birth_date);
        console.log(`Contact ${contact.name}: ${daysUntilBirthday} days until birthday`);

        if (daysUntilBirthday === 0 || daysUntilBirthday === settings.days_before) {
          console.log(`Sending notification for ${contact.name}`);
          const message = formatBirthdayMessage(
            settings.message_template,
            contact,
            daysUntilBirthday,
          );

          // Send notification if bot token is available
          if (settings.bot_token) {
            const sendResult = await sendTelegramMessage(
              settings.bot_token,
              settings.chat_id,
              message,
            );
            console.log(`Notification sent for ${contact.name}:`, sendResult);
          } else {
            console.log(`No bot token configured for user ${settings.user_id}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in birthday notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
