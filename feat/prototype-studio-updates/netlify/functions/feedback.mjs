import { getStore } from "@netlify/blobs";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json",
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers });
}

function clean(s, max) {
  return String(s ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers });
  }

  const store = getStore("iris-feedback");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const screen = clean(url.searchParams.get("screen"), 40);
    if (!screen) return json(400, { items: [] });
    const raw = await store.get(screen, { type: "json" });
    const items = Array.isArray(raw) ? raw.slice(0, 200) : [];
    return json(200, { items });
  }

  if (req.method === "POST") {
    let payload = {};
    try {
      payload = await req.json();
    } catch {
      return json(400, { ok: false });
    }
    const id = clean(payload.screen, 40);
    const name = clean(payload.name, 20) || "익명";
    const body = clean(payload.body, 400);
    if (!id || !body) return json(400, { ok: false });
    const prev = await store.get(id, { type: "json" });
    const list = Array.isArray(prev) ? prev : [];
    const item = { id: `f-${Date.now()}`, name, body, at: new Date().toISOString() };
    await store.setJSON(id, [item, ...list].slice(0, 200));
    return json(200, { ok: true, item });
  }

  return json(405, { ok: false });
};

export const config = {
  path: "/api/feedback",
};
