import { useState } from "react";
import { TODAY, counselor, customers, homeGroups, hqPosts } from "../data";
import {
  IconBottle,
  IconCake,
  IconChevron,
  IconDown,
  IconPill,
  IconSpark,
  IconStethoscope,
  IconTrend,
  IconWon,
} from "../icons";
import { custType, dueText, formatDot, koreanDate } from "../lib";
import { useNav } from "../nav";
import type { Customer } from "../types";
import { AppHeader } from "../ui";

const icons = {
  blue: IconStethoscope,
  purple: IconBottle,
  green: IconTrend,
  orange: IconCake,
  teal: IconPill,
  red: IconSpark,
};

const iconById: Record<string, (typeof icons)[keyof typeof icons]> = {
  birthday: IconCake,
  pointsExpire: IconSpark,
  reward: IconWon,
};

function PersonRow({
  c,
  why,
  onClick,
}: {
  c: Customer;
  why?: string;
  onClick: () => void;
}) {
  return (
    <button className="person" type="button" onClick={onClick}>
      <span className="who">
        <span className="name-row">
          <b>{c.name}</b>
          <span className="tag">{custType(c)}</span>
          {why ? <span className="why-chip">{why}</span> : null}
        </span>
        <p className="sub">
          {formatDot(c.birth)} ({c.age}세)
          <br />
          최근 진단 {c.lastDiagnosis ?? formatDot(c.lastConsultAt ?? c.lastPurchaseAt)}
        </p>
      </span>
      <span className="due-pill">{dueText(c)}</span>
      <IconChevron width={16} height={16} style={{ color: "#c5cad3" }} />
    </button>
  );
}

export function HomeScreen() {
  const nav = useNav();
  const [open, setOpen] = useState("");

  const blocks = homeGroups.map((g) => ({
    id: g.id,
    title: g.title,
    desc: g.desc,
    tone: g.tone,
    count: g.count,
    people: g.ids
      .map((id) => customers.find((c) => c.id === id))
      .filter((c): c is Customer => Boolean(c))
      .map((c) => ({ c, why: undefined as string | undefined })),
  }));

  return (
    <div className="app-scroll" style={{ background: "var(--bg)" }}>
      <AppHeader />
      <div className="hello">
        <p className="who">안녕하세요 {counselor.name}님~</p>
      </div>

      <button className="hq-board" type="button" onClick={() => nav.go("board")}>
        <div className="hq-board-h">
          <b>게시판</b>
          <span>
            더보기
            <IconChevron width={14} height={14} />
          </span>
        </div>
        {hqPosts.map((p) => (
          <div className="hq-post" key={p.id}>
            <em className={p.tag === "필수" ? "must" : ""}>{p.tag}</em>
            <p>{p.title}</p>
            <span>{p.date}</span>
          </div>
        ))}
      </button>

      <nav className="home-links" aria-label="바로가기">
        <button
          type="button"
          onClick={() => nav.setToast("에딧샵으로 연결됩니다. 로컬 프로토타입에서는 이동하지 않습니다.")}
        >
          에딧샵
        </button>
        <button
          type="button"
          onClick={() => nav.setToast("뷰티스퀘어로 연결됩니다. 로컬 프로토타입에서는 이동하지 않습니다.")}
        >
          뷰티스퀘어
        </button>
        <button type="button" className="in" onClick={() => nav.go("guestskin")}>
          피부진단
        </button>
      </nav>

      <div className="home-title">
        <h3>오늘 확인할 고객</h3>
        <span className="today-chip">{koreanDate(TODAY)}</span>
      </div>
      <div className="home-list">
        {blocks.map((g) => {
          const Icon = iconById[g.id] ?? icons[g.tone];
          const expanded = open === g.id;
          return (
            <div className="acc" key={g.id}>
              <button className="acc-head" type="button" onClick={() => setOpen(expanded ? "" : g.id)}>
                <span className={`acc-ic ${g.tone}`}>
                  <Icon width={22} height={22} />
                </span>
                <span className="acc-copy">
                  <b>{g.title}</b>
                  <p>{g.desc}</p>
                </span>
                <span className="acc-count">{g.count}</span>
                <span className={`acc-chevron ${expanded ? "open" : ""}`}>
                  <IconDown width={18} height={18} />
                </span>
              </button>
              {expanded ? (
                <div className="acc-people">
                  {g.people.map(({ c, why }) => (
                    <PersonRow
                      key={c.id}
                      c={c}
                      why={why}
                      onClick={() => nav.go("customer", { customerId: c.id })}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
