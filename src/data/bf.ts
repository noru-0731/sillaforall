// 무장애 알맹이 시안(git 갈래 bf-draft)의 자료 도우미. 서버 컴포넌트에서만 부른다(JSON 세 개를 클라이언트로 보내지 않으려고).
// - barrierfree.json: 관광공사 무장애 여행 정보 28칸(곳마다), 짝 못 지은 곳의 가까운 후보. 만드는 곳: 도구/06_편의시설.py
// - amenities.json: 곳마다 가까운 편의시설 요약, 배리어프리 문화예술관광지 짝, 시 전체 창구(교통약자이동지원센터), 자료 출처. 같은 도구.
// - amenities_near.json: 지도에 찍을 가까운 화장실·공영주차장·충전기(번호 매김)와 벤치·쉼터. 만드는 곳: 도구/10_편의시설_지도.py
// - food_near.json: 1km 안 관광공사 무장애 여행 정보 음식점(유형 39, 가까운 순 몇 곳). 만드는 곳: 도구/14_무장애_음식점.py
//   amenitiesOf 에서 편의시설 목록 끝에 번호를 이어 붙인다.
// 칸 이름은 원본 자료의 칸 이름을 그대로 쓴다(새 글이 아니다). 거리는 모두 직선거리(m).
// 무장애 칸 글은 줄바꿈이 빠져 붙은 자리만 줄을 나눠 돌려준다(lib/breaks.ts bfLines, 글자는 그대로).
import { bfLines } from "@/lib/breaks";
import bfRaw from "./barrierfree.json";
import amRaw from "./amenities.json";
import nearRaw from "./amenities_near.json";
import foodRaw from "./food_near.json";

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
    rows: BF.meta.groups[g].filter((k) => fields[k]?.trim()).map((k) => [k, bfLines(fields[k]!.trim())] as [string, string]),
  })).filter((g) => g.rows.length > 0);
}

/** 이 곳의 무장애 정보(채워진 칸만, 묶음 차례). 명부에 없으면 빈 목록 */
export function bfGroupsOf(id: string): BfGroup[] {
  const f = BF.places[id]?.fields;
  return f ? groupsOf(f) : [];
}
/** 글이 적힌 칸이 하나라도 있는 묶음 이름(묶음 차례). 목록 카드·표의 이름표(가8)에 쓴다. 명부에 없으면 빈 목록 */
export function bfGroupNamesOf(id: string): string[] {
  return bfGroupsOf(id).map((g) => g.name);
}
/** 채워진 칸 수 */
export const bfFilledOf = (id: string) => BF.places[id]?.filled ?? 0;

// 칸 이름을 화면에 적을 때: 값이 대여 이야기인 두 칸은 열린관광 무장애 편의정보 칸 이름으로(문구 대조 BF02). 자료 칸 이름은 그대로 둔다.
const FIELD_LABEL: Record<string, string> = { 휠체어: "휠체어대여", 유모차: "유모차 대여" };
export const bfLabel = (k: string) => FIELD_LABEL[k] ?? k;

/** 글이 적힌 칸 이름(묶음·칸 차례). 무장애 쪽 머리 그림 줄(가9)에 쓴다. '… 기타' 칸은 시설 이름이 아니라서 뺀다. 명부에 없으면 빈 목록 */
export function bfFilledFieldsOf(id: string): string[] {
  return bfGroupsOf(id)
    .flatMap((g) => g.rows.map(([k]) => k))
    .filter((k) => !k.endsWith("기타"));
}

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
export type AmenityKind = "toiletA" | "toilet" | "parking" | "charger" | "food";
export type AmenitySrc = "toiletStd" | "osm" | "korwith" | "bfCulture" | "parking" | "charger" | "korwithFood";
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

const FOOD = foodRaw as unknown as {
  meta: { fetched: string; radius: number; cap: number };
  places: Record<string, { name: string; inRadius: number; items: Omit<AmenityItem, "no">[] }>;
};

/** 가까운 편의시설(좌표를 빌린 곳은 null). 무장애 음식점은 끝에 번호를 이어 붙인다 */
export function amenitiesOf(id: string): NearPlace | null {
  const base = NEAR.places[id];
  if (!base) return null;
  const food = FOOD.places[id]?.items ?? [];
  if (!food.length) return base;
  const last = base.items.reduce((n, i) => Math.max(n, i.no), 0);
  return { ...base, items: [...base.items, ...food.map((f, n) => ({ ...f, no: last + n + 1 }))] };
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
  food: "음식점",
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
  korwithFood: "한국관광공사 무장애 여행 정보",
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
  if (set.has("korwithFood")) lines.push(`자료: ${S.korwith.name.replace(/\(.*\)$/, "")} 음식점(${FOOD.meta.fetched} 받음)`);
  if (set.has("osm") || set.has("osmRest")) lines.push(`자료: © OpenStreetMap 기여자, ODbL(${S.osm.fetched.slice(0, 10)} 받음)`);
  return lines;
}
