import type { AiSettingsInput, AiSettingsReadonly } from "@nocoo/next-ai";
import { NextResponse } from "next/server";

const initialState: AiSettingsReadonly = {
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  hasApiKey: false,
};

type Bucket = { state: AiSettingsReadonly; apiKey: string };
const buckets = new Map<string, Bucket>();

function getBucket(req: Request): Bucket {
  const key = req.headers.get("x-test-bucket") ?? "default";
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { state: { ...initialState }, apiKey: "" };
    buckets.set(key, bucket);
  }
  return bucket;
}

export async function GET(req: Request) {
  return NextResponse.json(getBucket(req).state);
}

export async function PUT(req: Request) {
  const bucket = getBucket(req);
  const body = (await req.json()) as Partial<AiSettingsInput>;
  if (typeof body.apiKey === "string" && body.apiKey.length > 0) {
    bucket.apiKey = body.apiKey;
  }
  const { apiKey: _omit, ...rest } = body;
  bucket.state = {
    ...bucket.state,
    ...rest,
    hasApiKey: bucket.apiKey.length > 0,
  };
  return NextResponse.json(bucket.state);
}

export async function DELETE(req: Request) {
  const bucket = getBucket(req);
  bucket.state = { ...initialState };
  bucket.apiKey = "";
  return NextResponse.json(bucket.state);
}
