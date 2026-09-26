// 버스 정류장 자료 도우미(오시는 길 대중교통). 서버 컴포넌트에서만 부른다.
// bus.json 만드는 곳: 05_사이트/도구/12_버스_문단_사이트.py(정류장·오픈스트리트맵 노선) → 05_사이트/도구/20_버스_TAGO.py(TAGO 노선).
// - 정류장: 국토교통부 전국 버스정류장 위치정보(정보수집일 2025-10-31)와 오픈스트리트맵 정류장 점을 합친 목록에서 곳 좌표와 직선거리가 가장 짧은 셋.
//   좌표를 빌린 곳(서악서원)은 거리 없이 이름이 맞은 정류장. posSrc "osm" 은 이름·번호·좌표를 오픈스트리트맵에서 얻은 정류장.
// - 노선 번호(src "tago"): 국토교통부 TAGO 정류소별경유노선. 정류장 번호로 TAGO 정류소와 짝지었다. 다른 도시 노선은 '포항 800'처럼 적힌다.
//   짝을 못 찾은 정류장(src "osm")은 오픈스트리트맵 버스 노선 관계의 번호 그대로(그 줄에 오픈스트리트맵 출처를 붙인다).
// - 노선 줄(routes): TAGO 노선정보항목의 기점·종점·첫차시간·막차시간·배차간격(평일·토요일·일요일). 첫차·막차는 기점 기준 값이다.
//   화면에 보이는 값이 같은 routeid 는 도구에서 한 줄로 묶었다.
// - fromKtx: 경주역(KTX) 정류소가 그 정류장보다 앞에 있는 노선의 번호(TAGO 노선별경유정류소 차례. src "osm" 이면 오픈스트리트맵 노선 관계 차례).
import raw from "./bus.json";

export type BusLine = {
  /** 노선번호(TAGO routeno 그대로, 다른 도시 노선은 앞에 도시 이름) */
  no: string;
  /** 기점·종점(TAGO startnodenm·endnodenm) */
  start: string | null;
  end: string | null;
  /** 첫차시간·막차시간(HH:MM) */
  first: string | null;
  last: string | null;
  /** 배차간격(평일·토요일·일요일, 분) */
  int: number | null;
  sat: number | null;
  sun: number | null;
};
export type BusStop = {
  name: string;
  stopNo: string | null;
  distM: number | null;
  /** 노선 번호의 출처: tago = 국토교통부 TAGO, osm = 오픈스트리트맵(TAGO 에서 짝을 못 찾음) */
  src: "tago" | "osm";
  /** 정류장 이름·번호·좌표를 오픈스트리트맵에서 얻었으면 "osm" */
  posSrc?: "osm";
  routes: string[];
  /** src tago 일 때 노선 줄 열쇠(routes 표) */
  lines?: string[];
  fromKtx: string[];
};
type BusPlace = { name: string; byName: boolean; stops: BusStop[] };
type ApiMeta = { name: string; short: string; provider: string; license: string; url: string };
const BUS = raw as unknown as {
  meta: {
    molit: { name: string; refDate: string; url: string; license: string };
    osm: { fetched: string; base: string };
    ktx: { name: string; stopNos: string[] };
    tago: { fetched: string; cityCode: string; stop: ApiMeta; route: ApiMeta };
  };
  places: Record<string, BusPlace>;
  routes: Record<string, BusLine & { ids: string[] }>;
};

export const BUS_META = BUS.meta;
/** TAGO 두 API(자료 출처 쪽 표): 버스정류소정보, 버스노선정보 */
export const TAGO_APIS: ApiMeta[] = [BUS.meta.tago.stop, BUS.meta.tago.route];
/** 경주역(KTX) 정류장 이름(국토부 파일 이름 그대로) */
export const KTX_NAME = BUS.meta.ktx.name;

/** 이 곳의 정류장(가까운 차례, 최대 셋). 없으면 빈 목록 */
export function busStopsOf(id: string): BusStop[] {
  return BUS.places[id]?.stops ?? [];
}

/** 정류장 하나의 노선 줄(TAGO 값). src osm 이거나 노선이 없으면 빈 목록 */
export function linesOf(stop: BusStop): BusLine[] {
  return (stop.lines ?? []).map((k) => BUS.routes[k]).filter(Boolean);
}

/** 배차간격 칸: 값이 하나라도 있는 것만(평일 → 토요일 → 일요일) */
export const INTERVAL_KEYS = [
  { key: "int", label: "배차간격(평일)" },
  { key: "sat", label: "배차간격(토요일)" },
  { key: "sun", label: "배차간격(일요일)" },
] as const;
export function intervalKeysOf(lines: BusLine[]) {
  return INTERVAL_KEYS.filter((k) => lines.some((l) => l[k.key] !== null));
}

/** 경주역(KTX)에서 오는 노선: 같은 이름·같은 노선인 정류장(길 건너편 등)은 한 줄로 묶는다 */
export function ktxLinesOf(id: string): { routes: string[]; name: string; stopNos: string[] }[] {
  const lines: { routes: string[]; name: string; stopNos: string[] }[] = [];
  for (const s of busStopsOf(id)) {
    if (!s.fromKtx.length) continue;
    const same = lines.find((l) => l.name === s.name && l.routes.join() === s.fromKtx.join());
    if (same) {
      if (s.stopNo) same.stopNos.push(s.stopNo);
    } else lines.push({ routes: s.fromKtx, name: s.name, stopNos: s.stopNo ? [s.stopNo] : [] });
  }
  return lines;
}

/** 오픈스트리트맵 출처 줄(노선이 오픈스트리트맵으로 남은 정류장 줄 아래, 쪽 끝 출처 줄) */
export const OSM_SOURCE_LINE = `자료: © OpenStreetMap 기여자, ODbL(${BUS.meta.osm.fetched} 받음)`;

/**
 * 쪽 끝 출처 줄: "자료: 이름(기준일)" 꼴(가까운 편의시설 출처 줄과 같은 꼴).
 * 정류장 위치(국토부 파일) → TAGO 두 API → 오픈스트리트맵(이 곳 정류장 가운데 노선이나 위치가 오픈스트리트맵에서 온 것이 있을 때만).
 */
export function busSourceLines(id: string): string[] {
  const stops = busStopsOf(id);
  const out = [
    `자료: ${BUS.meta.molit.name}(정보수집일 ${BUS.meta.molit.refDate})`,
    `자료: 국토교통부 TAGO ${BUS.meta.tago.route.short}·${BUS.meta.tago.stop.short}(${BUS.meta.tago.fetched} 받음)`,
  ];
  if (stops.some((s) => s.src === "osm" || s.posSrc === "osm")) out.push(OSM_SOURCE_LINE);
  return out;
}

/** 사이트 전체에서 노선이 오픈스트리트맵으로 남은 정류장이 있는지(자료 출처 쪽 오픈스트리트맵 칸의 글) */
export const BUS_OSM_ROUTES_LEFT = Object.values(BUS.places).some((p) => p.stops.some((s) => s.src === "osm"));
