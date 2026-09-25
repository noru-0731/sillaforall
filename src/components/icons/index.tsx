// 직접 그린 단순한 선 아이콘(24×24, 글자색을 따름). 궁능 누리집의 아이콘 그림은 쓰지 않는다.
// 모두 장식용(aria-hidden). 뜻은 옆 글자나 sr-only 글자로 전한다.
// 사용: <Icon name="map" /> 또는 <Icon name="map" size={27} strokeWidth={1.4} />
import type { SVGProps } from "react";

export type IconName =
  | "sitemap"
  | "settings"
  | "menu"
  | "close"
  | "map"
  | "list"
  | "wheelchair"
  | "hub"
  | "guide"
  | "about"
  | "home"
  | "share"
  | "print"
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "arrow-right"
  | "plus"
  | "minus"
  | "reset"
  | "pause"
  | "play"
  | "info"
  | "clock"
  | "pin"
  | "bus"
  | "car"
  | "parking"
  | "toilet"
  | "walk"
  | "camera"
  | "phone"
  | "external"
  | "search"
  | "calendar"
  | "question"
  | "photo"
  | "check"
  | "volume"
  | "stop";

const PATHS: Record<IconName, React.ReactNode> = {
  sitemap: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  settings: (
    <>
      {/* 글자 크기: 큰 가 + 작은 가 대신 두 개의 A 모양 */}
      <path d="M3 19 8.5 5h1L15 19M5.2 14h7.6" />
      <path d="M15 19l3-7.5h.8L22 19M16.1 16.4h4.6" />
    </>
  ),
  close: <path d="M5 5l14 14M19 5 5 19" />,
  map: (
    <>
      <path d="M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20z" />
      <path d="M8.5 4v13.5M15.5 6.5V20" />
    </>
  ),
  list: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M7.5 8.5h9M7.5 12h9M7.5 15.5h6" />
    </>
  ),
  wheelchair: (
    <>
      <circle cx="11" cy="4.5" r="1.8" />
      <path d="M11 7.5v6h5.5l2.5 5.5" />
      <path d="M11 10.5h4.5" />
      <path d="M8 11.2a5.5 5.5 0 1 0 8.2 6.3" />
    </>
  ),
  hub: (
    <>
      <path d="M12 21s-6-5.6-6-10.2A6 6 0 0 1 18 10.8C18 15.4 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </>
  ),
  guide: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 10.5V17" />
      <circle cx="12" cy="7.3" r=".6" fill="currentColor" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 10.5V17" />
      <circle cx="12" cy="7.3" r=".6" fill="currentColor" />
    </>
  ),
  about: (
    <>
      {/* 기와지붕 집 */}
      <path d="M2.5 9.5C6 9 9 7.5 12 4.5c3 3 6 4.5 9.5 5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M3 20h18M10 20v-5h4v5" />
    </>
  ),
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v10h13V10" />
    </>
  ),
  share: (
    <>
      <circle cx="17.5" cy="5.5" r="2.5" />
      <circle cx="6.5" cy="12" r="2.5" />
      <circle cx="17.5" cy="18.5" r="2.5" />
      <path d="M8.7 10.8 15.3 6.8M8.7 13.2l6.6 4" />
    </>
  ),
  print: (
    <>
      <path d="M7 8V3.5h10V8" />
      <rect x="3.5" y="8" width="17" height="8.5" rx="1.5" />
      <path d="M7 13.5h10V20.5H7z" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-up": <path d="m6 15 6-6 6 6" />,
  "chevron-left": <path d="m15 6-6 6 6 6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  "arrow-right": <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  plus: <path d="M12 4.5v15M4.5 12h15" />,
  minus: <path d="M4.5 12h15" />,
  reset: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4v4.5H9" />
    </>
  ),
  pause: <path d="M9 5.5v13M15 5.5v13" />,
  play: <path d="M7.5 5v14l11-7z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  bus: (
    <>
      <rect x="4.5" y="3.5" width="15" height="15" rx="2.5" />
      <path d="M4.5 11h15M7.5 18.5V21M16.5 18.5V21" />
      <circle cx="8" cy="15" r=".7" fill="currentColor" />
      <circle cx="16" cy="15" r=".7" fill="currentColor" />
    </>
  ),
  car: (
    <>
      <path d="M3.5 16.5v-4l2-5h13l2 5v4z" />
      <path d="M3.5 12.5h17M6 16.5V19M18 16.5V19" />
      <circle cx="7.5" cy="14.5" r=".7" fill="currentColor" />
      <circle cx="16.5" cy="14.5" r=".7" fill="currentColor" />
    </>
  ),
  parking: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M9.5 17V7.5h3.5a3 3 0 0 1 0 6H9.5" />
    </>
  ),
  toilet: (
    <>
      <circle cx="7.5" cy="4.5" r="1.6" />
      <circle cx="16.5" cy="4.5" r="1.6" />
      <path d="M5.5 8h4v6.5h-1V21h-2v-6.5h-1z" />
      <path d="M16.5 8l-3 7.5h6zM15.5 15.5V21M17.5 15.5V21" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4.3" r="1.8" />
      <path d="M10.5 21l2-6-2.5-2.5 1-5 3.5 2.5 3 1" />
      <path d="M11 7.5 7.5 9.5 6.5 13M12.5 15l2.5 2.5V21" />
    </>
  ),
  camera: (
    <>
      <path d="M3.5 8h4l1.7-2.5h5.6L16.5 8h4v11h-17z" />
      <circle cx="12" cy="13.2" r="3.4" />
    </>
  ),
  phone: <path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3A2 2 0 0 1 18.5 20 15.5 15.5 0 0 1 4 5.5a2 2 0 0 1 2.5-2z" />,
  external: (
    <>
      <path d="M13.5 4.5h6v6M19.5 4.5 11 13" />
      <path d="M18 14v5.5H4.5V6H10" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5" />
      <circle cx="12" cy="16.8" r=".6" fill="currentColor" />
    </>
  ),
  photo: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <circle cx="9" cy="9.5" r="1.7" />
      <path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  volume: (
    <>
      {/* 소리로 듣기: KRDS ico_volume(스피커 + 소리 물결 둘)을 선으로 다시 그림 */}
      <path d="M3 9h3.5l6-4.5v15l-6-4.5H3z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.3a8 8 0 0 1 0 11.4" />
    </>
  ),
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />,
};

export function Icon({
  name,
  size = 24,
  strokeWidth = 1.6,
  ...rest
}: { name: IconName; size?: number | string; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

/** 아래 채운 세모(▼), 빵부스러기·드롭다운 막대용 */
export function Caret({ up, size = 12 }: { up?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true" focusable="false" fill="currentColor">
      {up ? <path d="M6 2.5 11 9.5H1z" /> : <path d="M1 2.5h10L6 9.5z" />}
    </svg>
  );
}
