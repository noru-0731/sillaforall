// 지도 부품의 계산만 모은 곳(화면 없이 숫자만). MapView가 부른다.
// 좌표 세 단계: 위도·경도 → 기본 좌표(확대 1배일 때 틀 안의 px) → 화면 좌표(확대·끌기 반영).
import type { Box } from "@/data";
import { aspect, project } from "@/lib/geo";

export type Rect = { x: number; y: number; w: number; h: number };
export type Pt = { x: number; y: number };

/** 상자(box)를 틀(w×h) 안에 비율을 지켜 넣었을 때의 자리. 남는 쪽은 가운데 정렬. */
export type Fit = { ox: number; oy: number; bw: number; bh: number };

export function fitBox(box: Box, w: number, h: number): Fit {
  const a = aspect(box);
  let bw = w;
  let bh = w * a;
  if (bh > h) {
    bh = h;
    bw = h / a;
  }
  return { ox: (w - bw) / 2, oy: (h - bh) / 2, bw, bh };
}

export function toBase(lon: number, lat: number, box: Box, fit: Fit): Pt {
  const p = project(lon, lat, box, fit.bw, fit.bh);
  return { x: p.x + fit.ox, y: p.y + fit.oy };
}

/** 확대 k배, 옮김 (tx, ty). 화면 = 기본 × k + t */
export type View = { k: number; tx: number; ty: number };
export const HOME: View = { k: 1, tx: 0, ty: 0 };

/** 확대 범위와 끌기 범위를 지킨다(틀 밖으로 지도가 빠지지 않게). */
export function clampView(v: View, w: number, h: number, maxK: number): View {
  const k = Math.min(Math.max(v.k, 1), maxK);
  const tx = Math.min(0, Math.max(w - w * k, v.tx));
  const ty = Math.min(0, Math.max(h - h * k, v.ty));
  return { k, tx, ty };
}

/** 화면의 한 점(cx, cy)을 제자리에 둔 채 k를 바꾼다. */
export function zoomAt(v: View, nextK: number, cx: number, cy: number, w: number, h: number, maxK: number): View {
  const k = Math.min(Math.max(nextK, 1), maxK);
  const s = k / v.k;
  return clampView({ k, tx: cx - (cx - v.tx) * s, ty: cy - (cy - v.ty) * s }, w, h, maxK);
}

/** 기본 좌표의 사각형(bx0..bx1, by0..by1)이 화면 가운데에 오도록 확대한다. */
export function zoomToRect(v: View, r: Rect, w: number, h: number, maxK: number, pad: number): View {
  const fitK = Math.min((w - pad * 2) / Math.max(r.w, 1), (h - pad * 2) / Math.max(r.h, 1));
  const k = Math.min(maxK, Math.max(v.k * 1.6, fitK));
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return clampView({ k, tx: w / 2 - cx * k, ty: h / 2 - cy * k }, w, h, maxK);
}

export const toScreen = (p: Pt, v: View): Pt => ({ x: p.x * v.k + v.tx, y: p.y * v.k + v.ty });

/** 고리 하나를 SVG 경로 글로 */
export function ringPath(ring: Pt[]) {
  if (!ring.length) return "";
  let d = `M${ring[0].x.toFixed(1)} ${ring[0].y.toFixed(1)}`;
  for (let i = 1; i < ring.length; i++) d += `L${ring[i].x.toFixed(1)} ${ring[i].y.toFixed(1)}`;
  return d + "Z";
}

/** 다각형 넓이(부호 없음)와 무게중심 */
export function ringCentroid(ring: Pt[]): { area: number; c: Pt } {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j].x * ring[i].y - ring[i].x * ring[j].y;
    a += f;
    cx += (ring[j].x + ring[i].x) * f;
    cy += (ring[j].y + ring[i].y) * f;
  }
  if (Math.abs(a) < 1e-9) {
    const sx = ring.reduce((s, p) => s + p.x, 0) / ring.length;
    const sy = ring.reduce((s, p) => s + p.y, 0) / ring.length;
    return { area: 0, c: { x: sx, y: sy } };
  }
  return { area: Math.abs(a / 2), c: { x: cx / (3 * a), y: cy / (3 * a) } };
}

/**
 * 글자 폭 어림(px). 한글은 거의 정사각, 숫자·로마자는 그 절반쯤.
 * 겹침 판단용이라 조금 넉넉하게 잡는다.
 */
export function textWidth(s: string, fs: number, bold = false) {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0) ?? 0;
    if (c >= 0xac00 && c <= 0xd7a3) w += 0.95;
    else if (ch === " ") w += 0.3;
    else if ("·ㆍ.,()[]'".includes(ch)) w += 0.38;
    else if (c >= 0x30 && c <= 0x39) w += 0.6;
    else w += 0.62;
  }
  return w * fs * (bold ? 1.05 : 1);
}

export const overlaps = (a: Rect, b: Rect, m = 2) =>
  a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

export const insideFrame = (r: Rect, w: number, h: number, m = 2) => r.x >= m && r.y >= m && r.x + r.w <= w - m && r.y + r.h <= h - m;

/**
 * 점 옆 이름표 자리 찾기: 오른쪽 → 왼쪽 → 위 → 아래 순서로 빈자리를 본다.
 * 다 막혔으면 null(이름을 숨긴다).
 */
export function placeLabel(
  ax: number,
  ay: number,
  r: number,
  tw: number,
  th: number,
  taken: Rect[],
  w: number,
  h: number,
): Rect | null {
  const gap = 4;
  const cands: Rect[] = [
    { x: ax + r + gap, y: ay - th / 2, w: tw, h: th },
    { x: ax - r - gap - tw, y: ay - th / 2, w: tw, h: th },
    { x: ax - tw / 2, y: ay - r - gap - th, w: tw, h: th },
    { x: ax - tw / 2, y: ay + r + gap, w: tw, h: th },
  ];
  for (const c of cands) if (insideFrame(c, w, h) && !taken.some((t) => overlaps(t, c))) return c;
  return null;
}

/**
 * 꼭 보여야 하는 이름표(고른 곳)인데 빈자리가 없을 때: 네 자리(오른쪽 → 왼쪽 → 위 → 아래)를 틀 안으로 당겨 놓고
 * 이미 차지한 자리(점·묶음 점·다른 이름표)와 겹치는 넓이가 가장 작은 곳을 고른다. 넓이가 같으면 앞 차례.
 * (전에는 늘 오른쪽에 두어 옆 묶음 점과 포갤 때가 있었다.)
 */
export function forceLabel(ax: number, ay: number, r: number, tw: number, th: number, taken: Rect[], w: number, h: number): Rect {
  const gap = 4;
  const cx = (x: number) => Math.min(Math.max(x, 2), w - tw - 2);
  const cy = (y: number) => Math.min(Math.max(y, 2), h - th - 2);
  const cands: Rect[] = [
    { x: cx(ax + r + gap), y: cy(ay - th / 2), w: tw, h: th },
    { x: cx(ax - r - gap - tw), y: cy(ay - th / 2), w: tw, h: th },
    { x: cx(ax - tw / 2), y: cy(ay - r - gap - th), w: tw, h: th },
    { x: cx(ax - tw / 2), y: cy(ay + r + gap), w: tw, h: th },
  ];
  const hit = (c: Rect) =>
    taken.reduce(
      (s, t) => s + Math.max(0, Math.min(t.x + t.w, c.x + c.w) - Math.max(t.x, c.x)) * Math.max(0, Math.min(t.y + t.h, c.y + c.h) - Math.max(t.y, c.y)),
      0,
    );
  let best = cands[0];
  let bestHit = hit(best);
  for (const c of cands.slice(1)) {
    const v = hit(c);
    if (v < bestHit) {
      best = c;
      bestHit = v;
    }
  }
  return best;
}

/** 축척 막대: 1km 폭(px)을 받아 60~140px 사이의 보기 좋은 길이를 고른다. */
export function niceScale(pxPerKm: number, maxPx = 140) {
  const steps = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20];
  let pick = steps[0];
  for (const s of steps) if (s * pxPerKm <= maxPx) pick = s;
  return { px: pick * pxPerKm, label: pick < 1 ? `${Math.round(pick * 1000)}m` : `${pick}km` };
}

/** 점이 고리들(짝홀 규칙) 안에 있는지 */
export function inRings(x: number, y: number, rings: Pt[][]) {
  let inside = false;
  for (const r of rings) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const a = r[i];
      const b = r[j];
      if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
    }
  }
  return inside;
}

/**
 * 권역 이름표 자리: 권역 다각형 안의 빈자리 가운데 무게중심에 가장 가까운 곳.
 * 1차: 이름표 네 모서리가 모두 권역 안, 2차: 가운데만 권역 안. 둘 다 없으면 null(숨김).
 */
export function placeInPolygon(
  rings: Pt[][],
  c: Pt,
  tw: number,
  th: number,
  taken: Rect[],
  w: number,
  h: number,
): Rect | null {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of rings)
    for (const p of r) {
      if (p.x < x0) x0 = p.x;
      if (p.x > x1) x1 = p.x;
      if (p.y < y0) y0 = p.y;
      if (p.y > y1) y1 = p.y;
    }
  x0 = Math.max(x0, tw / 2);
  x1 = Math.min(x1, w - tw / 2);
  y0 = Math.max(y0, th / 2);
  y1 = Math.min(y1, h - th / 2);
  if (x0 > x1 || y0 > y1) return null;
  const step = Math.max(8, Math.round(Math.min(w, h) / 48));
  const cands: Pt[] = [];
  for (let y = y0; y <= y1; y += step) for (let x = x0; x <= x1; x += step) cands.push({ x, y });
  cands.push({ x: Math.min(Math.max(c.x, x0), x1), y: Math.min(Math.max(c.y, y0), y1) });
  cands.sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y));
  for (const strict of [true, false]) {
    for (const p of cands) {
      const r = { x: p.x - tw / 2, y: p.y - th / 2, w: tw, h: th };
      if (!insideFrame(r, w, h) || taken.some((t) => overlaps(t, r, 3))) continue;
      if (!inRings(p.x, p.y, rings)) continue;
      if (
        strict &&
        !(inRings(r.x, r.y, rings) && inRings(r.x + r.w, r.y, rings) && inRings(r.x, r.y + r.h, rings) && inRings(r.x + r.w, r.y + r.h, rings))
      )
        continue;
      return r;
    }
  }
  return null;
}

/**
 * 겹치는 점 묶기. geo.ts의 groupOverlaps로 한 번 묶은 뒤,
 * 묶음 가운데가 움직여 다시 가까워진 묶음끼리 더 합친다(묶음 점끼리 겹치지 않게).
 */
export function cluster<T extends Pt>(groups: { x: number; y: number; items: T[] }[], radius: number) {
  const gs = groups.map((g) => ({ ...g, items: [...g.items] }));
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < gs.length; i++) {
      for (let j = i + 1; j < gs.length; j++) {
        if (Math.hypot(gs[i].x - gs[j].x, gs[i].y - gs[j].y) < radius) {
          const items = [...gs[i].items, ...gs[j].items];
          gs[i] = {
            items,
            x: items.reduce((t, q) => t + q.x, 0) / items.length,
            y: items.reduce((t, q) => t + q.y, 0) / items.length,
          };
          gs.splice(j, 1);
          changed = true;
          break outer;
        }
      }
    }
  }
  return gs;
}
