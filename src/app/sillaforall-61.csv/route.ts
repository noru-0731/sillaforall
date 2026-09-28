// 관광지 61곳 무장애 정보 표(CSV) 내려받기. 자료 출처와 저작권 쪽(/about/sources#sillaforall)에서 건다(09-28 밤, 서식4 파급력 "다른 기관이 가져다 쓸 수 있는가").
// 칸 값은 관광지 서브메인 관람 도우미와 같은 차례로 만든다: 한국관광공사 무장애 여행 정보 글 → 없으면 data/fill.ts 로 채운 값.
// 그래서 화면과 표가 어긋나지 않는다. 칸마다 그 값을 가져온 자료 이름을 옆 칸에 적는다(관광공사 글과 채운 값 구별).
// 칸 이름은 사이트 칸 이름(주차·접근로·화장실·가까운 장애인 화장실·문의 전화)과 자료 이름 그대로다. 빌드 때 한 번 만든다.
import { places } from "@/data";
import type { Place } from "@/data";
import { parkingFill, toiletFill, walkFill, type Fill } from "@/data/fill";
import { nearestWithin, SOURCES } from "@/data/bf";
import { GJ_SOURCE } from "@/data/gj";
import { gugseokUrl } from "@/data/gugseok";

export const dynamic = "force-static";

const SITE = "https://sillaforall.vercel.app";
const BF_NAME = "한국관광공사 무장애 여행 정보";
const SIDE = { old: "노년층 중심", mid: "세대 공통", young: "청년층 중심" } as const;
// 보완 순서는 서식4 본문과 같게(09-29): 보완 우선순위 16곳(문무대왕릉, 노년층 중심 미등록 13곳, 기본 3항목을 못 채운 기림사·옥산서원)을
// 데이터랩 「관광지별 분석」 내비게이션 목적지 검색량(2026년 1~8월 합) × 60대 이상 비중(집중률) 큰 순으로 1~16.
// 화랑의언덕은 검색량 자료가 없어 끝. 계산은 04_분석_경주 노년/12차/산출/전국_검색량(fetch.mjs, gj61.py)
const ORDER: Record<string, number> = { p29: 1, p04: 2, p08: 3, p09: 4, p02: 5, p10: 6, p16: 7, p06: 8, p14: 9, p03: 10, p17: 11, p05: 12, p18: 13, p12: 14, p07: 15, p01: 16 };

const srcName = (key: string) => (SOURCES as Record<string, { name: string }>)[key]?.name ?? key;

/** 채운 값의 자료 이름. near 는 그 칸을 채운 가까운 편의시설의 자료 */
function fillSource(fill: Fill, near: { src: string } | null): string {
  if (fill.src === "gj") return GJ_SOURCE.name;
  if (fill.src === "tour") return "한국관광공사 관광정보";
  // 가까운 편의시설로 채운 값: 사이트 꼬리 '(편의시설 자료)'와 같은 이름 뒤에 그 편의시설의 자료 이름
  return near ? `편의시설 자료(${srcName(near.src)})` : "";
}

/** 관람 도우미 한 칸: [값, 자료] */
function cell(own: string | null, fill: Fill | null, near: { src: string } | null): [string, string] {
  if (own?.trim()) return [own, BF_NAME];
  if (fill) return [fill.text, fillSource(fill, near)];
  return ["", ""];
}

function row(p: Place): string[] {
  const parking = cell(p.three.parking, parkingFill(p), nearestWithin(p.id, "parking", 500));
  const walk = cell(p.three.walk, walkFill(p), null);
  const toilet = cell(p.three.toilet, toiletFill(p), nearestWithin(p.id, "toiletA", 1000));
  const t = p.approx ? null : nearestWithin(p.id, "toiletA", 1000);
  return [
    p.name,
    p.address ?? "",
    p.contact ?? "",
    SIDE[p.side],
    p.registered ? "등록" : "미등록",
    ORDER[p.id] ? String(ORDER[p.id]) : "",
    ...parking,
    ...walk,
    ...toilet,
    t ? (t.name ?? "") : "",
    t ? String(t.distanceM) : "",
    t ? srcName(t.src) : "",
    `${SITE}/places/${p.id}`,
    gugseokUrl(p.id) ?? "",
  ];
}

const HEAD = [
  "관광지",
  "주소",
  "문의 전화",
  "구분(2026년 1~8월)",
  "한국관광공사 무장애 여행 정보(2026-09-13 목록)",
  "보완 순서",
  "주차",
  "주차 자료",
  "접근로",
  "접근로 자료",
  "화장실",
  "화장실 자료",
  "가까운 장애인 화장실(직선 1km 안)",
  "직선거리(m)",
  "가까운 장애인 화장실 자료",
  "누구나 신라 주소",
  "대한민국 구석구석 주소(관광정보 수정요청)",
];

const esc = (v: string) => {
  const s = v.replace(/\s*\n\s*/g, " / ").trim();
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const lines = [HEAD, ...places.map(row)].map((r) => r.map(esc).join(","));
  // 엑셀에서 한글이 깨지지 않게 BOM을 앞에 붙인다
  return new Response("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent("누구나신라_관광지61곳_무장애정보.csv"),
    },
  });
}
