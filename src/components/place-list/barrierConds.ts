// 무장애 조건으로 관광지 거르기: 관광지마다 어느 항목을 "있다고 적힌 곳"으로 치는지 가른다.
// 가르는 규칙과 판정한 글 전체는 05_사이트/레퍼런스/궁능_포맷/04_무장애_거르기_규칙.md 에 적었다(규칙을 바꾸면 그 문서도 같이).
// 이 파일은 형(type)만 부르고 places.json을 부르지 않는다. 서버·클라이언트 어디서나 쓴다.
import type { Place } from "@/data/types";

/** 거르기 단추 다섯. 대중교통은 명부에 글이 있는 곳이 2곳뿐이라 단추로 두지 않는다. */
export const COND_KEYS = ["parking", "walk", "toilet", "wheelchair", "elevator"] as const;
export type CondKey = (typeof COND_KEYS)[number];

/** 단추 이름: 사이트가 이미 쓰는 항목 이름(세 상자 이름 + 무장애 정보 표의 칸 이름) */
export const COND_LABEL: Record<CondKey, string> = {
  parking: "주차",
  walk: "접근로",
  toilet: "화장실",
  wheelchair: "휠체어대여",
  elevator: "엘리베이터",
};

/** 판정에 쓰는 글. 주차·걷는 길·화장실은 세 상자와 같은 글(걷는 길 = 접근로, 비면 출입통로), 휠체어·엘리베이터는 명부 칸 글. */
export function condText(p: Place, k: CondKey): string | null {
  switch (k) {
    case "parking":
      return p.three.parking;
    case "walk":
      return p.three.walk;
    case "toilet":
      return p.three.toilet;
    case "wheelchair":
      return p.move["휠체어"] ?? null;
    case "elevator":
      return p.move["엘리베이터"] ?? null;
  }
}

/** 없다는 말. 이 말이 들어 있는 글은 사람이 읽고 KEEP에 올린 글이 아니면 "없음"으로 친다. */
export const NEG_WORDS = /없음|없다|없고|없어|없으|없는|없이|불가|미설치|아님|아니|어려|어렵/;
/** "턱이 없어", "단차 없음", "단차가 없고"는 걷기 편하다는 뜻이라 없다는 말을 찾기 전에 뗀다. */
export const NO_STEP = /(턱|단차)(이|가)?\s*없(음|고|어|는|이)?/g;

/**
 * 없다는 말이 들어 있지만 글 전체로는 시설이 있다고 적혀 있어 "있음"으로 친 글(2026-09-25 places.json을 읽고 정함).
 * frag는 원문 일부. 관광공사 글이 바뀌어 frag가 사라지면 다시 "없음"으로 떨어진다(다시 읽고 고칠 때까지).
 */
export const KEEP: { id: string; key: CondKey; frag: string }[] = [
  // 오릉 걷는 길: 보행로는 평지·경사로. 숭덕전·알영전만 계단이라 관람이 어려움
  { id: "p24", key: "walk", frag: "보행로는 평지" },
  // 월성 걷는 길: 보행로는 대부분 경사로·평탄한 흙길. 석빙고 안만 계단이라 휠체어 관람 불가
  { id: "p48", key: "walk", frag: "보행로는 대부분 경사로" },
  // 봉길대왕암해변 화장실: 주차장 화장실은 장애인 화장실이 아니고, 대피로 쪽 공중화장실이 장애인 화장실
  { id: "p21", key: "toilet", frag: "장애인 전용 화장실 있음" },
  // 보문호 화장실: 두 곳 가운데 상가 안 화장실만 이용 불가, 선착장 앞 화장실은 그런 말이 없음
  { id: "p53", key: "toilet", frag: "선착장 앞과" },
];

/** 이 관광지가 이 항목을 "있다고 적힌 곳"인지 */
export function hasCond(p: Place, k: CondKey): boolean {
  if (!p.registered) return false;
  const t = condText(p, k)?.trim();
  if (!t) return false;
  if (!NEG_WORDS.test(t.replace(NO_STEP, ""))) return true;
  return KEEP.some((x) => x.id === p.id && x.key === k && t.includes(x.frag));
}

/** 이 관광지가 "있다고 적힌" 항목들(COND_KEYS 차례) */
export function condsOf(p: Place): CondKey[] {
  return COND_KEYS.filter((k) => hasCond(p, k));
}

/** 고른 조건을 모두 갖췄는지(그리고). 고른 것이 없으면 참 */
export function meetsAll(have: readonly CondKey[] | undefined, want: readonly CondKey[]): boolean {
  if (want.length === 0) return true;
  if (!have) return false;
  return want.every((k) => have.includes(k));
}

// ── 주소 뒤 ?조건= ─────────────────────────────────────────
/** 주소 뒤 이름: ?조건=주차,접근로 */
export const COND_PARAM = "조건";
const squeeze = (s: string) => s.replace(/\s+/g, "");

/** ?조건= 값 → 조건 목록(COND_KEYS 차례, 모르는 값은 버림). 단추 이름(띄어쓰기 무시)과 영문 이름을 받는다. */
export function parseConds(raw: string | null | undefined): CondKey[] {
  if (!raw) return [];
  const parts = raw
    .split(/[,+|]/)
    .map((x) => squeeze(x))
    .filter(Boolean);
  return COND_KEYS.filter((k) => parts.some((x) => x === k || x === squeeze(COND_LABEL[k])));
}

/** 조건 목록 → ?조건= 값(단추 이름에서 띄어쓰기를 뺀 것, 쉼표로 이음) */
export function condsParam(keys: readonly CondKey[]): string {
  return COND_KEYS.filter((k) => keys.includes(k))
    .map((k) => squeeze(COND_LABEL[k]))
    .join(",");
}
