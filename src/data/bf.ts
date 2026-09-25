// 무장애 알맹이 시안(git 갈래 bf-draft)의 자료 도우미. 서버 컴포넌트에서만 부른다(JSON 세 개를 클라이언트로 보내지 않으려고).
// - barrierfree.json: 관광공사 무장애 여행 정보 28칸(곳마다), 짝 못 지은 곳의 가까운 후보. 만드는 곳: 도구/06_편의시설.py
// - amenities.json: 곳마다 가까운 편의시설 요약, 배리어프리 문화예술관광지 짝, 시 전체 창구(교통약자이동지원센터), 자료 출처. 같은 도구.
// - amenities_near.json: 지도에 찍을 가까운 화장실·공영주차장·충전기(번호 매김)와 벤치·쉼터. 만드는 곳: 도구/10_편의시설_지도.py
// 칸 이름은 원본 자료의 칸 이름을 그대로 쓴다(새 글이 아니다). 거리는 모두 직선거리(m).
import bfRaw from "./barrierfree.json";
import amRaw from "./amenities.json";
import nearRaw from "./amenities_near.json";

// ───────── 관광공사 무장애 여행 정보 28칸 ─────────
type Fields = Record<string, string | null>;
type BfPlace = { name: string; contentId: string | null; title: string | null; fields: Fields | null; filled: number };
type BfCand = { contentId: string; title: string; type: string; distanceM: number; coordsBorrowed: boolean; fields: Record<string, string> };
const BF = bfRaw as unknown as {
  meta: { source: string; url: string; fetched: string; groups: Record<string, string[]>; fieldOrder: string[] };
  places: Record<string, BfPlace>;
  candidates: Record<string, { name: string; candidates: BfCand[] }>;
};

export const BF_GROUPS = Object.keys(BF.meta.groups); // 지체장애, 시각장애, 청각장애, 영유아 가족
export const BF_SOURCE = { name: "한국관광공사 무장애 여행 정보", fetched: BF.meta.fetched, url: BF.meta.url };

export type BfGroup = { name: string; rows: [string, string][] };

function groupsOf(fields: Record<string, string | null | undefined>): BfGroup[] {
  return BF_GROUPS.map((g) => ({
    name: g,
    rows: BF.meta.groups[g].filter((k) => fields[k]?.trim()).map((k) => [k, fields[k]!.trim()] as [string, string]),
  })).filter((g) => g.rows.length > 0);
}

/** 이 곳의 무장애 정보(채워진 칸만, 묶음 차례). 명부에 없으면 빈 목록 */
export function bfGroupsOf(id: string): BfGroup[] {
  const f = BF.places[id]?.fields;
  return f ? groupsOf(f) : [];
}
/** 채워진 칸 수 */
export const bfFilledOf = (id: string) => BF.places[id]?.filled ?? 0;

// 관광공사 콘텐츠 유형: 12 관광지, 14 문화시설 (숙박 32·음식점 39 후보는 싣지 않는다)
const TYPE_LABEL: Record<string, string> = { "12": "관광지", "14": "문화시설" };
export type BfNeighbor = { title: string; contentId: string; typeLabel: string; distanceM: number; coordsBorrowed: boolean; groups: BfGroup[] };

/** 명부에 없는 곳: 300m 안(좌표를 빌린 곳은 빌린 좌표 기준) 관광공사 무장애 여행 정보에 오른 관광지·문화시설과 그 칸 */
export function bfNeighborsOf(id: string): BfNeighbor[] {
  if (BF.places[id]?.fields) return [];
  return (BF.candidates[id]?.candidates ?? [])
    .filter((c) => TYPE_LABEL[c.type])
    .map((c) => ({
      title: c.title,
      contentId: c.contentId,
      typeLabel: TYPE_LABEL[c.type],
      distanceM: c.distanceM,
      coordsBorrowed: c.coordsBorrowed,
      groups: groupsOf(c.fields),
    }))
    .filter((c) => c.groups.length > 0)
    .sort((a, b) => a.distanceM - b.distanceM);
}

// ───────── 배리어프리 문화예술관광지(한국문화정보원) 짝 ─────────
type Yn = Record<string, string>;
type AmPlace = {
  name: string;
  bfCulture: { match: { name: string; category: string; distanceM: number; refDate: string; hours: string | null; closed: string | null; yn: Yn } | null };
  skipped?: string;
};
type Source = { name: string; url: string; provider: string; license: string; caution?: string; fetched: string; refDates?: string[] };
const AM = amRaw as unknown as {
  sources: Record<string, Source>;
  cityWide: {
    mobilityCenter: {
      name: string;
      address: string;
      phone: string;
      vehicles: string;
      slope: number;
      reserve: string;
      reserveHours: { weekday: string; weekend: string };
      area: { inside: string; outside: string };
      target: string[];
      fare: string;
      refDate: string;
    };
  };
  places: Record<string, AmPlace>;
};

export type BfCulture = { name: string; distanceM: number; refDate: string; rows: [string, string][]; hours: string | null; closed: string | null };
/** 같은 이름으로 짝지은 배리어프리 문화예술관광지 행(12곳). Y/N 칸 그대로 */
export function bfCultureOf(id: string): BfCulture | null {
  const m = AM.places[id]?.bfCulture?.match;
  if (!m) return null;
  return { name: m.name, distanceM: m.distanceM, refDate: m.refDate, rows: Object.entries(m.yn), hours: m.hours, closed: m.closed };
}

export const SOURCES = AM.sources;
export const MOBILITY = AM.cityWide.mobilityCenter;

// ───────── 지도에 찍을 가까운 편의시설 ─────────
export type AmenityKind = "toiletA" | "toilet" | "parking" | "charger";
export type AmenitySrc = "toiletStd" | "osm" | "korwith" | "bfCulture" | "parking" | "charger";
export type AmenityItem = {
  no: number;
  kind: AmenityKind;
  src: AmenitySrc;
  name: string | null;
  distanceM: number;
  lat: number;
  lon: number;
  fields: [string, string | number][];
  far?: boolean;
  disabledZone?: string;
};
export type RestPoint = { kind: "bench" | "shelter"; lat: number; lon: number; distanceM: number };
type NearPlace = { name: string; items: AmenityItem[]; rest: RestPoint[]; inRadius: Record<string, number> };
const NEAR = nearRaw as unknown as {
  meta: { radii: { toilet: number; parking: number; charger: number; benchShelter: number }; cap: Record<AmenityKind, number> };
  places: Record<string, NearPlace>;
};
export const NEAR_RADII = NEAR.meta.radii;

/** 가까운 편의시설(좌표를 빌린 두 곳은 null) */
export function amenitiesOf(id: string): NearPlace | null {
  return NEAR.places[id] ?? null;
}

/** 가장 가까운 장애인 화장실 한 곳(관람 도우미 칸) */
export function nearestAccessibleToilet(id: string): AmenityItem | null {
  return NEAR.places[id]?.items.find((i) => i.kind === "toiletA") ?? null;
}

/** 표시 이름(범례·목록 '구분' 칸) */
export const KIND_LABEL: Record<AmenityKind | "bench" | "shelter", string> = {
  toiletA: "장애인 화장실",
  toilet: "화장실",
  parking: "공영주차장",
  charger: "전동휠체어 급속충전기",
  bench: "벤치",
  shelter: "쉼터",
};

/** 자료 이름(목록 '자료' 칸과 출처 줄). 원본 자료 이름을 줄였다 */
export const SRC_LABEL: Record<AmenitySrc, string> = {
  toiletStd: "공중화장실 표준데이터",
  osm: "오픈스트리트맵",
  korwith: "한국관광공사 무장애 여행 정보",
  bfCulture: "배리어프리 문화예술관광지",
  parking: "주차장정보 표준데이터",
  charger: "전동휠체어급속충전기 표준데이터",
};

/** 출처 줄: "자료: 이름(기준일)" 꼴. src 차례 = SRC_LABEL 차례 */
export function sourceLines(srcs: Iterable<AmenitySrc | "osmRest">): string[] {
  const set = new Set(srcs);
  const S = AM.sources;
  const lines: string[] = [];
  const ref = (s: Source) => (s.refDates ? `데이터기준일자 ${s.refDates[1]}` : `${s.fetched.slice(0, 10)} 받음`);
  // 이름 끝 괄호(KorWithService2, 내려받기 판 등)는 떼고 적는다. 같은 쪽 무장애 표 출처 줄과 같은 이름이 되게
  if (set.has("korwith")) lines.push(`자료: ${S.korwith.name.replace(/\(.*\)$/, "")}(${ref(S.korwith)})`);
  if (set.has("toiletStd")) lines.push(`자료: ${S.toiletStd.name.replace(/\(.*\)$/, "")}(${ref(S.toiletStd)})`);
  if (set.has("bfCulture")) lines.push(`자료: ${S.bfCulture.name}(최종작성일 2022-11-25)`);
  if (set.has("parking")) lines.push(`자료: ${S.parking.name}(${ref(S.parking)})`);
  if (set.has("charger")) lines.push(`자료: ${S.charger.name}(${ref(S.charger)})`);
  if (set.has("osm") || set.has("osmRest")) lines.push(`자료: © OpenStreetMap 기여자, ODbL(${S.osm.fetched.slice(0, 10)} 받음)`);
  return lines;
}
