// 사이트 정보 구조(메뉴). 이름은 모두 임시 문구다. 문구는 사용자에게 질문으로 정한다.
// 1차 = 헤더 메인 메뉴, 2차 = 펼침판·왼쪽 메뉴·탭, 3차 = 관광지 쪽.
import { areas, areaOf, byName, HUBS, places } from "@/data";
import type { Place } from "@/data";

export type NavItem = {
  label: string;
  href: string;
  /** 1차 메뉴 펼침판 회색 상자의 둘째 줄. 궁능은 이 자리에 기관 이름(궁능유적본부)을 두므로 사이트 이름을 점선 없이 쓴다. */
  desc?: string;
  children?: NavItem[];
};

/** 서브 쪽 왼쪽 메뉴(자유 정의). title = 검정 머리 상자 글자, items = 2단, children = 3단 */
export type SideMenuLink = { label: string; href: string };
export type SideMenuItem = { label: string; href: string; children?: SideMenuLink[] };
export type SideMenu = { title: string; items: SideMenuItem[] };

export const SITE_NAME = "경주 관광지 안내";

export const MENU: NavItem[] = [
  {
    label: "관광지 지도",
    href: "/map",
    desc: SITE_NAME,
    children: [{ label: "경주 전체", href: "/map" }, ...areas.map((a) => ({ label: a.label, href: `/map/${a.key}` }))],
  },
  {
    label: "관광지 목록",
    href: "/list",
    desc: SITE_NAME,
    children: [
      { label: "권역별", href: "/list" },
      { label: "가나다순", href: "/list/abc" },
      { label: "거점별", href: "/list/hub" },
    ],
  },
  {
    label: "무장애 정보",
    href: "/barrier-free",
    desc: SITE_NAME,
    children: [
      { label: "무장애 정보 보는 법", href: "/barrier-free" },
      { label: "정보가 적힌 곳", href: "/barrier-free/listed" },
      { label: "정보가 없는 곳", href: "/barrier-free/unlisted" },
      { label: "계단 없는 길", href: "/barrier-free/step-free" },
    ],
  },
  {
    label: "사이트 소개",
    href: "/about",
    desc: SITE_NAME,
    children: [
      { label: "만든 까닭", href: "/about" },
      { label: "자료 출처와 저작권", href: "/about/sources" },
      { label: "이용 안내", href: "/about/guide" },
    ],
  },
];

/**
 * 1차 메뉴 펼침판·휴대전화 전체메뉴의 3차 목록(궁능: 2차 칸의 ∨를 누르면 3차 목록이 열린다. 첫 칸은 2차 쪽 자신).
 * 2차 주소 → 3차 목록. 3차가 없으면 undefined(그 2차 칸은 바로 가는 링크, 궁능 "경희궁"처럼 ∨ 없음).
 * 지금은 관광지 지도의 권역 다섯: 첫 칸 = 그 권역 지도, 그다음 그 권역 관광지(가나다순) → 관광지 쪽.
 */
export function depth3Of(href: string): SideMenuLink[] | undefined {
  const m = href.match(/^\/map\/([a-z]+)$/);
  const area = m ? areas.find((a) => a.key === m[1]) : undefined;
  if (!area) return undefined;
  const ps = places.filter((p) => areaOf(p) === area.key).sort(byName);
  return [{ label: area.label, href }, ...ps.map((p) => ({ label: p.name, href: `/places/${p.id}` }))];
}

/** PC 왼쪽 고정 막대의 바로가기 6칸(아이콘 이름은 src/components/icons). */
export const LEFT_BAR: { label: string; href: string; icon: "map" | "list" | "wheelchair" | "hub" | "guide" | "about" }[] = [
  { label: "관광지 지도", href: "/map", icon: "map" },
  { label: "관광지 목록", href: "/list", icon: "list" },
  { label: "무장애 정보", href: "/barrier-free", icon: "wheelchair" },
  { label: "거점별", href: "/list/hub", icon: "hub" },
  { label: "이용 안내", href: "/about/guide", icon: "guide" },
  { label: "사이트 소개", href: "/about", icon: "about" },
];

/** 머리의 남색 둥근 띠: 권역 5개 */
export const AREA_LINKS = areas.map((a) => ({ key: a.key, label: a.label, href: `/map/${a.key}` }));

export { HUBS };

/** 주소가 어느 1차 메뉴에 속하는지. 관광지 쪽(/places/…)과 사이트맵은 "관광지 목록"에 속한다. */
export function sectionOf(pathname: string) {
  const found = MENU.find((m) => pathname === m.href || pathname.startsWith(m.href + "/"));
  if (found) return found;
  if (pathname === "/sitemap" || pathname === "/places" || pathname.startsWith("/places/")) return MENU[1];
  return undefined;
}

/** 2차 메뉴 가운데 지금 쪽. 정확히 같은 주소를 먼저 찾는다. */
export function currentChild(pathname: string) {
  const sec = sectionOf(pathname);
  return sec?.children?.find((c) => c.href === pathname);
}

/** 1차 메뉴 하나를 왼쪽 메뉴 모양으로 */
export function sideMenuOf(section: NavItem): SideMenu {
  return { title: section.label, items: (section.children ?? []).map((c) => ({ label: c.label, href: c.href })) };
}

// ─── 관광지 쪽(61곳 × 5쪽) ───

/** 관광지 하나의 하위 5쪽 */
export function placePages(p: Pick<Place, "id" | "name">): SideMenuLink[] {
  return [
    { label: p.name, href: `/places/${p.id}` },
    { label: `${p.name} 소개`, href: `/places/${p.id}/intro` },
    { label: `${p.name} 사진`, href: `/places/${p.id}/photos` },
    { label: "무장애 정보", href: `/places/${p.id}/barrier-free` },
    { label: "오시는 길", href: `/places/${p.id}/directions` },
  ];
}

/**
 * 관광지 쪽 왼쪽 메뉴: 검정 머리 = 그 관광지의 권역 이름, 목록 = 같은 권역 관광지(가나다순).
 * 궁능 lnb처럼 관광지마다 하위 5쪽을 달아 ⊙∨ 단추로 펼친다. 처음에는 지금 관광지만 펼쳐 둔다.
 */
export function placeSideMenu(p: Place): SideMenu {
  const key = areaOf(p);
  const area = areas.find((a) => a.key === key)!;
  const same = places.filter((q) => areaOf(q) === key).sort(byName);
  return {
    title: area.label,
    items: same.map((q) => ({ label: q.name, href: `/places/${q.id}`, children: placePages(q) })),
  };
}

/** 관광지 쪽 빵부스러기(홈 뒤): 관광지 목록 ▸ {권역} ▸ {이름} ▸ {쪽}. page를 비우면 {이름}에서 끝난다. */
export function placeCrumbs(p: Place, page?: SideMenuLink) {
  const key = areaOf(p);
  const area = areas.find((a) => a.key === key)!;
  const crumbs = [
    { label: MENU[1].label, href: MENU[1].href },
    { label: area.label, href: `/map/${key}` },
    { label: p.name, href: `/places/${p.id}` },
  ];
  if (page && page.href !== `/places/${p.id}`) crumbs.push(page);
  return crumbs;
}

/** 관광지 쪽 배너 글자 */
export const PLACE_BANNER = "관광지 목록";
