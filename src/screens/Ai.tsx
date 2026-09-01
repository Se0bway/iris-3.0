import { useMemo, useState } from "react";
import { homeGroups, pushNotices } from "../data";
import { draftMessage, messageTypeLabel } from "../lib";
import { useNav } from "../nav";
import { useConsults } from "../consult";
import type { MessageType } from "../types";
import { TopBar } from "../ui";
import { IconCopy, IconRefresh, IconSend } from "../icons";

const types: MessageType[] = [
  "followup",
  "newproduct",
  "repurchase",
  "birthday",
  "vip",
  "dormant",
];

export function MessageScreen() {
  const nav = useNav();
  const { list } = useConsults();
  const c = list.find((x) => x.id === nav.customerId) ?? list[0];
  const [type, setType] = useState<MessageType>(nav.messageType);
  const [seed, setSeed] = useState(0);
  const text = useMemo(() => {
    void seed;
    return draftMessage(c, type);
  }, [c, type, seed]);
  const segments = homeGroups
    .filter((g) => g.ids.includes(c.id))
    .map((g) => g.title);

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="AI 문구 자동생성" onBack={nav.back} />
      <div className="seg-label">반영된 세그먼트</div>
      <div className="filters" style={{ paddingTop: 0 }}>
        {(segments.length ? segments : [messageTypeLabel[type]]).map((s) => (
          <span className="chip on" key={s} style={{ pointerEvents: "none" }}>
            {s}
          </span>
        ))}
      </div>
      <div className="filters">
        {types.map((t) => (
          <button
            key={t}
            className={`chip ${type === t ? "on" : ""}`}
            type="button"
            onClick={() => setType(t)}
          >
            {messageTypeLabel[t]}
          </button>
        ))}
      </div>
      <div className="msg-wrap">
        <div className="msg-count">
          {text.length} / 1,000자
        </div>
        <div className="body">{text}</div>
      </div>
      <div className="btn-row">
        <button className="btn ghost" type="button" onClick={() => setSeed((n) => n + 1)}>
          <IconRefresh width={16} height={16} /> 다시 생성
        </button>
        <button
          className="btn primary"
          type="button"
          onClick={() => nav.setToast("문구를 복사했습니다. 카카오톡이나 문자에 붙여넣으세요.")}
        >
          <IconCopy width={16} height={16} /> 복사하기
        </button>
      </div>
      <div className="hint-box">
        복사한 문구는 카카오톡, 문자메시지 등 외부 앱에 붙여넣어 발송할 수 있습니다.
      </div>
    </div>
  );
}

function botReply(q: string) {
  if (/제품|설화수|헤라|재고/.test(q)) {
    return "본품 주문은 재고 확인 후 영업점 재고 또는 본사 발주로 진행합니다. 홈 → 주문 또는 업무에서 설화수 자음생크림 재고 6개를 확인할 수 있습니다.";
  }
  if (/보상|플랜|직급|인센/.test(q)) {
    return "직급은 카운셀러 → 프로1 → 프로2 → 시니어 → 마스터 → 수석마스터 → 그랜드마스터 순입니다. 현재 시니어이며 마스터 승급 달성률은 86%입니다. 마이오피스 → 직급 예상에서 확인할 수 있습니다.";
  }
  if (/미수|수금|입금/.test(q)) {
    return "뉴커머스는 판매와 수금이 분리됩니다. 미처리 가상계좌 18만원이 있습니다. 수금 등록 또는 입금내역에서 고객과 매칭하세요.";
  }
  if (/프로모션|판촉/.test(q)) {
    return "8월 자음생 체험키트와 헤라 쿠션 샘플이 진행 중입니다. 본품 주문·재고조회에서 수량을 확인하세요.";
  }
  if (/제도|업무|에딧|뷰티/.test(q)) {
    return "에딧샵·뷰티스퀘어는 링크모음에서 외부로 연결됩니다. 공지는 NEXT 게시판과 연동됩니다.";
  }
  return "뉴커머스 카운셀러는 고객을 발굴하고, 상담하고, 상품을 주문·판매한 뒤 수금과 미수까지 관리하는 1인 사업자입니다. 제품·제도·보상플랜·프로모션·미수를 물어보시면 됩니다.";
}

export function ChatScreen() {
  const nav = useNav();
  const [q, setQ] = useState("");
  const [log, setLog] = useState<{ who: "bot" | "me"; text: string }[]>([
    {
      who: "bot" as const,
      text: "안녕하세요. 뉴커머스 업무를 돕는 IRIS입니다. 제품, 제도, 보상플랜, 프로모션, 수금을 물어보세요.",
    },
  ]);

  const send = () => {
    const t = q.trim();
    if (!t) return;
    setLog((l) => [...l, { who: "me", text: t }, { who: "bot", text: botReply(t) }]);
    setQ("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <TopBar title="AI 챗봇" onBack={nav.back} />
      <div className="app-scroll">
        <div className="chat-log">
          {log.map((m, i) => (
            <div key={i} className={`bubble ${m.who}`}>
              {m.text}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-in">
        <input
          value={q}
          placeholder="업무를 물어보세요"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button type="button" onClick={send} aria-label="전송">
          <IconSend width={16} height={16} />
        </button>
      </div>
    </div>
  );
}

export function LinksScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <TopBar title="링크모음" onBack={nav.back} />
      <div className="pad">
        <div className="card list-card">
          <div className="row">
            <div className="meta">
              <b>뷰티스퀘어</b>
              <p>외부 링크 · 브랜드 콘텐츠</p>
            </div>
          </div>
          <div className="row">
            <div className="meta">
              <b>에딧샵</b>
              <p>외부 링크 · 디지털 모객 유입</p>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
          로컬 프로토타입에서는 실제 외부 사이트로 이동하지 않습니다.
        </p>
      </div>
    </div>
  );
}

export function BoardScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <TopBar title="게시판" onBack={nav.back} />
      <div className="banner">
        <b>8월 자음생 집중 운영</b>
        <p>재구매 도래 고객 우선 관리 · 8/31까지</p>
      </div>
      <div className="pad">
        <div className="card list-card">
          {[
            ["본사 · 필수", "9월 디바이스 마스터 교육 일정 안내", "2026-08-23"],
            ["본사 · 공지", "8월 자음생 집중 운영 · 재구매 고객 우선", "2026-08-21"],
            ["영업기획", "미수회전일 18일 이내 관리 요청", "2026-08-19"],
            ["상품", "진설 세트 재고 한정", "2026-08-18"],
          ].map(([t, s, d]) => (
            <div className="row" key={s}>
              <div className="meta">
                <b>{s}</b>
                <p>
                  {t} · {d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PushScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="Push 알림" onBack={nav.back} />
      <div className="pad">
        <div className="card list-card">
          {pushNotices.map((n) => (
            <button
              key={n.id}
              className={`push-row ${n.unread ? "unread" : ""}`}
              type="button"
              onClick={() => nav.setToast(n.body)}
            >
              <i className={n.unread ? "on" : ""} />
              <div className="meta">
                <span className="push-tag">{n.tag}</span>
                <b>{n.title}</b>
                <p>{n.body}</p>
                <em>{n.time}</em>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
