import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error);
    return redirect("/sign-in");
  }

  // Redirect to dashboard if authenticated, otherwise to sign-in
  if (user) {
    return redirect("/dashboard");
  }

  return redirect("/sign-in");
}
