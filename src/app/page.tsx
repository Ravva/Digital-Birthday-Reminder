import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to dashboard if authenticated, otherwise to sign-in
  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/sign-in");
  }

  // This will never be rendered
  return null;
}
