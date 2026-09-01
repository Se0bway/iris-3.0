import { createContext, useContext } from "react";
import type { MessageType, ScreenId } from "./types";

export interface NavState {
  screen: ScreenId;
  stack: ScreenId[];
  customerId: string;
  messageType: MessageType;
  toast: string;
  checkedIn: boolean;
  fabsHidden: boolean;
  draftName: string;
  draftPhone: string;
}

export interface NavApi extends NavState {
  go: (
    screen: ScreenId,
    extra?: { customerId?: string; messageType?: MessageType; name?: string; phone?: string }
  ) => void;
  back: () => void;
  setToast: (msg: string) => void;
  checkIn: () => void;
  toggleFabs: () => void;
}

export const NavContext = createContext<NavApi | null>(null);

export function useNav() {
  const v = useContext(NavContext);
  if (!v) throw new Error("NavContext missing");
  return v;
}
