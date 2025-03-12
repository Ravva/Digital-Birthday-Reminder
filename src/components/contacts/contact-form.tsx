"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/types/supabase";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Имя должно содержать минимум 2 символа.",
  }),
  birth_date: z.date({
    required_error: "Пожалуйста, выберите дату рождения.",
  }).nullable(),
  notes: z.string().optional(),
});

interface ContactFormProps {
  userId: string;
  contact?: Tables<"contacts">;
}

export default function ContactForm({ userId, contact }: ContactFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Initialize form with existing contact data if editing
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contact?.name || "",
      birth_date: contact?.birth_date
        ? new Date(contact.birth_date)
        : undefined,
      notes: contact?.notes || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (!values.birth_date) {
        throw new Error("Дата рождения обязательна");
      }

      if (contact) {
        const { error } = await supabase
          .from("contacts")
          .update({
            name: values.name,
            birth_date: values.birth_date.toISOString().split("T")[0],
            notes: values.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("contacts").insert({
          user_id: userId,
          name: values.name,
          birth_date: values.birth_date.toISOString().split("T")[0],
          notes: values.notes,
        });

        if (error) throw error;
      }

      router.push("/dashboard/contacts");
      router.refresh();
    } catch (error) {
      console.error("Error saving contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const onDateSelect = (date: Date | undefined) => {
    form.setValue("birth_date", date || null);
    setIsCalendarOpen(false); // закрываем календарь после выбора даты
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input placeholder="Иван Иванов" {...field} />
                </FormControl>
                <FormDescription>
                  Введите полное имя вашего контакта.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата рождения</FormLabel>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={onDateSelect}
                      disabled={(date: Date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Заметки (Необязательно)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Добавьте любую дополнительную информацию об этом контакте..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Добавьте любые заметки или напоминания об этом контакте.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? contact
                  ? "Обновление..."
                  : "Сохранение..."
                : contact
                  ? "Обновить контакт"
                  : "Сохранить контакт"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/contacts")}
            >
              Отмена
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
