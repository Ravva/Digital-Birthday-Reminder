import { redirect } from "next/navigation";
import { createClient } from "../../../../../supabase/server";
import DashboardNavbar from "@/components/dashboard-navbar";
import ContactForm from "@/components/contacts/contact-form";
import { AuthCheck } from "@/components/auth/auth-check";

export default async function NewContactPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Добавить новый контакт</h1>
      <ContactForm userId={user.id} />
    </main>
  );
}
