export type FeedbackItem = { id: string; name: string; body: string; at: string };

const LS = "iris-feedback";

function localAll(): Record<string, FeedbackItem[]> {
  try {
    return JSON.parse(localStorage.getItem(LS) || "{}") as Record<string, FeedbackItem[]>;
  } catch {
    return {};
  }
}

function saveLocal(screen: string, items: FeedbackItem[]) {
  const all = localAll();
  all[screen] = items;
  localStorage.setItem(LS, JSON.stringify(all));
}

export async function loadFeedback(screen: string): Promise<FeedbackItem[]> {
  try {
    const res = await fetch(`/api/feedback?screen=${encodeURIComponent(screen)}`);
    if (res.ok) {
      const data = (await res.json()) as { items?: FeedbackItem[] };
      if (Array.isArray(data.items)) return data.items;
    }
  } catch {
    /* local */
  }
  return localAll()[screen] ?? [];
}

export async function postFeedback(screen: string, name: string, body: string): Promise<FeedbackItem | null> {
  const item: FeedbackItem = {
    id: `f-${Date.now()}`,
    name: name.trim() || "익명",
    body: body.trim(),
    at: new Date().toISOString(),
  };
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ screen, name: item.name, body: item.body }),
    });
    if (res.ok) {
      const data = (await res.json()) as { item?: FeedbackItem };
      return data.item ?? item;
    }
  } catch {
    /* local */
  }
  const next = [item, ...(localAll()[screen] ?? [])].slice(0, 200);
  saveLocal(screen, next);
  return item;
}
