import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { TODAY, customers } from "./data";
import type { ConsultNote } from "./types";

interface ConsultApi {
  notesOf: (customerId: string) => ConsultNote[];
  addNote: (customerId: string, topic: string, body: string) => void;
}

const ConsultContext = createContext<ConsultApi | null>(null);

export function ConsultProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<Record<string, ConsultNote[]>>({});

  const api = useMemo<ConsultApi>(
    () => ({
      notesOf: (customerId) => {
        const base = customers.find((c) => c.id === customerId)?.consults ?? [];
        return [...(extra[customerId] ?? []), ...base];
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
    }),
    [extra]
  );

  return <ConsultContext.Provider value={api}>{children}</ConsultContext.Provider>;
}

export function useConsults() {
  const v = useContext(ConsultContext);
  if (!v) throw new Error("ConsultContext missing");
  return v;
}
