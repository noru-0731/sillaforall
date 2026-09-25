// 목록 쪽 자료 만들기. 서버 컴포넌트에서만 부른다(photos.json을 읽는다).
import { areaOf, areas, byName, places } from "@/data";
import type { Place } from "@/data";
import { photoCredit, photoCreditOf } from "@/data/photos";
import { pickPhoto } from "@/components/map/explorerData";
import type { AreaOption, BoardRow, CardPlace } from "./types";

const labelOf = (p: Place) => areas.find((a) => a.key === areaOf(p))?.label ?? "";

/** 이용시간: 빈 줄을 한 줄 바꿈으로 */
const cleanHours = (h: string | null) => (h ? h.replace(/\n\s*\n/g, "\n").trim() : null);

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
    photo,
    registered: p.registered,
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
    registered: p.registered,
    hasPhoto: pickPhoto(p.id) !== null,
  }));
}

export function areaOptions(): AreaOption[] {
  return areas.map((a) => ({ key: a.key, label: a.label, count: a.placeIds.length }));
}

/** 카드에 쓴 사진의 출처 줄(관광정보 사진은 쓴 유형만, 관광사진 정보 사진은 촬영자마다 한 줄) */
export function creditsFor(cards: CardPlace[]): string[] {
  const tour = cards.filter((c) => c.photo && c.photo.from !== "gallery");
  const types = new Set(tour.map((c) => c.photo!.type));
  const gallery = [...new Set(cards.filter((c) => c.photo?.from === "gallery").map((c) => photoCreditOf(c.photo!)))];
  return [...(["Type1", "Type3"] as const).filter((t) => types.has(t)).map(photoCredit), ...gallery];
}
