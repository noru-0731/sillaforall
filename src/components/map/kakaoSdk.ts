// 카카오 지도 SDK(JavaScript 키) 불러오기. 한 쪽(브라우저 창)에서 한 번만 부르고, 그 결과를 모든 지도가 함께 쓴다.
// - 키: 환경변수 NEXT_PUBLIC_KAKAO_MAP_KEY(web/.env.local, 배포에서는 버셀 프로젝트 환경변수). 빌드할 때 번들에 들어간다.
//   카카오 JavaScript 키는 브라우저에서 쓰라고 주는 키이고, 카카오 개발자 콘솔에 등록한 사이트 도메인에서 온 요청만 받는다.
// - autoload=false 로 sdk.js 를 받고 kakao.maps.load 로 나머지를 읽는다(Next 쪽 옮김 뒤에도 document.write 를 쓰지 않게).
// - 뜨지 않는 경우: 키가 비었음, sdk.js 가 오류로 끝남(등록하지 않은 도메인이면 401 "domain mismatched"), 8초 안에 끝나지 않음.
//   이때는 false 를 돌려주고, 부르는 쪽(PlaceMap)이 오픈스트리트맵 판(RealMap)을 그린다. 한 번 정한 결과는 바꾸지 않는다.
// 아래 형은 이 사이트가 쓰는 것만 적었다(카카오 지도 API 문서 apis.map.kakao.com/web/documentation 의 이름 그대로).

export type KLatLng = { getLat(): number; getLng(): number };
export type KPoint = { x: number; y: number };
export type KLatLngBounds = { extend(ll: KLatLng): void };
export type KProjection = { containerPointFromCoords(ll: KLatLng): KPoint; coordsFromContainerPoint(p: KPoint): KLatLng };
export type KMap = {
  getLevel(): number;
  setLevel(level: number, opt?: { animate?: boolean | { duration: number }; anchor?: KLatLng }): void;
  getCenter(): KLatLng;
  setCenter(ll: KLatLng): void;
  setBounds(b: KLatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
  setMinLevel(level: number): void;
  setMaxLevel(level: number): void;
  getProjection(): KProjection;
  relayout(): void;
};
export type KCustomOverlay = { setMap(map: KMap | null): void; setZIndex(z: number): void };
/** 다각형(권역 세부 지도의 읍면동 경계선, 09-27) */
export type KPolygon = { setMap(map: KMap | null): void };
export type KakaoMaps = {
  load(cb: () => void): void;
  Map: new (
    el: HTMLElement,
    opt: { center: KLatLng; level: number; draggable?: boolean; scrollwheel?: boolean; disableDoubleClickZoom?: boolean; keyboardShortcuts?: boolean },
  ) => KMap;
  LatLng: new (lat: number, lng: number) => KLatLng;
  LatLngBounds: new () => KLatLngBounds;
  CustomOverlay: new (opt: {
    position: KLatLng;
    content: HTMLElement;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
    clickable?: boolean;
  }) => KCustomOverlay;
  Polygon: new (opt: {
    path: KLatLng[];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
    fillColor?: string;
    fillOpacity?: number;
    zIndex?: number;
  }) => KPolygon;
  event: {
    addListener(target: object, type: string, handler: () => void): void;
    removeListener(target: object, type: string, handler: () => void): void;
  };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "";
/** sdk.js 와 kakao.maps.load 를 기다리는 가장 긴 시간(ms) */
const TIMEOUT_MS = 8000;

let once: Promise<boolean> | null = null;

/** 카카오 지도 SDK 를 불러 쓸 수 있으면 true. 몇 번을 불러도 처음 한 번의 결과를 준다(브라우저에서만 부른다) */
export function loadKakao(): Promise<boolean> {
  if (once) return once;
  once = new Promise<boolean>((resolve) => {
    if (!KEY) return resolve(false);
    if (window.kakao?.maps?.Map) return resolve(true);
    let timer = 0;
    const done = (ok: boolean) => {
      window.clearTimeout(timer);
      resolve(ok);
    };
    timer = window.setTimeout(() => done(false), TIMEOUT_MS);
    const sc = document.createElement("script");
    sc.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(KEY)}&autoload=false`;
    sc.async = true;
    sc.onerror = () => done(false);
    sc.onload = () => {
      const maps = window.kakao?.maps;
      if (!maps?.load) return done(false);
      try {
        maps.load(() => done(typeof window.kakao?.maps?.Map === "function"));
      } catch {
        done(false);
      }
    };
    document.head.appendChild(sc);
  });
  return once;
}
