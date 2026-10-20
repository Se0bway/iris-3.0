import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { TODAY, counselor, customers as seed, productOrders as seedOrders } from "./data";
import type { ConsultNote, Customer, PointRow, ProductOrder, ProductOrderKind, ProductOrderStatus } from "./types";
import { HQ_ORDER_STEPS } from "./types";

function slipKey(customerId: string, ledgerId: string) {
  return `${customerId}:${ledgerId}`;
}

export function nextOrderStatus(order: ProductOrder): ProductOrderStatus {
  if (order.kind === "hq") {
    const i = HQ_ORDER_STEPS.indexOf(order.status as (typeof HQ_ORDER_STEPS)[number]);
    if (i < 0 || i >= HQ_ORDER_STEPS.length - 1) return order.status;
    return HQ_ORDER_STEPS[i + 1];
  }
  return order.status === "미확정" ? "확정" : order.status;
}

export function hqNextLabel(status: ProductOrderStatus) {
  const i = HQ_ORDER_STEPS.indexOf(status as (typeof HQ_ORDER_STEPS)[number]);
  if (i < 0 || i >= HQ_ORDER_STEPS.length - 1) return null;
  return HQ_ORDER_STEPS[i + 1];
}

interface ConsultApi {
  list: Customer[];
  nextNo: () => number;
  addCustomer: (c: Customer) => void;
  removeCustomer: (customerId: string) => void;
  notesOf: (customerId: string) => ConsultNote[];
  addNote: (customerId: string, topic: string, body: string) => void;
  cancelSlip: (customerId: string, ledgerId: string) => void;
  setStopped: (customerId: string, stopped: boolean) => void;
  orders: ProductOrder[];
  addOrder: (items: { productId: string; qty: number }[], kind?: ProductOrderKind) => void;
  confirmOrder: (orderId: string) => void;
  advanceOrder: (orderId: string) => void;
  giftPoints: (fromId: string, toId: string, amount: number) => boolean;
  counselorPoints: number;
}

const ConsultContext = createContext<ConsultApi | null>(null);

export function custNoOf(id: string) {
  return Number(id.replace(/\D/g, "")) || 1;
}

export function ConsultProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<Record<string, ConsultNote[]>>({});
  const [added, setAdded] = useState<Customer[]>([]);
  const [cancelled, setCancelled] = useState<Record<string, true>>({});
  const [life, setLife] = useState<Record<string, boolean>>({});
  const [gone, setGone] = useState<Record<string, true>>({});
  const [orders, setOrders] = useState<ProductOrder[]>(seedOrders);
  const [pointLife, setPointLife] = useState<Record<string, { beautyPoints: number; history: PointRow[] }>>({});

  const list = useMemo(() => {
    const raw = [...added, ...seed].filter((c) => !gone[c.id]);
    const hasCancel = Object.keys(cancelled).length > 0;
    const hasLife = Object.keys(life).length > 0;
    const hasPoints = Object.keys(pointLife).length > 0;
    if (!hasCancel && !hasLife && !hasPoints) return raw;
    return raw.map((c) => ({
      ...c,
      stopped: c.id in life ? life[c.id] : c.stopped,
      beautyPoints: c.id in pointLife ? pointLife[c.id].beautyPoints : c.beautyPoints,
      pointHistory: c.id in pointLife ? [...pointLife[c.id].history, ...c.pointHistory] : c.pointHistory,
      ledger: hasCancel
        ? c.ledger.map((r) => (cancelled[slipKey(c.id, r.id)] ? { ...r, status: "취소" } : r))
        : c.ledger,
    }));
  }, [added, cancelled, life, pointLife, gone]);

  const api = useMemo<ConsultApi>(
    () => ({
      list,
      nextNo: () => Math.max(0, ...list.map((c) => custNoOf(c.id))) + 1,
      addCustomer: (c) => setAdded((s) => [c, ...s.filter((x) => x.id !== c.id)]),
      removeCustomer: (customerId) => {
        setGone((s) => ({ ...s, [customerId]: true }));
        setAdded((s) => s.filter((x) => x.id !== customerId));
        setExtra((s) => {
          if (!(customerId in s)) return s;
          const next = { ...s };
          delete next[customerId];
          return next;
        });
        setLife((s) => {
          if (!(customerId in s)) return s;
          const next = { ...s };
          delete next[customerId];
          return next;
        });
      },
      notesOf: (customerId) => {
        const owned = list.find((c) => c.id === customerId)?.consults ?? [];
        return [...(extra[customerId] ?? []), ...owned];
      },
      addNote: (customerId, topic, body) => {
        const note: ConsultNote = {
          id: `n-${Date.now()}`,
          date: TODAY.replace(/-/g, "."),
          topic,
          body,
        };
        setExtra((s) => ({ ...s, [customerId]: [note, ...(s[customerId] ?? [])] }));
      },
      cancelSlip: (customerId, ledgerId) => {
        setCancelled((s) => ({ ...s, [slipKey(customerId, ledgerId)]: true }));
      },
      setStopped: (customerId, stopped) => {
        setLife((s) => ({ ...s, [customerId]: stopped }));
      },
      orders,
      addOrder: (items, kind = "branch") => {
        const ymd = TODAY.replace(/-/g, "").slice(2);
        setOrders((s) => {
          const seq = String(s.length + 1).padStart(3, "0");
          const order: ProductOrder = {
            id: `o-${Date.now()}`,
            no: `PO-${ymd}-${seq}`,
            date: TODAY,
            kind,
            status: kind === "hq" ? "승인대기" : "미확정",
            items,
          };
          return [order, ...s];
        });
      },
      confirmOrder: (orderId) => {
        setOrders((s) => s.map((o) => (o.id === orderId ? { ...o, status: nextOrderStatus(o) } : o)));
      },
      advanceOrder: (orderId) => {
        setOrders((s) => s.map((o) => (o.id === orderId ? { ...o, status: nextOrderStatus(o) } : o)));
      },
      counselorPoints: pointLife.self?.beautyPoints ?? counselor.beautyPoints,
      giftPoints: (fromId, toId, amount) => {
        const to = list.find((c) => c.id === toId);
        const from = fromId === "self" ? null : list.find((c) => c.id === fromId);
        const fromName = fromId === "self" ? counselor.name : from?.name;
        const fromPts = fromId === "self" ? (pointLife.self?.beautyPoints ?? counselor.beautyPoints) : from?.beautyPoints;
        if (!to || !fromName || fromPts == null || fromId === toId || amount < 10 || amount % 10 !== 0 || amount > fromPts) {
          return false;
        }
        const date = TODAY.replace(/-/g, ".");
        setPointLife((s) => {
          const liveFrom = fromId === "self" ? (s.self?.beautyPoints ?? counselor.beautyPoints) : (s[fromId]?.beautyPoints ?? fromPts);
          const toPts = s[toId]?.beautyPoints ?? to.beautyPoints;
          if (amount > liveFrom) return s;
          const send: PointRow = {
            id: `pg-s-${Date.now()}`,
            date,
            type: "use",
            label: `${to.name}님께 선물`,
            amount: -amount,
          };
          const recv: PointRow = {
            id: `pg-r-${Date.now()}`,
            date,
            type: "earn",
            label: `${fromName}님에게 선물받음`,
            amount,
          };
          return {
            ...s,
            [fromId]: { beautyPoints: liveFrom - amount, history: [send, ...(s[fromId]?.history ?? [])] },
            [toId]: { beautyPoints: toPts + amount, history: [recv, ...(s[toId]?.history ?? [])] },
          };
        });
        return true;
      },
    }),
    [extra, list, orders, pointLife, gone]
  );

  return <ConsultContext.Provider value={api}>{children}</ConsultContext.Provider>;
}

export function useConsults() {
  const v = useContext(ConsultContext);
  if (!v) throw new Error("ConsultContext missing");
  return v;
}
