import { getProviders } from "next-auth/react";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const providers = await getProviders();
    return NextResponse.json(providers || {});
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
