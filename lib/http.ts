import { NextResponse } from "next/server";

export function rejectCrossOrigin(request: Request) {
  const origin = request.headers.get("origin");
  let expectedOrigin: string;
  try {
    expectedOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin;
  } catch {
    return NextResponse.json({ error: "Application origin is not configured" }, { status: 503 });
  }
  if (!origin || origin !== expectedOrigin) {
    return NextResponse.json({ error: "Request origin is not allowed" }, { status: 403 });
  }
  return null;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
