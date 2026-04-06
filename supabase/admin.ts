import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey } from "@/lib/env";

export function createAdminClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
}
