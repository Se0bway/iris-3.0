import type { ReactNode } from "react";
import { IconBell, IconChevron } from "./icons";
import { useNav } from "./nav";
import type { Level } from "./types";

const PHOTO_ALIAS: Record<string, string> = {
  m1: "me",
  m2: "c2",
  m3: "c4",
  m4: "c8",
  m5: "c5",
};

export function photoUrl(id: string, _gender?: "f" | "m") {
  const key = PHOTO_ALIAS[id] ?? id;
  return `/photos/${key}.png`;
}

export function Photo({
  id,
  name,
  size = 44,
  gender,
}: {
  id: string;
  name: string;
  size?: number;
  gender?: "f" | "m";
}) {
  return (
    <img
      className="photo"
      src={photoUrl(id, gender)}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}

export function AppHeader() {
  const nav = useNav();
  return (
    <header className="app-header">
      <button className="iris-brand" type="button" onClick={() => nav.go("home")}>
        <span className="iris-mark">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          </svg>
        </span>
        <span className="iris-word">IRIS</span>
      </button>
      <div className="header-actions">
        <button className="icon-btn" type="button" onClick={() => nav.go("board")} aria-label="알림">
          <IconBell width={18} height={18} />
        </button>
        <button
          className="icon-btn"
          type="button"
          onClick={() => nav.go("profile")}
          aria-label="내 정보"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <img className="header-avatar" src={photoUrl("me")} alt="" />
        </button>
      </div>
    </header>
  );
}

export function Section({
  title,
  count,
  action,
  onAction,
  children,
}: {
  title: string;
  count?: number;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-h">
        <h4>
          {title}
          {count != null ? ` ${count}` : ""}
        </h4>
        {action ? (
          <button type="button" onClick={onAction}>
            {action}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: "blue" | "gray" | "green" | "amber" | "red";
  children: ReactNode;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function riskTone(v: Level): "red" | "amber" | "green" {
  if (v === "high") return "red";
  if (v === "medium") return "amber";
  return "green";
}

export function Avatar({ name }: { name: string }) {
  return <div className="avatar">{name.slice(0, 1)}</div>;
}

export function PersonRow({
  name,
  meta,
  right,
  onClick,
  id,
}: {
  name: string;
  meta: string;
  right?: ReactNode;
  onClick?: () => void;
  id?: string;
}) {
  return (
    <button type="button" className="row" onClick={onClick}>
      {id ? <Photo id={id} name={name} size={40} /> : <Avatar name={name} />}
      <div className="meta">
        <b>{name}</b>
        <p>{meta}</p>
      </div>
      <div className="right">{right ?? <IconChevron />}</div>
    </button>
  );
}

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="topbar">
      {onBack ? (
        <div className="back-title">
          <button type="button" onClick={onBack} aria-label="뒤로">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 5 8 12l7 7" />
            </svg>
          </button>
          <h2>{title}</h2>
        </div>
      ) : (
        <h2>{title}</h2>
      )}
      {right ?? <span style={{ width: 34 }} />}
    </div>
  );
}
