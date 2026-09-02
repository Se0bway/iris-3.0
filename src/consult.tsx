import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { TODAY, customers as seed } from "./data";
import type { ConsultNote, Customer } from "./types";

function slipKey(customerId: string, ledgerId: string) {
  return `${customerId}:${ledgerId}`;
}

interface ConsultApi {
  list: Customer[];
  nextNo: () => number;
  addCustomer: (c: Customer) => void;
  notesOf: (customerId: string) => ConsultNote[];
  addNote: (customerId: string, topic: string, body: string) => void;
  cancelSlip: (customerId: string, ledgerId: string) => void;
}

const ConsultContext = createContext<ConsultApi | null>(null);

export function custNoOf(id: string) {
  return Number(id.replace(/\D/g, "")) || 1;
}

export function ConsultProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<Record<string, ConsultNote[]>>({});
  const [added, setAdded] = useState<Customer[]>([]);
  const [cancelled, setCancelled] = useState<Record<string, true>>({});

  const list = useMemo(() => {
    const raw = [...added, ...seed];
    const keys = Object.keys(cancelled);
    if (keys.length === 0) return raw;
    return raw.map((c) => ({
      ...c,
      ledger: c.ledger.map((r) => (cancelled[slipKey(c.id, r.id)] ? { ...r, status: "취소" } : r)),
    }));
  }, [added, cancelled]);

  const api = useMemo<ConsultApi>(
    () => ({
      list,
      nextNo: () => Math.max(0, ...list.map((c) => custNoOf(c.id))) + 1,
      addCustomer: (c) => setAdded((s) => [c, ...s.filter((x) => x.id !== c.id)]),
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
    }),
    [extra, list]
  );

  return <ConsultContext.Provider value={api}>{children}</ConsultContext.Provider>;
}

export function useConsults() {
  const v = useContext(ConsultContext);
  if (!v) throw new Error("ConsultContext missing");
  return v;
}
