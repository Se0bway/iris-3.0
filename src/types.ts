export type ScreenId =
  | "login"
  | "mfa"
  | "home"
  | "customers"
  | "customer"
  | "message"
  | "chat"
  | "links"
  | "board"
  | "push"
  | "work"
  | "promo"
  | "order"
  | "trade"
  | "slips"
  | "sales"
  | "collection"
  | "status"
  | "history"
  | "plcc"
  | "points"
  | "anniversaries"
  | "mypage"
  | "members"
  | "attendance"
  | "rank"
  | "profile"
  | "stock"
  | "deposit"
  | "incentive"
  | "editshop"
  | "live"
  | "education"
  | "skindiag"
  | "guestskin"
  | "note"
  | "register";

export type Segment =
  | "new"
  | "vip"
  | "repurchase"
  | "churn"
  | "consult"
  | "birthday";

export type CustomerStatus =
  | "new"
  | "growing"
  | "loyal"
  | "dormant"
  | "churn";

export type Tendency = "price" | "trend" | "premium" | "relationship";
export type Level = "high" | "medium" | "low";
export type MessageType =
  | "repurchase"
  | "birthday"
  | "newproduct"
  | "vip"
  | "dormant"
  | "followup";

export type TimelineKind =
  | "join"
  | "purchase"
  | "consult"
  | "message"
  | "repurchase"
  | "collection";

export interface Anniversary {
  type: string;
  date: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  kind: TimelineKind;
  title: string;
  detail: string;
}

export interface ConsultNote {
  id: string;
  date: string;
  topic: string;
  body: string;
}

export interface LedgerLine {
  code: string;
  name: string;
  qty: number;
  amount: number;
}

export interface LedgerRow {
  id: string;
  date: string;
  type: "sale" | "collect";
  product?: string;
  amount: number;
  status: string;
  issuedAt?: string;
  coupon?: number;
  pointsEarn?: number;
  pointsUse?: number;
  lines?: LedgerLine[];
}

export interface PointRow {
  id: string;
  date: string;
  type: "earn" | "use";
  label: string;
  amount: number;
}

export interface PointExpireLine {
  id: string;
  expireAt: string;
  amount: number;
  kind: string;
  note: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  birth: string;
  age: number;
  address: string;
  joinedAt: string;
  lastPurchaseAt: string | null;
  lastPurchaseDays: number | null;
  expectedRepurchaseAt: string | null;
  expectedLabel: string | null;
  birthdayOffset: number | null;
  totalAmount: number;
  purchaseCount: number;
  avgAmount: number;
  unpaid: number;
  segments: Segment[];
  status: CustomerStatus;
  tendency: Tendency;
  purchaseProb: Level;
  churnRisk: Level;
  lastConsultAt: string | null;
  favoriteBrand: string;
  interestProducts: string[];
  skin: string;
  family: string;
  lifestyle: string;
  purpose: string;
  habit: string;
  health: string;
  anniversaries: Anniversary[];
  beautyPoints: number;
  pointsExpireAt?: string;
  pointExpires?: PointExpireLine[];
  pointHistory: PointRow[];
  skinDiagnosis: string;
  timeline: TimelineEvent[];
  consults: ConsultNote[];
  ledger: LedgerRow[];
  aiHint: string;
  recommendedAction: string;
  customerType?: string;
  lastDiagnosis?: string | null;
  diagnosisOffset?: number | null;
  gender?: "f" | "m";
}

export interface Member {
  id: string;
  name: string;
  rank: string;
  sales: number;
  education: string;
  rotationDays: number;
  incentive: boolean;
}

export interface NavItem {
  id: ScreenId;
  label: string;
  children?: NavItem[];
}
