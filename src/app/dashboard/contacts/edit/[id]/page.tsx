import ContactForm from "@/components/contacts/contact-form";
import { redirect } from "next/navigation";
import { createClient } from "../../../../../../supabase/server";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch the contact with explicit type checking
  const { data: contact, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !contact) {
    console.error("Error fetching contact:", error);
    return redirect("/dashboard/contacts");
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Редактировать контакт</h1>
      <ContactForm userId={user.id} contact={contact} />
    </main>
  );
}
