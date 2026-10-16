import { useEffect, useState } from "react";
import { loadFeedback, postFeedback, type FeedbackItem } from "./feedback";
import { screenCatalog } from "./ia";
import { useNav } from "./nav";
import type { ScreenId } from "./types";

function titleOf(screen: ScreenId) {
  return screenCatalog.find((s) => s.screenId === screen)?.name ?? screen;
}

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function FeedbackSheet({
  screen,
  open,
  onClose,
}: {
  screen: ScreenId;
  open: boolean;
  onClose: () => void;
}) {
  const nav = useNav();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    loadFeedback(screen).then((list) => {
      if (live) setItems(list);
    });
    return () => {
      live = false;
    };
  }, [open, screen]);

  if (!open) return null;

  const send = async () => {
    if (!body.trim()) {
      nav.setToast("의견을 입력해 주세요");
      return;
    }
    setBusy(true);
    const saved = await postFeedback(screen, name, body);
    setBusy(false);
    if (!saved) {
      nav.setToast("의견을 저장하지 못했습니다");
      return;
    }
    setItems((s) => [saved, ...s.filter((x) => x.id !== saved.id)]);
    setBody("");
    nav.setToast("의견이 등록되었습니다");
  };

  return (
    <div className="fb-mask" onClick={onClose}>
      <div
        className="fb-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="화면 의견"
      >
        <div className="fb-h">
          <b>{titleOf(screen)} 의견</b>
          <button className="btn sm" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="fb-list">
          {items.length === 0 ? (
            <p className="fb-empty">아직 의견이 없습니다. 이 기능에 대해 남겨 주세요.</p>
          ) : (
            items.map((it) => (
              <div className="fb-item" key={it.id}>
                <span>
                  {it.name}
                  <em>{when(it.at)}</em>
                </span>
                <p>{it.body}</p>
              </div>
            ))
          )}
        </div>
        <div className="fb-form">
          <input
            placeholder="이름 (선택)"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="이 화면에 대한 의견"
            value={body}
            maxLength={400}
            rows={3}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="btn primary" type="button" disabled={busy} onClick={() => void send()}>
            의견 등록
          </button>
        </div>
      </div>
    </div>
  );
}
