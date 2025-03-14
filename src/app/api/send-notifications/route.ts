import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Add this line to explicitly set the allowed methods
export const dynamic = 'force-dynamic';

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

function isBirthdayToday(birthDateStr: string): boolean {
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  
  return today.getMonth() === birthDate.getMonth() && 
         today.getDate() === birthDate.getDate();
}

export async function POST(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = req.headers.get('x-supabase-url');

    // More detailed logging for debugging
    console.log('Auth check:', {
      receivedUrl: supabaseUrl,
      expectedUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAuthHeader: !!authHeader,
      headerFormat: authHeader?.startsWith('Bearer ') ? 'correct' : 'incorrect'
    });

    // Check if auth header exists and matches
    if (!authHeader || 
        !authHeader.startsWith('Bearer ') || 
        authHeader.split(' ')[1] !== process.env.SUPABASE_SERVICE_ROLE_KEY ||
        supabaseUrl !== process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { 
          error: "Invalid API key",
          details: "Authentication failed. Please check your credentials."
        },
        { status: 401 }
      );
    }

    // Get force parameter from URL
    const url = new URL(req.url);
    const forceCheck = url.searchParams.get('force') === 'true';
    
    console.log('Debug info:', {
      forceCheck,
      requestUrl: req.url,
      searchParams: Object.fromEntries(url.searchParams.entries())
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: telegramSettings, error: settingsError } = await supabase
      .from("telegram_settings")
      .select("*")
      .eq("is_active", true);

    if (settingsError) {
      console.error("Error fetching telegram settings:", settingsError);
      return NextResponse.json(
        { error: settingsError.message },
        { status: 500 }
      );
    }

    if (!telegramSettings?.length) {
      return NextResponse.json({ 
        message: "No active telegram settings found",
        success: true 
      });
    }

    let notificationsSent = false;
    let birthdaysFound = false;

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
        console.log('Processing contact:', {
          name: contact.name,
          birthDate: contact.birth_date,
          isBirthdayToday: isBirthdayToday(contact.birth_date)
        });

        if (isBirthdayToday(contact.birth_date)) {
          console.log('Birthday found for:', contact.name);
          birthdaysFound = true;
          
          const message = formatBirthdayMessage(
            settings.message_template,
            contact,
            0
          );

          const result = await sendTelegramMessage(
            settings.bot_token,
            settings.chat_id,
            message
          );

          if (result.success) {
            notificationsSent = true;
            console.log(`Birthday notification sent for ${contact.name}`);
          } else {
            console.error(`Failed to send notification for ${contact.name}:`, result.error);
          }
        }
      }
    }

    return NextResponse.json({ 
      message: birthdaysFound 
        ? (notificationsSent ? "Birthday notifications sent!" : "Birthdays found but notifications were not sent") 
        : "No birthdays today",
      success: true,
      birthdaysFound,
      notificationsSent
    });
  } catch (error) {
    console.error("Detailed error in birthday notifications:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Optionally, add an OPTIONS handler to properly handle CORS
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-supabase-url',
    },
  });
}
