// 진짜 지도 두 판(카카오 KakaoMap, 오픈스트리트맵 RealMap)이 함께 쓰는 것.
// - props 모양, 편의시설 점·범례 형(MapPoint, LegendItem)
// - 핀·이름 상자 HTML, 번호 네모 HTML과 크기, 범례
// - 번호 네모 비키기 셈(nudgeAll). 지도 틀과 상관없이 화면 px만 받는다. 두 판이 같은 셈을 쓰므로 같은 결과가 나온다.
// 이 파일은 지도 라이브러리를 불러오지 않는다(서버에서도 읽힌다).
import { Icon } from "@/components/icons";
import s from "./RealMap.module.css";

export type MapProps = {
  /** 핀 자리(위도) */
  lat: number;
  /** 핀 자리(경도) */
  lon: number;
  /** 핀 아래에 적는 관광지 이름 */
  name: string;
  /** 읽기 도구용 지도 이름. 기본 "{name} 위치 지도" */
  label?: string;
  /** 처음 확대 단계(오픈스트리트맵 0~19). 16이면 동네 길이 보인다. 카카오 판은 레벨 20−zoom(16 → 4)으로 바꿔 쓴다 */
  zoom?: number;
  /** 편의시설 점(번호 네모, 벤치·쉼터 작은 점) */
  points?: MapPoint[];
  /** 범례(지도 안 왼쪽, 좁으면 지도 아래) */
  legend?: LegendItem[];
  /** 궁능 관람코스 지도 높이(693) */
  tall?: boolean;
};

/** 지도 위 편의시설 점 하나. kind는 RealMap.module.css 의 pt_{kind} / dot_{kind} 색 */
export type MapPoint = {
  key: string;
  kind: "toiletA" | "toilet" | "parking" | "charger" | "food" | "bench" | "shelter";
  lat: number;
  lon: number;
  /** 네모 안 글자(번호). 없으면 작은 점 */
  label?: string;
  /** 마우스를 올리면 보이는 글 */
  title?: string;
  /** 누르면 옮겨 갈 쪽 안 자리(id, # 없이) */
  href?: string;
  /** 처음 화면 맞추기에 넣는지(반경 안) */
  near?: boolean;
  /** 같은 제자리를 나눠 쓰는 네모 묶음 이름(같은 자리 묶음을 종류별로 나눈 것, 가 173번). 서로의 제자리 점은 비킬 장애물로 보지 않는다 */
  spot?: string;
};
export type LegendItem = { kind: MapPoint["kind"] | "place"; label: string };

/** 처음 화면 맞추기 여백(px): 위·오른쪽(+ − ↻ 단추)·아래, 왼쪽은 범례가 지도 안에 있으면 그 폭 + 40, 없으면 36 */
export const FIT_PAD = { top: 40, right: 60, bottom: 40, left: 36, legend: 40 };
/** 처음 화면 맞추기에서 더 당기지 않는 확대 단계(오픈스트리트맵 17) */
export const FIT_MAX_ZOOM = 17;

/** 번호 네모를 옮겨 볼 자리(네모 가운데가 제자리에서 몇 px). 6px 격자, 반지름 132 안, 가까운 차례 */
const NUDGE: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let dx = -132; dx <= 132; dx += 6) for (let dy = -132; dy <= 132; dy += 6) if (Math.hypot(dx, dy) <= 132) out.push([dx, dy]);
  return out.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
})();
/** 네모 사이 띄움(px) */
export const GAP = 2;
/** 네모가 지도 상자 가장자리에서 떨어질 거리(px) */
const EDGE = 4;
/** 제자리 점 반지름(px). 벤치·쉼터 점(12)보다 작게 */
export const ANCHOR_R = 4;

export type Rect = { l: number; t: number; r: number; b: number };
/** 두 네모가 겹치는 넓이(px²) */
function overlap(a: Rect, b: Rect) {
  return Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
}

/** 지도 상자 안 요소(단추 줄, 범례 등)의 자리(px). 안 보이면 null */
export function boxOf(el: HTMLElement | null | undefined, pad = 0): Rect | null {
  return el && el.offsetWidth
    ? { l: el.offsetLeft - pad, t: el.offsetTop - pad, r: el.offsetLeft + el.offsetWidth + pad, b: el.offsetTop + el.offsetHeight + pad }
    : null;
}

/** 관광지 핀(29×42, 끝이 제자리 x·y)과 그 아래 이름 상자(RealMap.module.css .pinName: 핀 끝 4px 아래 가운데)의 자리 */
export function pinRects(x: number, y: number, nameEl: HTMLElement | null | undefined): Rect[] {
  const out: Rect[] = [{ l: x - 14.5 - GAP, t: y - 42 - GAP, r: x + 14.5 + GAP, b: y + GAP }];
  if (nameEl) out.push({ l: x - nameEl.offsetWidth / 2 - GAP, t: y + 4 - GAP, r: x + nameEl.offsetWidth / 2 + GAP, b: y + 4 + nameEl.offsetHeight + GAP });
  return out;
}

/** 번호 네모 하나: 제자리(지도 상자 안 px, 네모 가운데)와 크기. spot 이 같은 네모끼리는 제자리 점을 나눠 쓴다 */
export type NudgeItem = { x: number; y: number; w: number; h: number; spot?: string };
/** 옮길 거리와, 제자리 점과 선을 그릴지 */
export type Nudge = { dx: number; dy: number; lead: boolean };

/**
 * 번호 네모 비키기(무장애 시안 검토 9.3의 1·2): 네모끼리, 또 hard(관광지 핀·이름 상자·범례·단추·축척 줄 등)와 겹치면
 * 네모를 가장 가까운 빈자리로 옮긴다(6px 격자, 132px 안). 다른 네모의 제자리 점도 덮지 않게 비킨다.
 * 네모는 받은 차례(목록 번호 차례, 가까운 곳부터)로 자리를 잡고, 먼저 잡은 네모는 다음 네모의 장애물이 된다.
 * 제자리가 상자(W×H) 밖인 네모는 옮기지 않는다. 가장자리에 걸쳐 보이는 것은 다른 네모가 비켜 가게 먼저 넣는다.
 */
export function nudgeAll(W: number, H: number, hard: Rect[], items: NudgeItem[]): Nudge[] {
  const inside: Rect = { l: EDGE, t: EDGE, r: W - EDGE, b: H - EDGE };
  const R = ANCHOR_R + GAP;
  const dots = items.map((a) => ({ l: a.x - R, t: a.y - R, r: a.x + R, b: a.y + R }));
  const inView = (i: number) => items[i].x >= 0 && items[i].x <= W && items[i].y >= 0 && items[i].y <= H;
  const placed: Rect[] = items.flatMap((a, i) => (inView(i) ? [] : [{ l: a.x - a.w / 2 - GAP, t: a.y - a.h / 2 - GAP, r: a.x + a.w / 2 + GAP, b: a.y + a.h / 2 + GAP }]));
  return items.map((a, i) => {
    let best: [number, number] = [0, 0];
    if (inView(i)) {
      let bestCost = Infinity;
      for (const [dx, dy] of NUDGE) {
        const r = { l: a.x + dx - a.w / 2, t: a.y + dy - a.h / 2, r: a.x + dx + a.w / 2, b: a.y + dy + a.h / 2 };
        let cost = a.w * a.h - overlap(r, inside); // 지도 상자 밖으로 나간 넓이
        for (const o of hard) cost += overlap(r, o);
        for (const o of placed) cost += overlap(r, o);
        // 다른 네모의 제자리 점. 같은 제자리를 나눠 쓰는 네모(spot 같음)의 점은 뺀다: 먼저 잡은 네모가 그 자리에 서고 나머지가 옆으로 비킨다
        dots.forEach((o, j) => j !== i && !(a.spot && items[j].spot === a.spot) && (cost += overlap(r, o)));
        if (cost === 0) {
          best = [dx, dy];
          break;
        }
        cost += Math.hypot(dx, dy) * 0.5; // 다 겹치면 덜 겹치고 가까운 자리
        if (cost < bestCost) {
          bestCost = cost;
          best = [dx, dy];
        }
      }
    }
    const [dx, dy] = best;
    if (inView(i)) placed.push({ l: a.x + dx - a.w / 2 - GAP, t: a.y + dy - a.h / 2 - GAP, r: a.x + dx + a.w / 2 + GAP, b: a.y + dy + a.h / 2 + GAP });
    // 네모가 제자리 점을 다 덮지 못할 만큼 비켜나면 제자리 점과 선
    return { dx, dy, lead: Math.abs(dx) > a.w / 2 - ANCHOR_R || Math.abs(dy) > a.h / 2 - ANCHOR_R };
  });
}

/** 지도 안 HTML에 넣는 글자(관광지 이름)를 안전하게 */
export function esc(t: string) {
  return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** 핀(직접 그린 물방울 모양, 29×42 = 궁능 지도 표시 크기) + 이름 상자 */
export function pinHtml(name: string) {
  return (
    `<svg class="${s.pin}" viewBox="0 0 29 42" width="29" height="42" aria-hidden="true" focusable="false">` +
    `<path class="${s.pinBody}" d="M14.5 1C7.04 1 1 7.04 1 14.5c0 9.3 11.2 24.2 12.4 25.8a1.4 1.4 0 0 0 2.2 0C16.8 38.7 28 23.8 28 14.5 28 7.04 21.96 1 14.5 1Z"/>` +
    `<circle class="${s.pinDot}" cx="14.5" cy="14.5" r="5"/>` +
    `</svg>` +
    `<span class="${s.pinName}">${esc(name)}</span>`
  );
}

/** 편의시설 점 HTML(번호 네모 또는 작은 점)과 크기 */
export function pointIcon(p: MapPoint) {
  if (!p.label) return { html: `<span class="${s.dot} ${s[`dot_${p.kind}`] ?? ""}"></span>`, w: 12, h: 12 };
  const w = Math.max(24, 10 + p.label.length * 8);
  return { html: `<span class="${s.pt} ${s[`pt_${p.kind}`] ?? ""}" style="width:${w}px">${esc(p.label)}</span>`, w, h: 24 };
}

/** points 를 비교할 글자(쪽이 다시 그려질 때마다 새 배열이 와도 지도를 다시 만들지 않게) */
export function pointsKey(points?: MapPoint[]) {
  return points?.map((p) => `${p.key}:${p.lat},${p.lon}:${p.label ?? ""}`).join("|") ?? "";
}

/** 범례 네모 안 선 그림(궁능 범례 칸의 흰 그림 자리. 직접 그림) */
function LegendGlyph({ kind }: { kind: LegendItem["kind"] }) {
  const svg = (d: React.ReactNode) => (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {d}
    </svg>
  );
  switch (kind) {
    case "toiletA":
      return <Icon name="wheelchair" size={18} strokeWidth={2} />;
    case "toilet":
      return <Icon name="toilet" size={18} strokeWidth={2} />;
    case "parking":
      return svg(<path d="M9 18V6h4.5a3.5 3.5 0 0 1 0 7H9" />);
    case "charger":
      return svg(<path d="M13 3 6.5 13H12l-1 8 6.5-10H12z" />);
    case "food":
      return svg(<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.2 1.2-3.5 3.8-3.5 7v3H17" />);
    case "place":
      return <Icon name="pin" size={18} strokeWidth={2} />;
    default:
      return null;
  }
}

/** 범례(궁능처럼 지도 안 왼쪽에 세로로, 좁은 화면에서는 지도 아래 가로 줄) */
export function MapLegend({ legend, ref }: { legend: LegendItem[]; ref?: React.Ref<HTMLUListElement> }) {
  return (
    <ul ref={ref} className={s.legend} aria-label="지도 범례">
      {legend.map((g) => (
        <li key={g.kind}>
          {g.kind === "bench" || g.kind === "shelter" ? (
            <span className={`${s.legSw} ${s.legDot}`} aria-hidden="true">
              <span className={`${s.dot} ${s[`dot_${g.kind}`] ?? ""}`} />
            </span>
          ) : (
            <span className={`${s.legSw} ${s[`pt_${g.kind}`] ?? ""}`} aria-hidden="true">
              <LegendGlyph kind={g.kind} />
            </span>
          )}
          <span>{g.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** 지도 상자(+ 범례) 틀. children 은 상자 안(지도, 단추, 축척 줄). 범례가 있으면 틀 밖(지도 안 왼쪽 위에 겹치거나 좁으면 아래)에 둔다 */
export function MapFrame({
  tall,
  legend,
  legRef,
  children,
}: {
  tall?: boolean;
  legend?: LegendItem[];
  legRef?: React.Ref<HTMLUListElement>;
  children: React.ReactNode;
}) {
  const box = <div className={`${s.box}${tall ? " " + s.tall : ""}`}>{children}</div>;
  if (!legend?.length) return box;
  return (
    <div className={s.withLegend}>
      {box}
      <MapLegend legend={legend} ref={legRef} />
    </div>
  );
}

/** 오른쪽 위 세로 단추(+ − ↻). 우리 그린 지도(MapView)와 같은 자리·모양·이름 */
export function MapControls({
  ref,
  canIn,
  canOut,
  ready,
  onIn,
  onOut,
  onHome,
}: {
  ref?: React.Ref<HTMLDivElement>;
  canIn: boolean;
  canOut: boolean;
  ready: boolean;
  onIn: () => void;
  onOut: () => void;
  onHome: () => void;
}) {
  return (
    <div ref={ref} className={s.controls}>
      <button type="button" className={s.ctrl} aria-label="확대" title="확대" aria-disabled={!canIn} onClick={() => canIn && onIn()}>
        <Icon name="plus" size={18} strokeWidth={2} />
      </button>
      <button type="button" className={s.ctrl} aria-label="축소" title="축소" aria-disabled={!canOut} onClick={() => canOut && onOut()}>
        <Icon name="minus" size={18} strokeWidth={2} />
      </button>
      <button type="button" className={s.ctrl} aria-label="처음 크기" title="처음 크기" aria-disabled={!ready} onClick={() => ready && onHome()}>
        <Icon name="reset" size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
