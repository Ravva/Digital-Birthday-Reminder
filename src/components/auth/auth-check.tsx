"use client";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  // Since we're using Supabase auth directly, we don't need to check NextAuth session
  return <>{children}</>;
}
