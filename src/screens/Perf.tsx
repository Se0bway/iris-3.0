import { useMemo, useState } from "react";
import { useConsults } from "../consult";
import { TODAY, closing, counselor, members, productSalesBase, products } from "../data";
import { custNo, krw, krwShort } from "../lib";
import { useNav } from "../nav";
import { IconChevron } from "../icons";
import type { ScreenId } from "../types";
import { AppHeader, TopBar } from "../ui";

type TabId = "customer" | "product" | "brand";

const todayY = Number(TODAY.slice(0, 4));
const todayM = Number(TODAY.slice(5, 7));

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function shiftMonth(y: number, m: number, delta: number) {
  const t = y * 12 + (m - 1) + delta;
  return { y: Math.floor(t / 12), m: (t % 12) + 1 };
}

function ymOf(y: number, m: number) {
  return `${y}-${pad2(m)}`;
}

function monthScale(y: number, m: number) {
  const ago = todayY * 12 + todayM - (y * 12 + m);
  return Math.max(0.42, 1 - ago * 0.08);
}

export function usePerfMonth() {
  const [y, setY] = useState(todayY);
  const [m, setM] = useState(todayM);
  const scale = monthScale(y, m);
  const atLatest = y === todayY && m === todayM;
  const move = (delta: number) => {
    const next = shiftMonth(y, m, delta);
    if (next.y * 12 + next.m > todayY * 12 + todayM) return;
    setY(next.y);
    setM(next.m);
  };
  return { y, m, ym: ymOf(y, m), scale, atLatest, move };
}

export function MonthBar({ y, m, atLatest, move }: { y: number; m: number; atLatest: boolean; move: (d: number) => void }) {
  return (
    <div className="perf-month">
      <button type="button" onClick={() => move(-1)} aria-label="이전 달">
        <IconChevron width={20} height={20} style={{ transform: "rotate(180deg)" }} />
      </button>
      <b>
        {y}. {pad2(m)}
      </b>
      <button type="button" onClick={() => move(1)} disabled={atLatest} aria-label="다음 달">
        <IconChevron width={20} height={20} />
      </button>
    </div>
  );
}

export function PerfScreen() {
  const nav = useNav();
  const items: { id: ScreenId; n: string; title: string; desc: string }[] = [
    { id: "perfMine", n: "1", title: "내 영업실적", desc: "고객별 · 상품별 · 브랜드별" },
    { id: "perfGroup", n: "2", title: "그룹원 실적", desc: "그룹원 판매금액" },
  ];
  const ranked = [...members].sort((a, b) => b.sales - a.sales);
  const mine = ranked.find((m) => m.name === counselor.name) ?? ranked[0];
  const rank = ranked.findIndex((m) => m.id === mine.id) + 1;
  const groupTotal = ranked.reduce((s, m) => s + m.sales, 0);
  const share = Math.round((mine.sales / groupTotal) * 100);
  const second = ranked.find((m) => m.id !== mine.id);
  const collectRate = Math.round((closing.collected / closing.customerSales) * 100);
  const monthLabel = `${todayM}월`;

  return (
    <div className="app-scroll">
      <AppHeader />
      <div className="home-title">
        <h3>영업실적</h3>
      </div>
      <div className="perf-report">
        <h4>{monthLabel} 간단 리포트</h4>
        <div className="kpi-grid" style={{ padding: 0, marginBottom: 12 }}>
          <div className="kpi">
            <div className="lbl">내 판매</div>
            <div className="val" style={{ fontSize: 16 }}>
              {krw(mine.sales)}
            </div>
          </div>
          <div className="kpi">
            <div className="lbl">그룹 판매</div>
            <div className="val" style={{ fontSize: 16 }}>
              {krw(groupTotal)}
            </div>
          </div>
        </div>
        <p>
          {mine.name}님 고객판매는 {krwShort(mine.sales)}원으로 그룹 {ranked.length}명 중 {rank}위입니다. 그룹 판매의 {share}%입니다.
        </p>
        <p>
          수금 {krwShort(closing.collected)}원(판매의 {collectRate}%), 미수 {krwShort(closing.unpaid)}원입니다.
          {second ? ` 그룹 2위는 ${second.name}(${second.rank}) ${krwShort(second.sales)}원입니다.` : ""}
        </p>
      </div>
      <div className="pad">
        <div className="card list-card">
          {items.map((it) => (
            <button key={it.id} className="row" type="button" onClick={() => nav.go(it.id)}>
              <div className="avatar">{it.n}</div>
              <div className="meta">
                <b>{it.title}</b>
                <p>{it.desc}</p>
              </div>
              <IconChevron />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PerfMineScreen() {
  const nav = useNav();
  const { list } = useConsults();
  const { y, m, ym, scale, atLatest, move } = usePerfMonth();
  const [tab, setTab] = useState<TabId>("customer");

  const productRows = useMemo(() => {
    return productSalesBase
      .map((row) => {
        const p = products.find((x) => x.id === row.id);
        if (!p) return null;
        const qty = Math.max(1, Math.round(row.qty * scale));
        return { id: p.id, brand: p.brand, name: p.name, qty, amount: qty * p.price };
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => b.amount - a.amount);
  }, [scale]);

  const brandRows = useMemo(() => {
    const map = new Map<string, { brand: string; qty: number; amount: number }>();
    for (const r of productRows) {
      const cur = map.get(r.brand) ?? { brand: r.brand, qty: 0, amount: 0 };
      cur.qty += r.qty;
      cur.amount += r.amount;
      map.set(r.brand, cur);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [productRows]);

  const customerRows = useMemo(() => {
    return list
      .filter((c) => !c.stopped)
      .map((c) => {
        const rows = c.ledger.filter((r) => r.date.startsWith(ym) && r.status !== "취소");
        const sales = rows.filter((r) => r.type === "sale").reduce((s, r) => s + r.amount, 0);
        const collected = rows.filter((r) => r.type === "collect").reduce((s, r) => s + r.amount, 0);
        const deposited = rows
          .filter((r) => r.type === "collect" && (r.status.includes("입금") || r.status.includes("가상")))
          .reduce((s, r) => s + r.amount, 0);
        if (!sales && !collected && !deposited) return null;
        const last = rows.map((r) => r.date).sort()[rows.length - 1] ?? ym;
        return { id: c.id, name: c.name, no: custNo(c.id), date: last, sales, collected, deposited };
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => b.sales - a.sales || a.no - b.no);
  }, [list, ym]);

  const salesTotal = productRows.reduce((s, r) => s + r.amount, 0);
  const collectTotal = Math.round(closing.collected * scale);
  const depositTotal = Math.round(closing.deposited * scale);

  return (
    <div className="app-scroll">
      <TopBar title="내 영업실적" onBack={() => nav.go("mypage")} />
      <MonthBar y={y} m={m} atLatest={atLatest} move={move} />
      <div className="perf-tabs">
        {(
          [
            ["customer", "고객별"],
            ["product", "상품별"],
            ["brand", "브랜드별"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} type="button" onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <SumCard sales={salesTotal} collected={collectTotal} deposited={depositTotal} />

      {tab === "customer" ? (
        <div className="pad" style={{ paddingTop: 0 }}>
          {customerRows.length === 0 ? (
            <p className="empty">이 달 실적이 있는 고객이 없습니다.</p>
          ) : (
            customerRows.map((c) => (
              <button
                key={c.id}
                className="perf-cust"
                type="button"
                onClick={() => nav.go("customer", { customerId: c.id })}
              >
                <div className="perf-cust-h">
                  <b>
                    {c.no} {c.name}
                  </b>
                  <span>{c.date}</span>
                </div>
                <div className="perf-sum-row">
                  <span>판매</span>
                  <b>{krw(c.sales)}</b>
                </div>
                <div className="perf-sum-row">
                  <span>수금</span>
                  <b>{krw(c.collected)}</b>
                </div>
                <div className="perf-sum-row">
                  <span>입금</span>
                  <b>{krw(c.deposited)}</b>
                </div>
              </button>
            ))
          )}
        </div>
      ) : null}
      {tab === "product" ? (
        <PerfTable
          head={["상품", "수량", "판매금액"]}
          rows={productRows.map((r) => [r.name, `${r.qty}개`, krw(r.amount)])}
        />
      ) : null}
      {tab === "brand" ? (
        <PerfTable
          head={["브랜드", "수량", "판매금액"]}
          rows={brandRows.map((r) => [r.brand, `${r.qty}개`, krw(r.amount)])}
        />
      ) : null}
    </div>
  );
}

export function PerfGroupScreen() {
  const nav = useNav();
  const { y, m, scale, atLatest, move } = usePerfMonth();
  const groupRows = useMemo(
    () =>
      members
        .map((mem) => ({
          ...mem,
          amount: Math.round(mem.sales * scale),
        }))
        .sort((a, b) => b.amount - a.amount),
    [scale]
  );
  const salesTotal = groupRows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="app-scroll">
      <TopBar title="그룹원 실적" onBack={() => nav.go("mypage")} />
      <MonthBar y={y} m={m} atLatest={atLatest} move={move} />
      <SumCard sales={salesTotal} />
      <PerfTable
        head={["그룹원", "직급", "판매금액"]}
        rows={groupRows.map((r) => [r.name, r.rank, krw(r.amount)])}
      />
    </div>
  );
}

export function SumCard({ sales, collected, deposited }: { sales: number; collected?: number; deposited?: number }) {
  return (
    <div className="perf-sum">
      <h4>총 합계</h4>
      <div className="perf-sum-row">
        <span>판매</span>
        <b>{krw(sales)}</b>
      </div>
      {collected != null ? (
        <div className="perf-sum-row">
          <span>수금</span>
          <b>{krw(collected)}</b>
        </div>
      ) : null}
      {deposited != null ? (
        <div className="perf-sum-row">
          <span>입금</span>
          <b>{krw(deposited)}</b>
        </div>
      ) : null}
    </div>
  );
}

export function PerfTable({ head, rows }: { head: [string, string, string]; rows: [string, string, string][] }) {
  return (
    <div className="pad" style={{ paddingTop: 0 }}>
      <div className="card list-card cust-list">
        <div className="cust-head perf-head">
          <span>{head[0]}</span>
          <span>{head[1]}</span>
          <span>{head[2]}</span>
        </div>
        {rows.map((r) => (
          <div className="perf-row" key={r.join("-")}>
            <span className="perf-name">{r[0]}</span>
            <span>{r[1]}</span>
            <span className="perf-amt">{r[2]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
