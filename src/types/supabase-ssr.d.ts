declare module "@supabase/ssr" {
  import { SupabaseClient, createClient } from "@supabase/supabase-js";

  export interface CookieOptions {
    name?: string;
    value?: string;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
  }

  export interface CookieMethods {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: CookieOptions): void;
    remove(name: string, options?: CookieOptions): void;
  }

  export interface CreateClientOptions {
    cookies: CookieMethods;
  }

  export function createServerClient(
    supabaseUrl: string,
    supabaseKey: string,
    options: CreateClientOptions,
  ): SupabaseClient;

  export function createBrowserClient(
    supabaseUrl: string,
    supabaseKey: string,
  ): SupabaseClient;
}
