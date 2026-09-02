import type { ReactNode } from "react";
import { IconBack, IconBell, IconChevron } from "./icons";
import { useNav } from "./nav";
import type { Level } from "./types";

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
        <button className="icon-btn" type="button" onClick={() => nav.go("push")} aria-label="알림">
          <IconBell width={18} height={18} />
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

export function PersonRow({
  name,
  meta,
  right,
  onClick,
}: {
  name: string;
  meta: string;
  right?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="row" onClick={onClick}>
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
            <IconBack width={22} height={22} />
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
