import { useState } from "react";
import { closing, counselor, hqEducations, members, products, RANKS } from "../data";
import { krw } from "../lib";
import { useNav } from "../nav";
import { AppHeader, PersonRow, Photo, TopBar } from "../ui";
import { IconChevron } from "../icons";

const stockQty = products.reduce((s, p) => s + p.stock, 0);
const stockAmt = products.reduce((s, p) => s + p.stock * p.price, 0);
const attendDays = 14;
const liveDone = 8;
const liveTotal = 12;
const incentiveEst = 1_860_000;
const ownSales = 8_240_000;
const editCommission = 328_000;

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
              <Photo id="me" name={counselor.name} size={64} />
              <div>
                <h4>{counselor.name}</h4>
                <p>
                  {counselor.rank} · {counselor.branch}
                </p>
              </div>
            </button>
            <button className="rank-chip" type="button" onClick={() => nav.go("rank")}>
              직급
            </button>
          </div>
          <div className="mp-profile-stats">
            <button className="mp-stat" type="button" onClick={() => nav.go("incentive")}>
              <div className="l">예상 인센티브</div>
              <div className="v">{krw(incentiveEst)}</div>
            </button>
            <button className="mp-stat" type="button" onClick={() => nav.go("editshop")}>
              <div className="l">에딧샵 커미션</div>
              <div className="v">{krw(editCommission)}</div>
            </button>
          </div>
        </div>

        <button className="mp-card" type="button" onClick={() => nav.go("attendance")}>
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
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="에딧샵 커미션" onBack={nav.back} />
      <div className="ext-card">
        <div style={{ fontSize: 12, color: "var(--muted)" }}>예상 커미션</div>
        <div className="big-num">{krw(editCommission)}</div>
        <p>에딧샵에서 발생한 커미션 상세와 정산 내역을 확인합니다. 에딧샵 서비스로 이동합니다.</p>
        <button className="btn primary" type="button" onClick={() => nav.setToast("에딧샵으로 연결됩니다. 로컬 프로토타입에서는 이동하지 않습니다.")}>
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
          {nav.checkedIn ? (
            <div className="done-tag">오늘 출근이 등록되었습니다</div>
          ) : (
            <button className="btn primary" type="button" onClick={nav.checkIn}>
              출근 등록
            </button>
          )}
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
  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <TopBar title="재고조회" onBack={nav.back} />
      <div className="pad">
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
          {products.map((p) => (
            <div className="row" key={p.id}>
              <div className="meta">
                <b>
                  {p.brand} {p.name}
                </b>
                <p>{krw(p.price)}</p>
              </div>
              <div className="right amt">{p.stock}개</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MembersScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <TopBar title="그룹원" onBack={nav.back} />
      <div className="pad">
        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>그룹 매출</div>
          <div className="big-num">{krw(41200000)}</div>
        </div>
        <div className="card list-card">
          {members.map((m) => (
            <PersonRow
              key={m.id}
              id={m.id}
              name={m.name}
              meta={`${m.rank} · ${m.education}`}
              right={<span className="amt">{krw(m.sales)}</span>}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DepositScreen() {
  const nav = useNav();
  return (
    <div className="app-scroll">
      <TopBar title="입금내역" onBack={nav.back} />
      <div className="notice">입금 상세는 판매/수금 탭의 수금 등록과 함께 사용합니다.</div>
      <div className="pad">
        <button className="btn primary" type="button" onClick={() => nav.go("collection")}>
          수금 등록으로 이동
        </button>
      </div>
    </div>
  );
}
