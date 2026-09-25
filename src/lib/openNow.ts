// 지금 운영 상태 한 줄(페르소나 장점 취합 가4). 카카오맵·네이버 장소 이름 아래 "운영 전 · 10:00 오픈" 자리.
// 관광공사 관광정보의 이용시간(hours)·쉬는 날(closed) 글을 규칙으로 읽고, 브라우저에서 한국 시각으로 지금 상태를 셈한다.
// 글이 사람이 쓴 문장이라 규칙으로 읽을 수 없는 곳은 아무것도 보이지 않는다(틀린 상태를 보이지 않으려고).
//
// 읽는 규칙(parseOpenRule, 서버에서 한 번):
// - 이용시간: "상시 개방" 한 줄, 또는 "09:00~18:00"(뒤에 "(입장 마감 17:00)"가 붙을 수 있음) 줄.
//   줄이 여럿이면 줄마다 "(4월~9월)"처럼 달이 적혀 있어야 하고, 달이 겹치지 않아야 한다(하절기·동절기).
//   끝의 "※ 자세한 사항은 전화 문의 요망"은 시각을 바꾸지 않는 글이라 떼고 읽는다. 그 밖의 ※ 글, 시설마다 다른 시각
//   ("- 식물원 …", "[화랑전시관]…"), "익일", 달이 없는 하절기·동절기 줄은 읽지 않는다.
// - 쉬는 날: "연중무휴"(또는 "연중 무휴"), 또는 " / "로 나뉜 조각. 읽는 조각은 "매주 월요일", "1월 1일", "설·추석 당일", "설·추석 연휴".
//   그 밖의 조각("전시 교체 기간" 등)이 있으면 쉬는 날을 다 안다고 보지 않는다. ※·괄호·쌍점·"- "가 든 글(시설마다 다른 쉬는 날,
//   "단, …" 풀이)은 조각도 믿지 않는다.
//
// 셈(evaluateOpen, 브라우저에서 분마다):
// - 읽은 쉬는 날 조각에 오늘이 걸리면 "쉬는 날"(이용시간을 못 읽어도).
// - 아니면 이용시간과 쉬는 날을 모두 읽은 곳만: 여는 시각 전 "운영 전", 여는 동안 "운영 중", 입장 마감 뒤 닫기 전 "입장 마감", 닫은 뒤 "운영 종료".
// - 설·추석은 브라우저의 한국 음력 달력(Intl "dangi")으로 셈한다. 달력이 없는 브라우저에서는 설·추석 조각을 모르는 것으로 본다.
//   연휴는 설날·추석 전날, 당일, 다음 날이다(대체공휴일은 셈하지 않는다).
// 이 파일은 다른 파일을 부르지 않는다(서버·브라우저 어디서나, node 로 바로 시험할 수 있게).

/** 하루 가운데 분(0~1439) */
type Min = number;

export type OpenSeason = { months: number[] | null; open: Min; close: Min; last: Min | null };
export type OpenHours = { kind: "always" } | { kind: "ranges"; seasons: OpenSeason[] } | null;
export type ClosedToken =
  | { kind: "weekly"; day: number } // 0 일요일 … 6 토요일
  | { kind: "date"; month: number; day: number }
  | { kind: "lunarDay" } // 설날·추석 당일
  | { kind: "lunarHoliday" }; // 설날·추석 전날·당일·다음 날
/** none: 쉬는 날 없음. tokens: 읽은 조각. complete: 쉬는 날을 다 읽었는지(모르는 조각이 없음) */
export type OpenClosed = { none: true } | { none: false; tokens: ClosedToken[]; complete: boolean };
export type OpenRule = { hours: OpenHours; closed: OpenClosed };

export type OpenState = "open" | "before" | "lastEntry" | "after" | "closed";
/** 화면 글: 카카오맵·네이버 장소의 상태 이름, "입장 마감"은 관광정보 글의 말, "쉬는 날"은 우리 관람 도우미 칸 이름 */
export const OPEN_LABEL: Record<OpenState, string> = {
  open: "운영 중",
  before: "운영 전",
  lastEntry: "입장 마감",
  after: "운영 종료",
  closed: "쉬는 날",
};

const WEEK = "일월화수목금토";
const hm = (h: string, m: string): Min => Number(h) * 60 + Number(m);
const pad = (n: number) => String(n).padStart(2, "0");
export const fmtMin = (m: Min) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** "10월~3월" → [10, 11, 12, 1, 2, 3] */
function monthSpan(a: number, b: number): number[] | null {
  if (a < 1 || a > 12 || b < 1 || b > 12) return null;
  const out: number[] = [];
  for (let m = a; ; m = (m % 12) + 1) {
    out.push(m);
    if (m === b) break;
  }
  return out;
}

const LINE =
  /^(?:-\s*)?(?:(?:하절기|동절기)\s*)?(?:\((\d{1,2})월~(\d{1,2})월\)\s*)?(\d{2}):(\d{2})~(\d{2}):(\d{2})(?:\s*\(입장 마감 (\d{2}):(\d{2})\))?$/;

function parseHours(t: string | null): OpenHours {
  if (!t) return null;
  const text = t
    .replace(/※\s*자세한 사항은 전화\s?문의 요망\s*$/, "")
    // 붙은 줄 나누기(lib/breaks.ts hoursLines 와 같은 규칙)
    .replace(/(\S)([ \t]*)(- |\[)/g, "$1$2\n$3");
  if (text.includes("※")) return null;
  const lines = text
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  if (lines.length === 1 && lines[0] === "상시 개방") return { kind: "always" };
  if (!lines.length) return null;
  const seasons: OpenSeason[] = [];
  for (const line of lines) {
    const m = line.match(LINE);
    if (!m) return null;
    const months = m[1] ? monthSpan(Number(m[1]), Number(m[2])) : null;
    if (m[1] && !months) return null;
    const open = hm(m[3], m[4]);
    const close = hm(m[5], m[6]);
    const last = m[7] ? hm(m[7], m[8]) : null;
    if (!(open < close) || close > 24 * 60 || (last !== null && !(open < last && last <= close))) return null;
    seasons.push({ months, open, close, last });
  }
  if (seasons.length > 1) {
    // 여러 줄이면 줄마다 달이 있어야 하고 달이 겹치지 않아야 한다
    if (seasons.some((x) => !x.months)) return null;
    const seen = new Set<number>();
    for (const x of seasons)
      for (const mo of x.months!) {
        if (seen.has(mo)) return null;
        seen.add(mo);
      }
  }
  return { kind: "ranges", seasons };
}

function parseClosed(t: string | null): OpenClosed {
  if (!t) return { none: false, tokens: [], complete: false };
  const text = t.trim();
  if (/^연중\s?무휴$/.test(text)) return { none: true };
  if (/[※:()\n]/.test(text) || text.startsWith("-")) return { none: false, tokens: [], complete: false };
  const tokens: ClosedToken[] = [];
  let complete = true;
  for (const part of text.split(/\s*\/\s*/)) {
    const w = part.match(/^매주 ([일월화수목금토])요일$/);
    const d = part.match(/^(\d{1,2})월 (\d{1,2})일$/);
    if (w) tokens.push({ kind: "weekly", day: WEEK.indexOf(w[1]) });
    else if (d) tokens.push({ kind: "date", month: Number(d[1]), day: Number(d[2]) });
    else if (part === "설·추석 당일") tokens.push({ kind: "lunarDay" });
    else if (part === "설·추석 연휴") tokens.push({ kind: "lunarHoliday" });
    else complete = false;
  }
  return { none: false, tokens, complete };
}

/** 이용시간·쉬는 날 글 → 셈 규칙(서버에서 만들어 브라우저 부품에 넘긴다) */
export function parseOpenRule(hours: string | null, closed: string | null): OpenRule {
  return { hours: parseHours(hours), closed: parseClosed(closed) };
}

/** 이 규칙으로 무엇이든 보일 수 있는지(쉬는 날 조각이라도 읽었는지) */
export function ruleShowsAnything(r: OpenRule): boolean {
  return (!r.closed.none && r.closed.tokens.length > 0) || (!!r.hours && (r.closed.none || r.closed.complete));
}

// ── 한국 시각 ──
const SEOUL = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

type Parts = { month: number; day: number; weekday: number; min: Min };
function seoulParts(d: Date): Parts {
  const p = Object.fromEntries(SEOUL.formatToParts(d).map((x) => [x.type, x.value]));
  return { month: Number(p.month), day: Number(p.day), weekday: WD[p.weekday] ?? -1, min: Number(p.hour) * 60 + Number(p.minute) };
}

// 한국 음력(단기 달력). 윤달은 "6bis"처럼 나와 숫자로 읽히지 않는다(설날·추석은 윤달이 아니다).
let LUNAR: Intl.DateTimeFormat | null | undefined;
function lunarFmt(): Intl.DateTimeFormat | null {
  if (LUNAR !== undefined) return LUNAR;
  try {
    const f = new Intl.DateTimeFormat("en-US-u-ca-dangi", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" });
    LUNAR = f.resolvedOptions().calendar === "dangi" ? f : null;
  } catch {
    LUNAR = null;
  }
  return LUNAR;
}
function lunarMD(d: Date): [string, string] | null {
  const f = lunarFmt();
  if (!f) return null;
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return [p.month, p.day];
}
const DAY = 24 * 60 * 60 * 1000;
/** 설날·추석 당일인지. 음력 달력이 없으면 null */
function isLunarDay(d: Date): boolean | null {
  const md = lunarMD(d);
  if (!md) return null;
  return (md[0] === "1" && md[1] === "1") || (md[0] === "8" && md[1] === "15");
}
/** 설날·추석 전날·당일·다음 날인지 */
function isLunarHoliday(d: Date): boolean | null {
  const a = isLunarDay(new Date(d.getTime() - DAY));
  const b = isLunarDay(d);
  const c = isLunarDay(new Date(d.getTime() + DAY));
  if (a === null || b === null || c === null) return null;
  return a || b || c;
}

/** 지금 상태와 오늘 적용되는 시각(쉬는 날·상시 개방이면 null). 셈할 수 없으면 null */
export function evaluateOpen(r: OpenRule, now: Date): { state: OpenState; range: string | null } | null {
  const t = seoulParts(now);
  let complete = r.closed.none || r.closed.complete;
  if (!r.closed.none) {
    for (const k of r.closed.tokens) {
      let hit: boolean | null = false;
      if (k.kind === "weekly") hit = t.weekday === k.day;
      else if (k.kind === "date") hit = t.month === k.month && t.day === k.day;
      else if (k.kind === "lunarDay") hit = isLunarDay(now);
      else hit = isLunarHoliday(now);
      if (hit) return { state: "closed", range: null };
      if (hit === null) complete = false;
    }
  }
  if (!complete || !r.hours) return null;
  if (r.hours.kind === "always") return { state: "open", range: null };
  const hits = r.hours.seasons.filter((x) => !x.months || x.months.includes(t.month));
  if (hits.length !== 1) return null;
  const s = hits[0];
  const range = `${fmtMin(s.open)}~${fmtMin(s.close)}`;
  if (t.min < s.open) return { state: "before", range };
  if (t.min >= s.close) return { state: "after", range };
  if (s.last !== null && t.min >= s.last) return { state: "lastEntry", range };
  return { state: "open", range };
}
