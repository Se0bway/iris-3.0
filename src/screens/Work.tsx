import { useState, type ReactNode } from "react";
import { counselor, customers, products, promos } from "../data";
import { krw } from "../lib";
import { useNav } from "../nav";
import { IconBox, IconChevron, IconWon } from "../icons";
import { AppHeader, TopBar } from "../ui";

const stockQty = products.reduce((s, p) => s + p.stock, 0);
const stockAmt = products.reduce((s, p) => s + p.stock * p.price, 0);

function Hub({
  title,
  note,
  items,
}: {
  title: string;
  note: string;
  items: { id: "promo" | "order" | "stock" | "sales" | "collection"; title: string; desc: string; icon: ReactNode }[];
}) {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <AppHeader />
      <div className="home-title">
        <h3>{title}</h3>
      </div>
      <div className="notice">{note}</div>
      <div className="pad">
        <div className="card list-card">
          {items.map((it) => (
            <button key={it.id} className="row" type="button" onClick={() => nav.go(it.id)}>
              <div className="avatar">{it.icon}</div>
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

export function WorkScreen() {
  const nav = useNav();
  const used = counselor.creditLimit - counselor.creditRemain;
  return (
    <div className="app-scroll">
      <AppHeader />
      <div className="home-title">
        <h3>주문</h3>
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
          {[
            { id: "promo" as const, title: "판촉 주문", desc: "체험키트 · 샘플 주문" },
            { id: "order" as const, title: "본품 주문", desc: "재고 확인 후 발주" },
            { id: "stock" as const, title: "재고조회", desc: "본인 재고 수량 · 가격합계" },
          ].map((it) => (
            <button key={it.id} className="row" type="button" onClick={() => nav.go(it.id)}>
              <div className="avatar">
                <IconBox />
              </div>
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
  return (
    <Hub
      title="판매 / 수금"
      note="뉴커머스는 판매와 수금이 분리됩니다. 고객에게 판매한 뒤, 입금·미수를 따로 관리합니다."
      items={[
        { id: "sales", title: "판매 등록", desc: "고객 선택 → 제품 선택", icon: <IconWon /> },
        { id: "collection", title: "수금 등록", desc: "미수 확인 후 입금 매칭", icon: <IconWon /> },
      ]}
    />
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
  const [qty, setQty] = useState<Record<string, number>>({});
  return (
    <div className="app-scroll">
      <TopBar title="본품 주문" onBack={nav.back} />
      <div className="pad">
        <div className="card list-card">
          {products.map((p) => (
            <div className="row" key={p.id}>
              <div className="meta">
                <b>
                  {p.brand} {p.name}
                </b>
                <p>
                  {krw(p.price)} · 영업점 재고 {p.stock}
                </p>
              </div>
              <input
                type="number"
                min={0}
                value={qty[p.id] ?? 0}
                onChange={(e) => setQty({ ...qty, [p.id]: Number(e.target.value) })}
                style={{ width: 56, height: 34, border: "1px solid var(--line)", borderRadius: 8, textAlign: "center" }}
              />
            </div>
          ))}
        </div>
        <div style={{ height: 12 }} />
        <button className="btn primary" type="button" onClick={() => nav.setToast("본품 주문이 접수되었습니다")}>
          주문하기
        </button>
      </div>
    </div>
  );
}

export function SalesScreen() {
  const nav = useNav();
  const [cid, setCid] = useState(nav.customerId || customers[0].id);
  const [pid, setPid] = useState(products[0].id);
  const p = products.find((x) => x.id === pid)!;
  return (
    <div className="app-scroll">
      <TopBar title="판매 등록" onBack={nav.back} />
      <div className="pad">
        <div className="field">
          <label>고객</label>
          <select value={cid} onChange={(e) => setCid(e.target.value)}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>제품</label>
          <select value={pid} onChange={(e) => setPid(e.target.value)}>
            {products.map((x) => (
              <option key={x.id} value={x.id}>
                {x.brand} {x.name}
              </option>
            ))}
          </select>
        </div>
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div className="kv" style={{ padding: 0 }}>
            <div className="k">판매금액</div>
            <div>{krw(p.price)}</div>
            <div className="k">판매일</div>
            <div>2026-08-22</div>
            <div className="k">방식</div>
            <div>대면 판매</div>
          </div>
        </div>
        <button
          className="btn primary"
          type="button"
          onClick={() => nav.setToast("판매가 등록되었습니다. 이어서 수금을 등록하세요.")}
        >
          판매 등록
        </button>
      </div>
    </div>
  );
}

export function CollectionScreen() {
  const nav = useNav();
  const unpaid = customers.filter((c) => c.unpaid > 0);
  const [cid, setCid] = useState(unpaid[0]?.id ?? customers[0].id);
  const c = customers.find((x) => x.id === cid)!;
  const [amt, setAmt] = useState(String(c.unpaid || 100000));
  return (
    <div className="app-scroll">
      <TopBar title="수금 등록" onBack={nav.back} />
      <div className="notice">일반 쇼핑몰은 결제 = 판매 완료입니다. 뉴커머스는 판매 ≠ 수금입니다.</div>
      <div className="pad">
        <div className="field">
          <label>고객</label>
          <select
            value={cid}
            onChange={(e) => {
              setCid(e.target.value);
              const n = customers.find((x) => x.id === e.target.value);
              setAmt(String(n?.unpaid || 0));
            }}
          >
            {customers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} {x.unpaid ? `(미수 ${krw(x.unpaid)})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>수금 금액</label>
          <input value={amt} onChange={(e) => setAmt(e.target.value)} />
        </div>
        <div className="field">
          <label>방식</label>
          <select defaultValue="va">
            <option value="va">가상계좌 입금</option>
            <option value="branch">영업점 입금</option>
            <option value="cash">현금</option>
          </select>
        </div>
        <button className="btn primary" type="button" onClick={() => nav.setToast("수금이 등록되었습니다")}>
          수금 등록
        </button>
      </div>
    </div>
  );
}
