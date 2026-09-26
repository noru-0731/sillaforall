// 버스 정류장 자료 도우미(오시는 길 대중교통). 서버 컴포넌트에서만 부른다.
// bus.json 만드는 곳: 05_사이트/도구/12_버스_문단_사이트.py (07_버스.py 결과 bus.json 과 오픈스트리트맵 노선 관계에서).
// - 정류장: 국토교통부 전국 버스정류장 위치정보(정보수집일 2025-10-31)와 오픈스트리트맵 정류장 점을 합친 목록에서 곳 좌표와 직선거리가 가장 짧은 셋.
//   좌표를 빌린 곳(서악서원)은 거리 없이 이름이 맞은 정류장.
// - 노선 번호: 오픈스트리트맵 버스 노선 관계(경주시 공식 노선 자료와 한 줄씩 견주지 못함). 경주 밖 노선은 '포항 800'처럼 적혀 있다.
// - fromKtx: 경주역(KTX) 정류장(03142, 03143)이 그 정류장보다 앞에 있는 노선 관계의 번호. 걸리는 시간·갈아타기·배차는 없다.
import raw from "./bus.json";

export type BusStop = { name: string; stopNo: string | null; distM: number | null; routes: string[]; fromKtx: string[] };
type BusPlace = { name: string; byName: boolean; stops: BusStop[] };
const BUS = raw as unknown as {
  meta: {
    molit: { name: string; refDate: string; url: string; license: string };
    osm: { fetched: string; base: string };
    ktx: { name: string; stopNos: string[] };
  };
  places: Record<string, BusPlace>;
};

export const BUS_META = BUS.meta;
/** 경주역(KTX) 정류장 이름(국토부 파일 이름 그대로) */
export const KTX_NAME = BUS.meta.ktx.name;

/** 이 곳의 정류장(가까운 차례, 최대 셋). 없으면 빈 목록 */
export function busStopsOf(id: string): BusStop[] {
  return BUS.places[id]?.stops ?? [];
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

/** 출처 줄: "자료: 이름(기준일)" 꼴(가까운 편의시설 출처 줄과 같은 꼴) */
export const BUS_SOURCE_LINES = [
  `자료: ${BUS.meta.molit.name}(정보수집일 ${BUS.meta.molit.refDate})`,
  `자료: © OpenStreetMap 기여자, ODbL(${BUS.meta.osm.fetched} 받음)`,
];
