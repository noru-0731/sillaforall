// '계단 없는 길'(무장애 정보 > 계단 없는 길 쪽, 곳마다 무장애 정보 쪽 끝 절)의 자료. 서버 컴포넌트에서만 부른다.
// - stepfree.json: 만드는 곳 05_사이트/도구/19_계단없는길.py (곳 id, 묶음, 칸, 값, 출처).
// - 묶음 셋(무장애나눔길 / 데크길 / 평탄한 길)과 곳 차례는 자료 파일 차례 그대로.
// - 칸 차례는 한국산림복지진흥원 무장애나눔길 서비스 칸 차례(길이, 걸리는 시간, 노면, 경사, 계단, 쉼터, 화장실), 그 뒤 원문 칸 이름 줄.
// - 값은 관광공사 글이면 그대로, 그 밖(경주시·경상북도 누리집, 신문, 산림복지진흥원)은 사실만 짧게 옮겼다.
import raw from "./stepfree.json";

export type StepFreeRow = { k: string; v: string; src: string; field?: string };
export type StepFreeGroup = { key: string; label: string; ph: boolean };
export type StepFreePlace = { id: string; name: string; group: string; course: string | null; rows: StepFreeRow[] };
type Source = { name: string; line: string };

const SF = raw as unknown as {
  meta: { groups: StepFreeGroup[]; phLabels: string[]; sources: Record<string, Source> };
  places: StepFreePlace[];
};

export const STEPFREE_HREF = "/barrier-free/step-free";
export const STEPFREE_GROUPS = SF.meta.groups;
export const STEPFREE_PLACES = SF.places;

/** 새로 지은 칸 이름(점선으로 보인다) */
export const isPhLabel = (k: string) => SF.meta.phLabels.includes(k);

/** 칸마다 붙는 짧은 출처 이름. 원문 칸이 줄 칸과 다르면 괄호에 원문 칸 이름 */
export function sourceName(r: StepFreeRow): string {
  const n = SF.meta.sources[r.src]?.name ?? r.src;
  return r.field ? `${n}(${r.field})` : n;
}

/** 쪽 끝 출처 줄(자료 이름과 본 날짜). srcs 를 주면 그 출처만, 자료 파일 차례대로 */
export function stepFreeSourceLines(srcs?: Iterable<string>): string[] {
  const set = srcs ? new Set(srcs) : null;
  return Object.entries(SF.meta.sources)
    .filter(([k]) => !set || set.has(k))
    .map(([, s]) => s.line);
}

/**
 * 자료 출처 쪽(/about/sources) '계단 없는 길' 표의 칸(자료, 제공 기관, 이용허락, 기준일, 주소). 차례는 쪽 끝 출처 줄과 같은 자료 파일 차례.
 * 이용허락은 공공데이터포털 쪽의 '이용허락범위' 값, 그런 칸이 없는 누리집·신문은 그 쪽 바닥글·기사 끝에 적힌 글 그대로.
 * 경주시 누리집 두 쪽은 공공누리 표시가 없어 이미 쓰는 점선 글(licensePh).
 * 자료 칸과 기준일 칸은 쪽 끝 출처 줄(line) "자료: 이름(…)"을 나눠 쓴다(09-27 점검: 짧은 이름 name 은 출처 줄과 글이 달라 쓰지 않는다).
 * 끝 괄호 안의 날짜 조각('YYYY-MM-DD 기준·받음·확인')은 기준일 칸에, 나머지 조각(포털 번호, 기사 제목)은 자료 칸 괄호에 그대로 남긴다.
 * 확인: 05_사이트/도구/cache/출처확인/(2026-09-26 받은 쪽), 산림복지 서비스 바닥글은 첫 쪽(smartapp.fowi.or.kr/cmrd)을 화면으로 열어 읽음.
 * link false 는 주소를 글자로만(경주시 누리집으로 가는 링크는 싣지 않는다, 자료 출처 쪽 '경주시 문화관광' 칸과 같음).
 */
export type StepFreeSourceInfo = { provider: string; license: string; licensePh?: boolean; url: string; link: boolean };
const SOURCE_INFO: Record<string, StepFreeSourceInfo> = {
  fowi: {
    provider: "한국산림복지진흥원",
    license: "COPYRIGHTⒸ 산림청 SINCE1967. ALL RIGHTS RESERVED.",
    url: "https://smartapp.fowi.or.kr/cmrd/detail/41",
    link: true,
  },
  fowiFile: {
    provider: "한국산림복지진흥원",
    license: "이용허락범위 제한 없음",
    url: "https://www.data.go.kr/data/15063418/fileData.do",
    link: true,
  },
  tour: {
    provider: "한국관광공사",
    license: "이용허락범위 제한 없음",
    url: "https://www.data.go.kr/data/15101578/openapi.do",
    link: true,
  },
  korwith: {
    provider: "한국관광공사",
    license: "이용허락범위 제한 없음",
    url: "https://www.data.go.kr/data/15101897/openapi.do",
    link: true,
  },
  gjbf: {
    provider: "경주시",
    license: "누리집 쪽에 공공누리 표시 없음",
    licensePh: true,
    url: "https://www.gyeongju.go.kr/tour/page.do?mnu_uid=4840",
    link: false,
  },
  gjWalk: {
    provider: "경주시",
    license: "누리집 쪽에 공공누리 표시 없음",
    licensePh: true,
    url: "https://www.gyeongju.go.kr/tour/page.do?mnu_uid=4740",
    link: false,
  },
  gbTour: {
    provider: "경상북도",
    license: "Copyright ⓒ 2020 Gyeongsangbuk-do all rights reserved.",
    url: "https://tour.gb.go.kr/tip/storyView.do?idx=16126",
    link: true,
  },
  idaegu: {
    provider: "대구일보",
    license: "저작권자 © 대구일보 무단전재 및 재배포 금지",
    url: "https://www.idaegu.com/news/articleView.html?idxno=638085",
    link: true,
  },
};

/** 자료 출처 쪽 표 줄(쪽 끝 출처 줄과 같은 자료, 같은 차례). 칸 값이 없는 자료가 있으면 멈춘다(자료 파일에 새 출처가 생긴 때) */
export function stepFreeSourceRows(): ({ key: string; name: string; refDate: string } & StepFreeSourceInfo)[] {
  return Object.entries(SF.meta.sources).map(([key, src]) => {
    const info = SOURCE_INFO[key];
    const cut = splitSourceLine(src.line);
    if (!info || !cut) throw new Error(`stepfree.ts: 자료 출처 쪽 칸 값이나 날짜가 없는 출처 ${key}`);
    return { key, ...cut, ...info };
  });
}

/** 출처 줄 "자료: 이름(조각, 조각, …)" → 자료 칸(이름 + 날짜 아닌 조각), 기준일 칸(날짜 조각들). 끝 괄호나 날짜 조각이 없으면 null */
function splitSourceLine(line: string): { name: string; refDate: string } | null {
  const m = line.replace(/^자료:\s*/, "").match(/^(.*)\(([^()]*)\)$/);
  if (!m) return null;
  const parts = m[2].split(/,\s*/);
  const isDate = (p: string) => /^\d{4}-\d{2}-\d{2} (기준|받음|확인)$/.test(p);
  const dates = parts.filter(isDate);
  const rest = parts.filter((p) => !isDate(p));
  if (!dates.length) return null;
  return { name: rest.length ? `${m[1]}(${rest.join(", ")})` : m[1], refDate: dates.join(", ") };
}

/** 이 곳의 계단 없는 길 덩어리. 실리지 않은 곳은 null */
export function stepFreeOf(id: string): StepFreePlace | null {
  return SF.places.find((p) => p.id === id) ?? null;
}

export function stepFreeGroupOf(p: StepFreePlace): StepFreeGroup {
  return SF.meta.groups.find((g) => g.key === p.group)!;
}
