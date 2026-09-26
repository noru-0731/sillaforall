"use client";
// 권역 세부 지도(09-27 map2, 사용자: 경주 전체는 그림 지도로 두고, 권역에 들어가면 세부 지도로).
// /map/[권역] 에서 카카오 SDK 가 뜨면 도식 지도(MapView) 대신 이것을 그린다. 판정은 MapExplorer(kakaoSdk.loadKakao),
// 뜨지 않으면(키 없음·오류·8초) MapExplorer 가 지금까지의 도식 지도를 그린다.
// - 상자·범례·+ − ↻ 단추·번호 네모 비키기·선·카카오 로고 줄 장애물·손가락 고침은 관광지 쪽 카카오 지도(KakaoMap)와 같은 부품
//   (mapParts, kakaoParts, RealMap.module.css, KakaoMap.module.css)을 쓴다. 가운데 핀은 없다.
// - 번호 네모: 그 쪽 이름 격자의 차례(번호 = 차례 + 1, 거르기를 바꾸면 격자와 함께 다시 매김). 색은 AreaKakaoMap.module.css.
//   계단 없는 길 곳은 네모 안 번호 앞에 걷는 사람 그림(사이트 아이콘 walk, 무장애 정보 쪽 '접근로' 그림)을 넣어 네모가 넓어진다(비키기 셈에 그대로 들어감).
// - 번호를 누르면 도식 지도에서 점을 누를 때와 같이 정보 창(MapView.module.css 모양 그대로)이 열리고 onSelectPlace(주소 ?place=)를 부른다.
// - 권역 경계: 그 권역으로 칠한 읍면동(areas6.json dongs, boundary.json)의 경계선을 권역 색 옅은 선·옅은 칠로 얹는다. 권역 밖은 칠하지 않는다.
// - 처음 화면: 그 권역 곳이 모두 들어오게(setBounds, 범례가 지도 안에 있으면 그 폭 + 40 여백). 처음 크기 단추가 이리로 돌아온다.
// - live 가 false 면(판정 전) 같은 크기의 빈 상자와 범례만 그린다(판정 뒤 쪽이 밀리지 않게).
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { AREA_COLOR, areaByKey, areaColorVar, areaOf, areas, places as allPlaces, units } from "@/data";
import type { AreaKey, Place } from "@/data";
import { cn } from "@/lib/cn";
import { Ph } from "@/components/layout/Ph";
import { Icon } from "@/components/icons";
import { ANCHOR_R, FIT_MAX_ZOOM, FIT_PAD, MapControls, boxOf, esc, nudgeAll, type Rect } from "./mapParts";
import { MAX_LEVEL, MIN_LEVEL, guardTouch, isCoarse, kakaoFoot, levelOf, markKakaoLogo, relRect } from "./kakaoParts";
import type { KCustomOverlay, KLatLng, KMap, KPolygon } from "./kakaoSdk";
import rs from "./RealMap.module.css";
import k from "./KakaoMap.module.css";
import mv from "./MapView.module.css";
import a from "./AreaKakaoMap.module.css";

const AREA_OF_DONG = new Map(areas.flatMap((x) => x.dongs.map((d) => [d, x.key] as const)));

/** 걷는 사람 그림(components/icons walk 와 같은 선, 12px). 번호 네모는 카카오 겹에 HTML 로 넣으므로 글로 적는다 */
const WALK_SVG =
  '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
  '<circle cx="13" cy="4.3" r="1.8"/><path d="M10.5 21l2-6-2.5-2.5 1-5 3.5 2.5 3 1"/><path d="M11 7.5 7.5 9.5 6.5 13M12.5 15l2.5 2.5V21"/></svg>';
/** 걷는 사람 그림이 들어간 네모가 넓어지는 폭(그림 12 + 사이 2) */
const WALK_W = 14;
/** 권역 경계 선·칠(권역 색). 지도 그림을 가리지 않게 옅게 */
const EDGE = { strokeWeight: 2, strokeOpacity: 0.6, fillOpacity: 0.08 };

/** 번호 네모 하나. lead 는 비켜났을 때 제자리 점과 선(거점 강조에서 네모와 함께 흐려진다) */
type Num = { btn: HTMLButtonElement; p: Place; pos: KLatLng; w: number; h: number; ov: KCustomOverlay; lead?: HTMLElement };

export default function AreaKakaoMap({
  area,
  live,
  fitPlaces,
  places,
  highlightId,
  emphasisIds,
  onSelectPlace,
  stepFree,
  hubLegend,
}: {
  area: AreaKey;
  /** 카카오 SDK 가 떴는지(false 면 빈 상자만) */
  live: boolean;
  /** 처음 화면에 모두 들어오게 할 곳(그 권역 곳 전부) */
  fitPlaces: Place[];
  /** 번호 네모로 보일 곳(이름 격자 차례) */
  places: Place[];
  highlightId?: string;
  /** 거점 단추로 강조할 곳. 빈 배열이면 강조 없음 */
  emphasisIds: string[];
  onSelectPlace: (id: string) => void;
  /** 계단 없는 길 곳과 그 쪽 주소 */
  stepFree?: { ids: string[]; href: string };
  /** 범례에 거점 관광지 줄을 둘지(거점 단추가 있는 권역) */
  hubLegend: boolean;
}) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const titleId = `${uid}-title`;
  const label = areaByKey(area)?.label ?? "";

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KMap | null>(null);
  const [map, setMap] = useState<KMap | null>(null);
  const homeRef = useRef<{ center: KLatLng | null; level: number }>({ center: null, level: 0 });
  const legRef = useRef<HTMLUListElement>(null);
  const ctrlRef = useRef<HTMLDivElement>(null);
  const numsRef = useRef<Num[]>([]);
  const leadersRef = useRef<KCustomOverlay[]>([]);
  const [level, setLevel] = useState(0);

  // 정보 창
  const [sel, setSel] = useState<string | null>(null);
  const openerRef = useRef<string | null>(null);
  const panelTitleRef = useRef<HTMLParagraphElement>(null);
  const selectRef = useRef(onSelectPlace);
  // 번호 네모 모양이 따르는 값(겹 효과가 다시 만들어도 최신 값으로 칠하게)
  const emphKey = emphasisIds.join(",");
  const stateRef = useRef({ hl: highlightId, emph: emphKey, sel });

  const listKey = places.map((p) => p.id).join(",");
  const fitKey = fitPlaces.map((p) => p.id).join(",");
  const sfIds = stepFree?.ids;
  const sfKey = sfIds?.join(",") ?? "";
  const sfHere = !!sfIds && fitPlaces.some((p) => sfIds.includes(p.id));

  // ── 번호 네모 비키기(셈은 mapParts.nudgeAll, KakaoMap.tsx place 와 같음) ──────
  const clearLeaders = useCallback(() => {
    for (const o of leadersRef.current) o.setMap(null);
    leadersRef.current = [];
  }, []);
  const place = useCallback(() => {
    const K = window.kakao?.maps;
    const m = mapRef.current;
    const el = mapEl.current;
    clearLeaders();
    const nums = numsRef.current;
    if (!K || !m || !el || !nums.length) return;
    const proj = m.getProjection();
    // + − ↻ 단추, 지도 안 범례(좁은 화면에서는 지도 아래라 빼고), 카카오 로고·축척 줄
    const hard: Rect[] = [];
    const leg = legRef.current;
    for (const o of [ctrlRef.current, leg && getComputedStyle(leg).position === "absolute" ? leg : null]) {
      const r = boxOf(o, 4);
      if (r) hard.push(r);
    }
    const foot = kakaoFoot(el);
    const fr = foot && relRect(foot, el, 4);
    if (fr) hard.push(fr);
    const at = nums.map((n) => proj.containerPointFromCoords(n.pos));
    const moves = nudgeAll(el.clientWidth, el.clientHeight, hard, nums.map((n, i) => ({ x: at[i].x, y: at[i].y, w: n.w, h: n.h })));
    nums.forEach((n, i) => {
      const { dx, dy, lead } = moves[i];
      n.btn.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : "";
      n.lead = undefined;
      if (!lead) return;
      // 제자리(0,0)에 작은 점, 네모 가운데(dx,dy)까지 선
      const g = ANCHOR_R + 2;
      const x0 = Math.min(0, dx) - g;
      const y0 = Math.min(0, dy) - g;
      const w = Math.abs(dx) + g * 2;
      const h = Math.abs(dy) + g * 2;
      const box = document.createElement("div");
      box.className = `${k.ov} ${k.lead}${n.btn.classList.contains(a.sqDim) ? " " + a.sqDim : ""}`;
      n.lead = box;
      box.innerHTML =
        `<svg class="${k.leadSvg}" style="left:${x0}px;top:${y0}px" width="${w}" height="${h}" viewBox="${x0} ${y0} ${w} ${h}" aria-hidden="true" focusable="false">` +
        `<path class="${rs.leader} ${a.k}" d="M0 0L${dx} ${dy}"/>` +
        `<circle class="${rs.anchor} ${a.k}" cx="0" cy="0" r="${ANCHOR_R}"/>` +
        `</svg>`;
      const o = new K.CustomOverlay({ position: n.pos, content: box, xAnchor: 0, yAnchor: 0, zIndex: 0 });
      o.setMap(m);
      leadersRef.current.push(o);
    });
  }, [clearLeaders]);

  // 고른 곳·거점 강조를 네모에 칠한다(겹은 그대로)
  const paint = useCallback(() => {
    const { hl, emph, sel: open } = stateRef.current;
    const em = new Set(emph ? emph.split(",") : []);
    for (const n of numsRef.current) {
      const isHl = n.p.id === hl;
      const isEm = em.has(n.p.id);
      n.btn.classList.toggle(a.sqHl, isHl);
      n.btn.classList.toggle(a.sqEmph, isEm && !isHl);
      n.btn.classList.toggle(a.sqDim, em.size > 0 && !isEm && !isHl);
      n.lead?.classList.toggle(a.sqDim, em.size > 0 && !isEm && !isHl);
      n.btn.setAttribute("aria-expanded", String(open === n.p.id));
      if (open === n.p.id) n.btn.setAttribute("aria-controls", panelId);
      else n.btn.removeAttribute("aria-controls");
      n.ov.setZIndex(isHl ? 5 : isEm ? 4 : 3);
    }
  }, [panelId]);

  useEffect(() => {
    selectRef.current = onSelectPlace;
  }, [onSelectPlace]);
  useEffect(() => {
    stateRef.current = { hl: highlightId, emph: emphKey, sel };
    paint();
  }, [highlightId, emphKey, sel, paint]);

  // ── 지도 만들기: 경계, 처음 화면, 로고 옆 새 창 표시, 다시 셈할 때 ──────────
  useEffect(() => {
    const K = window.kakao?.maps;
    const el = mapEl.current;
    const box = areaByKey(area)?.box;
    if (!live || !K || !el || !box) return;
    const coarse = isCoarse();
    const m = new K.Map(el, {
      center: new K.LatLng((box.lat0 + box.lat1) / 2, (box.lon0 + box.lon1) / 2),
      level: 9,
      scrollwheel: false,
      draggable: !coarse,
      keyboardShortcuts: false,
    });
    m.setMinLevel(MIN_LEVEL);
    m.setMaxLevel(MAX_LEVEL);
    // 휴대전화: 한 손가락으로 지도 위를 쓸면 쪽이 내려가게(kakaoParts.guardTouch, 관광지 쪽 카카오 지도와 같음)
    const unguard = coarse ? guardTouch(el) : () => {};

    // 권역 경계: 그 권역으로 칠한 읍면동만. 고리 하나를 다각형 하나로(여러 고리를 한 다각형에 넣으면 카카오는 구멍으로 본다)
    const color = AREA_COLOR[area];
    const polys: KPolygon[] = units
      .filter((u) => AREA_OF_DONG.get(u.name) === area)
      .flatMap((u) =>
        u.rings.map(
          (r) =>
            new K.Polygon({
              path: r.map(([lon, lat]) => new K.LatLng(lat, lon)),
              strokeWeight: EDGE.strokeWeight,
              strokeColor: color,
              strokeOpacity: EDGE.strokeOpacity,
              strokeStyle: "solid",
              fillColor: color,
              fillOpacity: EDGE.fillOpacity,
              zIndex: 0,
            }),
        ),
      );
    for (const p of polys) p.setMap(m);

    // 처음 화면: 그 권역 곳이 모두 들어오게. 범례가 지도 안(왼쪽 위)에 있으면 그 폭만큼, 오른쪽은 + − ↻ 단추만큼 비운다
    const fit = fitKey ? fitKey.split(",").map((id) => allPlaces.find((p) => p.id === id)).filter((p): p is Place => !!p) : [];
    if (fit.length) {
      const b = new K.LatLngBounds();
      for (const p of fit) b.extend(new K.LatLng(p.lat, p.lon));
      const leg = legRef.current;
      const legIn = leg && getComputedStyle(leg).position === "absolute";
      m.setBounds(b, FIT_PAD.top, FIT_PAD.right, FIT_PAD.bottom, legIn ? leg.offsetWidth + FIT_PAD.legend : FIT_PAD.left);
      if (m.getLevel() < levelOf(FIT_MAX_ZOOM)) m.setLevel(levelOf(FIT_MAX_ZOOM));
    }
    homeRef.current = { center: m.getCenter(), level: m.getLevel() };

    // 카카오 로고 링크 옆 새 창 표시. 로고가 늦게 붙으면 타일을 다 받은 뒤 다시
    const onTiles = () => markKakaoLogo(el) && K.event.removeListener(m, "tilesloaded", onTiles);
    if (!markKakaoLogo(el)) K.event.addListener(m, "tilesloaded", onTiles);

    const onZoom = () => setLevel(m.getLevel());
    const onIdle = () => place();
    K.event.addListener(m, "zoom_changed", onZoom);
    K.event.addListener(m, "zoom_start", clearLeaders);
    K.event.addListener(m, "idle", onIdle);

    // 장애물 크기가 바뀌면 다시 셈한다(카카오 축척 줄은 레벨마다 폭이 바뀐다)
    const roMarks = new ResizeObserver(() => place());
    for (const o of [ctrlRef.current, legRef.current, kakaoFoot(el)]) if (o) roMarks.observe(o);
    // 글자·화면 설정(몸 zoom)이나 폭이 바뀌면 지도 크기를 다시 잰다(가운데는 그대로)
    const ro = new ResizeObserver(() => {
      const center = m.getCenter();
      m.relayout();
      m.setCenter(center);
      place();
    });
    ro.observe(el);
    mapRef.current = m;
    // 카카오 SDK 가 이미 떠 있을 때만 여기까지 오므로 바로 준비됨으로 둔다(겹 효과가 이 지도로 번호 네모를 얹는다)
    queueMicrotask(() => {
      setMap(m);
      setLevel(m.getLevel());
    });

    return () => {
      unguard();
      ro.disconnect();
      roMarks.disconnect();
      K.event.removeListener(m, "tilesloaded", onTiles);
      K.event.removeListener(m, "zoom_changed", onZoom);
      K.event.removeListener(m, "zoom_start", clearLeaders);
      K.event.removeListener(m, "idle", onIdle);
      clearLeaders();
      for (const p of polys) p.setMap(null);
      el.replaceChildren(); // 카카오가 만든 지도 겹(카카오 지도에는 없애기 함수가 없다)
      mapRef.current = null;
      setMap(null);
    };
  }, [live, area, fitKey, place, clearLeaders]);

  // ── 번호 네모(보이는 곳이 바뀔 때마다 다시 얹는다) ─────────────────────
  useEffect(() => {
    const K = window.kakao?.maps;
    if (!K || !map) return;
    const sf = new Set(sfKey ? sfKey.split(",") : []);
    const ids = listKey ? listKey.split(",") : [];
    const nums: Num[] = [];
    ids.forEach((id, i) => {
      const p = allPlaces.find((q) => q.id === id);
      if (!p) return;
      const no = String(i + 1);
      const walk = sf.has(p.id);
      const w = Math.max(24, 10 + no.length * 8) + (walk ? WALK_W : 0);
      const root = document.createElement("div");
      root.className = `${k.ov} ${k.hit}`;
      root.style.width = `${w}px`;
      root.style.height = "24px";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `${rs.pt} ${a.sq} ${p.registered ? a.sqOn : a.sqOff}`;
      btn.style.width = `${w}px`;
      btn.innerHTML = `${walk ? WALK_SVG : ""}<span>${esc(no)}</span>`;
      btn.title = p.name;
      btn.setAttribute("aria-label", walk ? `${no} ${p.name}, 계단 없는 길` : `${no} ${p.name}`);
      btn.addEventListener("click", () => {
        openerRef.current = p.id;
        setSel(p.id);
        selectRef.current(p.id);
      });
      root.append(btn);
      const pos = new K.LatLng(p.lat, p.lon);
      const ov = new K.CustomOverlay({ position: pos, content: root, xAnchor: 0.5, yAnchor: 0.5, zIndex: 3, clickable: true });
      ov.setMap(map);
      nums.push({ btn, p, pos, w, h: 24, ov });
    });
    numsRef.current = nums;
    paint();
    place();
    return () => {
      for (const n of nums) n.ov.setMap(null);
      numsRef.current = [];
      clearLeaders();
    };
  }, [map, listKey, sfKey, paint, place, clearLeaders]);

  // ── 정보 창 ─────────────────────────────────────────────
  useEffect(() => {
    if (sel) panelTitleRef.current?.focus();
  }, [sel]);
  const close = () => {
    setSel(null);
    const id = openerRef.current;
    const btn = numsRef.current.find((n) => n.p.id === id)?.btn;
    if (btn && document.contains(btn)) btn.focus();
    else mapEl.current?.parentElement?.focus();
  };
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape" && sel) {
      e.stopPropagation();
      close();
    }
  };
  const selPlace = sel ? allPlaces.find((p) => p.id === sel) : undefined;

  const canIn = !!map && level > MIN_LEVEL;
  const canOut = !!map && level < MAX_LEVEL;

  return (
    <div className={cn(mv.root, a.root)} onKeyDown={onKeyDown}>
      <div className={rs.withLegend}>
        <div className={cn(rs.box, a.box)}>
          <div className={rs.map} role="region" aria-label={`${label} 지도`} aria-busy={!map} data-engine={live ? "kakao" : undefined} tabIndex={-1}>
            <div ref={mapEl} className={k.kmap} />
          </div>
          <MapControls
            ref={ctrlRef}
            canIn={canIn}
            canOut={canOut}
            ready={!!map}
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
        </div>
        <ul ref={legRef} className={rs.legend} aria-label="지도 범례">
          <li>
            <span className={cn(rs.legSw, a.swOn)} aria-hidden="true" />
            <span>무장애 정보가 있는 곳</span>
          </li>
          <li>
            <span className={cn(rs.legSw, a.swOff)} aria-hidden="true" />
            <span>무장애 정보가 없는 곳</span>
          </li>
          {hubLegend && (
            <li>
              <span className={cn(rs.legSw, a.swOn, a.swEmph)} aria-hidden="true" />
              <Ph>덩어리 관광지</Ph>
            </li>
          )}
          {sfHere && stepFree && (
            <li>
              <span className={cn(rs.legSw, a.swOn)} aria-hidden="true">
                <Icon name="walk" size={18} strokeWidth={2} />
              </span>
              <Link href={stepFree.href} className={a.legLink}>
                계단 없는 길
              </Link>
            </li>
          )}
        </ul>
      </div>

      {selPlace && (
        <section id={panelId} className={mv.panel} aria-labelledby={titleId}>
          <p id={titleId} ref={panelTitleRef} className={mv.panelTitle} tabIndex={-1}>
            {selPlace.name}
          </p>
          <p className={mv.panelMeta}>
            <span className={mv.panelArea} style={{ color: areaColorVar(areaOf(selPlace)) }}>
              {areaByKey(areaOf(selPlace))?.label}
            </span>
            {selPlace.dong}
          </p>
          <p>
            <span className={cn(mv.badge, selPlace.registered ? mv.badgeOn : mv.badgeOff)}>
              <Ph>{selPlace.registered ? "무장애 정보 있음" : "무장애 정보 없음"}</Ph>
            </span>
          </p>
          <div className={mv.panelActions}>
            <Link href={`/places/${selPlace.id}`} className={mv.btnInk}>
              자세히보기
            </Link>
            <button type="button" className={mv.btnLine} onClick={close}>
              닫기
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
