import { getProviders } from "next-auth/react";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    const providers = await getProviders();
    return NextResponse.json(providers || {});
  } catch (error) {
    console.warn("Warning: Providers fetch failed during build time - this is expected");
    // Return empty providers object during build
    return NextResponse.json({});
  }
}
