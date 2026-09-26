// 편의시설 번호 매기기(deck 갈래). 무장애 정보 쪽 편의시설 지도·표에서 공영주차장을 맨 앞 종류로 옮기고 1부터 다시 매긴다.
// 까닭: 오시는 길 쪽은 공영주차장만 1부터 매기므로, 같은 주차장이 두 쪽에서 같은 번호가 되게(대릉원 봉황대공영주차장: 13 → 3 이던 것).
// 차례는 무장애 정보 쪽 부제 '주차·접근로·화장실'과 같게 주차 먼저. 나머지 종류와 같은 종류 안 차례는 자료 번호(no) 차례 그대로.
import type { AmenityItem } from "@/data/bf";

export function parkingFirst<T extends AmenityItem>(items: T[]): (T & { show: number })[] {
  const byNo = [...items].sort((a, b) => a.no - b.no);
  const ordered = [...byNo.filter((i) => i.kind === "parking"), ...byNo.filter((i) => i.kind !== "parking")];
  return ordered.map((i, n) => ({ ...i, show: n + 1 }));
}
