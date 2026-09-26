import raw from "./places.json";
import regionsRaw from "./regions.json";
import boundaryRaw from "./boundary.json";
import areas6 from "./areas6.json";
import zipRaw from "./zipcodes.json";
import type { Area, AreaKey, Box, Place, Region, Unit } from "./types";
import { extraFeeOf } from "./introExtra";

// 이용요금: places.json fee(관광정보 usefee, 문화시설 3곳)가 비면 관광공사 관광정보 반복 정보의 입장료 글(introExtra.ts)을 쓴다.
export const places = (raw.places as Place[]).map((p) => (p.fee ? p : { ...p, fee: extraFeeOf(p.id) }));
export const CITY_BOX = raw.city as Box;
export const regions = regionsRaw as Region[];
export const units = boundaryRaw.units as Unit[];
// 경주시 경계선 전체(128.970~129.521, 35.640~36.080)에 여백을 조금 둔 상자
export const FULL_BOX: Box = { lon0: 128.955, lon1: 129.535, lat0: 35.628, lat1: 36.092 };

// 권역: 지도 탭과 목록의 묶음. 경주문화관광 권역별 관광지(2026-09-26 확인)를 따른다.
// 표는 areas6.json(만드는 곳: 05_사이트/레퍼런스/권역/도구/07_사이트_권역표.py).
// - areas: 여섯 권역, 차례와 이름은 경주시 그대로(‘서악,북부권’의 쉼표만 가운뎃점).
// - places: 곳 → 권역. 경주시 목록 이름으로 찾은 51곳 + 목록에 없어 가까운 목록 항목으로 댄 10곳. 곳마다 출처(how, ref).
// - dongs: 지도 칠하기용 읍면동 → 권역. 그 읍면동 안 경주시 목록 항목의 다수 권역.
//   그래서 칠한 권역과 곳 권역이 다른 곳이 있다(월성동·황남동은 시내권으로 칠하고, 그 안의 보리사·서출지·오릉·삼불사·망월사는 남산권, 진평왕릉은 보문관광단지권).
const AREA_DEFS = areas6.areas.map((a) => ({ key: a.key as AreaKey, label: a.label }));
const areaOfPlace = new Map(areas6.places.map((r) => [r.id, r.area as AreaKey] as const));
const areaOfDong = new Map(areas6.dongs.map((d) => [d.name, d.area as AreaKey] as const));
export const areaOf = (p: Place): AreaKey => areaOfPlace.get(p.id) ?? areaOfDong.get(p.dong) ?? "city";

/** 권역 안 관광지를 모두 담는 상자. 가장자리에 여유를 두고, 너무 작으면 넓힌다. */
function boxFor(ps: Place[]): Box {
  const lons = ps.map((p) => p.lon), lats = ps.map((p) => p.lat);
  let lon0 = Math.min(...lons), lon1 = Math.max(...lons), lat0 = Math.min(...lats), lat1 = Math.max(...lats);
  const minSpan = 0.03; // 약 3km
  const padLon = Math.max((lon1 - lon0) * 0.15, (minSpan - (lon1 - lon0)) / 2, 0.006);
  const padLat = Math.max((lat1 - lat0) * 0.15, (minSpan - (lat1 - lat0)) / 2, 0.006);
  lon0 -= padLon; lon1 += padLon; lat0 -= padLat; lat1 += padLat;
  return { lon0, lon1, lat0, lat1 };
}

export const areas: Area[] = AREA_DEFS.map((a) => {
  const ps = places.filter((p) => areaOf(p) === a.key);
  const dongs = areas6.dongs.filter((d) => d.area === a.key).map((d) => d.name);
  return { ...a, dongs, placeIds: ps.map((p) => p.id), box: boxFor(ps) };
});

export const areaByKey = (k: string) => areas.find((a) => a.key === k);

// 우편번호: 관광공사 관광정보(detailCommon2 zipcode)에서 꺼낸 다섯 자리(도구/05_우편번호.py). 없는 곳 7곳은 null.
const ZIPS = zipRaw as Record<string, string>;
/** 관광지 우편번호(다섯 자리). 없으면 null */
export const zipOf = (id: string): string | null => ZIPS[id] ?? null;
export const placeById = (id: string) => places.find((p) => p.id === id);

// 거점: 보고서의 거점 묶음(문무대왕면, 안강·선도, 산내·건천)
export const HUBS = ["문무대왕면", "안강·선도", "산내·건천"] as const;

/** 가나다순 비교 */
export const byName = (a: Place, b: Place) => a.name.localeCompare(b.name, "ko");

export * from "./types";

// 권역 색: 궁능유적본부 누리집의 궁별 알약 색(공지사항·관람코스 쪽)을 권역에 붙였다.
// 권역 다섯이던 때의 색(경복궁 #604206, 창덕궁 #a2383d, 덕수궁 #286d79, 창경궁 #14489c, 종묘 #c14b35)은 그대로 두고,
// 여섯째로 궁능 알약 줄의 종묘 다음 색(관람코스 조선왕릉·공지사항 세종대왕유적 #47325d)을 더했다.
// 지도에서 맞닿는 권역끼리 옅은 칠(20%)이 가장 덜 닮게 나눴다: 시내권 #604206, 보문관광단지권 #a2383d, 동해안권 #286d79,
// 서악·북부권 #14489c, 남산권 #c14b35, 불국사권 #47325d.
// 화면에서는 CSS 변수 var(--rc-area-{key})를 쓰면 선명한 화면 모드에서 밝은 색으로 바뀐다. 이 값은 SVG·계산용.
export const AREA_COLOR: Record<AreaKey, string> = {
  bomun: "#a2383d",
  city: "#604206",
  bulguk: "#47325d",
  east: "#286d79",
  namsan: "#c14b35",
  seoak: "#14489c",
};
/** CSS에서 쓰는 권역 색 변수 이름. style={{ color: areaColorVar("city") }} */
export const areaColorVar = (k: AreaKey) => `var(--rc-area-${k})`;
