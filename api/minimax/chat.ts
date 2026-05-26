const DEFAULT_MINIMAX_API_URL = "https://api.minimaxi.com/v1/chat/completions";
const DEFAULT_MINIMAX_MODEL = "MiniMax-M2.7";

interface MiniMaxProxyRequest {
  model?: string;
  messages?: unknown;
  temperature?: number;
  max_completion_tokens?: number;
}

const json = (response: unknown, status = 200) => ({
  status,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  },
  body: JSON.stringify(response)
});

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    const result = json({ error: "Method not allowed" }, 405);
    res.setHeader("Content-Type", result.headers["Content-Type"]);
    res.setHeader("Cache-Control", result.headers["Cache-Control"]);
    res.status(result.status).send(result.body);
    return;
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    const result = json({ error: "MINIMAX_API_KEY is not configured on the server." }, 500);
    res.setHeader("Content-Type", result.headers["Content-Type"]);
    res.setHeader("Cache-Control", result.headers["Cache-Control"]);
    res.status(result.status).send(result.body);
    return;
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}) as MiniMaxProxyRequest;
  if (!Array.isArray(body.messages)) {
    const result = json({ error: "messages must be an array." }, 400);
    res.setHeader("Content-Type", result.headers["Content-Type"]);
    res.setHeader("Cache-Control", result.headers["Cache-Control"]);
    res.status(result.status).send(result.body);
    return;
  }

  const upstreamUrl = process.env.MINIMAX_API_URL || DEFAULT_MINIMAX_API_URL;
  const upstreamResponse = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: body.model || process.env.MINIMAX_MODEL || DEFAULT_MINIMAX_MODEL,
      messages: body.messages,
      temperature: body.temperature ?? 0.2,
      max_completion_tokens: body.max_completion_tokens ?? 900
    })
  });

  const text = await upstreamResponse.text();
  res.setHeader("Content-Type", upstreamResponse.headers.get("Content-Type") || "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.status(upstreamResponse.status).send(text);
}
