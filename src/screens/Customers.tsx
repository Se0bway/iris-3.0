import { useMemo, useState } from "react";
import { customers } from "../data";
import { useConsults } from "../consult";
import { custType, formatDot, krw, levelLabel, segmentLabel, statusLabel, tendencyLabel } from "../lib";
import { useNav } from "../nav";
import type { Customer, MessageType, Segment } from "../types";
import { AppHeader, Photo, TopBar } from "../ui";
import {
  IconBell,
  IconCake,
  IconCalendar,
  IconHome,
  IconPhone,
  IconScan,
  IconSearch,
  IconSparkle,
  IconStar,
} from "../icons";

const filters: { id: "all" | Segment; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "new", label: "신규" },
  { id: "vip", label: "VIP" },
  { id: "repurchase", label: "재구매 도래" },
  { id: "churn", label: "이탈 위험" },
  { id: "consult", label: "상담 후 미구매" },
  { id: "birthday", label: "생일" },
];

export function CustomersScreen() {
  const nav = useNav();
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<(typeof filters)[number]["id"]>("all");
  const [sort, setSort] = useState<"recent" | "amount" | "name">("recent");

  const list = useMemo(() => {
    let rows = customers.filter((c) => {
      const hit =
        !q ||
        c.name.includes(q) ||
        c.phone.replace(/-/g, "").includes(q.replace(/-/g, ""));
      const s = seg === "all" || c.segments.includes(seg);
      return hit && s;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "amount") return b.totalAmount - a.totalAmount;
      if (sort === "name") return a.name.localeCompare(b.name, "ko");
      return (a.lastPurchaseDays ?? 999) - (b.lastPurchaseDays ?? 999);
    });
    return rows;
  }, [q, seg, sort]);

  return (
    <div className="app-scroll">
      <AppHeader />
      <div className="home-title" style={{ paddingBottom: 8 }}>
        <h3>고객</h3>
      </div>
      <div className="search">
        <IconSearch />
        <input
          placeholder="고객명, 연락처"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="filters">
        {filters.map((f) => (
          <button
            key={f.id}
            className={`chip ${seg === f.id ? "on" : ""}`}
            type="button"
            onClick={() => setSeg(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="pad" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{list.length}명</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          style={{ border: 0, background: "transparent", fontSize: 12, color: "var(--ap)", fontWeight: 600 }}
        >
          <option value="recent">최근 구매일</option>
          <option value="amount">구매금액</option>
          <option value="name">이름</option>
        </select>
      </div>
      <div className="pad">
        <div className="card list-card">
          {list.map((c) => (
            <button key={c.id} className="person" type="button" onClick={() => nav.go("customer", { customerId: c.id })}>
              <Photo id={c.id} name={c.name} size={46} gender={c.gender} />
              <span className="who">
                <span className="name-row">
                  <b>{c.name}</b>
                  <span className="tag">{custType(c)}</span>
                </span>
                <p className="sub">
                  {c.phone} · {c.lastPurchaseAt ? formatDot(c.lastPurchaseAt) : "미구매"}
                </p>
              </span>
              <span className="due-pill">{segmentLabel[c.segments[0]]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomerScreen() {
  const nav = useNav();
  const { notesOf } = useConsults();
  const c = customers.find((x) => x.id === nav.customerId) ?? customers[0];
  const notes = [...notesOf(c.id)].sort((a, b) => noteTime(b.date).localeCompare(noteTime(a.date)));
  const [tab, setTab] = useState<"profile" | "buy" | "consult" | "skin" | "point">("profile");
  const no = Number(c.id.replace(/\D/g, "")) || 1;
  const birthMd = c.birth.slice(5).replace("-", "/");
  const lastSale = [...c.ledger]
    .filter((r) => r.type === "sale")
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);
  const plcc = c.segments.includes("vip") || c.purchaseCount >= 10;
  const nick = c.family && !["미혼", "없음"].includes(c.family) ? c.family.split(",")[0] : null;
  const brands = [c.favoriteBrand].filter(Boolean);
  const concerns = c.skin.split(/[·,]/).map((s) => s.trim()).filter(Boolean);
  const joinPath = c.timeline.find((t) => t.kind === "join")?.detail ?? "방문판매";
  const scores = [
    { label: "수분", value: scoreFrom(c.id, 3) },
    { label: "유분", value: scoreFrom(c.id, 11, 22, 52) },
    { label: "탄력", value: scoreFrom(c.id, 19, 30, 50) },
    { label: "색소", value: scoreFrom(c.id, 29, 18, 46) },
  ];
  const point = counselPoint(c, lastSale?.product, lastSale?.date, notes[0]);

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar
        title="목록"
        onBack={nav.back}
        right={
          <div className="cd-top-right">
            <button className="icon-btn" type="button" onClick={() => nav.go("board")} aria-label="알림">
              <IconBell width={18} height={18} />
            </button>
            <button className="cd-ai-btn" type="button" onClick={() => nav.go("chat")}>
              <IconSparkle width={12} height={12} />
              스마트카운셀링AI
            </button>
          </div>
        }
      />

      <div className="cd-hero">
        <div className="cd-id">
          <Photo id={c.id} name={c.name} size={56} gender={c.gender} />
          <div>
            <div className="cd-name">
              <b>{c.name}</b>
              {nick ? <em>{nick}</em> : null}
              <span className="cd-bday">
                <IconCake width={12} height={12} /> {birthMd}
              </span>
            </div>
            <p>
              고객번호 {no}번 · {c.age}세 · {tendencyLabel[c.tendency]}
            </p>
            <div className="cd-flags">
              <span className={`badge ${c.purchaseProb === "high" ? "green" : c.purchaseProb === "medium" ? "amber" : "gray"}`}>
                구매가능성 {levelLabel[c.purchaseProb]}
              </span>
              <span className={`badge ${c.churnRisk === "high" ? "red" : c.churnRisk === "medium" ? "amber" : "green"}`}>
                위험도 {levelLabel[c.churnRisk]}
              </span>
              <span className={`badge ${plcc ? "blue" : "amber"}`}>{plcc ? "PLCC 발급" : "PLCC 미발급"}</span>
            </div>
          </div>
        </div>
        <div className="cd-acts">
          <button type="button" onClick={() => nav.go("sales", { customerId: c.id })}>
            판매/수금 등록
          </button>
          <button className="tel" type="button" onClick={() => nav.setToast("전화 앱으로 연결됩니다")}>
            전화
          </button>
          <button type="button" onClick={() => nav.setToast("문자 앱으로 연결됩니다")}>
            문자
          </button>
          <button type="button" onClick={() => nav.setToast("카카오톡으로 연결됩니다")}>
            카카오톡
          </button>
          <button
            className="on"
            type="button"
            onClick={() =>
              nav.go("message", {
                customerId: c.id,
                messageType: (c.diagnosisOffset != null ? "followup" : "repurchase") as MessageType,
              })
            }
          >
            메시지 생성
          </button>
        </div>
      </div>

      <div className="cd-tabs">
        {(
          [
            ["profile", "프로필"],
            ["buy", "구매이력"],
            ["consult", "상담이력"],
            ["skin", "피부진단"],
            ["point", "뷰티포인트"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} type="button" onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <div className="cd-body">
          <div className="cd-card">
            <div className="cd-grid">
              <div>
                <span>
                  <IconPhone width={14} height={14} /> 연락처
                </span>
                <b>{c.phone}</b>
              </div>
              <div>
                <span>
                  <IconHome width={14} height={14} /> 주소
                </span>
                <b>{c.address}</b>
              </div>
              <div>
                <span>
                  <IconSearch width={14} height={14} /> 유입경로
                </span>
                <b>{joinPath}</b>
              </div>
              <div>
                <span>
                  <IconCalendar width={14} height={14} /> 가입일
                </span>
                <b>{c.joinedAt}</b>
              </div>
              <div>
                <span>
                  <IconStar width={14} height={14} /> 선호 브랜드
                </span>
                <div className="chips">
                  {brands.map((b) => (
                    <span className="chip on" key={b} style={{ pointerEvents: "none" }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span>
                  <IconSparkle width={14} height={14} /> 피부고민
                </span>
                <div className="chips">
                  {concerns.map((b) => (
                    <span className="chip" key={b} style={{ pointerEvents: "none" }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="cd-card">
            <div className="cd-sec-h">
              <div className="cd-sec-title">
                <i>성향분석</i>
                <h4>{tendencyLabel[c.tendency]}</h4>
              </div>
            </div>
            <p className="cd-copy">{point.tendency}</p>
          </div>

          <div className="cd-card">
            <div className="cd-sec-h">
              <div className="cd-sec-title">
                <i>상담포인트</i>
              </div>
              {point.recent ? <div className="cd-recent">{point.recent}</div> : null}
            </div>
            <p className="cd-copy">
              <b>{point.hook}</b>
            </p>
            <p className="cd-copy">{point.body}</p>
            <p className="cd-warn">{point.caution}</p>
            <div className="cd-reco">
              <span>추천제품</span>
              <div className="chips">
                {c.interestProducts.map((p) => (
                  <span className="chip on" key={p} style={{ pointerEvents: "none" }}>
                    {c.favoriteBrand} {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "buy" ? (
        <div className="cd-body">
          <div className="cd-card">
            <div className="cd-kpi">
              <div>
                <span>누적 구매</span>
                <b>{krw(c.totalAmount)}</b>
              </div>
              <div>
                <span>구매 횟수</span>
                <b>{c.purchaseCount}회</b>
              </div>
              <div>
                <span>미수</span>
                <b className={c.unpaid ? "bad" : ""}>{c.unpaid ? krw(c.unpaid) : "없음"}</b>
              </div>
            </div>
            {c.ledger.length === 0 ? (
              <p className="empty">구매 이력이 없습니다.</p>
            ) : (
              [...c.ledger]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((r) => (
                <div className="log-item" key={r.id}>
                  <div className="d">{formatDot(r.date)}</div>
                  <b>
                    {r.type === "sale" ? "판매" : "수금"} {r.product ?? ""}
                  </b>
                  <p>
                    {krw(r.amount)} · {r.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {tab === "consult" ? (
        <div className="cd-body">
          <div className="cd-card">
            {notes.length === 0 ? (
              <p className="empty">상담 기록이 없습니다.</p>
            ) : (
              notes.map((n) => (
                <div className="log-item" key={n.id}>
                  <div className="d">{n.date.replace(/-/g, ".")}</div>
                  <b>{n.topic}</b>
                  <p>{n.body}</p>
                </div>
              ))
            )}
            <button className="btn primary" style={{ marginTop: 12 }} type="button" onClick={() => nav.go("note")}>
              상담일지 작성
            </button>
          </div>
        </div>
      ) : null}

      {tab === "skin" ? (
        <div className="cd-body">
          <div className="cd-card">
            <p className="cd-recent">최근 진단 {c.lastDiagnosis ?? formatDot(c.lastConsultAt)}</p>
            <p style={{ fontSize: 13, margin: "0 0 12px" }}>{c.skinDiagnosis}</p>
            {scores.map((s) => (
              <div className="dx-row" key={s.label}>
                <div className="lab">
                  <span>{s.label}</span>
                  <span>{s.value}</span>
                </div>
                <div className="dx-bar">
                  <i style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
            <button className="btn primary" style={{ marginTop: 16 }} type="button" onClick={() => nav.go("skindiag", { customerId: c.id })}>
              <IconScan width={16} height={16} />
              AI 피부진단 링크발송
            </button>
          </div>
        </div>
      ) : null}

      {tab === "point" ? (
        <div className="cd-body">
          <div className="cd-card">
            <div className="cd-kpi">
              <div>
                <span>보유 포인트</span>
                <b>{c.beautyPoints.toLocaleString("ko-KR")}P</b>
              </div>
            </div>
            {c.pointHistory.length === 0 ? (
              <p className="empty">포인트 내역이 없습니다.</p>
            ) : (
              c.pointHistory.map((p) => (
                <div className="log-item" key={p.id}>
                  <div className="d">{formatDot(p.date)}</div>
                  <b>{p.label}</b>
                  <p style={{ color: p.amount > 0 ? "var(--good)" : "var(--bad)" }}>
                    {p.amount > 0 ? "+" : ""}
                    {p.amount.toLocaleString("ko-KR")}P
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function counselPoint(
  c: Customer,
  lastProduct?: string,
  lastDate?: string,
  lastNote?: { date: string; topic: string; body: string }
) {
  const recent = lastProduct && lastDate ? `[최근구매] ${shortMd(lastDate)} ${lastProduct}` : "";
  const hook = "첫 30초에 요즘 잘 나가는 이유 한 줄과 고객님 피부에 좋은 포인트 한 줄만 전달하세요.";
  const tendCopy = {
    price: `가격과 용량을 먼저 보고, 샘플·소용량으로 효과를 확인한 뒤 본품을 결정하는 성향입니다. ${c.skin} 피부이며 ${statusLabel[c.status]}입니다. 부담 없는 옵션부터 보여주고 효과를 숫자로 설명해 주세요.`,
    trend: `신제품·유행 아이템에 반응이 빠른 편입니다. 긴 설명보다 샘플로 바로 느껴보는 쪽을 선호하니, 지금 잘 나가는 이유를 짧게 말한 뒤 피부 맞춤 포인트를 붙이세요. ${c.skin} 피부이며 ${statusLabel[c.status]}입니다.`,
    premium: `효과를 오래 유지하는 프리미엄 케어를 선호합니다. 루틴이 이미 있으니 시즌 교체와 탄력·보습 보완만 짚어 주세요. ${c.skin} 피부이며 ${statusLabel[c.status]}입니다.`,
    relationship: `관계와 신뢰를 우선합니다. 제품보다 안부·지난 상담을 먼저 떠올리고, 필요를 확인한 뒤에 권하세요. ${c.skin} 피부이며 ${statusLabel[c.status]}입니다.`,
  } as const;
  const snippet = lastNote ? lastNote.body.replace(/\.$/, "").slice(0, 42) : "";
  const lastTalk = lastNote
    ? `${shortMd(lastNote.date)} ${lastNote.topic} 상담에서 ‘${snippet}’ 관심이 있었습니다.`
    : "최근 상담 기록이 적습니다. 피부 상태부터 다시 여쭤보세요.";
  const body = `${lastTalk} 이번엔 ${c.skin} 고민에 맞춰 ${c.favoriteBrand} ${c.interestProducts[0] ?? "추천 라인"}으로 연결하세요. ${c.purpose}가 목적이니, 한 달 루틴으로 어떻게 쓰는지까지 보여 주면 전환이 쉽습니다.`;
  const caution = {
    price: "주의: 할인과 증정만 강조하지 마세요. 효과가 가격을 상쇄한다는 근거를 먼저 말하고, 소용량·체험부터 제안하세요.",
    trend: "주의: 본품을 권할 때는 호수·커버가 피부 톤과 맞는지 확인하고, 유행 컬러라는 이유만으로 권하지 마세요.",
    premium: "주의: 고가라는 이유로 밀어붙이지 마세요. 지금 쓰는 루틴에서 무엇이 부족한지만 짚고, 교체 타이밍을 제안하세요.",
    relationship: "주의: 재구매를 재촉하지 마세요. 지난번 사용감과 가족·기념일 맥락을 먼저 묻고, 필요한 양만 권하세요.",
  } as const;
  return { tendency: tendCopy[c.tendency], hook, body, caution: caution[c.tendency], recent };
}

function shortMd(date: string) {
  const p = date.replace(/\./g, "-").split("-");
  if (p.length >= 3) return `${p[0].slice(-2)}/${p[1]}/${p[2]}`;
  return date;
}

function noteTime(date: string) {
  return date.replace(/\./g, "-");
}

function scoreFrom(id: string, salt: number, min = 28, span = 48) {
  const n = [...id].reduce((s, ch) => s + ch.charCodeAt(0), salt);
  return min + (n % span);
}

export function SkinDiagScreen() {
  const nav = useNav();
  const c = customers.find((x) => x.id === nav.customerId) ?? customers[0];
  const scores = [
    { label: "수분", value: scoreFrom(c.id, 3) },
    { label: "유분", value: scoreFrom(c.id, 11, 22, 52) },
    { label: "탄력", value: scoreFrom(c.id, 19, 30, 50) },
    { label: "색소", value: scoreFrom(c.id, 29, 18, 46) },
  ];

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="AI 피부진단 링크발송" onBack={nav.back} />
      <div className="dx-hero">
        <Photo id={c.id} name={c.name} size={84} gender={c.gender} />
        <h3>{c.name}</h3>
        <p>
          최근 진단 {c.lastDiagnosis ?? formatDot(c.lastConsultAt)}
          <br />
          {c.skinDiagnosis}
        </p>
      </div>
      <div className="dx-scores">
        {scores.map((s) => (
          <div className="dx-row" key={s.label}>
            <div className="lab">
              <span>{s.label}</span>
              <span>{s.value}</span>
            </div>
            <div className="dx-bar">
              <i style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="dx-note">
        {c.skin} 타입입니다. {c.favoriteBrand} {c.interestProducts[0] ?? "추천 라인"} 중심으로 상담하면 전환 가능성이 높습니다.
      </div>
      <div className="pad">
        <button
          className="btn primary"
          type="button"
          onClick={() => nav.setToast("피부진단 링크를 발송했습니다. 카카오톡으로 전달됩니다.")}
        >
          <IconScan width={18} height={18} />
          링크 발송
        </button>
      </div>
    </div>
  );
}

const TOPICS = ["피부상담", "재구매 상담", "방문상담", "클레임", "기타"];

export function NoteScreen() {
  const nav = useNav();
  const { addNote } = useConsults();
  const [q, setQ] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [body, setBody] = useState("");

  const picked = customers.find((c) => c.id === pickedId) ?? null;
  const list = customers.filter(
    (c) => !q || c.name.includes(q) || c.phone.replace(/-/g, "").includes(q.replace(/-/g, ""))
  );

  const save = () => {
    if (!picked || !body.trim()) {
      nav.setToast("고객과 상담 내용을 입력해 주세요");
      return;
    }
    addNote(picked.id, topic, body.trim());
    nav.setToast("상담일지를 저장했습니다");
    nav.go("customer", { customerId: picked.id });
  };

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="상담일지 작성" onBack={nav.back} />
      {!picked ? (
        <>
          <div className="search">
            <IconSearch />
            <input placeholder="고객명, 연락처로 찾기" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <p className="note-hint">상담할 고객을 먼저 선택하세요</p>
          <div className="pad">
            <div className="card list-card">
              {list.map((c) => (
                <button key={c.id} className="person" type="button" onClick={() => setPickedId(c.id)}>
                  <Photo id={c.id} name={c.name} size={46} gender={c.gender} />
                  <span className="who">
                    <span className="name-row">
                      <b>{c.name}</b>
                      <span className="tag">{custType(c)}</span>
                    </span>
                    <p className="sub">{c.phone}</p>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="pad">
          <div className="picked-bar">
            <Photo id={picked.id} name={picked.name} size={44} gender={picked.gender} />
            <div>
              <b>{picked.name}</b>
              <p>{picked.phone}</p>
            </div>
            <button className="btn ghost sm" type="button" onClick={() => setPickedId(null)}>
              변경
            </button>
          </div>
          <div className="field">
            <label>상담 주제</label>
            <div className="topic-row">
              {TOPICS.map((t) => (
                <button key={t} className={`chip ${topic === t ? "on" : ""}`} type="button" onClick={() => setTopic(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>상담 내용</label>
            <textarea
              className="tall"
              placeholder="상담한 내용, 관심 제품, 다음 액션을 적어 주세요"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <button className="btn primary" type="button" onClick={save}>
            상담일지 저장
          </button>
        </div>
      )}
    </div>
  );
}
