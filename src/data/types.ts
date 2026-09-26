// places.json 한 줄의 모양. 만드는 곳: 05_사이트/도구/01_자료.py
export type Side = "old" | "mid" | "young"; // 노년 쪽 / 공통 / 청년 쪽 (2026년 1~8월 기준)

export type Place = {
  id: string;
  name: string; // 화면에 보일 이름
  rawName: string; // 데이터랩 이름
  apiName: string | null; // 관광공사 관광정보 이름
  dong: string; // 읍면동
  area: string | null; // 시내동 / 읍면 / 관광동
  side: Side;
  share60: number; // 60대 이상 몫(%) 2026년 1~8월
  share60prev: number; // 60대 이상 몫(%) 2025년
  share2030: number; // 20·30대 몫(%) 2026년 1~8월
  registered: boolean; // 무장애 여행 정보 명부에 올라 있는지
  filled: number; // 28항목 가운데 글이 적힌 항목 수
  three: { parking: string | null; walk: string | null; toilet: string | null }; // 주차, 걷는 길(접근로·출입통로), 화장실 — 명부 글 그대로, 없으면 null
  move: Record<string, string | null>; // 이동 일곱 항목 명부 글
  cluster: string | null; // 같은 여행 덩어리: 문무대왕면 / 안강·선도 / 산내·건천
  plan: 1 | 2 | null; // 1차 등록 / 2차 등록 대상
  nearestRegistered: string | null; // 비어 있는 13곳만: 가장 가까운 등록 관광지
  lon: number;
  lat: number;
  approx: boolean; // true면 가까운 곳 좌표를 빌려 씀(서악서원). 블루원워터파크는 가 88번으로 관광정보 '강동 워터파크' 좌표
  inCity: boolean; // 시내 확대 칸 안에 있는지
  address: string | null;
  hours: string | null;
  closed: string | null;
  parkingInfo: string | null; // 관광정보의 일반 주차 안내(무장애 주차와 다름)
  fee: string | null; // 이용요금. places.json에서 비면 관광정보 반복 정보의 입장료 글로 채운다(data/index.ts, introExtra.ts)
  contact: string | null;
  overview: string | null;
  photo: string | null; // 한국관광공사 대표사진(https://tong.visitkorea.or.kr)
  category: string | null;
};

export type Box = { lon0: number; lon1: number; lat0: number; lat1: number };
export type Region = { name: string; lon: number; lat: number; n: number; kind: "읍면" | "동" };

/** 읍면동 경계선(boundary.json). 만드는 곳: 05_사이트/도구/02_경계.py */
export type Unit = { name: string; rings: [number, number][][] };

/** 권역(지도 탭 하나). 이름과 나눔은 임시 */
export type AreaKey = "city" | "bomun" | "east" | "southwest" | "north";
export type Area = { key: AreaKey; label: string; dongs: string[]; placeIds: string[]; box: Box };
