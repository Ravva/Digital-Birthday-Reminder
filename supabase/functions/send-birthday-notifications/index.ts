import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Define CORS headers at the top level
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Add Error interface
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

// Move function declarations to module level
const sendTelegramMessage = async (
  botToken: string,
  chatId: string,
  message: string,
) => {
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
};

const formatBirthdayMessage = (
  template: string,
  contact: Contact,
  daysUntilBirthday: number,
) => {
  let message = template;
  message = message.replace(/{{name}}/g, contact.name);
  message = message.replace(/{{days}}/g, daysUntilBirthday.toString());
  message = message.replace(/{{notes}}/g, contact.notes || "");
  return message;
};

const calculateDaysUntilBirthday = (birthDateStr: string): number => {
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
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export async function POST(req: NextRequest) {
  // First, verify the authorization header
  const authHeader = req.headers.get('authorization');
  const supabaseUrl = req.headers.get('x-supabase-url');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const serviceRoleKey = authHeader.split(' ')[1];

  if (!supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Missing Supabase URL header' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Create Supabase client with the provided credentials
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the connection by making a simple query
    const { data, error } = await supabase
      .from('contacts')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase authentication error:', error);
      return new Response(JSON.stringify({ error: 'Invalid API key or URL' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log("Starting birthday notifications check");

    // Get all active telegram settings with more detailed logging
    const { data: telegramSettings, error: settingsError } = await supabase
      .from("telegram_settings")
      .select("*")
      .eq("is_active", true);

    console.log("Telegram settings count:", telegramSettings?.length || 0);
    console.log("Settings error:", settingsError);

    if (settingsError) {
      throw settingsError;
    }

    if (!telegramSettings?.length) {
      console.log("No active telegram settings found");
      return new Response(JSON.stringify({ 
        message: "No active telegram settings found",
        success: true 
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    for (const settings of telegramSettings) {
      console.log(`Processing user ${settings.user_id} with bot token: ${settings.bot_token ? 'present' : 'missing'}`);
      
      if (!settings.bot_token) {
        console.log(`Skipping user ${settings.user_id} - no bot token`);
        continue;
      }

      // Test the bot token with a simple API call
      try {
        const testResponse = await fetch(
          `https://api.telegram.org/bot${settings.bot_token}/getMe`
        );
        const testData = await testResponse.json();
        console.log(`Bot test response:`, testData);
      } catch (error) {
        console.error(`Bot token test failed for user ${settings.user_id}:`, error);
      }

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

    return new Response(
      JSON.stringify({ 
        message: "Birthday notifications sent!",
        success: true 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in birthday notifications:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
