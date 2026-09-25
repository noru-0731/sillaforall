// 사이트맵(궁능 sitemap 쪽 모양): 왼쪽 회색 칸에 1차 이름, 오른쪽에 2차·3차 목록.
// 관광지 61곳은 "관광지 목록" 아래 권역별로 나열한다. 권역 이름 줄 아래에 관광지마다 한 칸,
// 그 아래 "- " 줄로 관광지 쪽 다섯(궁능: 경복궁 아래 - 경복궁, - 경복궁 소개·역사, - 경복궁 이야기).
import type { Metadata } from "next";
import Link from "next/link";
import { SubPage } from "@/components/layout/PageParts";
import { MENU, placePages } from "@/site/ia";
import type { SideMenu } from "@/site/ia";
import { areas, byName, placeById } from "@/data";
import s from "./sitemap.module.css";

export const metadata: Metadata = { title: "사이트맵" };

type Col = { label: string; href: string; items?: { label: string; href: string }[]; wide?: boolean; head?: boolean };

// 궁능의 "가이드" 묶음(사이트맵·개인정보처리방침·저작권정책…)을 우리 쪽들로
const GUIDE: SideMenu = {
  title: "가이드",
  items: [
    { label: "사이트맵", href: "/sitemap" },
    { label: "자료 출처와 저작권", href: "/about/sources" },
    { label: "이용 안내", href: "/about/guide" },
  ],
};

function groups(): { label: string; cols: Col[] }[] {
  return MENU.map((m) => {
    const cols: Col[] = (m.children ?? []).map((c) => ({ label: c.label, href: c.href }));
    if (m.href === "/list") {
      // 관광지 목록: 권역마다 관광지 이름(가나다순)
      for (const a of areas) {
        const ps = a.placeIds.map((id) => placeById(id)!).sort(byName);
        cols.push({ label: a.label, href: `/map/${a.key}`, wide: true, head: true });
        for (const p of ps) cols.push({ label: p.name, href: `/places/${p.id}`, items: placePages(p) });
      }
    }
    return { label: m.label, cols };
  });
}

export default function SitemapPage() {
  return (
    <SubPage
      crumbs={[
        { label: "가이드", href: "/sitemap" },
        { label: "사이트맵", href: "/sitemap" },
      ]}
      title="사이트맵"
      banner="가이드"
      sideMenu={GUIDE}
      current="/sitemap"
    >
      <div className={s.wrap}>
        {groups().map((g) => (
          <section className={s.group} key={g.label} aria-label={g.label}>
            <h2 className={s.d1}>{g.label}</h2>
            <ul className={s.cols}>
              {g.cols.map((c) => (
                <li className={[s.col, c.wide ? s.wide : "", c.head ? s.head : ""].filter(Boolean).join(" ")} key={c.href + c.label}>
                  <Link href={c.href} className={s.d2}>
                    {c.label}
                  </Link>
                  {c.items && (
                    <ul className={s.d3}>
                      {c.items.map((it) => (
                        <li key={it.href}>
                          <Link href={it.href}>{it.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SubPage>
  );
}
