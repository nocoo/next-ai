import {
  type IncomingMessage,
  type ServerResponse,
  createServer,
} from "node:http";
import type {
  AiSettingsInput,
  AiSettingsReadonly,
  AiTestConfig,
} from "@nocoo/next-ai";

let state: AiSettingsReadonly = {
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  hasApiKey: false,
};
let apiKey = "";

function readJson<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? (JSON.parse(raw) as T) : ({} as T));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = req.url ?? "";
  const method = req.method ?? "GET";

  if (url === "/api/settings/ai" && method === "GET") {
    return sendJson(res, 200, state);
  }

  if (url === "/api/settings/ai" && method === "PUT") {
    const body = await readJson<Partial<AiSettingsInput>>(req);
    if (typeof body.apiKey === "string" && body.apiKey.length > 0) {
      apiKey = body.apiKey;
    }
    const { apiKey: _omit, ...rest } = body;
    state = { ...state, ...rest, hasApiKey: apiKey.length > 0 };
    return sendJson(res, 200, state);
  }

  if (url === "/api/settings/ai/test" && method === "POST") {
    const body = await readJson<AiTestConfig>(req);
    return sendJson(res, 200, {
      success: true,
      model: body.model,
      provider: body.provider,
    });
  }

  sendJson(res, 404, { error: "not found" });
});

const PORT = 5174;
server.listen(PORT, () => {
  console.log(`mock server listening on http://localhost:${PORT}`);
});
