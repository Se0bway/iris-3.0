import { useMemo, useRef, useState } from "react";
import { TODAY, closing, counselor, products, promos } from "../data";
import { custNo, krw } from "../lib";
import { useNav } from "../nav";
import { useConsults } from "../consult";
import { IconBack, IconChevron, IconDown, IconMenu, IconSearch } from "../icons";
import { AppHeader, TopBar } from "../ui";
import type { Customer, LedgerLine, LedgerRow, ScreenId } from "../types";

const stockQty = products.reduce((s, p) => s + p.stock, 0);
const stockAmt = products.reduce((s, p) => s + p.stock * p.price, 0);
const productBrands = ["전체", ...[...new Set(products.map((p) => p.brand))]];

function useCustomer(id: string) {
  const { list } = useConsults();
  return list.find((x) => x.id === id) ?? list[0];
}

export function WorkScreen() {
  const nav = useNav();
  const used = counselor.creditLimit - counselor.creditRemain;
  const items: { id: ScreenId; n: string; title: string; desc: string }[] = [
    { id: "order", n: "1", title: "본품 주문", desc: "재고 확인 후 발주" },
    { id: "orderLookup", n: "2", title: "주문조회", desc: "발주한 상품 · 확정 상태" },
    { id: "stock", n: "3", title: "재고조회", desc: "본인 재고 수량 · 가격합계" },
    { id: "deposit", n: "4", title: "가상계좌 입금내역", desc: "처리구분 · 상세보기 · 등록요청" },
  ];
  return (
    <div className="app-scroll">
      <AppHeader />
      <div className="home-title">
        <h3>주문/입금</h3>
      </div>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="lbl">여신한도</div>
          <div className="val" style={{ fontSize: 16 }}>
            {krw(counselor.creditLimit)}
          </div>
        </div>
        <div className="kpi">
          <div className="lbl">잔여한도</div>
          <div className="val" style={{ fontSize: 16 }}>
            {krw(counselor.creditRemain)}
          </div>
          <div className="sub">사용 {krw(used)}</div>
        </div>
        <div className="kpi">
          <div className="lbl">재고 수량</div>
          <div className="val">{stockQty}개</div>
        </div>
        <div className="kpi">
          <div className="lbl">재고금액</div>
          <div className="val" style={{ fontSize: 16 }}>
            {krw(stockAmt)}
          </div>
        </div>
      </div>
      <div className="notice">상담 후 판매가 예상되면 본인 재고와 한도를 확인한 뒤 주문합니다.</div>
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

export function TradeScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <AppHeader />
      <div className="home-title">
        <h3>판매 / 수금</h3>
      </div>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="lbl">고객판매</div>
          <div className="val" style={{ fontSize: 16 }}>
            {krw(closing.customerSales)}
          </div>
        </div>
        <div className="kpi">
          <div className="lbl">수금금액</div>
          <div className="val" style={{ fontSize: 16 }}>
            {krw(closing.collected)}
          </div>
        </div>
        <div className="kpi">
          <div className="lbl">미수</div>
          <div className="val" style={{ fontSize: 16 }}>
            {krw(closing.unpaid)}
          </div>
        </div>
        <div className="kpi">
          <div className="lbl">입금</div>
          <div className="val" style={{ fontSize: 16 }}>
            {krw(closing.deposited)}
          </div>
        </div>
      </div>
      <div className="pad">
        <div className="card list-card">
          {[
            { id: "tradeHistory" as const, n: "1", title: "판매/수금 내역", desc: "고객원장 · 전표조회 · 취소전표조회" },
            { id: "saleHistory" as const, n: "2", title: "판매이력", desc: "상품별 · 고객별 판매수량 · 판매금액" },
            { id: "sales" as const, n: "3", title: "판매", desc: "본인 재고에서 상품 판매" },
            { id: "collection" as const, n: "4", title: "수금", desc: "현금 · 카드 수금 등록" },
          ].map((it) => (
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

export function TradeHistoryScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <TopBar title="판매/수금 내역" onBack={nav.back} />
      <div className="pad">
        <div className="card list-card">
          {[
            { id: "ledger" as const, n: "1", title: "고객원장", desc: "일별 판매 · 수금 활동" },
            { id: "slips" as const, n: "2", title: "전표조회", desc: "고객별 판매 · 수금 전표" },
            { id: "cancelledSlips" as const, n: "3", title: "취소전표조회", desc: "취소된 판매 · 수금 전표" },
          ].map((it) => (
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

export function SlipsScreen() {
  return <TradeFlow kind="slips" title="전표조회" />;
}

export function CancelledSlipsScreen() {
  return <TradeFlow kind="cancelled" title="취소전표조회" />;
}

export function SalesScreen() {
  return <TradeFlow kind="sales" title="판매" />;
}

export function CollectionScreen() {
  return <TradeFlow kind="collection" title="수금" />;
}

function HistRange({
  from,
  to,
  onFrom,
  onTo,
  onApply,
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="ld-range">
      <input type="date" value={from} onChange={(e) => onFrom(e.target.value)} />
      <span>—</span>
      <input type="date" value={to} onChange={(e) => onTo(e.target.value)} />
      <button className="fill" type="button" onClick={onApply}>
        조회
      </button>
    </div>
  );
}

export function SaleHistoryScreen() {
  const nav = useNav();
  const { list } = useConsults();
  const defaultFrom = shiftMonth(TODAY, -1);
  const [tab, setTab] = useState<"product" | "customer">("product");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(TODAY);
  const [applied, setApplied] = useState({ from: defaultFrom, to: TODAY });
  const [q, setQ] = useState("");
  const [pickedProduct, setPickedProduct] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [slip, setSlip] = useState<LedgerRow | null>(null);

  const clearDrill = () => {
    setPickedProduct(null);
    setPickedId(null);
    setSlip(null);
  };

  const productRows = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        code: string;
        name: string;
        qty: number;
        amount: number;
        buyers: { id: string; name: string; qty: number; amount: number }[];
      }
    >();
    for (const c of list) {
      if (c.stopped) continue;
      for (const r of c.ledger) {
        if (r.type !== "sale" || r.status === "취소" || r.date < applied.from || r.date > applied.to) continue;
        for (const line of slipLines(r)) {
          const key = `${line.code}|${line.name}`;
          const cur = map.get(key) ?? { key, code: line.code, name: line.name, qty: 0, amount: 0, buyers: [] };
          cur.qty += line.qty;
          cur.amount += line.amount;
          const buyer = cur.buyers.find((b) => b.id === c.id);
          if (buyer) {
            buyer.qty += line.qty;
            buyer.amount += line.amount;
          } else {
            cur.buyers.push({ id: c.id, name: c.name, qty: line.qty, amount: line.amount });
          }
          map.set(key, cur);
        }
      }
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
  }, [list, applied]);

  const customerRows = useMemo(() => {
    const key = q.replace(/-/g, "");
    return list
      .filter((c) => !c.stopped)
      .map((c) => {
        const sales = c.ledger.filter(
          (r) => r.type === "sale" && r.status !== "취소" && r.date >= applied.from && r.date <= applied.to
        );
        if (!sales.length) return null;
        const items = sales.flatMap((r) => slipLines(r).map((line) => ({ row: r, line })));
        const qty = items.reduce((s, x) => s + x.line.qty, 0);
        const amount = items.reduce((s, x) => s + x.line.amount, 0);
        const last = [...sales.map((r) => r.date)].sort().at(-1) ?? "";
        return { c, qty, amount, last, items };
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .filter((x) => !q || x.c.name.includes(q) || x.c.phone.replace(/-/g, "").includes(key))
      .sort((a, b) => b.amount - a.amount);
  }, [list, applied, q]);

  const productFiltered = productRows.filter((p) => !q || p.name.includes(q) || p.code.includes(q));
  const productDetail = productRows.find((p) => p.key === pickedProduct) ?? null;
  const customerDetail = customerRows.find((x) => x.c.id === pickedId) ?? null;

  if (slip && customerDetail) {
    return <SlipDetail customer={customerDetail.c} row={slip} onBack={() => setSlip(null)} />;
  }

  if (productDetail) {
    const buyers = [...productDetail.buyers].sort((a, b) => b.amount - a.amount);
    return (
      <div className="app-scroll">
        <TopBar title="판매이력" onBack={() => setPickedProduct(null)} />
        <p className="ld-note">
          {productDetail.code} {productDetail.name} · {productDetail.qty}개 · {krw(productDetail.amount)}
        </p>
        {buyers.length === 0 ? (
          <p className="empty" style={{ padding: 12 }}>
            구매 고객이 없습니다.
          </p>
        ) : (
          buyers.map((b) => (
            <button
              className="sh-row"
              key={b.id}
              type="button"
              onClick={() => nav.go("ledger", { customerId: b.id })}
            >
              <p>{b.name}</p>
              <span>
                {b.qty}개 · {krw(b.amount)}
              </span>
            </button>
          ))
        )}
      </div>
    );
  }

  if (customerDetail) {
    return (
      <div className="app-scroll">
        <TopBar title={customerDetail.c.name} onBack={() => setPickedId(null)} />
        <p className="ld-note">
          {customerDetail.last} · {customerDetail.qty}개 · {krw(customerDetail.amount)} · 미수{" "}
          {customerDetail.c.unpaid ? krw(customerDetail.c.unpaid) : "없음"}
        </p>
        {customerDetail.items.map((x, i) => (
          <button className="sh-row" key={`${x.row.id}-${i}`} type="button" onClick={() => setSlip(x.row)}>
            <p>
              {x.line.code} {x.line.name}
            </p>
            <span>
              {x.row.date} · {x.line.qty}개 · {krw(x.line.amount)}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="app-scroll">
      <TopBar title="판매이력" onBack={nav.back} />
      <HistRange
        from={from}
        to={to}
        onFrom={setFrom}
        onTo={setTo}
        onApply={() => {
          setApplied({ from, to });
          clearDrill();
        }}
      />
      <div className="perf-tabs cols-2">
        <button className={tab === "product" ? "on" : ""} type="button" onClick={() => { setTab("product"); clearDrill(); setQ(""); }}>
          상품별
        </button>
        <button className={tab === "customer" ? "on" : ""} type="button" onClick={() => { setTab("customer"); clearDrill(); setQ(""); }}>
          고객별
        </button>
      </div>
      <div className="search">
        <IconSearch />
        <input
          placeholder={tab === "product" ? "상품명, 코드" : "고객명, 연락처"}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {tab === "product" ? (
        productFiltered.length === 0 ? (
          <p className="empty" style={{ padding: 12 }}>
            해당 기간 판매이력이 없습니다.
          </p>
        ) : (
          productFiltered.map((p) => (
            <button className="sh-row" key={p.key} type="button" onClick={() => setPickedProduct(p.key)}>
              <p>
                {p.code} {p.name}
              </p>
              <span>
                {p.qty}개 · {krw(p.amount)}
              </span>
            </button>
          ))
        )
      ) : customerRows.length === 0 ? (
        <p className="empty" style={{ padding: 12 }}>
          해당 기간 판매이력이 없습니다.
        </p>
      ) : (
        customerRows.map((x) => (
          <button className="sh-row" key={x.c.id} type="button" onClick={() => setPickedId(x.c.id)}>
            <p>
              {x.c.name}
              <em className="sh-date">{x.last}</em>
            </p>
            <span>
              {x.qty}개 · {krw(x.amount)} · 미수 {x.c.unpaid ? krw(x.c.unpaid) : "없음"}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

function shiftMonth(iso: string, months: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1 + months, d);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

type DayProd = { row: LedgerRow; line: LedgerLine; key: string };
type DayGroup = {
  date: string;
  rows: LedgerRow[];
  qty: number;
  saleAmt: number;
  coupon: number;
  points: number;
  collected: number;
  products: DayProd[];
};

function groupLedgerDays(c: Customer, from: string, to: string): DayGroup[] {
  const live = c.ledger.filter((r) => r.status !== "취소" && r.date >= from && r.date <= to);
  const dates = [...new Set(live.map((r) => r.date))].sort((a, b) => b.localeCompare(a));
  return dates.map((date) => {
    const rows = live.filter((r) => r.date === date);
    const sales = rows.filter((r) => r.type === "sale");
    const collects = rows.filter((r) => r.type === "collect");
    const products: DayProd[] = [];
    for (const r of sales) {
      slipLines(r).forEach((line, i) => products.push({ row: r, line, key: `${r.id}-${i}` }));
    }
    return {
      date,
      rows,
      qty: products.reduce((s, p) => s + p.line.qty, 0),
      saleAmt: products.reduce((s, p) => s + p.line.amount, 0),
      coupon: sales.reduce((s, r) => s + (r.coupon ?? 0), 0),
      points: sales.reduce((s, r) => s + (r.pointsEarn ?? 0) + (r.pointsUse ?? 0), 0),
      collected: collects.reduce((s, r) => s + r.amount, 0),
      products,
    };
  });
}

export function LedgerScreen() {
  const nav = useNav();
  const last = nav.stack[nav.stack.length - 1];
  const keepCustomer = last === "customer" || last === "saleHistory";
  const [pickedId, setPickedId] = useState<string | null>(() => (keepCustomer ? nav.customerId : null));

  if (!pickedId) {
    return <CustomerPick title="고객원장" onPick={setPickedId} onBack={nav.back} />;
  }

  return (
    <LedgerPage
      customerId={pickedId}
      onBack={keepCustomer ? nav.back : () => setPickedId(null)}
    />
  );
}

function LedgerPage({ customerId, onBack }: { customerId: string; onBack: () => void }) {
  const nav = useNav();
  const c = useCustomer(customerId);
  const defaultFrom = shiftMonth(TODAY, -1);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(TODAY);
  const [applied, setApplied] = useState({ from: defaultFrom, to: TODAY });
  const [shown, setShown] = useState(2);
  const [shareDate, setShareDate] = useState<string | null>(null);
  const [slip, setSlip] = useState<LedgerRow | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const days = useMemo(() => groupLedgerDays(c, applied.from, applied.to), [c, applied]);
  const visible = days.slice(0, shown);
  const shareDay = days.find((d) => d.date === shareDate) ?? null;

  if (slip) {
    return <SlipDetail customer={c} row={slip} onBack={() => setSlip(null)} />;
  }

  const openDaySlip = (day: DayGroup, row?: LedgerRow) => {
    const hit = row ?? day.rows.find((r) => r.type === "sale") ?? day.rows[0];
    if (hit) setSlip(hit);
  };

  const shareText = shareDay
    ? `[IRIS] ${c.name} 고객님 ${shareDay.date} 원장\n판매수량 ${shareDay.qty}개 · 판매금액 ${krw(shareDay.saleAmt)}\n수금 ${krw(shareDay.collected)} · 미수 ${c.unpaid ? krw(c.unpaid) : "없음"}`
    : "";

  return (
    <div className="app-scroll" ref={scroller}>
      <TopBar
        title="고객원장"
        onBack={onBack}
        right={
          <button className="icon-btn" type="button" aria-label="메뉴" onClick={() => nav.setToast("고객원장 메뉴")}>
            <IconMenu width={20} height={20} />
          </button>
        }
      />
      <div className="ld-metrics">
        <div>
          <span>뷰티포인트</span>
          <b>{c.beautyPoints.toLocaleString("ko-KR")}</b>
        </div>
        <div>
          <span>미수금</span>
          <b>{c.unpaid ? c.unpaid.toLocaleString("ko-KR") : "0"}</b>
        </div>
      </div>
      <div className="ld-acts">
        <button className="fill" type="button" onClick={() => nav.go("note", { customerId: c.id })}>
          메모등록
        </button>
        <button className="line" type="button" onClick={() => nav.go("slips", { customerId: c.id })}>
          전표조회
        </button>
      </div>
      <div className="ld-range">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span>—</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button
          className="fill"
          type="button"
          onClick={() => {
            setApplied({ from, to });
            setShown(2);
          }}
        >
          조회
        </button>
      </div>
      <p className="ld-note">
        ※ 일별 원장에는 5년 이상 무거래 고객의 미수금액이 노출되지 않으므로, 화면 오른쪽 상단의 &apos;미수금&apos; 확인 바랍니다.
      </p>
      {visible.length === 0 ? <p className="empty" style={{ padding: "12px" }}>해당 기간 원장이 없습니다.</p> : null}
      {visible.map((day) => (
        <section className="ld-day" key={day.date}>
          <div className="ld-day-h">
            <b>{day.date}</b>
            <button className="ld-share" type="button" onClick={() => setShareDate(day.date)}>
              공유하기
            </button>
          </div>
          <div className="ld-sec">판매상품 목록</div>
          <button className="ld-sum" type="button" onClick={() => openDaySlip(day)}>
            <span className="ld-sum-l">합계</span>
            <span className="ld-sum-r">
              <span>
                판매수량 <b>{day.qty}개</b>
              </span>
              <span>
                판매금액 <b>{krw(day.saleAmt)}</b>
              </span>
              <span>
                쿠폰 할인 <b>{krw(day.coupon)}</b>
              </span>
              <span>
                포인트 <b>{day.points.toLocaleString("ko-KR")}P</b>
              </span>
              <span>
                수금금액 <b>{krw(day.collected)}</b>
              </span>
              <span>
                미수금액 <b>{c.unpaid ? krw(c.unpaid) : "0원"}</b>
              </span>
            </span>
          </button>
          {day.products.map((p) => (
            <button className="ld-prod" key={p.key} type="button" onClick={() => openDaySlip(day, p.row)}>
              <p>
                {p.line.code} {p.line.name}
              </p>
              <span>
                가격 {krw(Math.abs(p.line.amount))} · 수량 {p.line.qty}개
              </span>
            </button>
          ))}
        </section>
      ))}
      {days.length > 0 ? (
        <div className="ld-foot">
          {shown < days.length ? (
            <button
              className="ld-more"
              type="button"
              onClick={() => setShown((n) => Math.min(n + 2, days.length))}
            >
              더보기 {Math.min(shown, days.length)}/{days.length}
            </button>
          ) : (
            <p className="ld-more">더보기 {days.length}/{days.length}</p>
          )}
          <button
            className="ld-top"
            type="button"
            onClick={() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" })}
          >
            맨위로
          </button>
        </div>
      ) : null}
      {shareDay ? (
        <div className="ld-mask" onClick={() => setShareDate(null)} role="presentation">
          <div className="ld-sheet" onClick={(e) => e.stopPropagation()} role="dialog">
            <b>{shareDay.date} 원장 공유</b>
            <p>{c.name} 고객에게 보내는 일별 원장입니다.</p>
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                nav.setToast("고객에게 일별 원장을 보냈습니다");
                setShareDate(null);
              }}
            >
              카카오톡
            </button>
            <button
              className="btn outline"
              type="button"
              onClick={() => {
                nav.setToast("고객에게 일별 원장을 보냈습니다");
                setShareDate(null);
              }}
            >
              문자
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(shareText);
                nav.setToast("복사됨");
                setShareDate(null);
              }}
            >
              복사
            </button>
            <button className="btn ghost" type="button" onClick={() => setShareDate(null)}>
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TradeFlow({
  kind,
  title,
  onExit,
}: {
  kind: "slips" | "cancelled" | "sales" | "collection";
  title: string;
  onExit?: () => void;
}) {
  const nav = useNav();
  const last = nav.stack[nav.stack.length - 1];
  const keepCustomer = last === "customer" || last === "ledger";
  const [pickedId, setPickedId] = useState<string | null>(() => (keepCustomer ? nav.customerId : null));
  const leave = onExit ?? nav.back;

  if (!pickedId) {
    return <CustomerPick title={title} onPick={setPickedId} onBack={leave} />;
  }

  const onBack = keepCustomer ? leave : () => setPickedId(null);
  if (kind === "slips") return <SlipsPage customerId={pickedId} onBack={onBack} cancelledOnly={false} />;
  if (kind === "cancelled") return <SlipsPage customerId={pickedId} onBack={onBack} cancelledOnly />;
  if (kind === "sales") return <SalesPage customerId={pickedId} onBack={onBack} />;
  return <CollectPage customerId={pickedId} onBack={onBack} />;
}

function CustomerPick({
  title,
  onPick,
  onBack,
}: {
  title: string;
  onPick: (id: string) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState("");
  const { list: people } = useConsults();
  const list = useMemo(() => {
    const key = q.replace(/-/g, "");
    return people.filter(
      (c) => !c.stopped && (!q || c.name.includes(q) || c.phone.replace(/-/g, "").includes(key))
    );
  }, [q, people]);

  return (
    <div className="app-scroll">
      <TopBar title={title} onBack={onBack} />
      <div className="search">
        <IconSearch />
        <input placeholder="고객명, 연락처" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="pad">
        <div className="card list-card">
          {list.length === 0 ? (
            <p className="empty">검색 결과가 없습니다.</p>
          ) : (
            list.map((c) => (
              <button key={c.id} className="person" type="button" onClick={() => onPick(c.id)}>
                <span className="who">
                  <span className="name-row">
                    <b>{c.name}</b>
                  </span>
                  <p className="sub">
                    {c.phone} · 미수 {c.unpaid ? krw(c.unpaid) : "없음"}
                  </p>
                </span>
                <IconChevron />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FlowSteps({ title, current }: { title: string; current: 1 | 2 | 3 }) {
  return (
    <div className="flow-steps">
      <b>{title}</b>
      <ol>
        {([1, 2, 3] as const).map((n) => (
          <li key={n} className={n === current ? "on" : ""}>
            {n}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CartBar({ qty, amount, onClear }: { qty: number; amount: number; onClear: () => void }) {
  return (
    <div className="cart-bar">
      <div>
        <p>수량합계 {qty}개</p>
        <p>금액합계 {krw(amount)}</p>
      </div>
      <button className="btn sm" type="button" onClick={onClear}>
        카트비우기
      </button>
    </div>
  );
}

function UnpaidBar({ customerId }: { customerId: string }) {
  const c = useCustomer(customerId);
  return (
    <div className="tr-unpaid">
      <div>
        <span>미수금액</span>
        <b>{c.unpaid ? krw(c.unpaid) : "없음"}</b>
      </div>
    </div>
  );
}

function slipLines(r: LedgerRow) {
  if (r.lines?.length) return r.lines;
  const hit = products.find((p) => r.product && (r.product.includes(p.name) || r.product.includes(p.brand)));
  return [
    {
      code: hit?.code ?? "—",
      name: r.product ?? (r.type === "sale" ? "판매" : "수금"),
      qty: 1,
      amount: r.amount,
    },
  ];
}

function slipIssuedAt(r: LedgerRow) {
  return r.issuedAt ?? `${r.date} 10:00:00`;
}

function SlipsPage({
  customerId,
  onBack,
  cancelledOnly,
}: {
  customerId: string;
  onBack: () => void;
  cancelledOnly: boolean;
}) {
  const c = useCustomer(customerId);
  const [slipId, setSlipId] = useState<string | null>(null);
  const rows = c.ledger.filter((r) => (cancelledOnly ? r.status === "취소" : r.status !== "취소"));
  const slip = rows.find((r) => r.id === slipId) ?? null;

  if (slip) {
    return <SlipDetail customer={c} row={slip} onBack={() => setSlipId(null)} />;
  }

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title={c.name} onBack={onBack} />
      <UnpaidBar customerId={c.id} />
      <div className="tr-card">
        <h4>{cancelledOnly ? "취소전표" : "전표"}</h4>
        {rows.length === 0 ? (
          <p className="tr-hint">{cancelledOnly ? "취소된 전표가 없습니다." : "최근 전표가 없습니다."}</p>
        ) : (
          rows.map((r) => (
            <button className="tr-prod" key={r.id} type="button" onClick={() => setSlipId(r.id)}>
              <div>
                <b>
                  {r.type === "sale" ? "판매" : "수금"}
                  {r.product ? ` · ${r.product}` : ""}
                </b>
                <span>
                  {r.date} · {r.status}
                </span>
              </div>
              <em className="tr-amt">{krw(r.amount)}</em>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function SlipDetail({
  customer,
  row,
  onBack,
}: {
  customer: Customer;
  row: LedgerRow;
  onBack: () => void;
}) {
  const { cancelSlip } = useConsults();
  const [open, setOpen] = useState(true);
  const [ask, setAsk] = useState(false);
  const sale = row.type === "sale";
  const cancelled = row.status === "취소";
  const lines = slipLines(row);
  const qty = lines.reduce((s, l) => s + l.qty, 0);
  const coupon = row.coupon ?? 0;
  const earn = row.pointsEarn ?? 0;
  const used = row.pointsUse ?? 0;

  return (
    <div className="slip-page">
      <header className="slip-head">
        <button type="button" onClick={onBack}>
          <IconBack width={20} height={20} />
          뒤로
        </button>
        <h2>전표 상세조회</h2>
        <span />
      </header>
      <div className="slip-scroll">
        <table className="slip-table">
          <tbody>
            <tr>
              <th>고객 정보</th>
              <td>
                {custNo(customer.id)} {customer.name}
              </td>
            </tr>
            <tr>
              <th>전표구분</th>
              <td>{sale ? "판매 전표" : "수금 전표"}</td>
            </tr>
            <tr>
              <th>전표 발행일</th>
              <td>{slipIssuedAt(row)}</td>
            </tr>
            <tr>
              <th>{sale ? "판매 정보" : "수금 정보"}</th>
              <td>
                {sale ? (
                  <>
                    <div>수량 : {qty} 개</div>
                    <div>금액 : {krw(row.amount)}</div>
                  </>
                ) : (
                  <div>금액 : {krw(row.amount)}</div>
                )}
              </td>
            </tr>
            <tr>
              <th>쿠폰 할인</th>
              <td>{krw(coupon)}</td>
            </tr>
            <tr>
              <th>적립/사용 뷰티포인트</th>
              <td>
                <div>적립 : {earn.toLocaleString("ko-KR")} P</div>
                <div>사용 : {used.toLocaleString("ko-KR")} P</div>
              </td>
            </tr>
            <tr>
              <th>현재미수</th>
              <td>{customer.unpaid ? krw(customer.unpaid) : "0원"}</td>
            </tr>
            <tr>
              <th>현재 뷰티포인트</th>
              <td>{customer.beautyPoints.toLocaleString("ko-KR")}P</td>
            </tr>
          </tbody>
        </table>
        <button className="slip-acc-h" type="button" onClick={() => setOpen((v) => !v)}>
          <span>{sale ? "판매 상세" : "수금 상세"}</span>
          <i className={open ? "open" : ""}>
            <IconDown width={16} height={16} />
          </i>
        </button>
        {open
          ? lines.map((l) => (
              <div className="slip-item" key={`${l.code}-${l.name}`}>
                <b>{l.code}</b>
                <p>{l.name}</p>
                <em>
                  {sale ? "판매수량" : "수량"} : {l.qty}개 | {sale ? "판매금액" : "금액"} : {krw(l.amount)}
                </em>
              </div>
            ))
          : null}
      </div>
      <div className="slip-foot">
        <button className="btn outline" type="button" onClick={onBack}>
          확인
        </button>
        <button className="btn primary" type="button" disabled={cancelled} onClick={() => setAsk(true)}>
          전표취소
        </button>
      </div>
      {ask ? (
        <div className="slip-mask">
          <div className="slip-dialog">
            <p>이 전표를 취소할까요?</p>
            <div className="slip-dialog-btns">
              <button className="btn outline" type="button" onClick={() => setAsk(false)}>
                아니오
              </button>
              <button
                className="btn primary"
                type="button"
                onClick={() => {
                  cancelSlip(customer.id, row.id);
                  setAsk(false);
                  onBack();
                }}
              >
                전표취소
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SalesPage({ customerId, onBack }: { customerId: string; onBack: () => void }) {
  const nav = useNav();
  const c = useCustomer(customerId);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [brand, setBrand] = useState("전체");
  const [q, setQ] = useState("");
  const [payWay, setPayWay] = useState<"cashcard" | "point">("cashcard");
  const [cashKind, setCashKind] = useState<"today" | "credit" | "">("");
  const [cardKind, setCardKind] = useState<"lump" | "install">("lump");
  const [months, setMonths] = useState("");
  const [supply, setSupply] = useState<"direct" | "third">("direct");
  const [livePick, setLivePick] = useState(false);
  const [serviceOn, setServiceOn] = useState(false);
  const picked = products.filter((p) => (qty[p.id] ?? 0) > 0);
  const qtySum = picked.reduce((s, p) => s + (qty[p.id] ?? 0), 0);
  const saleTotal = picked.reduce((s, p) => s + p.price * (qty[p.id] ?? 0), 0);
  const list = products.filter((p) => {
    if (brand !== "전체" && p.brand !== brand) return false;
    if (q && !`${p.brand} ${p.name} ${p.code}`.includes(q)) return false;
    return true;
  });
  const unpaidAfter = c.unpaid + saleTotal;

  if (step === 2) {
    return (
      <div className="app-scroll" style={{ background: "var(--bg)" }}>
        <TopBar title="판매" onBack={() => setStep(1)} />
        <FlowSteps title="상품구매계약서" current={2} />
        <div className="tr-card">
          <div className="flow-kv">
            <div>
              <span>고객번호</span>
              <b>{custNo(c.id)}</b>
            </div>
            <div>
              <span>고객명</span>
              <b>{c.name}</b>
            </div>
            <div>
              <span>라이브 상품선택</span>
              <div className="pay-radios">
                <label>
                  <input type="radio" checked={livePick} onChange={() => setLivePick(true)} /> 선택
                </label>
                <label>
                  <input type="radio" checked={!livePick} onChange={() => setLivePick(false)} /> 미선택
                </label>
              </div>
            </div>
            <div>
              <span>현금</span>
              <div className="pay-radios">
                <label>
                  <input type="radio" checked={cashKind === "today"} onChange={() => setCashKind("today")} /> 당일
                </label>
                <label>
                  <input type="radio" checked={cashKind === "credit"} onChange={() => setCashKind("credit")} /> 외상
                </label>
              </div>
            </div>
            <div>
              <span>카드</span>
              <div className="pay-radios">
                <label>
                  <input type="radio" checked={cardKind === "lump"} onChange={() => setCardKind("lump")} /> 일시불
                </label>
                <label>
                  <input type="radio" checked={cardKind === "install"} onChange={() => setCardKind("install")} /> 할부
                </label>
                {cardKind === "install" ? (
                  <input
                    className="kv-mini"
                    inputMode="numeric"
                    placeholder="개월"
                    value={months}
                    onChange={(e) => setMonths(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  />
                ) : null}
              </div>
            </div>
            <div>
              <span>공급방법</span>
              <div className="pay-radios">
                <label>
                  <input type="radio" checked={supply === "direct"} onChange={() => setSupply("direct")} /> 직접배달
                </label>
                <label>
                  <input type="radio" checked={supply === "third"} onChange={() => setSupply("third")} /> 제3자 배달
                </label>
              </div>
            </div>
            <div>
              <span>작성일</span>
              <b>{TODAY}</b>
            </div>
            <div>
              <span>서비스 제공</span>
              <div className="pay-radios">
                <label>
                  <input type="radio" checked={serviceOn} onChange={() => setServiceOn(true)} /> 진행
                </label>
                <label>
                  <input type="radio" checked={!serviceOn} onChange={() => setServiceOn(false)} /> 미진행
                </label>
              </div>
            </div>
          </div>
          <button className="btn primary" type="button" style={{ marginTop: 14 }} onClick={() => setStep(3)}>
            다음
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="app-scroll" style={{ background: "var(--bg)" }}>
        <TopBar title="판매" onBack={() => setStep(2)} />
        <FlowSteps title="판매등록결과" current={3} />
        <div className="tr-card">
          <h4>{c.name}</h4>
          <div className="tr-sum">
            <span>총 수량합계</span>
            <b>{qtySum}개</b>
          </div>
          <div className="tr-sum">
            <span>총 가격합계</span>
            <b>{krw(saleTotal)}</b>
          </div>
          <p className="tr-hint pay" style={{ marginTop: 14 }}>
            라이브 판매등록 결과
          </p>
          <div className="tr-sum">
            <span>수량합계</span>
            <b>{livePick ? qtySum : 0}개</b>
          </div>
          <div className="tr-sum">
            <span>가격합계</span>
            <b>{krw(livePick ? saleTotal : 0)}</b>
          </div>
          <p className="tr-hint pay" style={{ marginTop: 14 }}>
            미수금
          </p>
          <div className="tr-sum">
            <span>판매 전 미수금액</span>
            <b>{c.unpaid ? krw(c.unpaid) : "없음"}</b>
          </div>
          <div className="tr-sum">
            <span>판매 후 미수금액</span>
            <b className="bad">{krw(unpaidAfter)}</b>
          </div>
          <div className="tr-actions">
            <button className="btn primary" type="button" onClick={() => nav.setToast("계약서를 출력합니다")}>
              계약서 출력
            </button>
            <button
              className="btn outline"
              type="button"
              onClick={() => {
                nav.setToast("판매가 등록되었습니다. 이어서 수금을 등록하세요.");
                onBack();
              }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title={c.name} onBack={onBack} />
      <UnpaidBar customerId={c.id} />
      <FlowSteps title="판매상품등록" current={1} />
      <div className="tr-card">
        <div className="flow-search">
          <input placeholder="상품명, 상품코드" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn sm primary" type="button">
            검색
          </button>
        </div>
        <p className="tr-hint pay">결제방식</p>
        <div className="pay-radios" style={{ marginBottom: 10 }}>
          <label>
            <input type="radio" checked={payWay === "cashcard"} onChange={() => setPayWay("cashcard")} /> 현금/카드
          </label>
          <label>
            <input type="radio" checked={payWay === "point"} onChange={() => setPayWay("point")} /> 포인트 또는 쿠폰 사용
          </label>
        </div>
        {payWay === "point" ? (
          <p className="tr-hint">보유 뷰티포인트 {c.beautyPoints.toLocaleString("ko-KR")}P · 쿠폰은 점검 단계에서 반영됩니다.</p>
        ) : null}
        <CartBar qty={qtySum} amount={saleTotal} onClear={() => setQty({})} />
        <label className="tr-brand-field">
          <span>브랜드</span>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            {productBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        {list.length === 0 ? (
          <p className="tr-hint">검색 결과가 없습니다.</p>
        ) : (
          list.map((p) => {
            const n = qty[p.id] ?? 0;
            return (
              <div className="tr-prod" key={p.id}>
                <div>
                  <b>
                    {p.code} {p.brand} {p.name}
                  </b>
                  <span>
                    소비자가격 {krw(p.price)} · 카운셀러재고 {p.stock}개
                  </span>
                </div>
                <div className="qty">
                  <button type="button" disabled={n <= 0} onClick={() => setQty({ ...qty, [p.id]: Math.max(0, n - 1) })}>
                    −
                  </button>
                  <em>{n}</em>
                  <button type="button" disabled={n >= p.stock} onClick={() => setQty({ ...qty, [p.id]: n + 1 })}>
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div className="tr-actions">
          <button className="btn primary" type="button" onClick={() => nav.go("slips")}>
            전표조회
          </button>
          <button
            className="btn outline"
            type="button"
            onClick={() => {
              if (saleTotal <= 0) nav.setToast("선택된 상품이 없습니다. 상품을 담아 주세요.");
              else setStep(2);
            }}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}

function CollectPage({ customerId, onBack }: { customerId: string; onBack: () => void }) {
  const nav = useNav();
  const c = useCustomer(customerId);
  const [cash, setCash] = useState("");
  const [card, setCard] = useState("");
  const [payKind, setPayKind] = useState<"approve" | "slip">("approve");
  const cashN = Number(cash.replace(/\D/g, "")) || 0;
  const cardN = Number(card.replace(/\D/g, "")) || 0;
  const collectTotal = cashN + cardN;
  const unpaidAfter = Math.max(0, c.unpaid - collectTotal);

  const setAmt = (raw: string, fn: (v: string) => void) => {
    const n = raw.replace(/\D/g, "");
    fn(n ? Number(n).toLocaleString("ko-KR") : "");
  };

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title={c.name} onBack={onBack} />
      <UnpaidBar customerId={c.id} />
      <div className="tr-card">
        <h4>수금</h4>
        <p className="tr-hint pay">결제수단</p>
        <div className="pay-row">
          <span>현금</span>
          <input
            inputMode="numeric"
            placeholder="0"
            value={cash}
            onChange={(e) => setAmt(e.target.value, setCash)}
          />
          <button className="btn sm ink" type="button" onClick={() => nav.setToast("현금영수증 화면으로 연결됩니다")}>
            현금영수증
          </button>
        </div>
        <div className="pay-row">
          <span>카드</span>
          <input
            inputMode="numeric"
            placeholder="0"
            value={card}
            onChange={(e) => setAmt(e.target.value, setCard)}
          />
        </div>
        <div className="pay-row">
          <span>무이자혜택</span>
          <button className="btn sm ink" type="button" onClick={() => nav.setToast("무이자 혜택을 조회했습니다")}>
            혜택조회
          </button>
        </div>
        <div className="pay-row">
          <span>결제구분</span>
          <div className="pay-radios">
            <label>
              <input type="radio" checked={payKind === "approve"} onChange={() => setPayKind("approve")} />
              카드승인
            </label>
            <label>
              <input type="radio" checked={payKind === "slip"} onChange={() => setPayKind("slip")} />
              카드전표
            </label>
          </div>
        </div>
        <div className="tr-sum">
          <span>수금합계</span>
          <b>{krw(collectTotal)}</b>
        </div>
        <div className="tr-sum">
          <span>수금 후 미수금</span>
          <b className={unpaidAfter ? "bad" : ""}>{unpaidAfter ? krw(unpaidAfter) : "없음"}</b>
        </div>
        <button className="btn primary" type="button" onClick={() => nav.setToast("수금이 등록되었습니다")}>
          수금 등록
        </button>
      </div>
    </div>
  );
}

export function PromoScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <TopBar title="판촉" onBack={nav.back} />
      <div className="pad">
        <div className="card list-card">
          {promos.map((p) => (
            <div className="row" key={p.id}>
              <div className="meta">
                <b>{p.name}</b>
                <p>
                  {krw(p.price)} · 재고 {p.stock} · ~{p.until}
                </p>
              </div>
              <button
                className="btn sm primary"
                type="button"
                onClick={() => nav.setToast("판촉 주문이 접수되었습니다")}
              >
                주문
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrderScreen() {
  const nav = useNav();
  const { addOrder } = useConsults();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("전체");
  const [check, setCheck] = useState(false);
  const picked = products.filter((p) => (qty[p.id] ?? 0) > 0);
  const qtySum = picked.reduce((s, p) => s + (qty[p.id] ?? 0), 0);
  const amount = picked.reduce((s, p) => s + p.price * (qty[p.id] ?? 0), 0);
  const overLimit = amount > counselor.creditRemain;
  const list = products.filter((p) => {
    if (brand !== "전체" && p.brand !== brand) return false;
    if (q && !`${p.brand} ${p.name} ${p.code}`.includes(q)) return false;
    return true;
  });

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="본품 주문" onBack={nav.back} />
      <div className="tr-card">
        <div className="flow-kv">
          <div>
            <span>여신한도</span>
            <b>{krw(counselor.creditLimit)}</b>
          </div>
          <div>
            <span>잔여한도</span>
            <b>{krw(counselor.creditRemain)}</b>
          </div>
          <div>
            <span>재고회전일</span>
            <b>{counselor.stockTurnDays}일</b>
          </div>
        </div>
        <div className="flow-search">
          <input placeholder="상품명, 상품코드" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn sm primary" type="button">
            검색
          </button>
        </div>
        <button className="btn primary" type="button" style={{ margin: "8px 0 12px" }} onClick={() => nav.go("orderLookup")}>
          주문조회
        </button>
        <CartBar qty={qtySum} amount={amount} onClear={() => setQty({})} />
        <label className="tr-brand-field">
          <span>브랜드</span>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            {productBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        {list.length === 0 ? (
          <p className="tr-hint">검색 결과가 없습니다.</p>
        ) : (
          list.map((p) => {
            const n = qty[p.id] ?? 0;
            const branch = p.stock + 4;
            return (
              <div className="tr-prod" key={p.id}>
                <div>
                  <b>
                    {p.code} {p.brand} {p.name}
                  </b>
                  <span>
                    소비자가격 {krw(p.price)} · 영업점재고 {branch}개 · 카운셀러재고 {p.stock}개
                  </span>
                </div>
                <div className="qty">
                  <button type="button" disabled={n <= 0} onClick={() => setQty({ ...qty, [p.id]: Math.max(0, n - 1) })}>
                    −
                  </button>
                  <em>{n}</em>
                  <button type="button" onClick={() => setQty({ ...qty, [p.id]: n + 1 })}>
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
        <button
          className="btn primary"
          type="button"
          onClick={() => {
            if (amount <= 0) nav.setToast("주문상품카트에 상품이 없습니다.");
            else setCheck(true);
          }}
        >
          주문점검
        </button>
      </div>
      {check ? (
        <div className="slip-mask">
          <div className="slip-dialog" style={{ width: "min(320px, 86vw)" }}>
            <p style={{ fontWeight: 800, marginBottom: 8 }}>주문점검</p>
            {picked.map((p) => (
              <div className="tr-sum" key={p.id}>
                <span>
                  {p.name} · {qty[p.id]}개
                </span>
                <b>{krw(p.price * (qty[p.id] ?? 0))}</b>
              </div>
            ))}
            <div className="tr-sum">
              <span>수량합계</span>
              <b>{qtySum}개</b>
            </div>
            <div className="tr-sum">
              <span>금액합계</span>
              <b>{krw(amount)}</b>
            </div>
            <div className="tr-sum">
              <span>잔여한도</span>
              <b className={overLimit ? "bad" : ""}>{krw(counselor.creditRemain)}</b>
            </div>
            {overLimit ? <p className="tr-hint">잔여한도를 초과합니다. 수량을 조정하세요.</p> : null}
            <div className="slip-dialog-btns">
              <button className="btn outline" type="button" onClick={() => setCheck(false)}>
                취소
              </button>
              <button
                className="btn primary"
                type="button"
                disabled={overLimit}
                onClick={() => {
                  addOrder(picked.map((p) => ({ productId: p.id, qty: qty[p.id] ?? 0 })));
                  setCheck(false);
                  nav.setToast("미확정 주문으로 접수되었습니다");
                  nav.go("orderLookup");
                }}
              >
                주문하기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OrderLookupScreen() {
  const nav = useNav();
  const { orders, confirmOrder } = useConsults();
  return (
    <div className="app-scroll">
      <TopBar title="주문조회" onBack={() => nav.go("work")} />
      <div className="pad">
        {orders.map((order) => {
          const lines = order.items
            .map((it) => {
              const p = products.find((x) => x.id === it.productId);
              if (!p) return null;
              return { ...p, qty: it.qty, amount: p.price * it.qty };
            })
            .filter((x): x is NonNullable<typeof x> => x != null);
          const total = lines.reduce((s, r) => s + r.amount, 0);
          const qtySum = lines.reduce((s, r) => s + r.qty, 0);
          return (
            <div className="perf-cust" key={order.id}>
              <div className="perf-cust-h">
                <b>{order.no}</b>
                <span className={`order-st${order.status === "미확정" ? " pending" : ""}`}>{order.status}</span>
              </div>
              <p className="order-date">{order.date}</p>
              {lines.map((r) => (
                <div className="perf-sum-row" key={`${order.id}-${r.id}`}>
                  <span>
                    {r.brand} {r.name}
                    <em className="order-qty"> · {r.qty}개</em>
                  </span>
                  <b>{krw(r.amount)}</b>
                </div>
              ))}
              <div className="perf-sum-row order-total">
                <span>합계 {qtySum}개</span>
                <b>{krw(total)}</b>
              </div>
              {order.status === "미확정" ? (
                <button
                  className="btn sm outline order-confirm"
                  type="button"
                  onClick={() => {
                    confirmOrder(order.id);
                    nav.setToast("영업점에서 주문을 확정했습니다");
                  }}
                >
                  영업점 확정
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
