// 무장애 알맹이 시안(git 갈래 bf-draft)의 자료 도우미. 서버 컴포넌트에서만 부른다(JSON 세 개를 클라이언트로 보내지 않으려고).
// - barrierfree.json: 관광공사 무장애 여행 정보 28칸(곳마다), 짝 못 지은 곳의 가까운 후보. 만드는 곳: 도구/06_편의시설.py
// - amenities.json: 곳마다 가까운 편의시설 요약, 배리어프리 문화예술관광지 짝, 시 전체 창구(교통약자이동지원센터), 자료 출처. 같은 도구.
// - amenities_near.json: 지도에 찍을 가까운 화장실·공영주차장·충전기(번호 매김)와 벤치·쉼터. 만드는 곳: 도구/10_편의시설_지도.py
// - food_near.json: 1km 안 관광공사 무장애 여행 정보 음식점(유형 39, 가까운 순 몇 곳). 만드는 곳: 도구/14_무장애_음식점.py
//   amenitiesOf 에서 편의시설 목록 끝에 번호를 이어 붙인다.
// 칸 이름은 원본 자료의 칸 이름을 그대로 쓴다(새 글이 아니다). 공공데이터 칸은 화면에 적을 때 낱말 사이를 띄우고 Y/N·운영시각을 읽히게 한다(아래 stdLabel·stdValue). 거리는 모두 직선거리(m).
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

/** 이 곳의 무장애 정보(채워진 칸만, 묶음 차례). 무장애 정보가 없는 곳이면 빈 목록 */
export function bfGroupsOf(id: string): BfGroup[] {
  const f = BF.places[id]?.fields;
  return f ? groupsOf(f) : [];
}
/** 글이 적힌 칸이 하나라도 있는 묶음 이름(묶음 차례). 목록 카드·표의 이름표(가8)에 쓴다. 무장애 정보가 없는 곳이면 빈 목록 */
export function bfGroupNamesOf(id: string): string[] {
  return bfGroupsOf(id).map((g) => g.name);
}
/** 채워진 칸 수 */
export const bfFilledOf = (id: string) => BF.places[id]?.filled ?? 0;

// 칸 이름을 화면에 적을 때: 값이 대여 이야기인 두 칸은 열린관광 무장애 편의정보 칸 이름으로(문구 대조 BF02). 자료 칸 이름은 그대로 둔다.
const FIELD_LABEL: Record<string, string> = { 휠체어: "휠체어대여", 유모차: "유모차 대여" };
export const bfLabel = (k: string) => FIELD_LABEL[k] ?? k;

/** 글이 적힌 칸 이름(묶음·칸 차례). 무장애 쪽 머리 그림 줄(가9)에 쓴다. '… 기타' 칸은 시설 이름이 아니라서 뺀다. 무장애 정보가 없는 곳이면 빈 목록 */
export function bfFilledFieldsOf(id: string): string[] {
  return bfGroupsOf(id)
    .flatMap((g) => g.rows.map(([k]) => k))
    .filter((k) => !k.endsWith("기타"));
}

// 관광공사 콘텐츠 유형: 12 관광지, 14 문화시설 (숙박 32·음식점 39 후보는 싣지 않는다)
const TYPE_LABEL: Record<string, string> = { "12": "관광지", "14": "문화시설" };
/**
 * placeId: 그 후보가 61곳 안 관광지의 무장애 기록이면 그 곳 id(barrierfree.json places 의 contentId 로 찾음). 표 위 이름을 그 곳 무장애 정보 쪽으로 잇는다(가 99번).
 */
export type BfNeighbor = { title: string; contentId: string; typeLabel: string; distanceM: number; coordsBorrowed: boolean; groups: BfGroup[]; placeId: string | null };

/** 관광공사 무장애 콘텐츠 번호 → 61곳 id(무장애 정보가 있는 곳) */
const PLACE_BY_CID: Record<string, string> = Object.fromEntries(
  Object.entries(BF.places).flatMap(([pid, r]) => (r.contentId ? [[r.contentId, pid]] : [])),
);

/**
 * 무장애 정보가 없는 곳: 300m 안 관광공사 무장애 여행 정보에 올라 있는 관광지·문화시설과 그 칸.
 * 좌표를 빌린 곳(서악서원)과 넓은 구역 기록(경주시 관광특구)은 도구(06_편의시설.py)가 후보에서 뺐다(가 101번).
 */
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
      placeId: PLACE_BY_CID[c.contentId] ?? null,
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
  /** 관광공사 무장애 여행 정보 기록 번호(src korwith 일 때) */
  contentId?: string;
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

/** 이 거리(m) 안에서 가장 가까운 한 곳(종류별, 빈 칸 채우기 data/fill.ts). 찾는 거리 밖이라 가장 가까운 한 곳으로 실린 것(far)은 뺀다 */
/** 구역 전체를 좌표 한 점으로 올린 무장애 기록(도구/06_편의시설.py AREA_RECORDS 와 같음). 직선거리가 실제 거리가 아니라 '가장 가까운 곳'으로 고르지 않는다 */
const AREA_RECORDS = new Set(["1957348"]); // 경주시 관광특구

export function nearestWithin(id: string, kind: AmenityKind, maxM: number): AmenityItem | null {
  const xs = (NEAR.places[id]?.items ?? []).filter(
    (i) => i.kind === kind && !i.far && i.distanceM <= maxM && !(i.contentId && AREA_RECORDS.has(i.contentId)),
  );
  return xs.reduce<AmenityItem | null>((m, i) => (!m || i.distanceM < m.distanceM ? i : m), null);
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

// ───────── 공공데이터 칸 이름·값을 화면에 적을 때(09-26 평가 04 A③ 고침) ─────────
// 자료(JSON)의 칸 이름·값은 원본 그대로 두고, 화면에 적을 때만 여기 한 곳에서 바꾼다(편의시설 표·오시는 길 공영주차장 표·배리어프리 문화예술관광지 표).
// 칸 이름: 그 표준데이터의 공식 항목명을 낱말 사이만 띄어 쓴다(새 말로 바꾸지 않음). 공식 항목명은 행정안전부_공공데이터 제공 표준_20251001(공공데이터포털 15156444)에서 확인.
//   두 항목을 한 칸에 붙인 것(○○운영시작시각~○○운영종료시각 → ○○운영시각, 주차장구분·주차장유형 → 주차장구분·유형)은 도구(10_편의시설_지도.py)가 붙인 이름을 같은 규칙으로 띄운다.
const STD_FIELD_LABEL: Record<string, string> = {
  // 전국공중화장실표준데이터
  개방시간: "개방 시간",
  소재지도로명주소: "소재지 도로명 주소",
  "남성용-장애인용대변기수": "남성용 장애인용 대변기 수",
  "남성용-장애인용소변기수": "남성용 장애인용 소변기 수",
  "여성용-장애인용대변기수": "여성용 장애인용 대변기 수",
  // 전국주차장정보표준데이터
  "주차장구분·유형": "주차장 구분·유형",
  주차구획수: "주차 구획 수",
  평일운영시각: "평일 운영 시각",
  토요일운영시각: "토요일 운영 시각",
  공휴일운영시각: "공휴일 운영 시각",
  요금정보: "요금 정보",
  특기사항: "특기 사항",
  장애인전용주차구역보유여부: "장애인 전용 주차 구역 보유 여부",
  // 전국전동휠체어급속충전기표준데이터(운영시각 셋은 위와 같은 이름)
  설치장소설명: "설치 장소 설명",
  동시사용가능대수: "동시 사용 가능 대수",
  관리기관전화번호: "관리 기관 전화번호",
  // 전국교통약자이동지원센터정보표준데이터(오시는 길·인쇄 쪽 교통약자이동지원센터 칸).
  // '예약접수'는 평일·주말예약접수운영시작시각~종료시각을 한 괄호에 적을 때 앞에 붙이는 조각
  예약접수전화번호: "예약 접수 전화번호",
  보유차량종류: "보유 차량 종류",
  슬로프형휠체어차량대수: "슬로프형 휠체어 차량 대수",
  사전예약신청기간: "사전 예약 신청 기간",
  예약접수: "예약 접수",
  차량관내운행지역: "차량 관내 운행 지역",
  차량관외운행지역: "차량 관외 운행 지역",
  차량이용요금: "차량 이용 요금",
  차량이용대상: "차량 이용 대상",
  // 표준데이터 모두에 있는 칸(출처 줄 괄호)
  데이터기준일자: "데이터 기준 일자",
  // 한국문화정보원 전국 배리어프리 문화예술관광지(띄어 쓰지 않은 넷만. 최종작성일은 출처 줄 괄호)
  "무료주차 가능여부": "무료 주차 가능 여부",
  "유료주차 가능여부": "유료 주차 가능 여부",
  "대형주차장 가능여부": "대형 주차장 가능 여부",
  최종작성일: "최종 작성일",
};
/** 화면에 적을 칸 이름(표에 없는 칸은 그대로) */
export const stdLabel = (k: string) => STD_FIELD_LABEL[k] ?? k;

/**
 * 화면에 적을 칸 값.
 * - Y/N: 칸 이름에 '가능'이 들면 가능/불가, 아니면 있음/없음(오픈스트리트맵 wheelchair yes·no 를 옮긴 말과 같은 낱말).
 * - 운영시각 '시작~종료': 표준데이터 제공 표준의 항목 설명대로 읽는다. 전동휠체어급속충전기·주차장정보 모두
 *   시작 시각은 "24시간 운영 또는 미운영 시 ‘00:00’", 종료 시각은 "24시간 운영 시 ‘23:59’, 미운영 시 ‘00:00’"으로 적게 되어 있어
 *   00:00~00:00 은 '미운영', 00:00~23:59 는 '24시간 운영'(지침의 말)이다.
 */
export function stdValue(k: string, v: string | number): string {
  const t = String(v);
  if (t === "Y" || t === "N") return k.includes("가능") ? (t === "Y" ? "가능" : "불가") : t === "Y" ? "있음" : "없음";
  if (k.endsWith("운영시각")) {
    if (t === "00:00~00:00") return "미운영";
    if (t === "00:00~23:59") return "24시간 운영";
  }
  return t;
}

// 자료 이름(공공데이터포털 표준데이터 제목)도 화면에 적을 때 칸 이름과 같은 규칙으로 낱말 사이만 띄운다(09-27 점검).
// 낱말 나눔은 사이트에 이미 있는 꼴을 따른다: '공중화장실'·'전동휠체어 급속충전기'(KIND_LABEL), '요금 정보'처럼 '주차장 정보',
// '이동지원센터'는 「교통약자의 이동편의 증진법」의 말 한 덩어리. 자료 출처 쪽(/about/sources) 표는 포털 제목 그대로 둔다(주소와 같이 적는 인용).
const STD_DATASET_LABEL: Record<string, string> = {
  전국공중화장실표준데이터: "전국 공중화장실 표준데이터",
  전국주차장정보표준데이터: "전국 주차장 정보 표준데이터",
  전국전동휠체어급속충전기표준데이터: "전국 전동휠체어 급속충전기 표준데이터",
  전국교통약자이동지원센터정보표준데이터: "전국 교통약자 이동지원센터 정보 표준데이터",
};
/** 화면에 적을 자료 이름(표에 없는 이름은 그대로) */
export const stdDataset = (name: string) => STD_DATASET_LABEL[name] ?? name;

/** 교통약자이동지원센터 출처 줄(오시는 길·인쇄 쪽) */
export const MOBILITY_SOURCE_LINE = `자료: ${stdDataset(AM.sources.mobilityCenter.name)}(${stdLabel("데이터기준일자")} ${MOBILITY.refDate})`;

/** 배리어프리 문화예술관광지 출처 줄(무장애 정보 쪽 표 아래·편의시설 출처 줄) */
export const BF_CULTURE_SOURCE_LINE = `자료: ${AM.sources.bfCulture.name}(${stdLabel("최종작성일")} 2022-11-25)`;

/** 자료 이름(목록 '자료' 칸과 출처 줄). 원본 자료 이름을 줄였다(낱말 사이는 위 자료 이름과 같게) */
export const SRC_LABEL: Record<AmenitySrc, string> = {
  toiletStd: "공중화장실 표준데이터",
  osm: "오픈스트리트맵",
  korwith: "한국관광공사 무장애 여행 정보",
  bfCulture: "배리어프리 문화예술관광지",
  parking: "주차장 정보 표준데이터",
  charger: "전동휠체어 급속충전기 표준데이터",
  korwithFood: "한국관광공사 무장애 여행 정보",
};

/** 출처 줄: "자료: 이름(기준일)" 꼴. src 차례 = SRC_LABEL 차례 */
export function sourceLines(srcs: Iterable<AmenitySrc | "osmRest">): string[] {
  const set = new Set(srcs);
  const S = AM.sources;
  const lines: string[] = [];
  const ref = (s: Source) => (s.refDates ? `${stdLabel("데이터기준일자")} ${s.refDates[1]}` : `${s.fetched.slice(0, 10)} 받음`);
  // 이름 끝 괄호(KorWithService2, 내려받기 판 등)는 떼고 적는다. 같은 쪽 무장애 표 출처 줄과 같은 이름이 되게
  if (set.has("korwith")) lines.push(`자료: ${S.korwith.name.replace(/\(.*\)$/, "")}(${ref(S.korwith)})`);
  if (set.has("toiletStd")) lines.push(`자료: ${stdDataset(S.toiletStd.name.replace(/\(.*\)$/, ""))}(${ref(S.toiletStd)})`);
  if (set.has("bfCulture")) lines.push(BF_CULTURE_SOURCE_LINE);
  if (set.has("parking")) lines.push(`자료: ${stdDataset(S.parking.name)}(${ref(S.parking)})`);
  if (set.has("charger")) lines.push(`자료: ${stdDataset(S.charger.name)}(${ref(S.charger)})`);
  if (set.has("korwithFood")) lines.push(`자료: ${S.korwith.name.replace(/\(.*\)$/, "")} 음식점(${FOOD.meta.fetched} 받음)`);
  if (set.has("osm") || set.has("osmRest")) lines.push(`자료: © OpenStreetMap 기여자, ODbL(${S.osm.fetched.slice(0, 10)} 받음)`);
  return lines;
}
