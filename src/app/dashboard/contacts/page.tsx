import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import { Tables } from "@/types/supabase";
import { DataTable } from "@/components/contacts/data-table";
import { columns } from "@/components/contacts/columns";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import Link from "next/link";
import { AuthCheck } from "@/components/auth/auth-check";
import ContactImport from "@/components/contacts/contact-import";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ContactsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch contacts for the current user
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching contacts:", error);
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Контакты</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/contacts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Добавить контакт
            </Button>
          </Link>
        </div>
      </div>

      {contacts && contacts.length > 0 ? (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Список контактов</TabsTrigger>
            <TabsTrigger value="import">Импорт контактов</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <DataTable columns={columns} data={contacts as Tables<"contacts">[]} />
          </TabsContent>
          <TabsContent value="import">
            <ContactImport userId={user.id} />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="add">Добавить контакт</TabsTrigger>
            <TabsTrigger value="import">Импорт контактов</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <div className="text-center py-12 bg-card/80 rounded-lg border border-border/30 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Пока нет контактов
              </h3>
              <p className="text-muted-foreground mb-6">
                Добавьте свой первый контакт, чтобы начать получать напоминания
                о днях рождения.
              </p>
              <Link href="/dashboard/contacts/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Добавить первый контакт
                </Button>
              </Link>
            </div>
          </TabsContent>
          <TabsContent value="import">
            <ContactImport userId={user.id} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
