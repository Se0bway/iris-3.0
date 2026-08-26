import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function I(props: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      aria-hidden
      {...props}
    />
  );
}

export const IconHome = (p: P) => (
  <I {...p}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
  </I>
);
export const IconUsers = (p: P) => (
  <I {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M4 19a5 5 0 0 1 10 0" />
    <circle cx="17" cy="9" r="2.2" />
    <path d="M16 19a4.5 4.5 0 0 1 4-4" />
  </I>
);
export const IconSpark = (p: P) => (
  <I {...p}>
    <path d="M12 3v4M12 17v4M4.9 6.5l2.8 2.8M16.3 14.7l2.8 2.8M3 12h4M17 12h4M4.9 17.5l2.8-2.8M16.3 9.3l2.8-2.8" />
    <circle cx="12" cy="12" r="2.4" />
  </I>
);
export const IconChart = (p: P) => (
  <I {...p}>
    <path d="M4 19h16" />
    <path d="M7 16v-5" />
    <path d="M12 16V8" />
    <path d="M17 16v-8" />
  </I>
);
export const IconUser = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 19a7 7 0 0 1 14 0" />
  </I>
);
export const IconBack = (p: P) => (
  <I {...p}>
    <path d="M15 5 8 12l7 7" />
  </I>
);
export const IconSearch = (p: P) => (
  <I {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </I>
);
export const IconBell = (p: P) => (
  <I {...p}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.2 2H4.8z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </I>
);
export const IconChevron = (p: P) => (
  <I {...p}>
    <path d="M9 6l6 6-6 6" />
  </I>
);
export const IconPlus = (p: P) => (
  <I {...p}>
    <path d="M12 5v14M5 12h14" />
  </I>
);
export const IconPhone = (p: P) => (
  <I {...p}>
    <path d="M7 3h4l1 4-2 2a12 12 0 0 0 5 5l2-2 4 1v4c0 1-1 2-2 2C10 19 5 14 5 5c0-1 1-2 2-2z" />
  </I>
);
export const IconChat = (p: P) => (
  <I {...p}>
    <path d="M5 6h14v10H8l-3 3z" />
  </I>
);
export const IconBox = (p: P) => (
  <I {...p}>
    <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
    <path d="M4 8l8 4 8-4M12 12v8" />
  </I>
);
export const IconWon = (p: P) => (
  <I {...p}>
    <path d="M5 7l2.5 10M12 7v10M19 7l-2.5 10M6 12h12" />
  </I>
);
export const IconCheck = (p: P) => (
  <I {...p}>
    <path d="M5 12.5 9.5 17 19 7" />
  </I>
);
export const IconCopy = (p: P) => (
  <I {...p}>
    <rect x="8" y="8" width="11" height="13" rx="1.5" />
    <path d="M5 16V5h11" />
  </I>
);
export const IconSend = (p: P) => (
  <I {...p}>
    <path d="M4 12 20 4 12 20l-1.5-7z" />
  </I>
);
export const IconDown = (p: P) => (
  <I {...p}>
    <path d="M6 9l6 6 6-6" />
  </I>
);
export const IconMore = (p: P) => (
  <I {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
  </I>
);
export const IconPlan = (p: P) => (
  <I {...p}>
    <rect x="5" y="4" width="14" height="16" rx="2" />
    <path d="M8 9h8M8 13h6" />
  </I>
);
export const IconStethoscope = (p: P) => (
  <I {...p}>
    <path d="M7 4v6a3 3 0 0 0 6 0V4" />
    <path d="M7 4H5.5M13 4h1.5" />
    <path d="M10 13v1.5a5 5 0 0 0 9 0V12" />
    <circle cx="19" cy="11" r="2" />
  </I>
);
export const IconBottle = (p: P) => (
  <I {...p}>
    <path d="M10 3h4v3l2 2v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l2-2z" />
    <path d="M10 12h4" />
  </I>
);
export const IconTrend = (p: P) => (
  <I {...p}>
    <path d="M4 16l5-5 3 3 8-8" />
    <path d="M16 6h4v4" />
  </I>
);
export const IconCake = (p: P) => (
  <I {...p}>
    <path d="M4 13h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M4 13c0-2 2.5-3 4-3s3 .8 4 2c1-1.2 2.5-2 4-2s4 1 4 3" />
    <path d="M12 4v3M9.5 5v2M14.5 5v2" />
  </I>
);
export const IconPill = (p: P) => (
  <I {...p}>
    <rect x="3.5" y="9" width="17" height="6" rx="3" transform="rotate(-35 12 12)" />
    <path d="M9 9.5l6 6" />
  </I>
);
export const IconCrown = (p: P) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden {...p}>
    <path d="M4.2 16.2 2.8 8.4l5.1 3.1L12 5.2l4.1 6.3 5.1-3.1-1.4 7.8H4.2Zm-.2 2.3h16v2.1H4v-2.1Z" />
  </svg>
);
export const IconStar = (p: P) => (
  <I {...p}>
    <path d="M12 4l2.1 4.4 4.9.6-3.6 3.3.9 4.8L12 15.2 7.7 17.1l.9-4.8L5 9l4.9-.6z" />
  </I>
);
export const IconCalendar = (p: P) => (
  <I {...p}>
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <path d="M8 4v4M16 4v4M4 11h16" />
  </I>
);
export const IconScan = (p: P) => (
  <I {...p}>
    <path d="M7 5H5v2M17 5h2v2M7 19H5v-2M17 19h2v-2" />
    <circle cx="12" cy="12" r="4" />
  </I>
);
export const IconRefresh = (p: P) => (
  <I {...p}>
    <path d="M20 12a8 8 0 1 1-2.2-5.5" />
    <path d="M20 5v5h-5" />
  </I>
);
export const IconSparkle = (p: P) => (
  <I {...p}>
    <path d="M12 3.5 13.4 8 18 9.4 13.4 10.8 12 15.5 10.6 10.8 6 9.4 10.6 8z" />
    <path d="M18 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </I>
);
export const IconEdit = (p: P) => (
  <I {...p}>
    <path d="M4 16.5V20h3.5L19 8.5 15.5 5z" />
  </I>
);
