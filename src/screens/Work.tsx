import { useMemo, useState } from "react";
import { TODAY, closing, counselor, productOrders, products, promos } from "../data";
import { custNo, krw } from "../lib";
import { useNav } from "../nav";
import { useConsults } from "../consult";
import { IconBack, IconChevron, IconDown, IconSearch } from "../icons";
import { AppHeader, TopBar } from "../ui";
import type { Customer, LedgerRow, ScreenId } from "../types";

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
    { id: "orderLookup", n: "2", title: "주문조회", desc: "발주한 상품 · 입고 상태" },
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
  const nav = useNav();
  const [kind, setKind] = useState<"slips" | "cancelled" | null>(null);

  if (!kind) {
    return (
      <div className="app-scroll">
        <TopBar title="전표조회" onBack={nav.back} />
        <div className="pad">
          <div className="card list-card">
            {[
              { id: "slips" as const, n: "1", title: "전표조회", desc: "판매 · 수금 전표" },
              { id: "cancelled" as const, n: "2", title: "취소전표 조회", desc: "취소된 판매 · 수금 전표" },
            ].map((it) => (
              <button key={it.id} className="row" type="button" onClick={() => setKind(it.id)}>
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

  return (
    <TradeFlow
      kind={kind}
      title={kind === "cancelled" ? "취소전표 조회" : "전표조회"}
      onExit={() => setKind(null)}
    />
  );
}

export function SalesScreen() {
  return <TradeFlow kind="sales" title="판매" />;
}

export function CollectionScreen() {
  return <TradeFlow kind="collection" title="수금" />;
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
  const fromCrm = nav.stack[nav.stack.length - 1] === "customer";
  const [pickedId, setPickedId] = useState<string | null>(() => (fromCrm ? nav.customerId : null));
  const leave = onExit ?? nav.back;

  if (!pickedId) {
    return <CustomerPick title={title} onPick={setPickedId} onBack={leave} />;
  }

  const onBack = fromCrm ? leave : () => setPickedId(null);
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
                  setCheck(false);
                  nav.setToast("본품 주문이 접수되었습니다");
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
  return (
    <div className="app-scroll">
      <TopBar title="주문조회" onBack={() => nav.go("work")} />
      <div className="pad">
        {productOrders.map((order) => {
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
                <span className="order-st">{order.status}</span>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
