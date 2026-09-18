import { useMemo, useState } from "react";
import { closing, counselor, deposits, hqEducations, members, products, productSalesBase, RANKS, vaAccount } from "../data";
import { krw } from "../lib";
import { useNav } from "../nav";
import { useConsults } from "../consult";
import { MonthBar, PerfTable, usePerfMonth } from "./Perf";
import { AppHeader, TopBar } from "../ui";
import { IconChevron, IconCrown, IconSearch } from "../icons";

const stockQty = products.reduce((s, p) => s + p.stock, 0);
const stockAmt = products.reduce((s, p) => s + p.stock * p.price, 0);
const stockBrands = ["전체", ...[...new Set(products.map((p) => p.brand))]];
const attendDays = 14;
const liveDone = 8;
const liveTotal = 12;
const incentiveEst = 1_860_000;
const ownSales = 8_240_000;
const editShopSales = 4_120_000;
const editCommission = 328_000;
const incentiveMembers = members.filter((m) => m.incentive).length;
const normalMembers = members.length;
const groupSales = members.reduce((s, m) => s + m.sales, 0);
const branchUndeposited = closing.collected - closing.deposited;

function CardHead({ title }: { title: string }) {
  return (
    <div className="mp-card-h">
      <b>{title}</b>
      <span className="go">
        <IconChevron width={16} height={16} />
      </span>
    </div>
  );
}

function AttendanceCheck() {
  const nav = useNav();
  if (nav.checkedIn) {
    return <div className="done-tag">오늘 출근이 등록되었습니다</div>;
  }
  return (
    <button className="btn primary" type="button" onClick={nav.checkIn}>
      출근 체크
    </button>
  );
}

const eduLabel = {
  required: "필수",
  done: "수료",
  progress: "진행",
} as const;

const eduTone = {
  required: "red" as const,
  done: "green" as const,
  progress: "amber" as const,
};

export function MyPageScreen() {
  const nav = useNav();
  const { counselorPoints } = useConsults();
  const dueEdu = hqEducations.filter((e) => e.status !== "done");

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <AppHeader />
      <div className="home-title">
        <h3>마이오피스</h3>
      </div>
      <div className="mp-list">
        <div className="mp-profile">
          <div className="mp-profile-top">
            <button className="mp-profile-id" type="button" onClick={() => nav.go("profile")}>
              <div>
                <h4>{counselor.name}</h4>
                <p className="mp-idline">
                  <span>{counselor.no}</span>
                  <i />
                  <span className="mp-rank">
                    <IconCrown width={13} height={13} />
                    {counselor.rank}
                  </span>
                </p>
                <p>{counselor.branch}</p>
              </div>
            </button>
            <button className="rank-chip" type="button" onClick={() => nav.go("rank")}>
              직급
            </button>
          </div>
          <button className="mp-team" type="button" onClick={() => nav.go("perfGroup")}>
            <div className="mp-team-h">
              <b>그룹원 상태 요약</b>
              <IconChevron width={16} height={16} />
            </div>
            <div className="mp-team-inline">
              <span>
                <em>{incentiveMembers}명</em>수혜예상
              </span>
              <i />
              <span>
                <em>{normalMembers}명</em>정상
              </span>
              <i />
              <span>
                <em>{krw(groupSales)}</em>총원매출
              </span>
            </div>
          </button>
          <div className="mp-types">
            <button className="mp-type" type="button" onClick={() => nav.go("perfMine")}>
              <span className="mp-type-tag">A타입</span>
              <div className="mp-type-main">
                <div className="l">당월 고객판매</div>
                <div className="v">{krw(closing.customerSales)}</div>
              </div>
              <div className="mp-type-subs">
                <div>
                  <div className="l">예상 인센티브</div>
                  <div className="v">{krw(incentiveEst)}</div>
                </div>
                <div>
                  <div className="l">미수회전일</div>
                  <div className="v">{closing.rotationDays}일</div>
                </div>
              </div>
            </button>
            <button className="mp-type" type="button" onClick={() => nav.go("editshop")}>
              <span className="mp-type-tag">B타입</span>
              <div className="mp-type-main">
                <div className="l">에딧샵 매출</div>
                <div className="v">{krw(editShopSales)}</div>
              </div>
              <div className="mp-type-subs one">
                <div>
                  <div className="l">에딧샵 커미션</div>
                  <div className="v">{krw(editCommission)}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <button className="mp-card" type="button" onClick={() => nav.go("pointGift", { customerId: "self" })}>
          <CardHead title="내 뷰티포인트" />
          <div className="mp-metrics one">
            <div className="mp-metric">
              <div className="l">보유 포인트</div>
              <div className="v">{counselorPoints.toLocaleString("ko-KR")}P</div>
            </div>
          </div>
        </button>

        <div className="mp-card">
          <button className="mp-card-go" type="button" onClick={() => nav.go("attendance")}>
            <CardHead title="출근 현황" />
            <div className="mp-metrics">
              <div className="mp-metric">
                <div className="l">이번 달 출근일 수</div>
                <div className="v">{attendDays + (nav.checkedIn ? 1 : 0)}일</div>
              </div>
              <div className="mp-metric">
                <div className="l">오늘</div>
                <div className="v">{nav.checkedIn ? "출근완료!" : "미출근"}</div>
              </div>
            </div>
          </button>
          <div className="mp-attend-act">
            <AttendanceCheck />
          </div>
        </div>

        <button className="mp-card" type="button" onClick={() => nav.go("live")}>
          <CardHead title="라이브 영상 시청횟수" />
          <div className="mp-metrics one">
            <div className="mp-metric">
              <div className="l">시청완료 / 전체 영상</div>
              <div className="v">
                {liveDone} / {liveTotal}
              </div>
            </div>
          </div>
          <div className="progress" style={{ marginTop: 10 }}>
            <i style={{ width: `${(liveDone / liveTotal) * 100}%` }} />
          </div>
        </button>

        <button className="mp-card" type="button" onClick={() => nav.go("education")}>
          <CardHead title="본사 수료 교육" />
          <div className="mp-metrics one">
            <div className="mp-metric">
              <div className="l">수료해야 할 교육</div>
              <div className="v">{dueEdu.length}건</div>
            </div>
          </div>
          <div className="edu-mini">
            {hqEducations.map((e) => (
              <div className="edu-mini-row" key={e.id}>
                <span>{e.name}</span>
                <em className={e.status}>{eduLabel[e.status]}</em>
              </div>
            ))}
          </div>
        </button>

        <div className="mp-snap">
          {[
            {
              id: "collection" as const,
              title: "수금 정보",
              left: { l: "전체수금", v: krw(closing.collected) },
              right: { l: "영업점 미입금", v: krw(branchUndeposited) },
            },
            {
              id: "stock" as const,
              title: "재고 정보",
              left: { l: "재고합계", v: `${stockQty}개` },
              right: { l: "가격합계", v: krw(stockAmt) },
            },
          ].map((it) => (
            <button key={it.id} className="mp-snap-row" type="button" onClick={() => nav.go(it.id)}>
              <div className="mp-snap-main">
                <b>{it.title}</b>
                <div className="mp-snap-pair">
                  <div>
                    <span>{it.left.l}</span>
                    <em>{it.left.v}</em>
                  </div>
                  <div>
                    <span>{it.right.l}</span>
                    <em>{it.right.v}</em>
                  </div>
                </div>
              </div>
              <IconChevron width={16} height={16} />
            </button>
          ))}
        </div>

        <div className="mp-foot">
          <button className="btn primary" type="button" onClick={() => nav.go("profile")}>
            내정보확인
          </button>
          <button className="btn outline" type="button" onClick={() => nav.go("deposit")}>
            가상계좌 입금내역
          </button>
        </div>
      </div>
    </div>
  );
}

export function IncentiveScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="인센티브 조회" onBack={nav.back} />
      <div className="pad">
        <div className="kpi-grid" style={{ padding: 0 }}>
          <div className="kpi">
            <div className="lbl">본인매출</div>
            <div className="val" style={{ fontSize: 16 }}>
              {krw(ownSales)}
            </div>
          </div>
          <div className="kpi">
            <div className="lbl">고객판매</div>
            <div className="val" style={{ fontSize: 16 }}>
              {krw(closing.customerSales)}
            </div>
          </div>
          <div className="kpi">
            <div className="lbl">미수회전일</div>
            <div className="val" style={{ fontSize: 16 }}>
              {closing.rotationDays}일
            </div>
          </div>
          <div className="kpi wide">
            <div className="lbl">예상 인센티브 금액</div>
            <div className="val">{krw(incentiveEst)}</div>
            <div className="sub">수금 기준 · 미수 제외</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditShopScreen() {
  const nav = useNav();
  const { y, m, scale, atLatest, move } = usePerfMonth();
  const [tab, setTab] = useState<"product" | "brand">("product");

  const productRows = useMemo(() => {
    return productSalesBase
      .map((row) => {
        const p = products.find((x) => x.id === row.id);
        if (!p) return null;
        const qty = Math.max(1, Math.round(row.qty * scale * 0.33));
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

  const sales = Math.round(editShopSales * scale);
  const commission = Math.round(editCommission * scale);

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="에딧샵 영업실적" onBack={() => nav.go("mypage")} />
      <MonthBar y={y} m={m} atLatest={atLatest} move={move} />
      <div className="perf-sum">
        <h4>총 합계</h4>
        <div className="perf-sum-row">
          <span>에딧샵 매출</span>
          <b>{krw(sales)}</b>
        </div>
        <div className="perf-sum-row">
          <span>커미션</span>
          <b>{krw(commission)}</b>
        </div>
      </div>
      <div className="perf-tabs">
        {(
          [
            ["product", "상품별"],
            ["brand", "브랜드별"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} type="button" onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "product" ? (
        <PerfTable
          head={["상품", "수량", "판매금액"]}
          rows={productRows.map((r) => [r.name, `${r.qty}개`, krw(r.amount)])}
        />
      ) : (
        <PerfTable
          head={["브랜드", "수량", "판매금액"]}
          rows={brandRows.map((r) => [r.brand, `${r.qty}개`, krw(r.amount)])}
        />
      )}
      <div className="pad" style={{ paddingTop: 0 }}>
        <button
          className="btn primary"
          type="button"
          onClick={() => nav.setToast("에딧샵으로 연결됩니다. 로컬 프로토타입에서는 이동하지 않습니다.")}
        >
          에딧샵 연결
        </button>
      </div>
    </div>
  );
}

export function LiveScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="라이브 영상 시청" onBack={nav.back} />
      <div className="ext-card">
        <div className="big-num">
          {liveDone} / {liveTotal}
        </div>
        <p>시청완료 영상 / 전체 영상입니다. 남은 라이브는 뷰티스퀘어에서 이어서 시청할 수 있습니다.</p>
        <button className="btn primary" type="button" onClick={() => nav.setToast("뷰티스퀘어로 연결됩니다. 로컬 프로토타입에서는 이동하지 않습니다.")}>
          뷰티스퀘어 연결
        </button>
      </div>
    </div>
  );
}

export function EducationScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="본사 수료 교육" onBack={nav.back} />
      <div className="pad">
        {hqEducations.map((e) => (
          <div className="card edu-card" key={e.id}>
            <div className="edu-card-h">
              <b>{e.name}</b>
              <span className={`badge ${eduTone[e.status]}`}>{eduLabel[e.status]}</span>
            </div>
            <p>{e.note}</p>
            <div className="edu-due">기한 {e.due}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const attended = new Set([3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 17, 18, 19, 20]);

export function AttendanceScreen() {
  const nav = useNav();
  const first = new Date(2026, 7, 1).getDay();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="출근 현황" onBack={nav.back} />
      <div className="pad">
        <div className="card" style={{ padding: 16, marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>2026년 8월 · 출근 {attendDays + (nav.checkedIn ? 1 : 0)}일</div>
          <div className="big-num" style={{ margin: "8px 0", fontSize: 22 }}>
            {nav.checkedIn ? "출근완료!" : "오늘 미출근"}
          </div>
          <AttendanceCheck />
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="cal">
            {WEEK.map((w) => (
              <div className="hd" key={w}>
                {w}
              </div>
            ))}
            {Array.from({ length: first }).map((_, i) => (
              <div className="day mute" key={`e${i}`} />
            ))}
            {days.map((d) => {
              const on = attended.has(d) || (nav.checkedIn && d === 22);
              const today = d === 22;
              return (
                <div key={d} className={`day ${today ? "today" : on ? "on" : ""}`}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RankScreen() {
  const nav = useNav();
  const [tab, setTab] = useState<"result" | "forecast">("result");
  const currentIdx = RANKS.indexOf(counselor.rank as (typeof RANKS)[number]);
  const nextRank = currentIdx >= 0 && currentIdx < RANKS.length - 1 ? RANKS[currentIdx + 1] : counselor.rank;
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="직급 정보" onBack={nav.back} />
      <div className="seg">
        <button className={tab === "result" ? "on" : ""} type="button" onClick={() => setTab("result")}>
          직급 결과 조회
        </button>
        <button className={tab === "forecast" ? "on" : ""} type="button" onClick={() => setTab("forecast")}>
          직급 예상 조회
        </button>
      </div>
      <div className="pad">
        <div className="card rank-ladder">
          {RANKS.map((r, i) => (
            <div key={r} className={`rank-step ${r === counselor.rank ? "now" : i === currentIdx + 1 ? "next" : ""}`}>
              <i />
              <span>{r}</span>
            </div>
          ))}
        </div>
        {tab === "result" ? (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>현재 직급 (실적)</div>
            <div className="big-num">{counselor.rank}</div>
            <div className="kv" style={{ padding: "14px 0 0" }}>
              <div className="k">고객판매</div>
              <div>달성</div>
              <div className="k">그룹실적</div>
              <div>{closing.rankProgress}%</div>
              <div className="k">교육</div>
              <div>4/4 참석</div>
              <div className="k">인센티브 예상</div>
              <div>3 / 5명</div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>다음 직급 예상</div>
            <div className="big-num" style={{ fontSize: 24 }}>
              {nextRank}
            </div>
            <div style={{ fontSize: 13, margin: "12px 0 6px" }}>달성률 {closing.rankProgress}%</div>
            <div className="progress">
              <i style={{ width: `${closing.rankProgress}%` }} />
            </div>
            <div className="kv" style={{ padding: "14px 0 0" }}>
              <div className="k">필요 고객판매</div>
              <div>잔여 180만</div>
              <div className="k">그룹원 성장</div>
              <div>활동 5명</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="내정보 확인" onBack={nav.back} />
      <div className="pad">
        <div className="card">
          <div className="kv">
            <div className="k">이름</div>
            <div>{counselor.name}</div>
            <div className="k">소속영업장</div>
            <div>{counselor.branch}</div>
            <div className="k">카운셀러 코드</div>
            <div>{counselor.no}</div>
            <div className="k">에디터 코드</div>
            <div>{counselor.editorCode}</div>
            <div className="k">사업자등록번호</div>
            <div>{counselor.bizNo}</div>
            <div className="k">추천인</div>
            <div>{counselor.recommender}</div>
            <div className="k">직급</div>
            <div>{counselor.rank}</div>
            <div className="k">계좌 1</div>
            <div>{counselor.accounts[0]}</div>
            <div className="k">계좌 2</div>
            <div>{counselor.accounts[1]}</div>
          </div>
        </div>
        <button
          className="btn ghost"
          style={{ marginTop: 12 }}
          type="button"
          onClick={() => nav.setToast("약정서를 열었습니다")}
        >
          약정서 보기
        </button>
      </div>
    </div>
  );
}

export function StockScreen() {
  const nav = useNav();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("전체");
  const list = useMemo(() => {
    const key = q.trim().toLowerCase().replace(/-/g, "");
    return products.filter((p) => {
      const byBrand = brand === "전체" || p.brand === brand;
      const bySearch =
        !key ||
        p.name.toLowerCase().includes(key) ||
        p.brand.toLowerCase().includes(key) ||
        p.code.replace(/-/g, "").toLowerCase().includes(key);
      return byBrand && bySearch;
    });
  }, [q, brand]);

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="재고조회" onBack={nav.back} />
      <div className="search">
        <IconSearch />
        <input
          placeholder="상품명, 상품코드"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="pad">
        <label className="tr-brand-field">
          <span>브랜드</span>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            {stockBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <div className="kpi-grid" style={{ padding: 0, marginBottom: 12 }}>
          <div className="kpi">
            <div className="lbl">재고합계</div>
            <div className="val">{stockQty}개</div>
          </div>
          <div className="kpi">
            <div className="lbl">가격합계</div>
            <div className="val" style={{ fontSize: 15 }}>
              {krw(stockAmt)}
            </div>
          </div>
        </div>
        <div className="card list-card">
          {list.length === 0 ? (
            <p className="empty">검색 결과가 없습니다.</p>
          ) : (
            list.map((p) => (
              <div className="row" key={p.id}>
                <div className="meta">
                  <b>
                    {p.brand} {p.name}
                  </b>
                  <p>
                    {p.code} · {krw(p.price)}
                  </p>
                </div>
                <div className="right amt">{p.stock}개</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function MembersScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="그룹원 상태 요약" onBack={nav.back} />
      <div className="pad">
        <div className="mp-snap" style={{ marginBottom: 12 }}>
          <div className="mp-snap-row" style={{ pointerEvents: "none" }}>
            <div className="mp-snap-main">
              <b>그룹 현황</b>
              <div className="mp-snap-pair">
                <div>
                  <span>인센티브 수혜예상</span>
                  <em>{incentiveMembers}명</em>
                </div>
                <div>
                  <span>정상 그룹원</span>
                  <em>{normalMembers}명</em>
                </div>
              </div>
              <div className="mp-team-sales">
                <span>그룹원 총원 매출</span>
                <em>{krw(groupSales)}</em>
              </div>
            </div>
          </div>
        </div>
        <div className="card list-card">
          {members.map((m) => (
            <div className="mb-row" key={m.id}>
              <div className="mb-meta">
                <b>{m.name}</b>
                <p>
                  {m.rank} · {krw(m.sales)}
                </p>
                <div className="mb-flags">
                  <span>미수회전일 {m.rotationDays}일</span>
                  <span className={`badge ${m.incentive ? "green" : "gray"}`}>
                    {m.incentive ? "인센티브 수혜예상" : "인센티브 비대상"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DepositScreen() {
  const nav = useNav();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [kind, setKind] = useState("전체");
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-08-31");
  const [applied, setApplied] = useState({ kind: "전체", from: "2026-08-01", to: "2026-08-31" });
  const list = useMemo(() => {
    return deposits.filter((d) => {
      const byKind = applied.kind === "전체" || d.status === applied.kind;
      const day = d.requestedAt.slice(0, 10).replace(/\./g, "-");
      const byDate = day >= applied.from && day <= applied.to;
      return byKind && byDate;
    });
  }, [applied]);

  if (pickedId) {
    const d = deposits.find((x) => x.id === pickedId) ?? deposits[0];
    return <VaDetail deposit={d} onBack={() => setPickedId(null)} />;
  }

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="가상계좌 입금내역" onBack={nav.back} />
      <div className="va-acc">
        <div>
          <span>입금은행</span>
          <b>{vaAccount.bank}</b>
        </div>
        <div>
          <span>계좌번호</span>
          <b className="num">{vaAccount.number}</b>
        </div>
      </div>
      <div className="va-filter">
        <label className="tr-brand-field">
          <span>처리구분</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="전체">전체</option>
            <option value="처리">처리</option>
            <option value="미처리">미처리</option>
          </select>
        </label>
        <div className="va-dates">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span>~</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button
            className="btn sm primary"
            type="button"
            onClick={() => setApplied({ kind, from, to })}
          >
            조회
          </button>
        </div>
      </div>
      <div className="va-list">
        {list.length === 0 ? (
          <p className="empty">조회 결과가 없습니다.</p>
        ) : (
          list.map((d) => (
            <div className="va-item" key={d.id}>
              <div className="va-item-h">
                <b>{krw(d.amount)}</b>
                <span className={`badge ${d.status === "처리" ? "blue" : "amber"}`}>{d.status}</span>
              </div>
              <dl>
                <div>
                  <dt>입금은행</dt>
                  <dd>{d.bank}</dd>
                </div>
                <div>
                  <dt>입금요청 일자</dt>
                  <dd>{d.requestedAt}</dd>
                </div>
                <div>
                  <dt>입금처리 일자</dt>
                  <dd>{d.processedAt ?? "-"}</dd>
                </div>
              </dl>
              <button className="btn outline" type="button" onClick={() => setPickedId(d.id)}>
                상세보기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function VaDetail({
  deposit,
  onBack,
}: {
  deposit: (typeof deposits)[number];
  onBack: () => void;
}) {
  const [extra, setExtra] = useState("0");
  const [promo, setPromo] = useState("0");
  const extraN = Number(extra.replace(/\D/g, "")) || 0;
  const promoN = Number(promo.replace(/\D/g, "")) || 0;
  const requestAmt = deposit.selected + extraN + promoN;
  const setNum = (raw: string, fn: (v: string) => void) => {
    const n = raw.replace(/\D/g, "");
    fn(n ? String(Number(n)) : "0");
  };

  return (
    <div className="app-scroll" style={{ background: "#fff" }}>
      <TopBar title="가상계좌 등록요청" onBack={onBack} />
      <p className="va-note">※가상계좌에 입금한 대상 금액을 선택하여 주세요.</p>
      <div className="va-sum">
        <div>
          <span>가상계좌 입금금액</span>
          <b>{krw(deposit.amount)}</b>
        </div>
        <div>
          <span>영업점 처리요청액(①+②+③)</span>
          <b>{krw(requestAmt)}</b>
        </div>
      </div>
      <div className="va-box">
        <div>
          <span>① 수금내역 선택금액 (포인트제외)</span>
          <em>{krw(deposit.selected)}</em>
        </div>
        <label>
          <span>② 기타 상품대(IRIS)</span>
          <input inputMode="numeric" value={extra} onChange={(e) => setNum(e.target.value, setExtra)} />
          <i>원</i>
        </label>
        <label>
          <span>③ 유상판촉 대금</span>
          <input inputMode="numeric" value={promo} onChange={(e) => setNum(e.target.value, setPromo)} />
          <i>원</i>
        </label>
      </div>
      {deposit.items.length === 0 ? (
        <p className="empty">연결된 수금내역이 없습니다.</p>
      ) : (
        deposit.items.map((it) => (
          <div className="va-cust" key={`${it.no}-${it.at}`}>
            <div>
              <span>고객번호</span>
              <b>
                {it.no} | {it.name}
              </b>
            </div>
            <div>
              <span>{it.method}</span>
              <b>{krw(it.amount)}</b>
            </div>
            <div>
              <span>수금일시</span>
              <em>{it.at}</em>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
