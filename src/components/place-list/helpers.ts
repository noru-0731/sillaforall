// 목록·무장애 쪽이 같이 쓰는 계산. 화면 문구는 여기 두지 않는다(문구는 쪽에서 <Ph>로 감싼다).
import { areaOf, areas, byName, type Area, type Place } from "@/data";
import { sectionOf, type NavItem } from "@/site/ia";

/** 주소 하나로 쪽 머리(왼쪽 메뉴, 경로, 제목)를 MENU에서 꺼낸다. 메뉴 이름을 다시 쓰지 않기 위해서. */
export function menuPage(href: string): { section: NavItem; title: string; crumbs: { label: string; href: string }[] } {
  const section = sectionOf(href);
  const child = section?.children?.find((c) => c.href === href);
  if (!section || !child) throw new Error(`메뉴에 없는 주소: ${href}`);
  return { section, title: child.label, crumbs: [{ label: section.label, href: section.href }] };
}

/** 권역 차례대로, 권역 안은 가나다순. 빈 권역은 뺀다. */
export function groupByArea(ps: Place[]): { area: Area; places: Place[] }[] {
  return areas
    .map((area) => ({ area, places: ps.filter((p) => areaOf(p) === area.key).sort(byName) }))
    .filter((g) => g.places.length > 0);
}

// 한글 음절의 첫소리(초성). 된소리(ㄲ ㄸ ㅃ ㅆ ㅉ)는 예사소리 묶음에 넣는다.
const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const PLAIN: Record<string, string> = { ㄲ: "ㄱ", ㄸ: "ㄷ", ㅃ: "ㅂ", ㅆ: "ㅅ", ㅉ: "ㅈ" };
export const INITIALS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

/** 이름 첫 글자의 초성. 한글 음절이 아니면 null */
export function initialOf(name: string): string | null {
  const code = name.trim().charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const cho = CHO[Math.floor((code - 0xac00) / 588)];
    return PLAIN[cho] ?? cho;
  }
  return null;
}

/** 가나다순 목록을 초성별로 묶는다. 한글이 아닌 이름은 맨 끝 한 묶음(initial = null). */
export function groupByInitial(ps: Place[]): { id: string; initial: string | null; places: Place[] }[] {
  const sorted = [...ps].sort(byName);
  const groups = INITIALS.map((ini, i) => ({
    id: `initial-${i}`,
    initial: ini as string | null,
    places: sorted.filter((p) => initialOf(p.name) === ini),
  }));
  groups.push({ id: "initial-etc", initial: null, places: sorted.filter((p) => initialOf(p.name) === null) });
  return groups.filter((g) => g.places.length > 0);
}

/** 무장애 세 항목 */
export const THREE_KEYS = ["parking", "walk", "toilet"] as const;
export type ThreeKey = (typeof THREE_KEYS)[number];
