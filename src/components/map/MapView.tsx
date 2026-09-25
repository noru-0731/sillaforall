"use client";
// 지도 부품. 지도 서비스·바깥 타일 없이, 읍면동 경계선(SVG)과 관광지 점(HTML 단추)만 그린다.
// 약속(props)은 contracts.ts 그대로. 계산은 mapLayout.ts.
// 모양은 궁능유적본부 누리집 관람코스 지도 틀을 따랐다(궁능의 그림·CSS는 쓰지 않고 우리 CSS로 새로 씀):
// - 둥근 테두리 상자(1px, 둥글기 20), 오른쪽 위 세로 + − ↻ 단추, 넓은 칸에서는 왼쪽 아래 세로 범례.
// - 경계선: SVG. 경주 전체에서는 권역별로 권역 색을 옅게 칠하고, 권역 하나가 /map/[권역] 링크다
//   (onAreaSelect를 주면 링크 대신 거르기 단추).
// - 점·이름표·묶음 점: HTML(단추라서 키보드 초점과 누름 영역 44px).
// - 확대·축소·처음 크기 단추와 끌기. 마우스 휠 확대는 일부러 넣지 않았다(쪽 내리기가 먼저).
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { areaByKey, areaColorVar, areaOf, areas, FULL_BOX, places, units } from "@/data";
import type { AreaKey, Box, Place } from "@/data";
import { groupOverlaps, pxPerKm } from "@/lib/geo";
import { cn } from "@/lib/cn";
import { Ph } from "@/components/layout/Ph";
import { Icon } from "@/components/icons";
import type { MapViewProps } from "./contracts";
import {
  clampView,
  cluster,
  fitBox,
  HOME,
  insideFrame,
  niceScale,
  overlaps,
  placeInPolygon,
  placeLabel,
  ringCentroid,
  ringPath,
  textWidth,
  toBase,
  toScreen,
  zoomAt,
  zoomToRect,
  type Fit,
  type Pt,
  type Rect,
  type View,
} from "./mapLayout";
import s from "./MapView.module.css";

// 점 반지름(px). MapView.module.css의 크기와 짝이다(1rem = 10px 기준).
const R_OWN = 8; // .dot 1.6rem
const R_OTHER = 6; // .dotOther 1.2rem
const R_HL = 12; // .dotHl 2.4rem
const R_EMPH = 14; // .emph 고리 포함
const R_BUBBLE = 20; // .bubble 4rem
const MERGE = 44; // 화면에서 이 거리(px) 안의 점은 묶음 점 하나로(누름 영역 44px가 겹치지 않게)
const STEP = 1.6; // 확대 단추 한 번의 배율
const LEGEND_GAP = 20; // 안쪽 범례와 지도 사이
const CTRL = { right: 16, top: 16, w: 32, h: 32 * 3 }; // 오른쪽 위 + − ↻ (MapView.module.css .controls)

const AREA_OF_DONG = new Map(areas.flatMap((a) => a.dongs.map((d) => [d, a.key] as const)));

type Size = { w: number; h: number; fs: number; afs: number; ufs: number; insetL: number; insetR: number; legend: Rect | null };
type Sel = { kind: "place"; id: string } | { kind: "list"; ids: string[] } | null;

type Single = { kind: "single"; key: string; p: Place; x: number; y: number; own: boolean; hl: boolean; emph: boolean };
type Group = { kind: "group"; key: string; items: Place[]; x: number; y: number; own: boolean; emph: boolean; hl: boolean; bbox: Rect };
type Marker = Single | Group;
type Label = Rect & { key: string; text: string; tone: "own" | "other" | "hl" | "emph"; dim: boolean };
type AreaTag = Rect & { key: AreaKey; label: string };
type UnitTag = Rect & { key: string; text: string };

/** 상자를 왼쪽·오른쪽 여백을 뺀 자리에 맞춘다(안쪽 범례·단추 자리) */
function fitInset(box: Box, w: number, h: number, insetL: number, insetR: number): Fit {
  const f = fitBox(box, Math.max(1, w - insetL - insetR), h);
  return { ...f, ox: f.ox + insetL };
}

export default function MapView({
  view,
  placeIds,
  highlightId,
  interactive = true,
  showAreas,
  labels = true,
  height,
  ariaLabel,
  emphasisIds,
  onSelectPlace,
  onAreaSelect,
  selectedArea,
  legend = true,
  plain = false,
}: MapViewProps) {
  const router = useRouter();
  const uid = useId();
  const panelId = `${uid}-panel`;
  const titleId = `${uid}-title`;

  const box = view === "full" ? FULL_BOX : (areaByKey(view)?.box ?? FULL_BOX);
  const areaMode = view === "full" && (showAreas ?? true);
  const selectMode = areaMode && !!onAreaSelect;
  // 넓은 칸에서 궁능 관람코스처럼: 높이 69.3rem, 범례를 지도 안 왼쪽 아래에(CSS 컨테이너 질의로 판단)
  const big = interactive && !height;
  const frameAspect = useMemo(() => {
    const midLat = (box.lat0 + box.lat1) / 2;
    const wKm = (box.lon1 - box.lon0) * 111.32 * Math.cos((midLat * Math.PI) / 180);
    const hKm = (box.lat1 - box.lat0) * 111.0;
    return wKm / hKm; // CSS aspect-ratio = 가로 / 세로
  }, [box]);

  // ── 틀 크기 재기 ──────────────────────────────────────────
  const frameRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLUListElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [vw, setVw] = useState<View>(HOME);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const fsOf = (i: number, fallback: number) => {
        const node = probeRef.current?.children[i];
        const v = node ? parseFloat(getComputedStyle(node).fontSize) : NaN;
        return Number.isFinite(v) ? v : fallback;
      };
      // 범례가 지도 안에 떠 있으면(넓은 칸) 그만큼 지도를 오른쪽으로 비킨다. offset*은 화면 확대(zoom)와 무관한 CSS px.
      let insetL = 0;
      let insetR = 0;
      let lgRect: Rect | null = null;
      const lg = legendRef.current;
      if (lg && getComputedStyle(lg).position === "absolute") {
        const x = lg.offsetLeft - el.offsetLeft;
        const y = lg.offsetTop - el.offsetTop;
        lgRect = { x, y, w: lg.offsetWidth, h: lg.offsetHeight };
        insetL = x + lg.offsetWidth + LEGEND_GAP;
        insetR = CTRL.right + CTRL.w + 8;
        if (w - insetL - insetR < w * 0.5) {
          insetL = 0;
          insetR = 0;
        }
      }
      const next: Size = { w, h, fs: fsOf(0, 17), afs: fsOf(1, 17), ufs: fsOf(2, 15), insetL, insetR, legend: lgRect };
      setSize((prev) => {
        if (
          prev &&
          prev.w === next.w &&
          prev.h === next.h &&
          prev.fs === next.fs &&
          prev.insetL === next.insetL &&
          prev.insetR === next.insetR &&
          prev.legend?.h === next.legend?.h
        )
          return prev;
        return next;
      });
      setVw(HOME);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (legendRef.current) ro.observe(legendRef.current);
    return () => ro.disconnect();
  }, []);

  const w = size?.w ?? 0;
  const h = size?.h ?? 0;
  const fit = useMemo(() => (size ? fitInset(box, size.w, size.h, size.insetL, size.insetR) : null), [box, size]);
  const basePxKm = fit ? pxPerKm(box, fit.bw) : 1;
  const maxK = Math.max(3, 500 / basePxKm); // 가장 크게 봤을 때 1km ≈ 500px

  // ── 경계선(기본 좌표) ──────────────────────────────────────
  const shapes = useMemo(() => {
    if (!fit) return null;
    const unitList = units.map((u) => {
      const rings = u.rings.map((r) => r.map(([lon, lat]) => toBase(lon, lat, box, fit)));
      let best = { area: -1, c: { x: 0, y: 0 } as Pt };
      for (const r of rings) {
        const c = ringCentroid(r);
        if (c.area > best.area) best = c;
      }
      return { name: u.name, area: AREA_OF_DONG.get(u.name) ?? null, rings, d: rings.map(ringPath).join(""), c: best.c, size: best.area };
    });
    const areaShapes = areas.map((a) => {
      const mine = unitList.filter((u) => u.area === a.key);
      const tot = mine.reduce((t, u) => t + u.size, 0) || 1;
      const c = {
        x: mine.reduce((t, u) => t + u.c.x * u.size, 0) / tot,
        y: mine.reduce((t, u) => t + u.c.y * u.size, 0) / tot,
      };
      return { key: a.key, label: a.label, rings: mine.flatMap((u) => u.rings), d: mine.map((u) => u.d).join(""), c };
    });
    return { unitList, areaShapes };
  }, [box, fit]);

  // ── 관광지 점(기본 좌표) ──────────────────────────────────
  const idsKey = placeIds?.join(",") ?? "";
  const emphKey = emphasisIds?.join(",") ?? "";
  const emphOn = emphKey !== "";
  const pts = useMemo(() => {
    if (!fit) return [];
    const ids = idsKey ? new Set(idsKey.split(",")) : null;
    const emph = new Set(emphKey ? emphKey.split(",") : []);
    const list = ids ? places.filter((p) => ids.has(p.id)) : places;
    return list.map((p) => {
      const hl = p.id === highlightId;
      // 강조 모드(고정 지도)에서는 강조한 곳만 '내 점', 권역 지도에서는 그 권역 곳만 '내 점'
      const own = hl || (!interactive && highlightId ? false : view === "full" || !!ids || areaOf(p) === view);
      return { p, b: toBase(p.lon, p.lat, box, fit), own, hl, emph: own && emph.has(p.id) };
    });
  }, [fit, box, idsKey, emphKey, highlightId, interactive, view]);

  // ── 화면 배치(확대·끌기 반영): 점 묶기, 권역 이름, 이름표 ───────────
  const layout = useMemo(() => {
    if (!size || !fit || !shapes) return null;
    const { w, h, fs, afs, ufs } = size;
    const onScreen = (q: Pt, m: number) => q.x >= -m && q.x <= w + m && q.y >= -m && q.y <= h + m;
    // 축척 막대는 오른쪽 위 + − ↻ 단추 앞에서 끝나게(좁은 칸 + 글자 크게에서 막대가 단추 밑으로 들어가지 않게).
    // 왼쪽 위 모서리 = 왼쪽 여백 16 + 방위표 16 + 사이 16(MapView.module.css .corner)
    const sc = niceScale(basePxKm * vw.k, interactive ? Math.min(140, Math.max(40, w - 48 - (CTRL.right + CTRL.w + 8))) : 140);

    const markers: Marker[] = [];
    // 강조한 곳(이 관광지·고른 관광지)은 묶지 않고 따로, 맨 위에 그린다(무장애 시안 bf-draft: 누를 수 있는 지도에서도.
    // 전에는 누를 수 있는 지도에서 강조한 곳도 묶음에 들어가 좌표를 빌린 두 곳의 오시는 길 지도에서 "이 관광지" 점이 이름 없이 묶였다).
    const makeGroups = (own: boolean, emph: boolean) => {
      const list = pts
        .filter((q) => q.own === own && !q.hl && (!own || q.emph === emph))
        .map((q) => ({ ...toScreen(q.b, vw), q }))
        .filter((q) => onScreen(q, MERGE));
      const tag = own ? (emph ? "e-" : "g-") : "o-";
      for (const g of cluster(groupOverlaps(list, MERGE), MERGE)) {
        if (g.items.length === 1) {
          const it = g.items[0];
          markers.push({ kind: "single", key: it.q.p.id, p: it.q.p, x: it.x, y: it.y, own, hl: it.q.hl, emph });
        } else {
          const bx = g.items.map((it) => it.q.b.x);
          const by = g.items.map((it) => it.q.b.y);
          const x0 = Math.min(...bx);
          const y0 = Math.min(...by);
          markers.push({
            kind: "group",
            key: tag + g.items.map((it) => it.q.p.id).join("-"),
            items: g.items.map((it) => it.q.p),
            x: g.x,
            y: g.y,
            own,
            emph,
            hl: g.items.some((it) => it.q.hl),
            bbox: { x: x0, y: y0, w: Math.max(...bx) - x0, h: Math.max(...by) - y0 },
          });
        }
      }
    };
    makeGroups(false, false); // 흐린 점이 아래
    makeGroups(true, false);
    makeGroups(true, true); // 거점 점은 위에
    const hlPt = pts.find((q) => q.hl);
    if (hlPt) {
      const sp = toScreen(hlPt.b, vw);
      if (onScreen(sp, R_HL)) markers.push({ kind: "single", key: hlPt.p.id, p: hlPt.p, x: sp.x, y: sp.y, own: true, hl: true, emph: hlPt.emph });
    }

    // 이미 차지한 자리: 점, 묶음 점, 모서리의 방위표·축척(왼쪽 위), 오른쪽 위 단추, 안쪽 범례
    const radiusOf = (m: Marker) => (m.kind === "group" ? R_BUBBLE : m.hl ? R_HL + 3 : m.emph ? R_EMPH : m.own ? R_OWN : R_OTHER);
    const taken: Rect[] = markers.map((m) => {
      const r = radiusOf(m) + 1;
      return { x: m.x - r, y: m.y - r, w: r * 2, h: r * 2 };
    });
    taken.push({ x: 0, y: 0, w: Math.max(sc.px, 40) + 70, h: 64 });
    if (interactive) taken.push({ x: w - CTRL.right - CTRL.w - 4, y: 0, w: CTRL.right + CTRL.w + 4, h: CTRL.top + CTRL.h + 4 });
    if (size.legend) taken.push({ x: size.legend.x - 4, y: size.legend.y - 4, w: size.legend.w + 8, h: size.legend.h + 8 });

    // 권역 이름(경주 전체): 권역 안의 빈자리 가운데 무게중심에 가장 가까운 곳. 자리가 없으면 숨긴다(위 알약으로도 갈 수 있다).
    const areaTags: AreaTag[] = [];
    if (areaMode) {
      for (const a of shapes.areaShapes) {
        const rings = a.rings.map((r) => r.map((q) => toScreen(q, vw)));
        const tw = textWidth(a.label, afs, true) + 20;
        const th = Math.round(afs * 1.8);
        const pick = placeInPolygon(rings, toScreen(a.c, vw), tw, th, taken, w, h);
        if (pick) {
          areaTags.push({ ...pick, key: a.key, label: a.label });
          taken.push(pick);
        }
      }
    }

    // 관광지 이름표: 강조한 곳 → 거점 → 내 점 → 흐린 점 순서로, 겹치면 숨긴다
    const labelList: Label[] = [];
    const lh = Math.round(fs * 1.4);
    const tryLabel = (m: Single, force: boolean) => {
      const bold = m.hl || m.emph;
      const tw = textWidth(m.p.name, fs, bold) + 8;
      const r = radiusOf(m);
      let rect = placeLabel(m.x, m.y, r, tw, lh, taken, w, h);
      if (!rect && force) rect = { x: Math.min(Math.max(m.x + r + 4, 2), w - tw - 2), y: m.y - lh / 2, w: tw, h: lh };
      if (rect) {
        labelList.push({
          ...rect,
          key: m.key,
          text: m.p.name,
          tone: m.hl ? "hl" : m.emph ? "emph" : m.own ? "own" : "other",
          dim: emphOn && m.own && !m.emph && !m.hl,
        });
        taken.push(rect);
      }
    };
    const singles = markers.filter((m): m is Single => m.kind === "single");
    singles.filter((m) => m.hl).forEach((m) => tryLabel(m, true));
    singles.filter((m) => !m.hl && m.emph).forEach((m) => tryLabel(m, false));
    if (labels) {
      singles.filter((m) => !m.hl && !m.emph && m.own).forEach((m) => tryLabel(m, false));
      singles.filter((m) => !m.own).forEach((m) => tryLabel(m, false));
    }

    // 읍면동 이름(권역 지도에서만): 가장 뒤, 빈자리가 있을 때만
    const unitTags: UnitTag[] = [];
    if (!areaMode) {
      const uh = Math.round(ufs * 1.4);
      for (const u of shapes.unitList) {
        const c = toScreen(u.c, vw);
        const tw = textWidth(u.name, ufs) + 6;
        const r = { x: c.x - tw / 2, y: c.y - uh / 2, w: tw, h: uh };
        if (insideFrame(r, w, h) && !taken.some((t) => overlaps(t, r, 4))) {
          unitTags.push({ ...r, key: u.name, text: u.name });
          taken.push(r);
        }
      }
    }

    return { markers, labelList, areaTags, unitTags, sc, lh };
  }, [size, fit, shapes, pts, vw, basePxKm, areaMode, labels, interactive, emphOn]);

  // ── 정보 창 ─────────────────────────────────────────────
  const [sel, setSel] = useState<Sel>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const panelTitleRef = useRef<HTMLParagraphElement>(null);
  const [focusArea, setFocusArea] = useState<AreaKey | null>(null);

  useEffect(() => {
    if (sel) panelTitleRef.current?.focus();
  }, [sel]);

  const close = useCallback(() => {
    setSel(null);
    const op = openerRef.current;
    if (op && document.contains(op)) op.focus();
    else frameRef.current?.focus();
  }, []);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape" && sel) {
      e.stopPropagation();
      close();
    }
  };

  // ── 확대·축소 ───────────────────────────────────────────
  const zoomBy = (f: number) => size && setVw((v) => zoomAt(v, v.k * f, size.w / 2, size.h / 2, size.w, size.h, maxK));
  const canIn = vw.k < maxK - 1e-6;
  const canOut = vw.k > 1 + 1e-6;

  const onGroup = (g: Group, el: HTMLElement) => {
    if (!size) return;
    if (vw.k >= maxK - 1e-6) {
      openerRef.current = el;
      setSel({ kind: "list", ids: g.items.map((p) => p.id) });
      return;
    }
    setVw((v) => zoomToRect(v, g.bbox, size.w, size.h, maxK, 72));
  };

  const pickPlace = (id: string) => {
    setSel({ kind: "place", id });
    onSelectPlace?.(id);
  };
  const onPlace = (p: Place, el: HTMLElement) => {
    openerRef.current = el;
    pickPlace(p.id);
  };

  // ── 끌기(포인터) ────────────────────────────────────────
  const drag = useRef<{ id: number; x: number; y: number; v: View; f: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || !size || e.button !== 0 || vw.k <= 1 + 1e-6) return;
    if ((e.target as HTMLElement).closest(`.${s.controls}`)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, v: vw, f: size.w / (rect.width || size.w), moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !size) return;
    const dx = (e.clientX - d.x) * d.f;
    const dy = (e.clientY - d.y) * d.f;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      d.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setVw(clampView({ k: d.v.k, tx: d.v.tx + dx, ty: d.v.ty + dy }, size.w, size.h, maxK));
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved && !cancelled) {
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
    }
    drag.current = null;
    setDragging(false);
  };
  const onClickCapture = (e: ReactMouseEvent) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick.current = false;
    }
  };

  const onAreaClick = (e: ReactMouseEvent<Element>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    router.push(href);
  };
  const onAreaKey = (e: ReactKeyboardEvent<Element>, key: AreaKey) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAreaSelect?.(key);
    }
  };

  // ── 그리기 ─────────────────────────────────────────────
  const selPlace = sel?.kind === "place" ? places.find((p) => p.id === sel.id) : undefined;
  const selList = sel?.kind === "list" ? sel.ids.map((id) => places.find((p) => p.id === id)).filter((p): p is Place => !!p) : [];
  const t = `translate(${vw.tx} ${vw.ty}) scale(${vw.k})`;
  const hlPlace = highlightId ? places.find((p) => p.id === highlightId) : undefined;

  // 높이: height를 주면 그대로. 아니면 경계 상자 비율(높이 상한 72vh에 걸리면 폭도 같은 비율로 줄여 지도가 잘리지 않게).
  // 넓은 칸(.big)에서는 CSS가 폭 100%, 높이 69.3rem으로 바꾼다.
  const frameStyle = (
    height
      ? { height }
      : { "--map-ar": `${Math.round(frameAspect * 1000)} / 1000`, "--map-arn": frameAspect.toFixed(3) }
  ) as React.CSSProperties;
  const frameRole = interactive || selectMode ? "group" : "img";

  const dotClass = (m: Single) => cn(s.dot, m.hl ? s.dotHl : !m.own ? s.dotOther : m.p.registered ? s.dotOn : s.dotOff);

  return (
    <div className={cn(s.root, big && s.big)} onKeyDown={onKeyDown}>
      {/* 글자 크기 재기용(보이지 않음) */}
      <div ref={probeRef} className={s.probe} aria-hidden="true">
        <span className={s.label}>가</span>
        <span className={s.areaProbe}>가</span>
        <span className={s.unitProbe}>가</span>
      </div>

      <div
        ref={frameRef}
        className={cn(
          s.frame,
          height ? s.frameFixed : s.frameAspect,
          plain && s.plain,
          canOut && interactive && s.zoomed,
          dragging && s.dragging,
        )}
        style={frameStyle}
        role={frameRole}
        aria-label={ariaLabel ?? (hlPlace && !interactive ? hlPlace.name : view === "full" ? "경주" : areaByKey(view)?.label)}
        tabIndex={-1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, false)}
        onPointerCancel={(e) => endDrag(e, true)}
        onClickCapture={onClickCapture}
      >
        {size && shapes && layout && (
          <>
            <svg className={s.svg} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden={areaMode ? undefined : true}>
              {!areaMode && (
                <g transform={t}>
                  {shapes.unitList.map((u) => (
                    <path
                      key={u.name}
                      d={u.d}
                      className={cn(s.unit, u.area === view && s.unitHere, u.area === view && s[`fill_${u.area}`])}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
              )}
              {areaMode &&
                shapes.areaShapes.map((a) => {
                  const picked = selectedArea === a.key;
                  const path = (
                    <path
                      d={a.d}
                      transform={t}
                      className={cn(
                        s.areaShape,
                        s[`fill_${a.key}`],
                        (focusArea === a.key || (selectMode && picked)) && s.areaShapeOn,
                        selectMode && !!selectedArea && !picked && s.areaDim,
                      )}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                  const focusProps = {
                    onFocus: (e: React.FocusEvent<Element>) => setFocusArea(e.currentTarget.matches(":focus-visible") ? a.key : null),
                    onBlur: () => setFocusArea(null),
                  };
                  return selectMode ? (
                    <g
                      key={a.key}
                      role="button"
                      tabIndex={0}
                      aria-label={a.label}
                      aria-pressed={picked}
                      className={s.areaLink}
                      onClick={() => onAreaSelect?.(a.key)}
                      onKeyDown={(e) => onAreaKey(e, a.key)}
                      {...focusProps}
                    >
                      {path}
                    </g>
                  ) : (
                    <a key={a.key} href={`/map/${a.key}`} aria-label={a.label} className={s.areaLink} onClick={(e) => onAreaClick(e, `/map/${a.key}`)} {...focusProps}>
                      {path}
                    </a>
                  );
                })}
              {areaMode && (
                <g transform={t} aria-hidden="true">
                  {shapes.unitList.map((u) => (
                    <path key={u.name} d={u.d} className={s.unitLine} vectorEffect="non-scaling-stroke" />
                  ))}
                </g>
              )}
              {layout.areaTags.map((a) => (
                <g
                  key={a.key}
                  className={cn(s.areaTag, (focusArea === a.key || (selectMode && selectedArea === a.key)) && s.areaTagOn)}
                  style={{ "--c": areaColorVar(a.key) } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <rect x={a.x} y={a.y} width={a.w} height={a.h} rx={a.h / 2} />
                  <text x={a.x + a.w / 2} y={a.y + a.h / 2} textAnchor="middle" dominantBaseline="central">
                    {a.label}
                  </text>
                </g>
              ))}
              {layout.unitTags.map((u) => (
                <text
                  key={u.key}
                  className={s.unitLabel}
                  x={u.x + u.w / 2}
                  y={u.y + u.h / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  aria-hidden="true"
                >
                  {u.text}
                </text>
              ))}
            </svg>

            <div className={s.overlay}>
              {layout.markers.map((m) => {
                const pos = { left: m.x, top: m.y };
                const dim = emphOn && m.own && !m.emph && !m.hl;
                if (m.kind === "group") {
                  const inner = <span className={cn(s.bubble, !m.own && s.bubbleOther, m.emph && s.bubbleEmph, m.hl && s.bubbleHl)}>{m.items.length}</span>;
                  return interactive ? (
                    <button
                      key={m.key}
                      type="button"
                      className={cn(s.hit, !m.own && s.hitOther, m.emph && s.hitEmph, dim && s.dim)}
                      style={pos}
                      aria-label={m.items.map((p) => p.name).join(", ")}
                      onClick={(e) => onGroup(m, e.currentTarget)}
                    >
                      {inner}
                    </button>
                  ) : (
                    <span key={m.key} className={cn(s.pin, !m.own && s.faint, dim && s.dim)} style={pos} aria-hidden="true">
                      {inner}
                    </span>
                  );
                }
                const dot = (
                  <span className={cn(s.dotWrap, m.emph && s.emph)}>
                    <span className={dotClass(m)} />
                  </span>
                );
                const selected = sel?.kind === "place" && sel.id === m.p.id;
                return interactive ? (
                  <button
                    key={m.key}
                    type="button"
                    className={cn(s.hit, !m.own && s.hitOther, m.emph && s.hitEmph, m.hl && s.hitHl, selected && s.selected, dim && s.dim)}
                    style={pos}
                    aria-label={m.p.name}
                    aria-expanded={selected}
                    aria-controls={selected ? panelId : undefined}
                    onClick={(e) => onPlace(m.p, e.currentTarget)}
                  >
                    {dot}
                  </button>
                ) : (
                  <span key={m.key} className={cn(s.pin, !m.own && s.faint, dim && s.dim)} style={pos} aria-hidden="true">
                    {dot}
                  </span>
                );
              })}
              {layout.labelList.map((l) => (
                <span
                  key={l.key}
                  className={cn(
                    s.label,
                    l.tone === "other" && s.labelOther,
                    l.tone === "hl" && s.labelHl,
                    l.tone === "emph" && s.labelEmph,
                    l.dim && s.dim,
                  )}
                  style={{ left: l.x, top: l.y, height: l.h, lineHeight: `${l.h}px` }}
                  aria-hidden="true"
                >
                  {l.text}
                </span>
              ))}
            </div>

            <div className={s.corner} aria-hidden="true">
              <span className={s.north}>
                <svg viewBox="0 0 16 20" width="16" height="20">
                  <path d="M8 0 L15 19 L8 14 L1 19 Z" />
                </svg>
                N
              </span>
              <span className={s.scale}>
                <span className={s.scaleBar} style={{ width: layout.sc.px }} />
                <span>{layout.sc.label}</span>
              </span>
            </div>
          </>
        )}

        {interactive && (
          <div className={s.controls}>
            <button type="button" className={s.ctrl} aria-label="확대" title="확대" aria-disabled={!canIn} onClick={() => canIn && zoomBy(STEP)}>
              <Icon name="plus" size={18} strokeWidth={2} />
            </button>
            <button type="button" className={s.ctrl} aria-label="축소" title="축소" aria-disabled={!canOut} onClick={() => canOut && zoomBy(1 / STEP)}>
              <Icon name="minus" size={18} strokeWidth={2} />
            </button>
            <button type="button" className={s.ctrl} aria-label="처음 크기" title="처음 크기" aria-disabled={!canOut} onClick={() => canOut && setVw(HOME)}>
              <Icon name="reset" size={18} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      {interactive && (selPlace || selList.length > 0) && (
        <section id={panelId} className={s.panel} aria-labelledby={titleId}>
          {selPlace ? (
            <>
              <p id={titleId} ref={panelTitleRef} className={s.panelTitle} tabIndex={-1}>
                {selPlace.name}
              </p>
              <p className={s.panelMeta}>
                <span className={s.panelArea} style={{ color: areaColorVar(areaOf(selPlace)) }}>
                  {areaByKey(areaOf(selPlace))?.label}
                </span>
                {selPlace.dong}
              </p>
              <p>
                <span className={cn(s.badge, selPlace.registered ? s.badgeOn : s.badgeOff)}>
                  <Ph>{selPlace.registered ? "무장애 정보 있음" : "무장애 정보 없음"}</Ph>
                </span>
              </p>
              <div className={s.panelActions}>
                <Link href={`/places/${selPlace.id}`} className={s.btnInk}>
                  자세히보기
                </Link>
                <button type="button" className={s.btnLine} onClick={close}>
                  닫기
                </button>
              </div>
            </>
          ) : (
            <>
              <p id={titleId} ref={panelTitleRef} className={s.panelTitle} tabIndex={-1}>
                전체: {selList.length}곳
              </p>
              <ul className={s.panelList}>
                {selList.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => pickPlace(p.id)}>
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className={s.panelActions}>
                <button type="button" className={s.btnLine} onClick={close}>
                  닫기
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {legend && (
        <ul ref={legendRef} className={s.legend} aria-label="범례">
          {(interactive || !hlPlace) && (
            <>
              <li>
                <span className={s.swatch} aria-hidden="true">
                  <span className={cn(s.dot, s.dotOn)} />
                </span>
                <Ph>정보가 적힌 곳</Ph>
              </li>
              <li>
                <span className={s.swatch} aria-hidden="true">
                  <span className={cn(s.dot, s.dotOff)} />
                </span>
                <Ph>정보가 없는 곳</Ph>
              </li>
            </>
          )}
          {emphasisIds !== undefined && (
            <li>
              <span className={s.swatch} aria-hidden="true">
                <span className={cn(s.dotWrap, s.emph)}>
                  <span className={cn(s.dot, s.dotOn)} />
                </span>
              </span>
              <Ph>거점 관광지</Ph>
            </li>
          )}
          <li>
            <span className={s.swatch} aria-hidden="true">
              <span className={cn(s.bubble, s.bubbleSwatch, !interactive && hlPlace && s.bubbleOther)} />
            </span>
            <Ph>가까이 모인 곳</Ph>
          </li>
          {areaMode && (
            <li>
              <span className={cn(s.swatch, s.swatchArea)} aria-hidden="true" />
              <Ph>{selectMode ? "색칠한 권역을 누르면 그 권역만 봅니다" : "색칠한 권역을 누르면 그 권역 지도로 갑니다"}</Ph>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
