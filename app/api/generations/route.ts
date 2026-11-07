import { NextResponse } from "next/server";
import { generationRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = generationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generation request" }, { status: 400 });
  }

  return NextResponse.json(
    {
      error: "Generation provider is not configured yet",
      request: parsed.data,
    },
    { status: 503 },
  );
}
