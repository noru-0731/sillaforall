"use client";
// 진짜 지도 카카오 판(09-26). 궁능 누리집 오시는 길·관람코스 지도가 카카오 지도라 같은 지도로 맞춘다.
// props 와 모양은 오픈스트리트맵 판(RealMap.tsx)과 같다. 다른 것만 적는다.
// - 이 부품은 카카오 SDK 가 뜬 뒤에만 그려진다(PlaceMap.tsx 가 kakaoSdk.loadKakao 로 판정한 뒤). 그래서 window.kakao.maps 를 바로 쓴다.
// - 확대 단계: 카카오 레벨(1이 가장 가까움)은 한 단계마다 두 배라 오픈스트리트맵 zoom 과 레벨 = 20 − zoom 으로 짝짓는다
//   (zoom 16 ↔ 레벨 4, 맞추기 한계 17 ↔ 3, 7~19 ↔ 13~1).
// - 축척 막대와 저작자 표시: 카카오가 지도 안 왼쪽 아래에 그리는 카카오 로고와 축척을 그대로 둔다(궁능과 같은 자리·모양, 카카오 이용 조건).
//   번호 네모 비키기에서는 이 로고·축척 줄을 오픈스트리트맵 판의 축척 줄처럼 장애물로 넣는다.
// - 핀·이름 상자·번호 네모·벤치 점은 CustomOverlay 에 우리 HTML(mapParts 의 pinHtml·pointIcon, RealMap.module.css 모양)을 얹는다.
//   겹 차례: 선·제자리 점 0 < 벤치·쉼터 점 1 < 핀·이름 상자 2 < 번호 네모 3(오픈스트리트맵 판의 겹 차례와 같게).
// - 번호 네모 비키기: 셈은 mapParts.nudgeAll 그대로, 자리는 카카오 투영(getProjection().containerPointFromCoords)으로 잰다.
//   제자리 점과 선은 제자리에 얹은 작은 SVG 로 그린다. 지도가 멈출 때마다(idle) 다시 셈하고, 확대·축소가 시작되면 선을 지운다.
// - 마우스 휠 확대는 끄고, 휴대전화·태블릿에서는 한 손가락 끌기를 끈다(오픈스트리트맵 판과 같게).
import { useEffect, useRef, useState } from "react";
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
  type Rect,
} from "./mapParts";
import type { KCustomOverlay, KLatLng, KMap } from "./kakaoSdk";
import s from "./RealMap.module.css";
import k from "./KakaoMap.module.css";

/** 오픈스트리트맵 zoom → 카카오 레벨 */
const levelOf = (zoom: number) => Math.min(13, Math.max(1, 20 - zoom));
const MIN_LEVEL = levelOf(19);
const MAX_LEVEL = levelOf(7);

/** 지도 틀(root) 기준 자리(px). 글자·화면 설정의 몸 zoom 이 있어도 offsetLeft 와 같은 단위로 */
function relRect(el: HTMLElement, root: HTMLElement, pad: number): Rect | null {
  const rr = root.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  if (!r.width || !rr.width) return null;
  const z = root.offsetWidth / rr.width;
  return { l: (r.left - rr.left) * z - pad, t: (r.top - rr.top) * z - pad, r: (r.right - rr.left) * z + pad, b: (r.bottom - rr.top) * z + pad };
}

/** 카카오가 왼쪽 아래에 그리는 로고·축척 줄. 이름표가 없어 로고 링크(map.kakao.com)를 싼 상자를 찾는다 */
function kakaoFoot(root: HTMLElement) {
  return root.querySelector<HTMLElement>('a[href*="map.kakao.com"]')?.parentElement ?? null;
}

export default function KakaoMap({ lat, lon, name, label, zoom = 16, points, legend, tall }: MapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KMap | null>(null);
  // 처음 화면(맞추기 결과). 처음 크기 단추가 이리로 돌아온다
  const homeRef = useRef<{ center: KLatLng | null; level: number }>({ center: null, level: levelOf(zoom) });
  const legRef = useRef<HTMLUListElement>(null);
  const ctrlRef = useRef<HTMLDivElement>(null);
  const ptsKey = pointsKey(points);
  const [level, setLevel] = useState(levelOf(zoom));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const K = window.kakao?.maps;
    const el = mapEl.current;
    if (!K || !el) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const map = new K.Map(el, {
      center: new K.LatLng(lat, lon),
      level: levelOf(zoom),
      scrollwheel: false,
      draggable: !coarse,
      keyboardShortcuts: false,
    });
    map.setMinLevel(MIN_LEVEL);
    map.setMaxLevel(MAX_LEVEL);
    const overlays: KCustomOverlay[] = [];
    const add = (o: KCustomOverlay) => (o.setMap(map), overlays.push(o), o);

    // 관광지 핀 + 이름 상자(핀 끝이 제자리)
    const pinPos = new K.LatLng(lat, lon);
    const pinEl = document.createElement("div");
    pinEl.className = `${k.ov} ${k.pin}`;
    pinEl.innerHTML = pinHtml(name);
    add(new K.CustomOverlay({ position: pinPos, content: pinEl, xAnchor: 0.5, yAnchor: 1, zIndex: 2 }));
    const nameEl = pinEl.querySelector("span");

    // 편의시설 점: 벤치·쉼터 작은 점(겹 1)과 번호 네모(겹 3)
    const nums: { root: HTMLElement; p: MapPoint; pos: KLatLng; w: number; h: number }[] = [];
    for (const p of points ?? []) {
      const ic = pointIcon(p);
      const root = document.createElement("div");
      root.className = `${k.ov}${p.href ? " " + k.hit : ""}`;
      root.style.width = `${ic.w}px`;
      root.style.height = `${ic.h}px`;
      root.innerHTML = ic.html;
      if (p.title) root.title = p.title;
      if (p.href) root.firstElementChild?.addEventListener("click", () => (window.location.hash = p.href!));
      const pos = new K.LatLng(p.lat, p.lon);
      add(new K.CustomOverlay({ position: pos, content: root, xAnchor: 0.5, yAnchor: 0.5, zIndex: p.label ? 3 : 1, clickable: !!p.href }));
      if (p.label) nums.push({ root, p, pos, w: ic.w, h: ic.h });
    }

    // 번호 네모 비키기(셈은 mapParts.nudgeAll). 선과 제자리 점은 셀 때마다 새로 얹는다
    let leaders: KCustomOverlay[] = [];
    const clearLeaders = () => {
      for (const o of leaders) o.setMap(null);
      leaders = [];
    };
    const place = () => {
      clearLeaders();
      if (!nums.length) return;
      const proj = map.getProjection();
      const W = el.clientWidth;
      const H = el.clientHeight;
      // 관광지 핀과 이름 상자, + − ↻ 단추, 카카오 로고·축척 줄, 지도 안 범례(좁은 화면에서는 지도 아래라 빼고)
      const c = proj.containerPointFromCoords(pinPos);
      const hard = pinRects(c.x, c.y, nameEl);
      const leg = legRef.current;
      for (const o of [ctrlRef.current, leg && getComputedStyle(leg).position === "absolute" ? leg : null]) {
        const r = boxOf(o, 4);
        if (r) hard.push(r);
      }
      const foot = kakaoFoot(el);
      const fr = foot && relRect(foot, el, 4);
      if (fr) hard.push(fr);
      const at = nums.map((n) => proj.containerPointFromCoords(n.pos));
      const moves = nudgeAll(W, H, hard, nums.map((n, i) => ({ x: at[i].x, y: at[i].y, w: n.w, h: n.h })));
      nums.forEach((n, i) => {
        const { dx, dy, lead } = moves[i];
        const sq = n.root.firstElementChild as HTMLElement | null;
        if (sq) sq.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : "";
        if (!lead) return;
        // 제자리(0,0)에 작은 점, 네모 가운데(dx,dy)까지 선
        const kk = s[`k_${n.p.kind}`] ?? "";
        const m = ANCHOR_R + 2;
        const x0 = Math.min(0, dx) - m;
        const y0 = Math.min(0, dy) - m;
        const w = Math.abs(dx) + m * 2;
        const h = Math.abs(dy) + m * 2;
        const box = document.createElement("div");
        box.className = `${k.ov} ${k.lead}`;
        box.innerHTML =
          `<svg class="${k.leadSvg}" style="left:${x0}px;top:${y0}px" width="${w}" height="${h}" viewBox="${x0} ${y0} ${w} ${h}" aria-hidden="true" focusable="false">` +
          `<path class="${s.leader} ${kk}" d="M0 0L${dx} ${dy}"/>` +
          `<circle class="${s.anchor} ${kk}" cx="0" cy="0" r="${ANCHOR_R}"/>` +
          `</svg>`;
        const o = new K.CustomOverlay({ position: n.pos, content: box, xAnchor: 0, yAnchor: 0, zIndex: 0 });
        o.setMap(map);
        leaders.push(o);
      });
    };

    // 처음 화면: 반경 안 점과 관광지가 모두 들어오게(너무 가까이 당기지는 않게 레벨 3 = zoom 17까지)
    const fit = (points ?? []).filter((p) => p.near);
    if (fit.length) {
      const b = new K.LatLngBounds();
      b.extend(pinPos);
      for (const p of fit) b.extend(new K.LatLng(p.lat, p.lon));
      // 범례가 지도 안(왼쪽 위)에 있으면 그 폭만큼, 오른쪽은 + − ↻ 단추만큼 비워 점이 가리지 않게
      const leg = legRef.current;
      const legIn = leg && getComputedStyle(leg).position === "absolute";
      map.setBounds(b, FIT_PAD.top, FIT_PAD.right, FIT_PAD.bottom, legIn ? leg.offsetWidth + FIT_PAD.legend : FIT_PAD.left);
      if (map.getLevel() < levelOf(FIT_MAX_ZOOM)) map.setLevel(levelOf(FIT_MAX_ZOOM));
    }
    homeRef.current = { center: map.getCenter(), level: map.getLevel() };

    const onZoom = () => setLevel(map.getLevel());
    const onZoomStart = () => clearLeaders();
    const onIdle = () => place();
    K.event.addListener(map, "zoom_changed", onZoom);
    K.event.addListener(map, "zoom_start", onZoomStart);
    K.event.addListener(map, "idle", onIdle);
    onZoom();
    place();

    // 장애물 크기가 바뀌면 다시 셈한다(이름 상자는 글꼴을 받은 뒤, 카카오 축척 줄은 레벨마다 폭이 바뀐다)
    const roMarks = new ResizeObserver(() => place());
    for (const o of [ctrlRef.current, legRef.current, nameEl, kakaoFoot(el)]) if (o) roMarks.observe(o);
    // 글자·화면 설정(몸 zoom)이나 폭이 바뀌면 지도 크기를 다시 잰다(가운데는 그대로)
    const ro = new ResizeObserver(() => {
      const center = map.getCenter();
      map.relayout();
      map.setCenter(center);
      place();
    });
    ro.observe(el);
    mapRef.current = map;
    // 카카오 SDK 가 이미 떠 있을 때만 이 부품이 그려지므로, 여기서 바로 준비됨으로 둔다
    queueMicrotask(() => setReady(true));

    return () => {
      ro.disconnect();
      roMarks.disconnect();
      K.event.removeListener(map, "zoom_changed", onZoom);
      K.event.removeListener(map, "zoom_start", onZoomStart);
      K.event.removeListener(map, "idle", onIdle);
      clearLeaders();
      for (const o of overlays) o.setMap(null);
      el.replaceChildren(); // 카카오가 만든 지도 겹(카카오 지도에는 없애기 함수가 없다)
      mapRef.current = null;
      setReady(false);
    };
    // points 는 ptsKey 로 비교한다(쪽이 다시 그려질 때마다 새 배열이 와도 지도를 다시 만들지 않게)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, name, zoom, ptsKey]);

  const canIn = ready && level > MIN_LEVEL;
  const canOut = ready && level < MAX_LEVEL;

  return (
    <MapFrame tall={tall} legend={legend} legRef={legRef}>
      <div className={s.map} role="region" aria-label={label ?? `${name} 위치 지도`} data-engine="kakao">
        <div ref={mapEl} className={k.kmap} />
      </div>

      <MapControls
        ref={ctrlRef}
        canIn={canIn}
        canOut={canOut}
        ready={ready}
        onIn={() => {
          const m = mapRef.current;
          m?.setLevel(m.getLevel() - 1, { animate: true });
        }}
        onOut={() => {
          const m = mapRef.current;
          m?.setLevel(m.getLevel() + 1, { animate: true });
        }}
        onHome={() => {
          const m = mapRef.current;
          const h = homeRef.current;
          if (!m || !h.center) return;
          m.setLevel(h.level);
          m.setCenter(h.center);
        }}
      />
    </MapFrame>
  );
}
