import type { Customer, MessageType } from "./types";

export function krw(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export function krwShort(n: number) {
  if (Math.abs(n) >= 10_000) {
    const man = n / 10_000;
    return (Number.isInteger(man) ? man.toLocaleString("ko-KR") : man.toFixed(1)) + "만";
  }
  return n.toLocaleString("ko-KR");
}

export function phoneMask(v: string) {
  return v;
}

export const statusLabel = {
  new: "신규 고객",
  growing: "성장 고객",
  loyal: "충성 고객",
  dormant: "휴면 위험",
  churn: "이탈 위험",
} as const;

export const tendencyLabel = {
  price: "가격 민감형",
  trend: "트렌드 추종형",
  premium: "프리미엄 선호형",
  relationship: "관계 중심형",
} as const;

export const levelLabel = {
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

export const segmentLabel = {
  new: "신규",
  vip: "VIP",
  repurchase: "재구매 도래",
  churn: "이탈 위험",
  consult: "상담 후 미구매",
  birthday: "생일",
} as const;

export const actionLabel: Record<string, string> = {
  전화: "전화",
  카카오톡: "카카오톡",
  "샘플 제공": "샘플 제공",
  방문상담: "방문상담",
};

export const messageTypeLabel = {
  repurchase: "재구매 유도",
  birthday: "생일 축하",
  newproduct: "신제품 추천",
  vip: "VIP 관리",
  dormant: "휴면 고객 활성화",
  followup: "상담 후 후속관리",
} as const;

export function draftMessage(c: Customer, type: MessageType) {
  const lastProduct =
    c.ledger.find((r) => r.type === "sale")?.product ?? c.interestProducts[0] ?? "관심 제품";
  const diagnosis = c.lastDiagnosis ?? formatDot(c.lastConsultAt);

  if (type === "followup" || (type === "repurchase" && c.id === "c13")) {
    return `${c.name} 고객님, 안녕하세요.\n카운셀러 김서연입니다.\n\n피부진단 주기가 ${dueText(c)}로 다가와 연락드렸습니다.\n최근 진단(${diagnosis}) 이후 피부 변화에 맞춰 맞춤 진단을 다시 받아보시면 좋겠습니다.\n\n지금 시즌 신제품 중 고객님께 맞는 ${c.favoriteBrand} ${c.interestProducts[0]}도 함께 보실 수 있습니다.\n진단 예약: https://iris.ap/dx/${c.id}\n\n편하게 회신 주세요.`;
  }

  switch (type) {
    case "repurchase":
      return `${c.name} 고객님, 안녕하세요.\n카운셀러 김서연입니다.\n\n지난번 구매하신 ${lastProduct} 사용 주기가 도래했습니다.\n${c.favoriteBrand} ${c.interestProducts[0] ?? "관련 제품"}을 이어서 안내드리면 좋을 것 같아 연락드립니다.\n\n필요하시면 방문 상담이나 샘플도 바로 준비해 드리겠습니다.`;
    case "birthday":
      return `${c.name} 고객님, 생일을 진심으로 축하드립니다.\n카운셀러 김서연입니다.\n\n평소 ${c.favoriteBrand}를 애용해 주셔서 감사합니다. 생일 주간에 사용하시기 좋은 ${c.interestProducts[0] ?? "추천 제품"}을 함께 챙겨드리면 좋겠습니다.\n\n편하게 회신 주시면 일정 맞춰 안내드리겠습니다.`;
    case "newproduct":
      return `${c.name} 고객님, 안녕하세요.\n카운셀러 김서연입니다.\n\n고객님 피부 성향(${c.skin})을 기준으로 이번 시즌 ${c.favoriteBrand} 신제품을 추천드립니다.\n${c.interestProducts[0] ?? "추천 제품"}이 가장 잘 맞을 것 같습니다.\n\n짧은 상담으로 비교해서 보여드려도 괜찮을까요?`;
    case "vip":
      return `${c.name} 고객님, 안녕하세요.\n카운셀러 김서연입니다.\n\n늘 믿고 맡겨 주셔서 감사합니다. 최근에도 ${lastProduct}를 선택해 주셨고, 시즌 케어를 먼저 안내드리고 싶어 연락드렸습니다.\n\n원하시면 방문 상담으로 가을 루틴을 함께 정리해 드리겠습니다.`;
    case "dormant":
      return `${c.name} 고객님, 안녕하세요.\n카운셀러 김서연입니다.\n\n한동안 연락이 뜸해 안부가 궁금했습니다. 기존 ${c.favoriteBrand} 기준으로 부담 없는 옵션부터 다시 정리해 드릴 수 있습니다.\n\n편하신 시간에 짧게만 통화해도 괜찮으실까요?`;
  }
}

export function formatDot(date: string | null | undefined) {
  if (!date) return "-";
  return date.replace(/-/g, ".");
}

export function custType(c: Customer) {
  return c.customerType ?? (c.purchaseCount >= 3 ? "통합고객" : "일반고객");
}

export function dueText(c: Customer) {
  const n = c.diagnosisOffset ?? c.birthdayOffset;
  if (n === 0) return "D-Day";
  if (n != null && n < 0) return `D${n}일`;
  if (n != null && n > 0) return `D+${n}일`;
  if (c.expectedLabel === "오늘") return "D-Day";
  if (c.expectedLabel) return `${c.expectedLabel}일`.replace("일일", "일");
  return "D-7일";
}

export function koreanDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

export function urgencyScore(c: Customer, sources: string[]) {
  let s = 0;
  if (c.expectedLabel === "오늘" || c.diagnosisOffset === 0) s += 100;
  if (c.expectedLabel === "초과") s += 92;
  if (c.diagnosisOffset != null && c.diagnosisOffset < 0) s += 80 + Math.abs(c.diagnosisOffset) * 2;
  if (c.birthdayOffset === 0) s += 75;
  if (c.churnRisk === "high" || sources.some((x) => x.includes("이탈"))) s += 28;
  if (c.diagnosisOffset != null && c.diagnosisOffset > 0) s += Math.max(0, 45 - c.diagnosisOffset * 4);
  if (c.unpaid > 0) s += 12;
  if (c.lastPurchaseDays != null && c.lastPurchaseDays >= 90) s += 8;
  return s;
}

export function birthdayLabel(offset: number | null) {
  if (offset === null) return null;
  if (offset === 0) return "생일 D-Day";
  if (offset < 0) return `생일 D${offset}`;
  return `생일 D+${offset}`;
}
