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

/** 이 곳의 계단 없는 길 덩어리. 실리지 않은 곳은 null */
export function stepFreeOf(id: string): StepFreePlace | null {
  return SF.places.find((p) => p.id === id) ?? null;
}

export function stepFreeGroupOf(p: StepFreePlace): StepFreeGroup {
  return SF.meta.groups.find((g) => g.key === p.group)!;
}
