"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/supabase";
import { InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "../../../supabase/client";

const formSchema = z.object({
  chat_id: z.string().min(1, {
    message: "Chat ID is required.",
  }),
  bot_token: z.string().optional().nullable(), // Change this line to allow null values
  notification_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM).",
  }),
  timezone: z.string(),
  days_before: z.coerce.number().int().min(0).max(30),
  message_template: z.string().min(1, {
    message: "Message template is required.",
  }),
  is_active: z.boolean().default(true),
});

interface TelegramSettingsFormProps {
  userId: string;
  settings: Tables<"telegram_settings"> | null;
}

export default function TelegramSettingsForm({
  userId,
  settings,
}: TelegramSettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");

  // Format time from database (e.g., "09:00:00" to "09:00")
  const formatTimeForInput = (timeString: string | undefined) => {
    if (!timeString) return "09:00";
    return timeString.substring(0, 5); // Extract HH:MM part
  };

  // Initialize form with existing settings data if available
  const form = useForm<z.infer<typeof formSchema>>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      chat_id: settings?.chat_id || "",
      bot_token: settings?.bot_token || "", // This will convert null to empty string
      notification_time: formatTimeForInput(
        settings?.notification_time ?? undefined,
      ),
      timezone: settings?.timezone || "GMT+3",
      days_before: settings?.days_before ?? 0,
      message_template:
        settings?.message_template || "Today is {{name}}'s birthday!",
      is_active: settings?.is_active ?? true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Define the type for updateData
      type UpdateData = {
        chat_id: string;
        bot_token: string | null;
        notification_time: string;
        days_before: number;
        message_template: string;
        is_active: boolean;
        updated_at: string;
        timezone?: string; // Make timezone optional
      };

      // Create the updateData object with the correct type
      const updateData: UpdateData = {
        chat_id: values.chat_id,
        bot_token: values.bot_token || null,
        notification_time: `${values.notification_time}:00`, // Add seconds
        days_before: values.days_before,
        message_template: values.message_template,
        is_active: values.is_active,
        updated_at: new Date().toISOString(),
      };

      // Now you can safely assign the timezone
      updateData.timezone = values.timezone;

      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from("telegram_settings")
          .update(updateData)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const insertData = {
          user_id: userId,
          ...updateData,
        };

        const { error } = await supabase
          .from("telegram_settings")
          .insert(insertData);

        if (error) throw error;
      }

      router.refresh();
      setTestStatus({ success: true, message: "Settings saved successfully!" });
    } catch (error) {
      console.error("Error saving telegram settings:", error);
      setTestStatus({ success: false, message: "Error saving settings." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function testConnection() {
    const values = form.getValues();
    if (!values.bot_token || !values.chat_id) {
      setTestStatus({
        success: false,
        message: "Bot token and chat ID are required for testing.",
      });
      return;
    }

    setTestStatus({ message: "Testing connection..." });

    try {
      // Call the Telegram API directly to test the connection
      const response = await fetch(
        `https://api.telegram.org/bot${values.bot_token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: values.chat_id,
            text: "🎂 Test message from BirthdayBot! Your connection is working.",
          }),
        },
      );

      const data = await response.json();

      if (data.ok) {
        setTestStatus({
          success: true,
          message: "Connection successful! Test message sent.",
        });
      } else {
        setTestStatus({
          success: false,
          message: `Error: ${data.description || "Unknown error"}.`,
        });
      }
    } catch (error) {
      console.error("Error testing Telegram connection:", error);
      setTestStatus({
        success: false,
        message: "Connection failed. Please check your credentials.",
      });
    }
  }

  async function previewMessageTemplate() {
    const template = form.getValues().message_template;

    try {
      // Получаем список контактов
      const { data: contacts, error } = await supabase
        .from("contacts")
        .select("name, notes, birth_date")
        .limit(1);

      if (error) throw error;

      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        let message = template;

        // Рассчитываем дни до дня рождения
        const today = new Date();
        const birthDate = new Date(contact.birth_date);
        const birthDateThisYear = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate(),
        );

        // Если день рождения уже прошел в этом году, устанавливаем на следующий год
        if (birthDateThisYear < today) {
          birthDateThisYear.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = birthDateThisYear.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Заменяем плейсхолдеры
        message = message.replace(/{{name}}/g, contact.name);
        message = message.replace(/{{days}}/g, daysUntil.toString());
        message = message.replace(/{{notes}}/g, contact.notes || "");

        setPreviewMessage(message);
        setPreviewOpen(true);
      } else {
        setPreviewMessage(
          "Не найдено контактов для предпросмотра. Добавьте хотя бы один контакт.",
        );
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error("Error previewing message:", error);
      setPreviewMessage("Ошибка при создании предпросмотра сообщения.");
      setPreviewOpen(true);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg border shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/10 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <InfoIcon className="h-4 w-4" />
              Как настроить интеграцию с Telegram:
            </h3>
            <ol className="ml-2 list-decimal space-y-1 pl-5 text-sm text-primary/90">
              <li>
                Начните чат с{" "}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline hover:text-primary/80"
                >
                  @BotFather
                </a>{" "}
                в Telegram
              </li>
              <li>
                Отправьте команду /newbot и следуйте инструкциям для создания
                нового бота
              </li>
              <li>
                Скопируйте API токен, предоставленный BotFather, и вставьте его
                ниже
              </li>
              <li>Начните чат с вашим новым ботом или добавьте его в группу</li>
              <li>
                Получите ваш ID чата, используя{" "}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline hover:text-primary/80"
                >
                  @userinfobot
                </a>{" "}
                и вставьте его ниже
              </li>
            </ol>
          </div>

          <FormField
            control={form.control}
            name="chat_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID чата</FormLabel>
                <FormControl>
                  <Input placeholder="123456789" {...field} />
                </FormControl>
                <FormDescription>
                  Ваш ID чата Telegram или ID группы, куда будут отправляться
                  уведомления.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bot_token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Токен бота</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="123456789:ABCdefGhIJKlmnOPQRstUVwxYZ"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Ваш токен бота Telegram от BotFather.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="default"
              onClick={testConnection}
              disabled={
                isSubmitting ||
                !form.getValues().bot_token ||
                !form.getValues().chat_id
              }
            >
              Проверить соединение
            </Button>
            {testStatus && (
              <div
                className={`text-sm ${testStatus.success ? "text-primary" : testStatus.success === false ? "text-destructive" : "text-muted-foreground"}`}
              >
                {testStatus.message}
              </div>
            )}
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Настройки уведомлений</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="notification_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Время уведомления</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Время дня для отправки уведомлений (24-часовой формат).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Часовой пояс</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="GMT-12">GMT-12</option>
                        <option value="GMT-11">GMT-11</option>
                        <option value="GMT-10">GMT-10</option>
                        <option value="GMT-9">GMT-9</option>
                        <option value="GMT-8">GMT-8</option>
                        <option value="GMT-7">GMT-7</option>
                        <option value="GMT-6">GMT-6</option>
                        <option value="GMT-5">GMT-5</option>
                        <option value="GMT-4">GMT-4</option>
                        <option value="GMT-3">GMT-3</option>
                        <option value="GMT-2">GMT-2</option>
                        <option value="GMT-1">GMT-1</option>
                        <option value="GMT+0">GMT+0</option>
                        <option value="GMT+1">GMT+1</option>
                        <option value="GMT+2">GMT+2</option>
                        <option value="GMT+3">GMT+3</option>
                        <option value="GMT+4">GMT+4</option>
                        <option value="GMT+5">GMT+5</option>
                        <option value="GMT+6">GMT+6</option>
                        <option value="GMT+7">GMT+7</option>
                        <option value="GMT+8">GMT+8</option>
                        <option value="GMT+9">GMT+9</option>
                        <option value="GMT+10">GMT+10</option>
                        <option value="GMT+11">GMT+11</option>
                        <option value="GMT+12">GMT+12</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Выберите ваш часовой пояс для уведомлений.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days_before"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Предварительное уведомление
                      <Popover>
                        <PopoverTrigger>
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <p className="text-sm">
                            Установите 0 для уведомлений только в день рождения.
                            Установите 1 или больше, чтобы также получать
                            предварительные уведомления за указанное количество
                            дней до события.
                          </p>
                        </PopoverContent>
                      </Popover>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="30" {...field} />
                    </FormControl>
                    <FormDescription>
                      Количество дней для отправки напоминания заранее (0-30).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message_template"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>Шаблон сообщения</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Сегодня день рождения у {{name}}!"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Настройте ваше поздравление. Используйте {"{{name}}"} для
                    имени человека, {"{{days}}"} для количества дней до дня
                    рождения и {"{{notes}}"} для любых заметок.
                  </FormDescription>
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="default"
                      onClick={previewMessageTemplate}
                    >
                      Проверить сообщение
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-6">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Включить уведомления
                    </FormLabel>
                    <FormDescription>
                      Включить или выключить уведомления о днях рождения.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="default"
            >
              {isSubmitting ? "Сохранение..." : "Сохранить настройки"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Отмена
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Предпросмотр сообщения</DialogTitle>
            <DialogDescription>
              Так будет выглядеть ваше сообщение в Telegram:
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4 mt-2 rounded-md border bg-muted p-4">
            <p className="whitespace-pre-wrap">{previewMessage}</p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="default"
              onClick={async () => {
                const values = form.getValues();
                if (!values.bot_token || !values.chat_id) {
                  alert(
                    "Необходимо указать токен бота и ID чата для отправки сообщения.",
                  );
                  return;
                }

                try {
                  const response = await fetch(
                    `https://api.telegram.org/bot${values.bot_token}/sendMessage`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        chat_id: values.chat_id,
                        text: previewMessage,
                        parse_mode: "HTML",
                      }),
                    },
                  );

                  const data = await response.json();

                  if (data.ok) {
                    alert("Сообщение успешно отправлено!");
                    setPreviewOpen(false);
                  } else {
                    alert(
                      `Ошибка при отправке: ${data.description || "Неизвестная ошибка"}`,
                    );
                  }
                } catch (error) {
                  console.error("Error sending message:", error);
                  alert(
                    "Ошибка при отправке сообщения. Проверьте консоль для деталей.",
                  );
                }
              }}
            >
              Отправить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
