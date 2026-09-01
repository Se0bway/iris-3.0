import { useEffect, useMemo, useState } from "react";
import { screenNotes, sitemap } from "./data";
import { ConsultProvider } from "./consult";
import {
  IconBox,
  IconCalendar,
  IconChat,
  IconCheck,
  IconDown,
  IconEdit,
  IconHome,
  IconUser,
  IconUsers,
  IconWon,
} from "./icons";
import { NavContext, type NavState } from "./nav";
import { BoardScreen, ChatScreen, LinksScreen, MessageScreen, PushScreen } from "./screens/Ai";
import { CustomerScreen, CustomersScreen, GuestSkinScreen, NoteScreen, RegisterScreen, SkinDiagScreen } from "./screens/Customers";
import { HomeScreen } from "./screens/Home";
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
  OrderScreen,
  PromoScreen,
  SalesScreen,
  SlipsScreen,
  TradeScreen,
  WorkScreen,
} from "./screens/Work";
import type { MessageType, ScreenId } from "./types";

const tabs: { id: ScreenId; label: string; icon: typeof IconHome; office?: boolean }[] = [
  { id: "home", label: "홈", icon: IconHome },
  { id: "customers", label: "고객", icon: IconUsers },
  { id: "mypage", label: "마이오피스", icon: IconUser, office: true },
  { id: "work", label: "주문", icon: IconBox },
  { id: "trade", label: "판매/수금", icon: IconWon },
];

const tabScreens = new Set<ScreenId>(["home", "customers", "work", "trade", "mypage"]);

function isAuthed(screen: ScreenId) {
  return screen !== "login" && screen !== "mfa";
}

function activeTabOf(screen: ScreenId): ScreenId {
  if (screen === "customer" || screen === "message" || screen === "skindiag" || screen === "guestskin" || screen === "note" || screen === "register") return "customers";
  if (tabScreens.has(screen)) return screen;
  if (["promo", "order", "stock"].includes(screen)) return "work";
  if (["slips", "sales", "collection"].includes(screen)) return "trade";
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
      "deposit",
      "incentive",
      "editshop",
      "live",
      "education",
      "chat",
      "links",
      "board",
      "push",
    ].includes(screen)
  ) {
    return "mypage";
  }
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
    case "promo":
      return <PromoScreen />;
    case "order":
      return <OrderScreen />;
    case "trade":
      return <TradeScreen />;
    case "slips":
      return <SlipsScreen />;
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

  const activeTab = activeTabOf(state.screen);

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
            </div>
            <div className="stage-note">{screenNotes[state.screen]}</div>
          </div>
          <div className="phone-wrap">
            <div className="phone">
              <div className="phone-status">
                <span>9:41</span>
                <span>IRIS</span>
                <span>100%</span>
              </div>
              <div className="app">
                <ScreenInner screen={state.screen} />
                {isAuthed(state.screen) && state.screen !== "register" ? (
                  state.fabsHidden ? (
                    <button
                      className={`fab-peek ${state.screen === "chat" ? "over-chat" : ""}`}
                      type="button"
                      onClick={api.toggleFabs}
                      aria-label="플로팅 버튼 보기"
                    >
                      <IconDown width={16} height={16} style={{ transform: "rotate(180deg)" }} />
                    </button>
                  ) : (
                    <div className={`fab-stack ${state.screen === "chat" ? "over-chat" : ""}`}>
                      <button className="fab-hide" type="button" onClick={api.toggleFabs} aria-label="플로팅 버튼 숨기기">
                        <IconDown width={14} height={14} />
                      </button>
                      {state.screen !== "attendance" ? (
                        <button
                          className={`fab-checkin ${state.checkedIn ? "done" : ""}`}
                          type="button"
                          onClick={() => {
                            if (state.checkedIn) api.go("attendance");
                            else api.checkIn();
                          }}
                          aria-label={state.checkedIn ? "출근완료" : "출근 등록"}
                        >
                          {state.checkedIn ? <IconCheck width={20} height={20} /> : <IconCalendar width={20} height={20} />}
                          <span>{state.checkedIn ? "완료" : "출근"}</span>
                        </button>
                      ) : null}
                      {state.screen !== "note" ? (
                        <button className="fab-note" type="button" onClick={() => api.go("note")} aria-label="상담">
                          <IconEdit width={18} height={18} />
                          <span>상담</span>
                        </button>
                      ) : null}
                      {state.screen !== "chat" ? (
                        <button className="fab-ai" type="button" onClick={() => api.go("chat")} aria-label="챗봇">
                          <IconChat width={18} height={18} />
                          <span>챗봇</span>
                        </button>
                      ) : null}
                    </div>
                  )
                ) : null}
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
                            aria-label="마이오피스"
                          >
                            <span className="office-btn">
                              <span>마이</span>
                              <span>오피스</span>
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
              {state.toast ? <div className="toast">{state.toast}</div> : null}
            </div>
          </div>
        </main>
      </div>
    </NavContext.Provider>
    </ConsultProvider>
  );
}
