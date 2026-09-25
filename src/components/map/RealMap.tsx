"use client";
// 진짜 지도(오픈스트리트맵 타일 + Leaflet 1.9). 관광지 "오시는 길" 쪽에서만 쓴다.
// 궁능 누리집 오시는 길 지도 상자(레퍼런스/궁능_포맷/나무/directions_1440.txt map_box, directions_m390.png)를 재서 우리 코드로 새로 씀.
// - 상자: PC 1030×429, 휴대전화 360×289, 1px rgb(234,234,234) 테두리, 둥글기 없음 → RealMap.module.css
// - 축척 막대: 궁능은 지도 안 왼쪽 아래(왼쪽 6, 아래 0), 막대 58×6(왼·오른·아래 2px 검정 선) + 옆에 10px 700 글자 "500m".
//   같은 모양을 직접 그린다. 길이는 지금 확대 단계에서 1·2·3·5×10ⁿ m로 떨어지는 값(Leaflet 축척과 같은 셈).
// - 저작자 표시: 궁능의 카카오 로고 자리(축척 막대 오른쪽)에 "© OpenStreetMap 기여자"(오픈스트리트맵 이용 조건).
// - 확대·축소·처음 크기 단추: 우리 그린 지도(MapView)와 같은 자리·모양(오른쪽 위 세로, 32×32)과 같은 이름.
// - 마우스 휠 확대는 끈다(쪽 내리기가 먼저). 휴대전화·태블릿에서는 한 손가락 끌기도 꺼서 지도 위에서도 쪽이 내려가게 둔다(두 손가락 벌리기 확대는 된다).
// - Leaflet은 불러오는 순간 window·document를 만지므로 브라우저에서만(useEffect 안의 import()) 불러온다. 서버는 빈 상자만 그린다.
// 나중에 카카오맵으로 바꿀 때는 이 파일과 RealMap.module.css만 바꾸면 된다(props: lat, lon, name, label, zoom).
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "@/components/icons";
import s from "./RealMap.module.css";

type Props = {
  /** 핀 자리(위도) */
  lat: number;
  /** 핀 자리(경도) */
  lon: number;
  /** 핀 아래에 적는 관광지 이름 */
  name: string;
  /** 읽기 도구용 지도 이름. 기본 "{name} 위치 지도" */
  label?: string;
  /** 처음 확대 단계(오픈스트리트맵 0~19). 16이면 동네 길이 보인다 */
  zoom?: number;
};

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_COPYRIGHT = "https://www.openstreetmap.org/copyright";
const MIN_ZOOM = 7;
const MAX_ZOOM = 19;
/** 축척 막대가 가장 길 때(px). 궁능 막대는 58 */
const SCALE_MAX_PX = 80;
/** 지구 둘레(m, 웹 메르카토르) */
const EARTH = 40075016.686;

/** 확대 단계와 위도에서 축척 막대 길이(px)와 글자("500m", "1km") */
function scaleOf(lat: number, zoom: number) {
  const mPerPx = (EARTH * Math.cos((lat * Math.PI) / 180)) / 2 ** (zoom + 8);
  const maxM = mPerPx * SCALE_MAX_PX;
  const pow = 10 ** Math.floor(Math.log10(maxM));
  const d = maxM / pow;
  const m = (d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1) * pow;
  return { px: Math.round(m / mPerPx), text: m >= 1000 ? `${m / 1000}km` : `${m}m` };
}

/** divIcon 안에 넣는 글자(관광지 이름)를 HTML로 안전하게 */
function esc(t: string) {
  return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** 핀(직접 그린 물방울 모양, 29×42 = 궁능 지도 표시 크기) + 이름 상자 */
function pinHtml(name: string) {
  return (
    `<svg class="${s.pin}" viewBox="0 0 29 42" width="29" height="42" aria-hidden="true" focusable="false">` +
    `<path class="${s.pinBody}" d="M14.5 1C7.04 1 1 7.04 1 14.5c0 9.3 11.2 24.2 12.4 25.8a1.4 1.4 0 0 0 2.2 0C16.8 38.7 28 23.8 28 14.5 28 7.04 21.96 1 14.5 1Z"/>` +
    `<circle class="${s.pinDot}" cx="14.5" cy="14.5" r="5"/>` +
    `</svg>` +
    `<span class="${s.pinName}">${esc(name)}</span>`
  );
}

export default function RealMap({ lat, lon, name, label, zoom = 16 }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [view, setView] = useState({ zoom, lat });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let off = false;
    let ro: ResizeObserver | undefined;
    (async () => {
      const L = (await import("leaflet")).default;
      const el = mapEl.current;
      if (off || !el) return;
      const map = L.map(el, {
        center: [lat, lon],
        zoom,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoomControl: false, // 단추는 아래에서 직접 그린다
        attributionControl: false, // 저작자 표시도 아래에서 직접 그린다(축척 막대 옆)
        scrollWheelZoom: false,
        // 휴대전화·태블릿(손가락이 주 입력)에서는 한 손가락 끌기를 꺼서 지도 위에서도 쪽이 내려가게 한다
        dragging: !(L.Browser.mobile || window.matchMedia("(pointer: coarse)").matches),
      });
      L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM, minZoom: MIN_ZOOM }).addTo(map);
      L.marker([lat, lon], {
        icon: L.divIcon({ className: s.marker, html: pinHtml(name), iconSize: [29, 42], iconAnchor: [14.5, 42] }),
        interactive: false,
        keyboard: false,
      }).addTo(map);
      const sync = () => setView({ zoom: map.getZoom(), lat: map.getCenter().lat });
      map.on("zoomend moveend", sync);
      sync();
      // 글자·화면 설정(몸 zoom)이나 폭이 바뀌면 지도 크기를 다시 잰다
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(el);
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      off = true;
      ro?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [lat, lon, name, zoom]);

  const canIn = ready && view.zoom < MAX_ZOOM;
  const canOut = ready && view.zoom > MIN_ZOOM;
  const scale = scaleOf(view.lat, view.zoom);

  return (
    <div className={s.box}>
      <div ref={mapEl} className={s.map} role="region" aria-label={label ?? `${name} 위치 지도`} />

      <div className={s.controls}>
        <button type="button" className={s.ctrl} aria-label="확대" title="확대" aria-disabled={!canIn} onClick={() => canIn && mapRef.current?.zoomIn()}>
          <Icon name="plus" size={18} strokeWidth={2} />
        </button>
        <button type="button" className={s.ctrl} aria-label="축소" title="축소" aria-disabled={!canOut} onClick={() => canOut && mapRef.current?.zoomOut()}>
          <Icon name="minus" size={18} strokeWidth={2} />
        </button>
        <button
          type="button"
          className={s.ctrl}
          aria-label="처음 크기"
          title="처음 크기"
          aria-disabled={!ready}
          onClick={() => ready && mapRef.current?.setView([lat, lon], zoom)}
        >
          <Icon name="reset" size={18} strokeWidth={2} />
        </button>
      </div>

      <div className={s.foot}>
        {ready && (
          <div className={s.scale} aria-hidden="true">
            <span className={s.scaleBar} style={{ width: `${scale.px}px` }} />
            <span className={s.scaleTxt}>{scale.text}</span>
          </div>
        )}
        <p className={s.attr}>
          ©{" "}
          <a href={OSM_COPYRIGHT} target="_blank" rel="noopener noreferrer" title="새 창 열림">
            OpenStreetMap
          </a>{" "}
          기여자
        </p>
      </div>
    </div>
  );
}
