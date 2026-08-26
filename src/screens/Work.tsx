import { useMemo, useState } from "react";
import { counselor, customers, products, promos } from "../data";
import { krw } from "../lib";
import { useNav } from "../nav";
import { IconBox, IconChevron, IconSearch } from "../icons";
import { AppHeader, Photo, TopBar } from "../ui";

const stockQty = products.reduce((s, p) => s + p.stock, 0);
const stockAmt = products.reduce((s, p) => s + p.stock * p.price, 0);
const productBrands = ["전체", ...[...new Set(products.map((p) => p.brand))]];

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
  const nav = useNav();
  return (
    <div className="app-scroll">
      <AppHeader />
      <div className="home-title">
        <h3>판매 / 수금</h3>
      </div>
      <div className="pad">
        <div className="card list-card">
          {[
            { id: "slips" as const, n: "1", title: "전표조회", desc: "고객별 판매 · 수금 전표" },
            { id: "sales" as const, n: "2", title: "판매", desc: "본인 재고에서 상품 판매" },
            { id: "collection" as const, n: "3", title: "수금", desc: "현금 · 카드 수금 등록" },
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

export function SalesScreen() {
  return <TradeFlow kind="sales" title="판매" />;
}

export function CollectionScreen() {
  return <TradeFlow kind="collection" title="수금" />;
}

function TradeFlow({ kind, title }: { kind: "slips" | "sales" | "collection"; title: string }) {
  const nav = useNav();
  const fromCrm = nav.stack[nav.stack.length - 1] === "customer";
  const [pickedId, setPickedId] = useState<string | null>(() => (fromCrm ? nav.customerId : null));

  if (!pickedId) {
    return <CustomerPick title={title} onPick={setPickedId} onBack={nav.back} />;
  }

  const onBack = fromCrm ? nav.back : () => setPickedId(null);
  if (kind === "slips") return <SlipsPage customerId={pickedId} onBack={onBack} />;
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
  const list = useMemo(() => {
    const key = q.replace(/-/g, "");
    return customers.filter(
      (c) => !q || c.name.includes(q) || c.phone.replace(/-/g, "").includes(key)
    );
  }, [q]);

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
                <Photo id={c.id} name={c.name} size={46} gender={c.gender} />
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

function UnpaidBar({ customerId }: { customerId: string }) {
  const c = customers.find((x) => x.id === customerId) ?? customers[0];
  return (
    <div className="tr-unpaid">
      <div>
        <span>미수금액</span>
        <b>{c.unpaid ? krw(c.unpaid) : "없음"}</b>
      </div>
    </div>
  );
}

function SlipsPage({ customerId, onBack }: { customerId: string; onBack: () => void }) {
  const c = customers.find((x) => x.id === customerId) ?? customers[0];
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title={c.name} onBack={onBack} />
      <UnpaidBar customerId={c.id} />
      <div className="tr-card">
        <h4>전표</h4>
        {c.ledger.length === 0 ? (
          <p className="tr-hint">최근 전표가 없습니다.</p>
        ) : (
          c.ledger.map((r) => (
            <div className="tr-prod" key={r.id}>
              <div>
                <b>{r.type === "sale" ? "판매" : "수금"}{r.product ? ` · ${r.product}` : ""}</b>
                <span>
                  {r.date} · {r.status}
                </span>
              </div>
              <em className="tr-amt">{krw(r.amount)}</em>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SalesPage({ customerId, onBack }: { customerId: string; onBack: () => void }) {
  const nav = useNav();
  const c = customers.find((x) => x.id === customerId) ?? customers[0];
  const [qty, setQty] = useState<Record<string, number>>({});
  const [brand, setBrand] = useState("전체");
  const list = brand === "전체" ? products : products.filter((p) => p.brand === brand);
  const saleTotal = products.reduce((s, p) => s + p.price * (qty[p.id] ?? 0), 0);

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title={c.name} onBack={onBack} />
      <UnpaidBar customerId={c.id} />
      <div className="tr-card">
        <h4>판매</h4>
        <p className="tr-hint">본인 재고에서 상품을 골라 판매합니다.</p>
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
          <p className="tr-hint">해당 브랜드 재고가 없습니다.</p>
        ) : (
          list.map((p) => {
            const n = qty[p.id] ?? 0;
            return (
              <div className="tr-prod" key={p.id}>
                <div>
                  <b>
                    {p.brand} {p.name}
                  </b>
                  <span>
                    {krw(p.price)} · 재고 {p.stock}
                  </span>
                </div>
                <div className="qty">
                  <button
                    type="button"
                    disabled={n <= 0}
                    onClick={() => setQty({ ...qty, [p.id]: Math.max(0, n - 1) })}
                  >
                    −
                  </button>
                  <em>{n}</em>
                  <button
                    type="button"
                    disabled={n >= p.stock}
                    onClick={() => setQty({ ...qty, [p.id]: n + 1 })}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div className="tr-sum">
          <span>판매합계</span>
          <b>{krw(saleTotal)}</b>
        </div>
        <button
          className="btn primary"
          type="button"
          disabled={saleTotal <= 0}
          onClick={() => nav.setToast("판매가 등록되었습니다. 이어서 수금을 등록하세요.")}
        >
          판매 등록
        </button>
      </div>
    </div>
  );
}

function CollectPage({ customerId, onBack }: { customerId: string; onBack: () => void }) {
  const nav = useNav();
  const c = customers.find((x) => x.id === customerId) ?? customers[0];
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
