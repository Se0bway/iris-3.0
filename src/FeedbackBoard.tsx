import { useEffect, useState } from "react";
import { loadFeedback, postFeedback, UX_BOARD, type FeedbackItem } from "./feedback";

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function FeedbackBoard({ variant = "panel" }: { variant?: "panel" | "page" }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let live = true;
    loadFeedback(UX_BOARD).then((list) => {
      if (live) setItems(list);
    });
    return () => {
      live = false;
    };
  }, []);

  const send = async () => {
    if (!body.trim()) {
      setNotice("의견을 입력해 주세요");
      return;
    }
    setBusy(true);
    setNotice("");
    const saved = await postFeedback(UX_BOARD, name, body);
    setBusy(false);
    if (!saved) {
      setNotice("의견을 저장하지 못했습니다");
      return;
    }
    setItems((s) => [saved, ...s.filter((x) => x.id !== saved.id)]);
    setBody("");
    setNotice("의견이 등록되었습니다");
  };

  return (
    <section className={`fb-board ${variant}`} aria-label="UI/UX 의견">
      <div className="fb-h">
        <b>UI/UX 의견</b>
        <span>이 프로토타입에 대해 자유롭게 남겨 주세요. 다른 방문자의 의견도 보입니다.</span>
      </div>
      <div className="fb-list">
        {items.length === 0 ? (
          <p className="fb-empty">아직 의견이 없습니다. 화면 구성, 흐름, 카피에 대해 남겨 주세요.</p>
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
          placeholder="이 프로토타입 UI/UX에 대한 의견"
          value={body}
          maxLength={800}
          rows={variant === "page" ? 5 : 4}
          onChange={(e) => setBody(e.target.value)}
        />
        {notice ? <p className="fb-notice">{notice}</p> : null}
        <button className="btn primary" type="button" disabled={busy} onClick={() => void send()}>
          의견 등록
        </button>
      </div>
    </section>
  );
}
