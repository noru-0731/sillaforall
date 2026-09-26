// 목록 쪽 자료 만들기. 서버 컴포넌트에서만 부른다(photos.json, barrierfree.json을 읽는다).
// 페르소나 장점 취합: 카드·가나다순 표에 분류와 쉬는 날(가6), 카드에 무장애 묶음 이름표(가8). 모두 자료 글 그대로이고 보이기만 한다.
import { areaOf, areas, byName, places } from "@/data";
import type { Place } from "@/data";
import { photoCreditOf } from "@/data/photos";
import { pickPhoto } from "@/components/map/explorerData";
import { hoursLines } from "@/lib/breaks";
import { bfGroupNamesOf } from "@/data/bf";
import type { AreaOption, BoardRow, CardPlace } from "./types";

const labelOf = (p: Place) => areas.find((a) => a.key === areaOf(p))?.label ?? "";

/** 이용시간·쉬는 날: 빈 줄을 한 줄 바꿈으로, 붙은 줄(줄 첫머리가 아닌 "- "·"[")은 나눈다 */
const cleanHours = (h: string | null) => (h ? hoursLines(h.replace(/\n\s*\n/g, "\n").trim()) : null);

export function toCard(p: Place): CardPlace {
  const photo = pickPhoto(p.id);
  return {
    id: p.id,
    name: p.name,
    area: areaOf(p),
    areaLabel: labelOf(p),
    dong: p.dong,
    address: p.address,
    hours: cleanHours(p.hours),
    closed: cleanHours(p.closed),
    category: p.category,
    photo,
    registered: p.registered,
    bfGroups: bfGroupNamesOf(p.id),
    credit: photo ? photoCreditOf(photo) : null,
  };
}

/** 61곳 카드: 권역 차례, 권역 안은 가나다순 */
export function cardsByArea(): CardPlace[] {
  return areas.flatMap((a) => places.filter((p) => areaOf(p) === a.key).sort(byName).map(toCard));
}

/** 거점별 카드 묶음(HUBS 차례, 안은 가나다순) */
export function cardsOf(ps: Place[]): CardPlace[] {
  return [...ps].sort(byName).map(toCard);
}

/** 61곳 표 줄: 가나다순 */
export function boardRows(): BoardRow[] {
  return [...places].sort(byName).map((p) => ({
    id: p.id,
    name: p.name,
    area: areaOf(p),
    areaLabel: labelOf(p),
    dong: p.dong,
    category: p.category,
    closed: cleanHours(p.closed),
    registered: p.registered,
    hasPhoto: pickPhoto(p.id) !== null,
  }));
}

export function areaOptions(): AreaOption[] {
  return areas.map((a) => ({ key: a.key, label: a.label, count: a.placeIds.length }));
}
