// 지도 쪽(/map, /map/[area])이 서버에서 준비하는 자료. photos.json을 클라이언트로 보내지 않으려고
// 관광지마다 사진 한 장(주소·유형)만 골라 MapExplorer에 넘긴다. 서버 컴포넌트에서만 부른다.
import { areaOf, byName, HUBS, places } from "@/data";
import type { AreaKey } from "@/data";
import { anyPhoto, coverPhoto, type KoglType } from "@/data/photos";

export type ExplorerPhoto = { url: string; type: KoglType } | null;

/** 지도 쪽에 보일 관광지 id(가나다순). view가 권역이면 그 권역만 */
export function explorerIds(view: "full" | AreaKey): string[] {
  return places
    .filter((p) => view === "full" || areaOf(p) === view)
    .sort(byName)
    .map((p) => p.id);
}

/**
 * 관광지 사진 한 장: 잘라 써도 되는 제1유형 → 없으면 아무 사진(제3유형은 <Photo>가 자르지 않는다) → 없으면 null.
 */
export function pickPhoto(id: string): ExplorerPhoto {
  const p = coverPhoto(id) ?? anyPhoto(id);
  return p ? { url: p.url, type: p.type } : null;
}

/** 관광지마다 큰 사진 한 장 */
export function explorerPhotos(ids: string[]): Record<string, ExplorerPhoto> {
  const out: Record<string, ExplorerPhoto> = {};
  for (const id of ids) out[id] = pickPhoto(id);
  return out;
}

/** 이 범위 안에 관광지가 하나라도 있는 거점 */
export function explorerHubs(ids: string[]): string[] {
  const set = new Set(ids);
  return HUBS.filter((h) => places.some((p) => p.cluster === h && set.has(p.id)));
}
