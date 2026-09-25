import raw from "./places.json";
import regionsRaw from "./regions.json";
import boundaryRaw from "./boundary.json";
import zipRaw from "./zipcodes.json";
import type { Area, AreaKey, Box, Place, Region, Unit } from "./types";

export const places = raw.places as Place[];
export const CITY_BOX = raw.city as Box;
export const regions = regionsRaw as Region[];
export const units = boundaryRaw.units as Unit[];
// 경주시 경계선 전체(128.970~129.521, 35.640~36.080)에 여백을 조금 둔 상자
export const FULL_BOX: Box = { lon0: 128.955, lon1: 129.535, lat0: 35.628, lat1: 36.092 };

// 권역: 지도 탭과 목록의 묶음. 이름과 나눔은 임시다(사용자 확인 전).
// 읍면동 → 권역. 중부동은 경계 파일에 따로 없지만 관광지 주소에 있어 시내에 넣는다.
const AREA_DEFS: { key: AreaKey; label: string; dongs: string[] }[] = [
  { key: "city", label: "시내", dongs: ["월성동", "황남동", "중부동", "황오동", "성건동", "동천동", "선도동", "용강동", "황성동"] },
  { key: "bomun", label: "보문·불국사", dongs: ["보덕동", "불국동"] },
  { key: "east", label: "동해안", dongs: ["감포읍", "문무대왕면", "양남면"] },
  { key: "southwest", label: "서쪽·남쪽 읍면", dongs: ["건천읍", "내남면", "산내면", "서면", "외동읍"] },
  { key: "north", label: "북쪽 읍면", dongs: ["안강읍", "강동면", "천북면", "현곡면"] },
];

const areaOfDong = new Map(AREA_DEFS.flatMap((a) => a.dongs.map((d) => [d, a.key] as const)));
export const areaOf = (p: Place): AreaKey => areaOfDong.get(p.dong) ?? "city";

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
  return { ...a, placeIds: ps.map((p) => p.id), box: boxFor(ps) };
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

// 권역 색: 궁능유적본부 누리집의 궁별 알약 색(공지사항·관람코스 쪽)을 같은 차례로 권역에 붙였다.
// 경복궁 #604206 → 시내, 창덕궁 #a2383d → 보문·불국사, 덕수궁 #286d79 → 동해안, 창경궁 #14489c → 서쪽·남쪽 읍면, 종묘 #c14b35 → 북쪽 읍면.
// 화면에서는 CSS 변수 var(--rc-area-{key})를 쓰면 선명한 화면 모드에서 밝은 색으로 바뀐다. 이 값은 SVG·계산용.
export const AREA_COLOR: Record<AreaKey, string> = {
  city: "#604206",
  bomun: "#a2383d",
  east: "#286d79",
  southwest: "#14489c",
  north: "#c14b35",
};
/** CSS에서 쓰는 권역 색 변수 이름. style={{ color: areaColorVar("city") }} */
export const areaColorVar = (k: AreaKey) => `var(--rc-area-${k})`;
