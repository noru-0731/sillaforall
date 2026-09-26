// 빈 칸 채우기(사용자 09-27 0시 45분: "채울 수 있는 대로 채우고 나머지는 그냥 비워요"). 서버 컴포넌트에서만 부른다.
// 관광지 서브메인 관람 도우미의 주차·접근로·화장실 칸과 무장애 정보 쪽 세 상자(주차·접근로·화장실)에서
// 한국관광공사 무장애 여행 정보 글이 없을 때만 쓴다. 차례대로 첫째로 있는 것 하나:
// - 주차: 경주시 무장애 여행정보 '장애인 전용주차장' → 관광정보 일반 주차 글(places.json parkingInfo) → 500m 안 가장 가까운 공영주차장(이름·직선거리)
// - 화장실: 경주시 '장애인 전용화장실' → 1km 안 가장 가까운 장애인 화장실(이름·직선거리)
// - 접근로: 경주시 '출입구·이동로'·'관람로'만
// 채운 값에는 자료 꼬리(components/place/FillText.tsx)를 붙여 관광공사 무장애 글과 구별한다. 글은 자료 값과 칸 이름 그대로다.
import type { Place } from "./types";
import { gjOf } from "./gj";
import { KIND_LABEL, nearestWithin } from "./bf";

/** gj: 경주시 무장애 여행정보, tour: 한국관광공사 관광정보, near: 가까운 편의시설(편의시설 표와 같은 자료) */
export type FillSrc = "gj" | "tour" | "near";
export type Fill = { text: string; src: FillSrc };

/** 경주시 칸 줄('칸 이름 : 값', gj.ts 와 같은 꼴). 칸이 하나도 없으면 null */
function gjRows(id: string, keys: string[]): string | null {
  const rows = gjOf(id)?.rows.filter(([k, v]) => keys.includes(k) && v.trim()) ?? [];
  return rows.length ? rows.map(([k, v]) => `${k} : ${v.trim()}`).join("\n") : null;
}

/** 가까운 편의시설 한 곳: '이름 · 직선거리 Nm'(이름이 없으면 종류 이름, 지도 번호 네모 풀이와 같은 꼴) */
function nearText(id: string, kind: "parking" | "toiletA", maxM: number): string | null {
  const it = nearestWithin(id, kind, maxM);
  return it ? `${it.name ?? KIND_LABEL[it.kind]} · 직선거리 ${it.distanceM.toLocaleString("ko-KR")}m` : null;
}

/** 주차 칸을 채울 값(관광공사 무장애 주차 글이 없을 때) */
export function parkingFill(p: Place): Fill | null {
  const gj = gjRows(p.id, ["장애인 전용주차장"]);
  if (gj) return { text: gj, src: "gj" };
  const tour = p.parkingInfo?.trim();
  if (tour) return { text: tour, src: "tour" };
  const near = nearText(p.id, "parking", 500);
  return near ? { text: near, src: "near" } : null;
}

/** 화장실 칸을 채울 값(관광공사 무장애 화장실 글이 없을 때) */
export function toiletFill(p: Place): Fill | null {
  const gj = gjRows(p.id, ["장애인 전용화장실"]);
  if (gj) return { text: gj, src: "gj" };
  const near = nearText(p.id, "toiletA", 1000);
  return near ? { text: near, src: "near" } : null;
}

/** 접근로 칸을 채울 값(관광공사 무장애 접근로·출입통로 글이 없을 때). 경주시 칸만 */
export function walkFill(p: Place): Fill | null {
  const gj = gjRows(p.id, ["출입구·이동로", "관람로"]);
  return gj ? { text: gj, src: "gj" } : null;
}
