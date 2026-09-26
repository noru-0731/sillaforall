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
// 09-26 카카오 지도 판(KakaoMap.tsx)을 더했다. 쪽은 PlaceMap.tsx 를 쓰고, 이 파일은 카카오 SDK 가 뜨지 않을 때의 돌아가기 판이다.
// 두 판이 같이 쓰는 것(props 형, 핀·번호 네모 HTML, 범례, 번호 네모 비키기 셈)은 mapParts.tsx 로 옮겼다(이 판의 결과는 그대로).
//
// 편의시설 표시(무장애 시안 bf-draft에서 더함): 궁능 관람코스 편의시설 지도(레퍼런스/궁능_포맷/course*.png, 나무/course_1440.txt)를 재서 따름.
// - 점: 궁능 범례 칸과 같은 24×24 둥글기 3 네모에 흰 번호(아래 목록의 번호). 같은 자리의 점은 번호를 이어 한 네모로.
//   벤치·쉼터는 번호 없는 작은 점. 누르면 주소 뒤 #{href}로 옮겨 아래 목록의 그 줄을 보인다(궁능 "번호를 클릭하시면 아래 화면에서").
// - 범례: 궁능처럼 지도 안 왼쪽에 세로로(네모 + 이름). 좁은 화면(본문 767 이하)에서는 지도 아래로 내린다.
// - 처음 화면: points 가운데 near(반경 안)인 점과 관광지가 모두 들어오게 맞춘다(fitBounds). 먼 점은 찍어 두되 맞추기에서 뺀다.
// - tall: 궁능 관람코스 지도 상자 높이(693)를 따른다. 없으면 오시는 길 상자(429).
// 점은 키보드로 고르지 않는다(같은 내용이 아래 목록 표에 글로 있다).
//
// 번호 네모 비키기(무장애 시안 검토 9.3의 1·2): 네모끼리, 또 관광지 핀·이름 상자·범례·단추·축척 줄과 겹치면
// 네모를 가장 가까운 빈자리로 옮긴다(6px 격자, 132px 안). 다른 네모의 제자리 점도 덮지 않게 비킨다.
// 제자리를 벗어난 네모는 제자리에 작은 점을 남기고 네모까지 가는 선을 긋는다. 점과 선은 표시 겹 아래라 핀·이름 상자·네모를 덮지 않는다.
// 확대 단계·지도 자리·크기가 바뀔 때마다(moveend·resize) 다시 셈하므로, 확대하면 네모가 제자리로 돌아간다.
// 처음 화면 밖에 제자리가 있는 네모는 옮기지 않는다.
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ANCHOR_R,
  FIT_MAX_ZOOM,
  FIT_PAD,
  MapControls,
  MapFrame,
  boxOf,
  nudgeAll,
  pinHtml,
  pinRects,
  pointIcon,
  pointsKey,
  type MapPoint,
  type MapProps,
} from "./mapParts";
import s from "./RealMap.module.css";
import { NewWinIcon } from "@/components/layout/NewWin";

export type { LegendItem, MapPoint } from "./mapParts";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_COPYRIGHT = "https://www.openstreetmap.org/copyright";
const MIN_ZOOM = 7;
const MAX_ZOOM = 19;
/** 축척 막대가 가장 길 때(px). 궁능 막대는 58 */
const SCALE_MAX_PX = 80;
/** 지구 둘레(m, 웹 메르카토르) */
const EARTH = 40075016.686;
/** 선 그리는 겹(표시 겹 600 아래, 그림자 겹 500 위) */
const LEADER_PANE = "rcLeaders";

/** 확대 단계와 위도에서 축척 막대 길이(px)와 글자("500m", "1km") */
function scaleOf(lat: number, zoom: number) {
  const mPerPx = (EARTH * Math.cos((lat * Math.PI) / 180)) / 2 ** (zoom + 8);
  const maxM = mPerPx * SCALE_MAX_PX;
  const pow = 10 ** Math.floor(Math.log10(maxM));
  const d = maxM / pow;
  const m = (d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1) * pow;
  return { px: Math.round(m / mPerPx), text: m >= 1000 ? `${m / 1000}km` : `${m}m` };
}

export default function RealMap({ lat, lon, name, label, zoom = 16, points, legend, tall }: MapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  // 처음 화면(맞추기 결과). 처음 크기 단추가 이리로 돌아온다
  const homeRef = useRef<{ center: [number, number]; zoom: number }>({ center: [lat, lon], zoom });
  const legRef = useRef<HTMLUListElement>(null);
  const ctrlRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const ptsKey = pointsKey(points);
  const [view, setView] = useState({ zoom, lat });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let off = false;
    let ro: ResizeObserver | undefined;
    let roMarks: ResizeObserver | undefined;
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
      const pinMk = L.marker([lat, lon], {
        icon: L.divIcon({ className: s.marker, html: pinHtml(name), iconSize: [29, 42], iconAnchor: [14.5, 42] }),
        interactive: false,
        keyboard: false,
      }).addTo(map);
      // 편의시설 점: 작은 점(벤치·쉼터)을 아래에, 번호 네모를 위에
      const pts = [...(points ?? [])].sort((a, b) => Number(!!a.label) - Number(!!b.label));
      const nums: { mk: Marker; p: MapPoint; w: number; h: number }[] = [];
      for (const p of pts) {
        const ic = pointIcon(p);
        const mk = L.marker([p.lat, p.lon], {
          icon: L.divIcon({
            className: p.label ? `${s.marker} ${s.numIcon}` : s.marker,
            html: ic.html,
            iconSize: [ic.w, ic.h],
            iconAnchor: [ic.w / 2, ic.h / 2],
          }),
          interactive: !!p.href,
          keyboard: false,
          title: p.title,
          zIndexOffset: p.label ? 500 : 0,
        }).addTo(map);
        if (p.href) mk.on("click", () => (window.location.hash = p.href!));
        if (p.label) nums.push({ mk, p, w: ic.w, h: ic.h });
      }
      // 번호 네모 비키기. 네모는 목록 번호 차례(가까운 곳부터)로 자리를 잡고, 먼저 잡은 네모는 다음 네모의 장애물이 된다
      map.createPane(LEADER_PANE).style.zIndex = "550";
      const leaders = L.layerGroup().addTo(map);
      const place = () => {
        leaders.clearLayers();
        if (!nums.length) return;
        const { x: W, y: H } = map.getSize();
        // 관광지 핀과 이름 상자, + − ↻ 단추, 축척 줄, 지도 안 범례(좁은 화면에서는 지도 아래라 빼고)
        const c = map.latLngToContainerPoint([lat, lon]);
        const hard = pinRects(c.x, c.y, pinMk.getElement()?.querySelector("span"));
        const leg = legRef.current;
        for (const el of [ctrlRef.current, footRef.current, leg && getComputedStyle(leg).position === "absolute" ? leg : null]) {
          const r = boxOf(el, 4);
          if (r) hard.push(r);
        }
        // 네모마다 제자리(px). 비키기 셈은 mapParts.nudgeAll(카카오 판과 같은 셈)
        const at = nums.map((n) => map.latLngToContainerPoint([n.p.lat, n.p.lon]));
        const moves = nudgeAll(W, H, hard, nums.map((n, i) => ({ x: at[i].x, y: at[i].y, w: n.w, h: n.h, spot: n.p.spot })));
        nums.forEach((n, i) => {
          const a = at[i];
          const { dx, dy, lead } = moves[i];
          const sq = n.mk.getElement()?.firstElementChild as HTMLElement | null | undefined;
          if (sq) sq.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : "";
          if (lead) {
            const k = s[`k_${n.p.kind}`] ?? "";
            const opt = { pane: LEADER_PANE, interactive: false };
            L.polyline([[n.p.lat, n.p.lon], map.containerPointToLatLng([a.x + dx, a.y + dy])], { ...opt, className: `${s.leader} ${k}` }).addTo(leaders);
            L.circleMarker([n.p.lat, n.p.lon], { ...opt, radius: ANCHOR_R, className: `${s.anchor} ${k}` }).addTo(leaders);
          }
        });
      };
      // 처음 화면: 반경 안 점과 관광지가 모두 들어오게(너무 가까이 당기지는 않게 17까지)
      const fit = (points ?? []).filter((p) => p.near);
      if (fit.length) {
        // 범례가 지도 안(왼쪽 위)에 있으면 그 폭만큼, 오른쪽은 + − ↻ 단추만큼 비워 점이 가리지 않게
        const leg = legRef.current;
        const legIn = leg && getComputedStyle(leg).position === "absolute";
        map.fitBounds(L.latLngBounds([[lat, lon], ...fit.map((p) => [p.lat, p.lon] as [number, number])]), {
          paddingTopLeft: [legIn ? leg.offsetWidth + FIT_PAD.legend : FIT_PAD.left, FIT_PAD.top],
          paddingBottomRight: [FIT_PAD.right, FIT_PAD.bottom],
          maxZoom: FIT_MAX_ZOOM,
          animate: false,
        });
      }
      homeRef.current = { center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() };
      const sync = () => setView({ zoom: map.getZoom(), lat: map.getCenter().lat });
      map.on("zoomend moveend", sync);
      sync();
      // 확대·축소 움직임 동안은 선을 지웠다가 멈추면 다시 셈한다
      map.on("zoomstart", () => leaders.clearLayers());
      map.on("moveend resize", place);
      place();
      // 장애물 크기가 바뀌면 다시 셈한다(이름 상자는 글꼴을 받은 뒤, 축척 줄은 확대 단계마다 폭이 바뀐다)
      roMarks = new ResizeObserver(() => place());
      for (const o of [ctrlRef.current, footRef.current, legRef.current, pinMk.getElement()?.querySelector("span")]) if (o) roMarks.observe(o);
      // 글자·화면 설정(몸 zoom)이나 폭이 바뀌면 지도 크기를 다시 잰다
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(el);
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      off = true;
      ro?.disconnect();
      roMarks?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
    // points 는 ptsKey 로 비교한다(쪽이 다시 그려질 때마다 새 배열이 와도 지도를 다시 만들지 않게)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, name, zoom, ptsKey]);

  const canIn = ready && view.zoom < MAX_ZOOM;
  const canOut = ready && view.zoom > MIN_ZOOM;
  const scale = scaleOf(view.lat, view.zoom);

  return (
    <MapFrame tall={tall} legend={legend} legRef={legRef}>
      <div ref={mapEl} className={s.map} role="region" aria-label={label ?? `${name} 위치 지도`} />

      <MapControls
        ref={ctrlRef}
        canIn={canIn}
        canOut={canOut}
        ready={ready}
        onIn={() => mapRef.current?.zoomIn()}
        onOut={() => mapRef.current?.zoomOut()}
        onHome={() => mapRef.current?.setView(homeRef.current.center, homeRef.current.zoom)}
      />

      <div ref={footRef} className={s.foot}>
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
            <NewWinIcon />
          </a>{" "}
          기여자
        </p>
      </div>
    </MapFrame>
  );
}
