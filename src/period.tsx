import { useState, type ReactNode } from "react";
import { TODAY } from "./data";
import { IconCalendar, IconCheck, IconChevron } from "./icons";

export type DateSpan = { dateStart: string; dateEnd: string };
export type MoneySpan = "cur" | "prev" | "m3" | "m6";

export const MONEY_OPTS = [
  ["cur", "당월"],
  ["prev", "전월"],
  ["m3", "3개월"],
  ["m6", "6개월"],
] as const;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatPretty(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}. ${Number(m)}. ${Number(d)}.`;
}

export const todayY = Number(TODAY.slice(0, 4));
export const todayM = Number(TODAY.slice(5, 7));

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function addMonths(y: number, m: number, delta: number) {
  const t = y * 12 + (m - 1) + delta;
  return { y: Math.floor(t / 12), m: (t % 12) + 1 };
}

export function ymKey(y: number, m: number) {
  return `${y}-${pad2(m)}`;
}

export function addMonthsIso(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = addMonths(y, m, delta);
  const last = new Date(t.y, t.m, 0).getDate();
  return `${t.y}-${pad2(t.m)}-${pad2(Math.min(d, last))}`;
}

export function lastDom(y: number, m: number) {
  return pad2(new Date(y, m, 0).getDate());
}

export function monthStartEnd(y: number, m: number): DateSpan {
  return { dateStart: `${ymKey(y, m)}-01`, dateEnd: `${ymKey(y, m)}-${lastDom(y, m)}` };
}

export function moneyDates(span: MoneySpan): DateSpan {
  if (span === "cur") return { dateStart: `${ymKey(todayY, todayM)}-01`, dateEnd: TODAY };
  if (span === "prev") {
    const p = addMonths(todayY, todayM, -1);
    return monthStartEnd(p.y, p.m);
  }
  const back = addMonths(todayY, todayM, span === "m3" ? -2 : -5);
  return { dateStart: `${ymKey(back.y, back.m)}-01`, dateEnd: TODAY };
}

export function PeriodPicks<T extends string | number>({
  value,
  options,
  onChange,
  customOn,
  onCustom,
}: {
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
  customOn: boolean;
  onCustom: () => void;
}) {
  return (
    <div className="period-btns">
      {options.map(([id, label]) => (
        <button key={String(id)} className={`period-btn ${!customOn && value === id ? "on" : ""}`} type="button" onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
      <button className={`period-btn ${customOn ? "on" : ""}`} type="button" onClick={onCustom}>
        기간설정
      </button>
    </div>
  );
}

export function RangeDateBar({
  start,
  end,
  onOpen,
}: {
  start: string;
  end: string;
  onOpen: (which: "start" | "end") => void;
}) {
  return (
    <div className="range-bar">
      <button type="button" onClick={() => onOpen("start")} aria-label={`시작일 ${formatPretty(start)}`}>
        <span>{formatPretty(start)}</span>
        <IconCalendar width={18} height={18} />
      </button>
      <i>~</i>
      <button type="button" onClick={() => onOpen("end")} aria-label={`종료일 ${formatPretty(end)}`}>
        <span>{formatPretty(end)}</span>
        <IconCalendar width={18} height={18} />
      </button>
    </div>
  );
}

export function CalSheet({
  value,
  min,
  max,
  onConfirm,
  onClose,
}: {
  value: string;
  min: string;
  max: string;
  onConfirm: (ymd: string) => void;
  onClose: () => void;
}) {
  const origin = value.split("-").map(Number);
  const [view, setView] = useState({ y: origin[0], m: origin[1] });
  const [draft, setDraft] = useState(value);
  const [pickYm, setPickYm] = useState(false);

  const nDays = new Date(view.y, view.m, 0).getDate();
  const firstDow = new Date(view.y, view.m - 1, 1).getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: nDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const isoOf = (d: number) => `${view.y}-${pad2(view.m)}-${pad2(d)}`;
  const out = (iso: string) => iso < min || iso > max;

  return (
    <div className="cal-mask" onClick={onClose} role="presentation">
      <div className="cal-sheet" role="dialog" aria-label="날짜 선택" onClick={(e) => e.stopPropagation()}>
        <div className="cal-h">
          <button type="button" className="cal-ym" onClick={() => setPickYm((s) => !s)}>
            <b>
              {view.y}년 {view.m}월
            </b>
            <IconChevron width={16} height={16} />
          </button>
          <div className="cal-nav">
            <button type="button" onClick={() => setView((v) => addMonths(v.y, v.m, -1))} aria-label="이전 달">
              <IconChevron width={18} height={18} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button type="button" onClick={() => setView((v) => addMonths(v.y, v.m, 1))} aria-label="다음 달">
              <IconChevron width={18} height={18} />
            </button>
          </div>
        </div>
        {pickYm ? (
          <div className="cal-months">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((mm) => (
              <button
                key={mm}
                type="button"
                className={mm === view.m ? "on" : ""}
                onClick={() => {
                  setView((v) => ({ ...v, m: mm }));
                  setPickYm(false);
                }}
              >
                {mm}월
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="cal-weeks">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="cal-grid">
              {cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const iso = isoOf(d);
                const disabled = out(iso);
                const on = draft === iso;
                return (
                  <button key={i} type="button" disabled={disabled} className={`cal-day${on ? " on" : ""}`} onClick={() => setDraft(iso)}>
                    {d}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="cal-foot">
          <button
            type="button"
            className="cal-reset"
            onClick={() => {
              setDraft(value);
              setView({ y: origin[0], m: origin[1] });
              setPickYm(false);
            }}
          >
            재설정
          </button>
          <button type="button" className="cal-ok" aria-label="확인" onClick={() => onConfirm(draft)}>
            <IconCheck width={22} height={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RangeCard({ children }: { children: ReactNode }) {
  return (
    <div className="range-card">
      <span className="range-k">조회기간</span>
      {children}
    </div>
  );
}
