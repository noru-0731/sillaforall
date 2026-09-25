import type { Box } from "@/data/types";

// 위도·경도를 화면 좌표로 바꾼다. 경주(북위 약 35.8도)에서 경도 1도는 위도 1도보다 짧으므로 cos(위도)를 곱한다.
const KM_PER_DEG_LAT = 111.0;
const kmPerDegLon = (lat: number) => 111.32 * Math.cos((lat * Math.PI) / 180);

/** 상자(box)의 가로:세로 비율(실제 거리 기준). 세로 = 가로 × aspect */
export function aspect(box: Box) {
  const midLat = (box.lat0 + box.lat1) / 2;
  const w = (box.lon1 - box.lon0) * kmPerDegLon(midLat);
  const h = (box.lat1 - box.lat0) * KM_PER_DEG_LAT;
  return h / w;
}

/** 상자 안의 점을 0~width, 0~height 좌표로. 북쪽이 위. */
export function project(lon: number, lat: number, box: Box, width: number, height: number) {
  return {
    x: ((lon - box.lon0) / (box.lon1 - box.lon0)) * width,
    y: ((box.lat1 - lat) / (box.lat1 - box.lat0)) * height,
  };
}

export const inBox = (lon: number, lat: number, b: Box) => lon >= b.lon0 && lon <= b.lon1 && lat >= b.lat0 && lat <= b.lat1;

/** 가로 1km가 몇 px인지(축척 막대용) */
export function pxPerKm(box: Box, width: number) {
  const midLat = (box.lat0 + box.lat1) / 2;
  return width / ((box.lon1 - box.lon0) * kmPerDegLon(midLat));
}

/**
 * 화면에서 radius px 안에 겹치는 점들을 한 묶음으로 모은다(단순 탐욕 묶기).
 * 묶음이 하나짜리면 점 하나, 둘 이상이면 "묶음 점"으로 그리고 누르면 목록을 띄운다.
 */
export function groupOverlaps<T extends { x: number; y: number }>(pts: T[], radius: number) {
  const groups: { x: number; y: number; items: T[] }[] = [];
  for (const p of pts) {
    const g = groups.find((g) => Math.hypot(g.x - p.x, g.y - p.y) < radius);
    if (g) {
      g.items.push(p);
      g.x = g.items.reduce((s, q) => s + q.x, 0) / g.items.length;
      g.y = g.items.reduce((s, q) => s + q.y, 0) / g.items.length;
    } else groups.push({ x: p.x, y: p.y, items: [p] });
  }
  return groups;
}
