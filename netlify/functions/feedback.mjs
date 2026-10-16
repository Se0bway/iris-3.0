import { getStore } from "@netlify/blobs";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json",
};

function clean(s, max) {
  return String(s ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  const store = getStore("iris-feedback");
  const screen =
    event.httpMethod === "GET"
      ? clean(event.queryStringParameters?.screen, 40)
      : "";

  if (event.httpMethod === "GET") {
    if (!screen) return { statusCode: 400, headers, body: JSON.stringify({ items: [] }) };
    const raw = await store.get(screen, { type: "json" });
    const items = Array.isArray(raw) ? raw.slice(0, 200) : [];
    return { statusCode: 200, headers, body: JSON.stringify({ items }) };
  }

  if (event.httpMethod === "POST") {
    let payload = {};
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false }) };
    }
    const id = clean(payload.screen, 40);
    const name = clean(payload.name, 20) || "익명";
    const body = clean(payload.body, 400);
    if (!id || !body) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false }) };
    }
    const prev = await store.get(id, { type: "json" });
    const list = Array.isArray(prev) ? prev : [];
    const item = { id: `f-${Date.now()}`, name, body, at: new Date().toISOString() };
    await store.setJSON(id, [item, ...list].slice(0, 200));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, item }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ ok: false }) };
}
