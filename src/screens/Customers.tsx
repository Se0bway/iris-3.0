import { useMemo, useState, type ReactNode } from "react";
import { TODAY } from "../data";
import { useConsults } from "../consult";
import { custNo, custType, formatDot, krw, levelLabel, statusLabel } from "../lib";
import { useNav } from "../nav";
import { IconBell, IconCake, IconCalendar, IconChat, IconChevron, IconHome, IconPhone, IconScan, IconSearch } from "../icons";
import type { Customer, MessageType, PointExpireLine } from "../types";
import { AppHeader, TopBar } from "../ui";

export { RegisterScreen } from "./Register";

const sorts = [
  { id: "buy", label: "구매 금액" },
  { id: "unpaid", label: "미수" },
  { id: "new", label: "등록일" },
  { id: "birthday", label: "생일" },
  { id: "points", label: "포인트 소멸" },
] as const;

type FilterId = (typeof sorts)[number]["id"];
type MoneySpan = "cur" | "prev" | "m3" | "m6";
type MonthSpan = 0 | 1 | 2;

const MONEY_OPTS = [
  ["cur", "당월"],
  ["prev", "전월"],
  ["m3", "최근 3개월"],
  ["m6", "최근 6개월"],
] as const;

const todayY = Number(TODAY.slice(0, 4));
const todayM = Number(TODAY.slice(5, 7));

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function addMonths(y: number, m: number, delta: number) {
  const t = y * 12 + (m - 1) + delta;
  return { y: Math.floor(t / 12), m: (t % 12) + 1 };
}

function ymKey(y: number, m: number) {
  return `${y}-${pad2(m)}`;
}

function addDaysIso(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

function liveSale(r: { type: string; status: string; date: string; amount: number }) {
  return r.type === "sale" && r.status !== "취소";
}

function salesBetween(c: Customer, start: string, end: string) {
  return c.ledger.filter((r) => liveSale(r) && r.date >= start && r.date <= end).reduce((s, r) => s + r.amount, 0);
}

function monthRange() {
  return { start: `${ymKey(todayY, todayM)}-01`, end: `${ymKey(todayY, todayM)}-31` };
}

function moneyRange(span: MoneySpan) {
  if (span === "cur") return monthRange();
  if (span === "prev") {
    const p = addMonths(todayY, todayM, -1);
    return { start: `${ymKey(p.y, p.m)}-01`, end: `${ymKey(p.y, p.m)}-31` };
  }
  const back = addMonths(todayY, todayM, span === "m3" ? -2 : -5);
  return { start: `${ymKey(back.y, back.m)}-01`, end: TODAY };
}

function moneyLabel(span: MoneySpan) {
  return MONEY_OPTS.find((o) => o[0] === span)?.[1] ?? "";
}

function buySales(c: Customer, span: MoneySpan) {
  const { start, end } = moneyRange(span);
  return salesBetween(c, start, end);
}

function remainingUnpaid(c: Customer, sale: Customer["ledger"][number]) {
  if (sale.status === "미수") return sale.amount;
  const collected = c.ledger.filter((r) => r.type === "collect" && r.date >= sale.date).reduce((s, r) => s + r.amount, 0);
  return Math.max(0, sale.amount - collected);
}

function unpaidRows(c: Customer, start: string, end: string) {
  return c.ledger.filter(
    (r) => liveSale(r) && r.status !== "수금완료" && r.date >= start && r.date <= end && remainingUnpaid(c, r) > 0
  );
}

function unpaidInRange(c: Customer, span: MoneySpan) {
  const { start, end } = moneyRange(span);
  return unpaidRows(c, start, end).reduce((s, r) => s + remainingUnpaid(c, r), 0);
}

function shiftYm(span: MonthSpan) {
  const t = addMonths(todayY, todayM, span);
  return ymKey(t.y, t.m);
}

function birthMonthOf(c: Customer) {
  return Number(c.birth.slice(5, 7));
}

function expireLinesOf(c: Customer): PointExpireLine[] {
  if (c.pointExpires?.length) return c.pointExpires;
  if (!c.pointsExpireAt) return [];
  return [
    {
      id: `${c.id}-ex`,
      expireAt: c.pointsExpireAt,
      amount: c.beautyPoints,
      kind: "구매적립",
      note: "소멸 예정 포인트",
    },
  ];
}

function expireLinesInMonth(c: Customer, ym: string) {
  return expireLinesOf(c)
    .filter((l) => l.expireAt.startsWith(ym))
    .sort((a, b) => a.expireAt.localeCompare(b.expireAt) || b.amount - a.amount);
}

function expireSumInMonth(c: Customer, ym: string) {
  return expireLinesInMonth(c, ym).reduce((s, l) => s + l.amount, 0);
}

function salesRows(c: Customer, start: string, end: string) {
  return c.ledger.filter((r) => liveSale(r) && r.date >= start && r.date <= end);
}

function shortType(c: Customer) {
  const t = custType(c);
  if (t.startsWith("통합")) return "통합";
  if (t.startsWith("닉네임")) return "닉네임";
  return "일반";
}

function bdayLabel(c: Customer) {
  const [, m, d] = c.birth.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function expireLabel(iso?: string) {
  if (!iso) return "";
  return `${Number(iso.slice(5, 7))}월 소멸`;
}

function chipHead(seg: FilterId) {
  if (seg === "buy") return "구매 금액";
  if (seg === "unpaid") return "미수";
  if (seg === "new") return "등록일";
  if (seg === "birthday") return "생일";
  if (seg === "points") return "소멸예정";
  return "";
}

function chipMeta(c: Customer, seg: FilterId, moneySpan: MoneySpan, ym: string) {
  if (seg === "buy") return krw(buySales(c, moneySpan));
  if (seg === "unpaid") {
    const v = unpaidInRange(c, moneySpan);
    return v ? krw(v) : "없음";
  }
  if (seg === "new") return formatDot(c.joinedAt);
  if (seg === "birthday") return bdayLabel(c);
  if (seg === "points") {
    const first = expireLinesInMonth(c, ym)[0];
    return (
      <>
        <em>{expireSumInMonth(c, ym).toLocaleString("ko-KR")}P</em>
        <em>{expireLabel(first?.expireAt)}</em>
      </>
    );
  }
  return null;
}

function chipSort(a: Customer, b: Customer, seg: FilterId, moneySpan: MoneySpan, ym: string) {
  if (seg === "new") return b.joinedAt.localeCompare(a.joinedAt);
  if (seg === "buy") return buySales(b, moneySpan) - buySales(a, moneySpan) || custNo(a.id) - custNo(b.id);
  if (seg === "unpaid") return unpaidInRange(b, moneySpan) - unpaidInRange(a, moneySpan) || custNo(a.id) - custNo(b.id);
  if (seg === "birthday") return a.birth.slice(5).localeCompare(b.birth.slice(5));
  if (seg === "points") {
    const da = expireLinesInMonth(a, ym)[0]?.expireAt ?? "";
    const db = expireLinesInMonth(b, ym)[0]?.expireAt ?? "";
    return da.localeCompare(db) || expireSumInMonth(b, ym) - expireSumInMonth(a, ym);
  }
  return custNo(a.id) - custNo(b.id);
}

function metricTitle(seg: FilterId) {
  if (seg === "buy") return "구매 금액";
  if (seg === "unpaid") return "미수";
  if (seg === "new") return "등록일";
  if (seg === "birthday") return "생일";
  if (seg === "points") return "포인트 소멸";
  return "내역";
}

function joinMinOf(customers: Customer[]) {
  return customers.length ? customers.reduce((m, c) => (c.joinedAt < m ? c.joinedAt : m), TODAY) : TODAY;
}

function StepperRow({
  label,
  value,
  onMinus,
  onPlus,
  minusOff,
  plusOff,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  minusOff?: boolean;
  plusOff?: boolean;
}) {
  return (
    <div className="range-row">
      <span>{label}</span>
      <div className="range-step">
        <button type="button" onClick={onMinus} disabled={minusOff} aria-label={`${label} 줄이기`}>
          −
        </button>
        <b>{value}</b>
        <button type="button" onClick={onPlus} disabled={plusOff} aria-label={`${label} 늘리기`}>
          +
        </button>
      </div>
    </div>
  );
}

function PeriodPicks<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="period-btns">
      {options.map(([id, label]) => (
        <button key={String(id)} className={`period-btn ${value === id ? "on" : ""}`} type="button" onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function RangeCard({ children }: { children: ReactNode }) {
  return (
    <div className="range-card">
      <span className="range-k">조회조건</span>
      {children}
    </div>
  );
}

function InfoCard({ rows }: { rows: [string, string][] }) {
  return (
    <div className="ex-card">
      {rows.map(([k, v]) => (
        <div className="ex-kv" key={k}>
          <span>{k}</span>
          <b>{v}</b>
        </div>
      ))}
    </div>
  );
}

function ChipMetricScreen({
  customer: c,
  seg,
  moneySpan,
  ym,
  onBack,
}: {
  customer: Customer;
  seg: FilterId;
  moneySpan: MoneySpan;
  ym: string;
  onBack: () => void;
}) {
  const range = moneyRange(moneySpan);
  const sales = salesRows(c, range.start, range.end);
  const unpaid = unpaidRows(c, range.start, range.end);
  const expires = expireLinesInMonth(c, ym);
  const period = moneyLabel(moneySpan);

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title={metricTitle(seg)} onBack={onBack} />
      <div className="pad">
        <div className="ex-who">
          <span className="cust-no">{custNo(c.id)}</span>
          <b>{c.name}</b>
          <i className="cust-kind">{shortType(c)}</i>
        </div>
        {seg === "points" ? (
          <>
            <p className="ex-sum">
              {Number(ym.slice(5, 7))}월 소멸 {expireSumInMonth(c, ym).toLocaleString("ko-KR")}P
            </p>
            {expires.length === 0 ? (
              <p className="empty">해당 월 소멸 내역이 없습니다.</p>
            ) : (
              expires.map((l) => (
                <div className="ex-card" key={l.id}>
                  <div className="ex-kv">
                    <span>소멸 예정일</span>
                    <b>{formatDot(l.expireAt)}</b>
                  </div>
                  <div className="ex-amt">{l.amount.toLocaleString("ko-KR")}P</div>
                  <div className="ex-kv">
                    <span>구분</span>
                    <b>{l.kind}</b>
                  </div>
                  <div className="ex-kv">
                    <span>내용</span>
                    <b>{l.note}</b>
                  </div>
                </div>
              ))
            )}
          </>
        ) : null}
        {seg === "buy" ? (
          <>
            <InfoCard rows={[[`${period} 구매`, krw(buySales(c, moneySpan))]]} />
            {sales.length === 0 ? (
              <p className="empty">해당 기간 판매 내역이 없습니다.</p>
            ) : (
              sales.map((r) => (
                <div className="ex-card" key={r.id}>
                  <div className="ex-kv">
                    <span>일자</span>
                    <b>{formatDot(r.date)}</b>
                  </div>
                  <div className="ex-amt">{krw(r.amount)}</div>
                  <div className="ex-kv">
                    <span>구분</span>
                    <b>판매</b>
                  </div>
                  <div className="ex-kv">
                    <span>내용</span>
                    <b>{r.product ?? r.status}</b>
                  </div>
                </div>
              ))
            )}
          </>
        ) : null}
        {seg === "unpaid" ? (
          <>
            <InfoCard rows={[[`${period} 미수`, unpaidInRange(c, moneySpan) ? krw(unpaidInRange(c, moneySpan)) : "없음"]]} />
            {unpaid.length === 0 ? (
              <p className="empty">해당 기간 미수 내역이 없습니다.</p>
            ) : (
              unpaid.map((r) => (
                <div className="ex-card" key={r.id}>
                  <div className="ex-kv">
                    <span>일자</span>
                    <b>{formatDot(r.date)}</b>
                  </div>
                  <div className="ex-amt">{krw(remainingUnpaid(c, r))}</div>
                  <div className="ex-kv">
                    <span>구분</span>
                    <b>{r.status}</b>
                  </div>
                  <div className="ex-kv">
                    <span>내용</span>
                    <b>{r.product ?? ""}</b>
                  </div>
                </div>
              ))
            )}
          </>
        ) : null}
        {seg === "new" ? <InfoCard rows={[["등록일", formatDot(c.joinedAt)]]} /> : null}
        {seg === "birthday" ? (
          <InfoCard
            rows={[
              ["생일", formatDot(c.birth)],
              ["나이", `${c.age}세`],
            ]}
          />
        ) : null}
      </div>
    </div>
  );
}

export function CustomersScreen() {
  const nav = useNav();
  const { list: customers } = useConsults();
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<FilterId>("buy");
  const [moneySpan, setMoneySpan] = useState<MoneySpan>("cur");
  const [monthSpan, setMonthSpan] = useState<MonthSpan>(0);
  const [custom, setCustom] = useState<{ dateStart: string; dateEnd: string } | null>(null);
  const [metricId, setMetricId] = useState<string | null>(null);

  const ym = shiftYm(monthSpan);
  const joinMin = joinMinOf(customers);
  const dateStart = custom?.dateStart ?? joinMin;
  const dateEnd = custom?.dateEnd ?? TODAY;

  const bumpDate = (which: "start" | "end", delta: number) => {
    const floor = joinMin;
    const capEnd = TODAY;
    let s = dateStart;
    let e = dateEnd;
    if (which === "start") {
      s = addDaysIso(s, delta);
      if (s < floor) s = floor;
      if (s > capEnd) s = capEnd;
      if (s > e) e = s;
    } else {
      e = addDaysIso(e, delta);
      if (e > capEnd) e = capEnd;
      if (e < floor) e = floor;
      if (e < s) s = e;
    }
    setCustom({ dateStart: s, dateEnd: e });
  };

  const list = useMemo(() => {
    const bdayM = Number(ym.slice(5, 7));
    return customers
      .filter((c) => {
        const hit =
          !q ||
          c.name.includes(q) ||
          c.phone.replace(/-/g, "").includes(q.replace(/-/g, "")) ||
          String(custNo(c.id)).includes(q.replace(/\D/g, "") || q);
        if (!hit) return false;
        if (seg === "new") return c.joinedAt >= dateStart && c.joinedAt <= dateEnd;
        if (seg === "birthday") return birthMonthOf(c) === bdayM;
        if (seg === "points") return expireLinesInMonth(c, ym).length > 0;
        return true;
      })
      .sort((a, b) => chipSort(a, b, seg, moneySpan, ym));
  }, [q, seg, customers, moneySpan, dateStart, dateEnd, ym]);

  const metricCustomer = metricId ? (customers.find((c) => c.id === metricId) ?? null) : null;
  if (metricCustomer) {
    return (
      <ChipMetricScreen
        customer={metricCustomer}
        seg={seg}
        moneySpan={moneySpan}
        ym={ym}
        onBack={() => setMetricId(null)}
      />
    );
  }

  const resetSort = (id: FilterId) => {
    setSeg(id);
    setMoneySpan("cur");
    setMonthSpan(0);
    setCustom(null);
  };

  return (
    <div className="app-scroll">
      <AppHeader />
      <div className="home-title" style={{ paddingBottom: 8 }}>
        <h3>고객</h3>
        <button className="reg-entry" type="button" onClick={() => nav.go("register", { name: "", phone: "" })}>
          신규 등록
        </button>
      </div>
      <div className="search cust-search">
        <IconSearch />
        <input
          placeholder="고객명, 고객번호, 연락처"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="sort-tabs">
        {sorts.map((f) => (
          <button key={f.id} className={seg === f.id ? "on" : ""} type="button" onClick={() => resetSort(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <RangeCard>
        {seg === "buy" || seg === "unpaid" ? (
          <PeriodPicks value={moneySpan} options={MONEY_OPTS} onChange={setMoneySpan} />
        ) : null}
        {seg === "new" ? (
          <>
            <StepperRow
              label="시작"
              value={formatDot(dateStart)}
              onMinus={() => bumpDate("start", -1)}
              onPlus={() => bumpDate("start", 1)}
              minusOff={dateStart <= joinMin}
              plusOff={dateStart >= TODAY}
            />
            <StepperRow
              label="종료"
              value={formatDot(dateEnd)}
              onMinus={() => bumpDate("end", -1)}
              onPlus={() => bumpDate("end", 1)}
              minusOff={dateEnd <= joinMin}
              plusOff={dateEnd >= TODAY}
            />
          </>
        ) : null}
        {seg === "birthday" || seg === "points" ? (
          <PeriodPicks
            value={monthSpan}
            options={
              [
                [0, "이번달"],
                [1, "다음달"],
                [2, "다다음달"],
              ] as const
            }
            onChange={setMonthSpan}
          />
        ) : null}
      </RangeCard>
      <div className="pad cust-count">{list.length}명</div>
      <div className="pad">
        <div className="card list-card cust-list">
          <div className="cust-head">
            <span className="cust-no">번호</span>
            <span className="who">이름</span>
            <span className="cust-type">{chipHead(seg)}</span>
          </div>
          {list.map((c) => (
            <div key={c.id} className="cust-row">
              <button className="cust-main" type="button" onClick={() => nav.go("customer", { customerId: c.id })}>
                <span className="cust-no">{custNo(c.id)}</span>
                <span className="who">
                  <span className="name-row">
                    <b>{c.name}</b>
                    <i className="cust-kind">{shortType(c)}</i>
                  </span>
                </span>
              </button>
              <button className="cust-metric" type="button" onClick={() => setMetricId(c.id)}>
                <span className="cust-metric-txt">{chipMeta(c, seg, moneySpan, ym)}</span>
                <IconChevron width={14} height={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomerScreen() {
  const nav = useNav();
  const { notesOf, list } = useConsults();
  const c = list.find((x) => x.id === nav.customerId) ?? list[0];
  const notes = [...notesOf(c.id)].sort((a, b) => noteTime(b.date).localeCompare(noteTime(a.date)));
  const [tab, setTab] = useState<"profile" | "buy" | "consult" | "point">("profile");
  const birthMd = c.birth.slice(5).replace("-", "/");
  const lastSale = [...c.ledger]
    .filter((r) => r.type === "sale")
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);
  const plcc = c.segments.includes("vip") || c.purchaseCount >= 10;
  const nick = c.family && !["미혼", "없음"].includes(c.family) ? c.family.split(",")[0] : null;
  const joinPath = c.timeline.find((t) => t.kind === "join")?.detail ?? "방문판매";
  const point = counselPoint(c, lastSale?.product, lastSale?.date, notes[0]);

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar
        title="목록"
        onBack={nav.back}
        right={
          <button className="icon-btn" type="button" onClick={() => nav.go("push")} aria-label="알림">
            <IconBell width={18} height={18} />
          </button>
        }
      />

      <div className="cd-hero">
        <div className="cd-id">
          <div>
            <div className="cd-name">
              <b>{c.name}</b>
              {nick ? <em>{nick}</em> : null}
              <span className="cd-bday">
                <IconCake width={12} height={12} /> {birthMd}
              </span>
            </div>
            <p>
              {c.age}세 · {custType(c)}
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
          <div className="cd-contact">
            <button className="tel" type="button" onClick={() => nav.setToast("전화 앱으로 연결됩니다")} aria-label="전화">
              <IconPhone width={18} height={18} />
            </button>
            <button type="button" onClick={() => nav.setToast("문자 앱으로 연결됩니다")} aria-label="문자">
              <IconChat width={18} height={18} />
            </button>
          </div>
        </div>
        <div className="cd-metrics">
          <button className="cd-points" type="button" onClick={() => setTab("point")}>
            <span>뷰티포인트</span>
            <b>{custType(c).startsWith("통합") ? `${c.beautyPoints.toLocaleString("ko-KR")}P` : "미가입"}</b>
          </button>
          <button className="cd-points" type="button" onClick={() => setTab("buy")}>
            <span>미수금액</span>
            <b className={c.unpaid ? "bad" : ""}>{c.unpaid ? krw(c.unpaid) : "없음"}</b>
          </button>
        </div>
        <div className="cd-acts">
          <button type="button" onClick={() => nav.go("sales", { customerId: c.id })}>
            판매/수금 등록
          </button>
          <button type="button" onClick={() => nav.go("skindiag", { customerId: c.id })}>
            AI 피부진단
          </button>
          <button
            type="button"
            onClick={() =>
              nav.go("message", {
                customerId: c.id,
                messageType: (c.diagnosisOffset != null ? "followup" : "repurchase") as MessageType,
              })
            }
          >
            AI 추천 메세지
          </button>
        </div>
      </div>

      <div className="cd-tabs">
        {(
          [
            ["profile", "프로필"],
            ["buy", "구매이력"],
            ["consult", "상담이력"],
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
            </div>
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
  const { list } = useConsults();
  const c = list.find((x) => x.id === nav.customerId) ?? list[0];
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

export function GuestSkinScreen() {
  const nav = useNav();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const scores = [
    { label: "수분", value: 42 },
    { label: "유분", value: 61 },
    { label: "탄력", value: 48 },
    { label: "색소", value: 55 },
  ];

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="피부진단" onBack={nav.back} />
      <div className="gs-hero">
        <img src="/logos/skindiag.png" alt="" />
        <h3>방문객 AI 피부진단</h3>
        <p>고객 등록 없이, 매장을 방문한 분을 바로 진단합니다.</p>
      </div>
      {!done ? (
        <div className="pad">
          <div className="gs-cam">
            <span>얼굴이 화면 안에 들어오게 안내하세요</span>
          </div>
          <div className="field">
            <label>이름 (선택)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="방문객 이름" />
          </div>
          <div className="field">
            <label>연락처 (선택)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" />
          </div>
          <button className="btn primary" type="button" onClick={() => setDone(true)}>
            <IconScan width={18} height={18} />
            진단 시작
          </button>
        </div>
      ) : (
        <div className="pad">
          <div className="gs-result">
            <b>{name || "방문객"} 진단 결과</b>
            <p>수분·탄력이 낮고 유분이 다소 높습니다. 장벽 케어 라인부터 제안하세요.</p>
          </div>
          <div className="dx-scores" style={{ margin: "0 0 12px" }}>
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
          <div className="gs-reco">
            <span>추천</span>
            <p>설화수 자음생크림 · 윤조에센스</p>
          </div>
          <button
            className="btn primary"
            type="button"
            onClick={() => nav.setToast("진단 결과를 카카오톡으로 공유했습니다")}
          >
            결과 공유
          </button>
          <button
            className="btn outline"
            style={{ marginTop: 8 }}
            type="button"
            onClick={() => nav.go("register", { name, phone })}
          >
            고객으로 등록
          </button>
        </div>
      )}
    </div>
  );
}

const TOPICS = ["피부상담", "재구매 상담", "방문상담", "클레임", "기타"];

export function NoteScreen() {
  const nav = useNav();
  const { addNote, list: customers } = useConsults();
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
