import { useEffect, useMemo, useState } from "react";
import { screenNotes, sitemap } from "./data";
import { FeedbackSheet } from "./Feedback";
import { downloadIaExcel } from "./exportIa";
import { ConsultProvider } from "./consult";
import {
  IconBox,
  IconChat,
  IconDown,
  IconHome,
  IconUser,
  IconUsers,
  IconWon,
} from "./icons";
import { NavContext, type NavState } from "./nav";
import { BoardScreen, ChatScreen, LinksScreen, MessageScreen, PushScreen } from "./screens/Ai";
import { CustomerScreen, CustomersScreen, GuestSkinScreen, NoteScreen, PointGiftScreen, RegisterScreen, SkinDiagScreen, StoppedScreen } from "./screens/Customers";
import { HomeScreen } from "./screens/Home";
import { PerfGroupScreen, PerfMineScreen, PerfScreen } from "./screens/Perf";
import { LoginScreen, MfaScreen } from "./screens/Login";
import {
  AttendanceScreen,
  DepositScreen,
  EditShopScreen,
  EducationScreen,
  IncentiveScreen,
  LiveScreen,
  MembersScreen,
  MyPageScreen,
  ProfileScreen,
  RankScreen,
  StockScreen,
} from "./screens/MyPage";
import {
  AnniversaryScreen,
  HistoryScreen,
  PlccScreen,
  PointsScreen,
  StatusScreen,
} from "./screens/Status";
import {
  CollectionScreen,
  LedgerScreen,
  OrderLookupScreen,
  OrderScreen,
  PromoScreen,
  SaleHistoryScreen,
  SalesScreen,
  SlipsScreen,
  CancelledSlipsScreen,
  TradeHistoryScreen,
  TradeScreen,
  WorkScreen,
} from "./screens/Work";
import type { MessageType, ScreenId } from "./types";

const SHARE_URL = typeof window !== "undefined" ? window.location.origin : "";
const PHONE_URL = `${SHARE_URL}?phone=1`;
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&ecc=M&data=${encodeURIComponent(PHONE_URL)}`;

type TabDef = { id: ScreenId; label: string; icon: typeof IconBox; office?: boolean };

function usePhoneShell() {
  const [phoneShell, setPhoneShell] = useState(() => {
    if (typeof window === "undefined") return false;
    const q = new URLSearchParams(window.location.search);
    if (q.get("phone") === "1") return true;
    const ua = navigator.userAgent;
    if (/Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true;
    return window.matchMedia("(max-width: 860px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const sync = () => {
      const q = new URLSearchParams(window.location.search);
      const ua = navigator.userAgent;
      setPhoneShell(
        q.get("phone") === "1" ||
          /Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
          mq.matches
      );
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return phoneShell;
}

const tabs: TabDef[] = [
  { id: "home", label: "홈", icon: IconHome },
  { id: "customers", label: "고객", icon: IconUsers },
  { id: "mypage", label: "마이페이지", icon: IconUser, office: true },
  { id: "work", label: "주문/입금", icon: IconBox },
  { id: "trade", label: "판매/수금", icon: IconWon },
];

function isAuthed(screen: ScreenId) {
  return screen !== "login" && screen !== "mfa";
}

function activeTabOf(screen: ScreenId, customerId?: string): ScreenId {
  if (screen === "pointGift") return customerId === "self" ? "mypage" : "customers";
  if (screen === "customer" || screen === "message" || screen === "skindiag" || screen === "guestskin" || screen === "note" || screen === "register" || screen === "stopped") return "customers";
  if (["promo", "order", "orderLookup", "stock", "deposit"].includes(screen)) return "work";
  if (["trade", "tradeHistory", "slips", "cancelledSlips", "ledger", "saleHistory", "sales", "collection"].includes(screen)) return "trade";
  if (
    [
      "status",
      "history",
      "plcc",
      "points",
      "anniversaries",
      "members",
      "attendance",
      "rank",
      "profile",
      "incentive",
      "editshop",
      "live",
      "education",
      "chat",
      "links",
      "board",
      "push",
      "perf",
      "perfMine",
      "perfGroup",
    ].includes(screen)
  ) {
    return "mypage";
  }
  if (tabs.some((t) => t.id === screen)) return screen;
  return "home";
}

function ScreenInner({ screen }: { screen: ScreenId }) {
  switch (screen) {
    case "login":
      return <LoginScreen />;
    case "mfa":
      return <MfaScreen />;
    case "home":
      return <HomeScreen />;
    case "customers":
      return <CustomersScreen />;
    case "stopped":
      return <StoppedScreen />;
    case "customer":
      return <CustomerScreen />;
    case "message":
      return <MessageScreen />;
    case "skindiag":
      return <SkinDiagScreen />;
    case "guestskin":
      return <GuestSkinScreen />;
    case "note":
      return <NoteScreen />;
    case "pointGift":
      return <PointGiftScreen />;
    case "register":
      return <RegisterScreen />;
    case "chat":
      return <ChatScreen />;
    case "links":
      return <LinksScreen />;
    case "board":
      return <BoardScreen />;
    case "push":
      return <PushScreen />;
    case "work":
      return <WorkScreen />;
    case "perf":
      return <PerfScreen />;
    case "perfMine":
      return <PerfMineScreen />;
    case "perfGroup":
      return <PerfGroupScreen />;
    case "promo":
      return <PromoScreen />;
    case "order":
      return <OrderScreen />;
    case "orderLookup":
      return <OrderLookupScreen />;
    case "trade":
      return <TradeScreen />;
    case "tradeHistory":
      return <TradeHistoryScreen />;
    case "slips":
      return <SlipsScreen />;
    case "cancelledSlips":
      return <CancelledSlipsScreen />;
    case "ledger":
      return <LedgerScreen />;
    case "saleHistory":
      return <SaleHistoryScreen />;
    case "sales":
      return <SalesScreen />;
    case "collection":
      return <CollectionScreen />;
    case "status":
      return <StatusScreen />;
    case "history":
      return <HistoryScreen />;
    case "plcc":
      return <PlccScreen />;
    case "points":
      return <PointsScreen />;
    case "anniversaries":
      return <AnniversaryScreen />;
    case "mypage":
      return <MyPageScreen />;
    case "members":
      return <MembersScreen />;
    case "attendance":
      return <AttendanceScreen />;
    case "rank":
      return <RankScreen />;
    case "profile":
      return <ProfileScreen />;
    case "incentive":
      return <IncentiveScreen />;
    case "editshop":
      return <EditShopScreen />;
    case "live":
      return <LiveScreen />;
    case "education":
      return <EducationScreen />;
    case "stock":
      return <StockScreen />;
    case "deposit":
      return <DepositScreen />;
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  const [state, setState] = useState<NavState>({
    screen: "home",
    stack: [],
    customerId: "c13",
    messageType: "followup",
    toast: "",
    checkedIn: false,
    fabsHidden: false,
    draftName: "",
    draftPhone: "",
  });
  const [fbOpen, setFbOpen] = useState(false);

  const api = useMemo(
    () => ({
      ...state,
      go: (screen: ScreenId, extra?: { customerId?: string; messageType?: MessageType; name?: string; phone?: string }) => {
        setState((s) => ({
          ...s,
          stack: s.screen === screen ? s.stack : [...s.stack, s.screen],
          screen,
          customerId: extra?.customerId ?? s.customerId,
          messageType: extra?.messageType ?? s.messageType,
          draftName: screen === "register" ? extra?.name ?? "" : extra && "name" in extra ? extra.name ?? "" : s.draftName,
          draftPhone: screen === "register" ? extra?.phone ?? "" : extra && "phone" in extra ? extra.phone ?? "" : s.draftPhone,
        }));
      },
      back: () => {
        setState((s) => {
          const stack = [...s.stack];
          const prev = stack.pop() ?? (isAuthed(s.screen) ? "home" : "login");
          return { ...s, stack, screen: prev };
        });
      },
      setToast: (msg: string) => setState((s) => ({ ...s, toast: msg })),
      checkIn: () => {
        setState((s) => {
          if (s.checkedIn) return s;
          return { ...s, checkedIn: true, toast: "출근이 등록되었습니다" };
        });
      },
      toggleFabs: () => setState((s) => ({ ...s, fabsHidden: !s.fabsHidden })),
    }),
    [state]
  );

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => setState((s) => ({ ...s, toast: "" })), 2200);
    return () => clearTimeout(t);
  }, [state.toast]);

  const activeTab = activeTabOf(state.screen, state.customerId);
  const phoneShell = usePhoneShell();

  useEffect(() => {
    document.documentElement.classList.toggle("phone-shell", phoneShell);
    document.body.classList.toggle("phone-shell", phoneShell);
    return () => {
      document.documentElement.classList.remove("phone-shell");
      document.body.classList.remove("phone-shell");
    };
  }, [phoneShell]);

  const phone = (
            <div className={`phone${phoneShell ? " phone-live" : ""}`}>
              <div className="phone-status">
                <span>9:41</span>
                <span className="phone-status-icons" aria-hidden>
                  <svg viewBox="0 0 16 16" width="14" height="14">
                    <rect x="1" y="10" width="2.2" height="4" rx=".4" fill="currentColor" />
                    <rect x="4.6" y="7.5" width="2.2" height="6.5" rx=".4" fill="currentColor" />
                    <rect x="8.2" y="5" width="2.2" height="9" rx=".4" fill="currentColor" />
                    <rect x="11.8" y="2.5" width="2.2" height="11.5" rx=".4" fill="currentColor" opacity=".35" />
                  </svg>
                  <svg viewBox="0 0 16 16" width="14" height="14">
                    <path d="M2.2 6.6a8.4 8.4 0 0 1 11.6 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M4.6 9.2a5 5 0 0 1 6.8 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="8" cy="12.4" r="1.2" fill="currentColor" />
                  </svg>
                  <svg viewBox="0 0 22 12" width="20" height="11">
                    <rect x=".7" y=".7" width="18" height="10.6" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="2.2" y="2.3" width="13.6" height="7.4" rx="1" fill="currentColor" />
                    <rect x="19.4" y="3.6" width="1.8" height="4.8" rx=".6" fill="currentColor" />
                  </svg>
                </span>
              </div>
              <div className="app">
                <ScreenInner screen={state.screen} />
                {state.screen !== "register" ? (
                  isAuthed(state.screen) && state.fabsHidden ? (
                    <button
                      className={`fab-peek ${state.screen === "chat" ? "over-chat" : ""}`}
                      type="button"
                      onClick={api.toggleFabs}
                      aria-label="플로팅 버튼 보기"
                    >
                      <IconDown width={16} height={16} style={{ transform: "rotate(180deg)" }} />
                    </button>
                  ) : (
                    <div
                      className={`fab-stack${isAuthed(state.screen) ? "" : " guest"}${state.screen === "chat" ? " over-chat" : ""}`}
                    >
                      {isAuthed(state.screen) ? (
                        <button className="fab-hide" type="button" onClick={api.toggleFabs} aria-label="플로팅 버튼 숨기기">
                          <IconDown width={14} height={14} />
                        </button>
                      ) : null}
                      <button className="fab-ai fab-fb" type="button" onClick={() => setFbOpen(true)} aria-label="의견">
                        <span>의견</span>
                      </button>
                      {isAuthed(state.screen) && state.screen !== "chat" ? (
                        <button className="fab-ai" type="button" onClick={() => api.go("chat")} aria-label="챗봇">
                          <IconChat width={18} height={18} />
                          <span>챗봇</span>
                        </button>
                      ) : null}
                    </div>
                  )
                ) : null}
                <FeedbackSheet screen={state.screen} open={fbOpen} onClose={() => setFbOpen(false)} />
                {isAuthed(state.screen) ? (
                  <nav className="tabbar">
                    {tabs.map((t) => {
                      const Icon = t.icon;
                      if (t.office) {
                        return (
                          <button
                            key={t.id}
                            className={`tab office ${activeTab === t.id ? "on" : ""}`}
                            type="button"
                            onClick={() => api.go(t.id)}
                            aria-label="마이페이지"
                          >
                            <span className="office-btn">
                              <span>마이</span>
                              <span>페이지</span>
                            </span>
                          </button>
                        );
                      }
                      return (
                        <button
                          key={t.id}
                          className={`tab ${activeTab === t.id ? "on" : ""}`}
                          type="button"
                          onClick={() => api.go(t.id)}
                        >
                          <span className="ai-dot">
                            <Icon width={20} height={20} />
                          </span>
                          {t.label}
                        </button>
                      );
                    })}
                  </nav>
                ) : null}
              </div>
              <div className="phone-gesture" aria-hidden>
                <span />
              </div>
              {state.toast ? <div className="toast">{state.toast}</div> : null}
            </div>
  );

  if (phoneShell) {
    return (
      <ConsultProvider>
        <NavContext.Provider value={api}>{phone}</NavContext.Provider>
      </ConsultProvider>
    );
  }

  return (
    <ConsultProvider>
    <NavContext.Provider value={api}>
      <div className="studio">
        <aside className="side">
          <div className="side-brand">
            <div className="side-logo">IR</div>
            <div>
              <strong>IRIS 3.0</strong>
              <span>Sales Operating Platform</span>
            </div>
          </div>
          <div className="side-kicker">Information architecture</div>
          {sitemap.map((g) => (
            <div className="nav-group" key={g.label}>
              {g.children ? <div className="nav-parent">{g.label}</div> : null}
              {(g.children ?? [g]).map((item) => (
                <button
                  key={item.label}
                  className={`nav-item ${g.children ? "nav-child" : ""} ${state.screen === item.id ? "on" : ""}`}
                  type="button"
                  onClick={() => api.go(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>
        <main className="stage">
          <div className="stage-head">
            <div>
              <h1>IRIS 3.0 로컬 프로토타입</h1>
              <p>기획 검증용입니다. 왼쪽 메뉴를 누르거나 폰 화면을 직접 조작하세요.</p>
              <p className="share-url">
                모바일 공유{" "}
                <a href={PHONE_URL} target="_blank" rel="noreferrer">
                  {PHONE_URL}
                </a>
              </p>
            </div>
            <div className="stage-head-aside">
              <button className="ia-export" type="button" onClick={downloadIaExcel}>
                메뉴구조도 엑셀
              </button>
              <div className="stage-note">{screenNotes[state.screen]}</div>
            </div>
          </div>
          <div className="phone-wrap">{phone}</div>
        </main>
        <aside className="qr-dock">
          <img src={QR_SRC} width={176} height={176} alt="모바일 접속 QR" />
          <strong>모바일로 스캔</strong>
          <span>카메라로 찍으면 폰 화면만 열립니다</span>
          <span className="qr-url">{PHONE_URL}</span>
        </aside>
      </div>
    </NavContext.Provider>
    </ConsultProvider>
  );
}
