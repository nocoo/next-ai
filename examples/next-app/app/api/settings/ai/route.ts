import type { AiSettingsInput, AiSettingsReadonly } from "@nocoo/next-ai";
import { NextResponse } from "next/server";

let state: AiSettingsReadonly = {
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  hasApiKey: false,
};
let apiKey = "";

export async function GET() {
  return NextResponse.json(state);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Partial<AiSettingsInput>;
  if (typeof body.apiKey === "string" && body.apiKey.length > 0) {
    apiKey = body.apiKey;
  }
  const { apiKey: _omit, ...rest } = body;
  state = { ...state, ...rest, hasApiKey: apiKey.length > 0 };
  return NextResponse.json(state);
}
