// 서브 쪽 틀(궁능유적본부 누리집 모양): 배너(185) → [왼쪽 메뉴 250] + 본문(빵부스러기, 제목 + 공유·인쇄, 윗선, 내용).
// 휴대전화: 배너(130) → 검정 드롭다운 막대 → 빵부스러기 → 제목 + 공유 → 내용.
// 서버 컴포넌트. 누르면 움직이는 부분은 SubPageParts.tsx(클라이언트).
import Link from "next/link";
import { MENU, SITE_NAME, sectionOf, sideMenuOf } from "@/site/ia";
import type { NavItem, SideMenu, SideMenuLink } from "@/site/ia";
import { bannerPhoto as pickBanner, photoCredit } from "@/data/photos";
import { Icon } from "@/components/icons";
import { MobileMenuBar, PageTools, SideMenuNav } from "./SubPageParts";
import { Ph } from "./Ph";

export { Ph };
export type { SideMenu, SideMenuItem, SideMenuLink } from "@/site/ia";

export type Crumb = { label: string; href: string };

/** 빵부스러기: 집 아이콘 ▸ 작은 글자. 마지막 칸이 지금 쪽. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="rc-bc" aria-label="현재 경로" id="breadcrumb">
      <ol>
        <li>
          <Link href="/" className="rc-bc__home">
            <Icon name="home" size={18} strokeWidth={2} />
            <span className="sr-only">홈</span>
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={c.href + c.label}>
            <Link href={c.href} aria-current={i === items.length - 1 ? "page" : undefined}>
              {c.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** (예전 이름) 1차 메뉴의 2차 목록을 왼쪽 메뉴로. 새 쪽은 SubPage의 side 또는 sideMenu를 쓴다. */
export function SideNav({ section, current }: { section: NavItem; current: string }) {
  return <SideMenuNav menu={sideMenuOf(section)} current={current} />;
}

/** 쪽 안 목차: "이 페이지의 구성" 상자(궁능에는 없음. KRDS 쪽 안 목차의 이름표). 관광지 무장애 정보 쪽이 쓴다 */
export function InPageNav({ title, items }: { title: string; items: { id: string; label: React.ReactNode }[] }) {
  return (
    <nav className="rc-inpage" aria-label={`${title} 이 페이지의 구성`}>
      <p className="rc-inpage__tit">이 페이지의 구성</p>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`}>{it.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export type BannerPhotoProp = string | { url: string; caption?: string } | null;

/**
 * 서브 쪽 한 장.
 * - crumbs: 홈 뒤 경로. 마지막 칸이 지금 쪽.
 * - title: 쪽 제목(h1). lead: 제목 아래 이끄는 글(윗선 아래 첫 줄).
 * - side: 왼쪽 메뉴를 붙일 1차 메뉴(MENU[i]). sideMenu: 왼쪽 메뉴 자유 정의(관광지 쪽: placeSideMenu(p)). 둘 다 없으면 왼쪽 메뉴 없이 넓게.
 * - current: 왼쪽 메뉴에서 굵게 할 주소(기본: crumbs 마지막 주소).
 * - banner: 배너 글자(기본: 1차 메뉴 이름). bannerPhoto: 배너 사진(제1유형만. 기본: 1차 메뉴별 고정 사진, null이면 사진 없이 회색).
 * - tools: 공유·인쇄 단추(기본 true). tabs: 제목과 윗선 사이에 둘 알약 줄 등.
 * - inPage: 쪽 안 목차 상자. wide: 예전 호환용(뜻 없음).
 */
export function SubPage({
  crumbs,
  title,
  lead,
  side,
  current,
  inPage,
  wide: _wide,
  banner,
  bannerPhoto,
  sideMenu,
  tools = true,
  tabs,
  children,
}: {
  crumbs: Crumb[];
  title: React.ReactNode;
  lead?: React.ReactNode;
  side?: NavItem;
  current?: string;
  inPage?: { title: string; items: { id: string; label: string }[] };
  wide?: boolean;
  banner?: React.ReactNode;
  bannerPhoto?: BannerPhotoProp;
  sideMenu?: SideMenu;
  tools?: boolean;
  tabs?: React.ReactNode;
  children: React.ReactNode;
}) {
  void _wide;
  const section = side ?? sectionOf(crumbs[0]?.href ?? "") ?? MENU[1];
  const cur = current ?? crumbs[crumbs.length - 1]?.href ?? "";
  const bannerText = banner ?? section.label;

  // 배너 사진: 기본은 1차 메뉴별로 고른 제1유형 사진
  let photoUrl: string | null = null;
  let photoCaption: string | null = null;
  if (bannerPhoto === undefined) {
    const firstHref = crumbs[0]?.href ?? section.href;
    const b = pickBanner(firstHref.startsWith("/places") || firstHref === "/sitemap" ? firstHref : section.href);
    photoUrl = b.url;
    photoCaption = `${b.placeName} · ${photoCredit("Type1")}`;
  } else if (typeof bannerPhoto === "string") {
    photoUrl = bannerPhoto;
    photoCaption = photoCredit("Type1");
  } else if (bannerPhoto) {
    photoUrl = bannerPhoto.url;
    photoCaption = bannerPhoto.caption ?? photoCredit("Type1");
  }

  // PC 왼쪽 메뉴
  const lnb = sideMenu ?? (side ? sideMenuOf(side) : undefined);
  // 휴대전화 검정 막대: 지금 쪽과 같은 단의 목록
  const mMenu = sideMenu ?? sideMenuOf(side ?? section);
  const parent = mMenu.items.find((it) => it.children?.some((c) => c.href === cur));
  const barLinks: SideMenuLink[] = parent?.children ?? mMenu.items.map((it) => ({ label: it.label, href: it.href }));
  const barLabel = barLinks.find((l) => l.href === cur)?.label ?? (typeof title === "string" ? title : mMenu.title);
  const titleText = typeof title === "string" ? title : SITE_NAME;

  return (
    <div className="rc-sub">
      <div className="rc-sub-visual">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photoUrl && <img src={photoUrl} alt="" decoding="async" />}
        <p className="rc-sub-visual__tit">{bannerText}</p>
        {photoCaption && <p className="rc-sub-visual__credit">{photoCaption}</p>}
      </div>
      <MobileMenuBar label={barLabel} links={barLinks} current={cur} />
      <div className="rc-sub-inner">
        {lnb && <SideMenuNav menu={lnb} current={cur} />}
        <div className="rc-contents" id="contents">
          <Breadcrumb items={crumbs} />
          <div className="rc-titlewrap">
            <h1>{title}</h1>
            {tools && <PageTools title={titleText} />}
          </div>
          {tabs && <div className="rc-subtabs">{tabs}</div>}
          <div className="rc-subcon">
            {lead && <p className="rc-lead">{lead}</p>}
            {inPage && <InPageNav title={inPage.title} items={inPage.items} />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 본문 안 한 칸(제목 26px 700 + 내용). 궁능의 sub_con_section + txt_section_tit. */
export function Section({
  id,
  title,
  children,
  className,
  level = 2,
}: {
  id?: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  level?: 2 | 3;
}) {
  const H = level === 3 ? "h3" : "h2";
  return (
    <section id={id} className={`rc-section${className ? " " + className : ""}`}>
      <H className="rc-section__tit">{title}</H>
      {children}
    </section>
  );
}
