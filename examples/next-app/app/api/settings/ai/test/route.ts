import type { AiTestConfig } from "@nocoo/next-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as AiTestConfig;
  return NextResponse.json({
    success: true,
    model: body.model,
    provider: body.provider,
  });
}
