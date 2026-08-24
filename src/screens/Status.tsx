import { closing, customers } from "../data";
import { krw } from "../lib";
import { useNav } from "../nav";
import { AppHeader, Badge, PersonRow, TopBar } from "../ui";

export function StatusScreen() {
  const nav = useNav();
  const items = [
    ["고객판매", krw(closing.customerSales)],
    ["그룹실적", krw(closing.groupSales)],
    ["수금", krw(closing.collected)],
    ["입금", krw(closing.deposited)],
    ["미수", krw(closing.unpaid)],
    ["주문", krw(closing.orders)],
  ] as const;

  return (
    <div className="app-scroll">
      <TopBar title="마감현황" onBack={nav.back} />
      <div className="pad">
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>직급조건</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <b>{closing.rankGoal}</b>
            <span>{closing.rankProgress}%</span>
          </div>
          <div className="progress">
            <i style={{ width: `${closing.rankProgress}%` }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
            미수회전일 {closing.rotationDays}일 · 현장 KPI
          </div>
        </div>
        <div className="kpi-grid" style={{ padding: 0 }}>
          {items.map(([l, v]) => (
            <div className="kpi" key={l}>
              <div className="lbl">{l}</div>
              <div className="val" style={{ fontSize: 15 }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pad">
        <div className="card list-card">
          <button className="row" type="button" onClick={() => nav.go("history")}>
            <div className="meta">
              <b>고객 판매이력</b>
              <p>고객별 판매 · 판수미</p>
            </div>
          </button>
          <button className="row" type="button" onClick={() => nav.go("plcc")}>
            <div className="meta">
              <b>PLCC</b>
              <p>발급 · 미발급 · 혜택</p>
            </div>
          </button>
          <button className="row" type="button" onClick={() => nav.go("points")}>
            <div className="meta">
              <b>뷰티포인트</b>
              <p>통합고객 · 소멸예정 · 선물하기</p>
            </div>
          </button>
          <button className="row" type="button" onClick={() => nav.go("anniversaries")}>
            <div className="meta">
              <b>기념일</b>
              <p>생일 · 결혼기념일</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function HistoryScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <TopBar title="고객 판매이력" onBack={nav.back} />
      <div className="pad">
        <div className="card list-card">
          {customers
            .filter((c) => c.purchaseCount > 0)
            .map((c) => (
              <PersonRow
                key={c.id}
                name={c.name}
                meta={`판매 ${krw(c.totalAmount)} · 미수 ${c.unpaid ? krw(c.unpaid) : "0원"}`}
                onClick={() => nav.go("customer", { customerId: c.id })}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export function PlccScreen() {
  const nav = useNav();
  const issued = customers.filter((c) => c.segments.includes("vip") || c.purchaseCount > 5);
  const notIssued = customers.filter((c) => !issued.includes(c));
  return (
    <div className="app-scroll">
      <TopBar title="PLCC" onBack={nav.back} />
      <div className="section">
        <div className="section-h">
          <h4>발급 고객 {issued.length}</h4>
        </div>
        <div className="card list-card">
          {issued.map((c) => (
            <PersonRow key={c.id} name={c.name} meta="PLCC 보유" right={<Badge tone="blue">발급</Badge>} />
          ))}
        </div>
      </div>
      <div className="section">
        <div className="section-h">
          <h4>미발급 고객 {notIssued.length}</h4>
        </div>
        <div className="card list-card">
          {notIssued.slice(0, 5).map((c) => (
            <PersonRow key={c.id} name={c.name} meta="혜택 안내 대상" right={<Badge>미발급</Badge>} />
          ))}
        </div>
      </div>
      <div className="notice">PLCC 혜택: 적립 우대 · 생일 바우처 · 방문 케어 우선</div>
    </div>
  );
}

export function PointsScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <TopBar title="뷰티포인트" onBack={nav.back} />
      <div className="pad">
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <div className="lbl" style={{ fontSize: 12, color: "var(--muted)" }}>
            소멸예정 포인트
          </div>
          <div className="big-num">24,800 P</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>9월 말 소멸 예정 · 대상 고객 4명</div>
        </div>
        <div className="card list-card">
          {customers
            .filter((c) => c.beautyPoints > 0)
            .map((c) => (
              <PersonRow
                key={c.id}
                name={c.name}
                meta={`${c.beautyPoints.toLocaleString()} P`}
                onClick={() => nav.go("customer", { customerId: c.id })}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export function AnniversaryScreen() {
  const nav = useNav();
  const rows = customers.flatMap((c) =>
    c.anniversaries.map((a) => ({ id: c.id + a.type, name: c.name, type: a.type, date: a.date, cid: c.id }))
  );
  return (
    <div className="app-scroll">
      <TopBar title="기념일" onBack={nav.back} />
      <div className="pad">
        <div className="card list-card">
          {rows.map((r) => (
            <PersonRow
              key={r.id}
              name={r.name}
              meta={`${r.type} · ${r.date}`}
              onClick={() => nav.go("customer", { customerId: r.cid })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
