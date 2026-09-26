// 무장애 정보 > 무장애 정보 보는 법(궁능 관람규칙·한복무료관람 가이드라인 모양).
// 장 바로가기 격자 → 세 항목 표(가이드라인 표) → 둘째·셋째 장 조 상자(관람규칙) → 숫자 표. 맨 위 회색 안내 상자는 문구 대조 E01로 뺐다.
// 장·조 번호("제1장", 조 제목 앞 "1.")는 09-26 저녁 사용자 결정으로 뗐다. 장·조 이름만 둔다.
// 숫자는 모두 places.json에서 센다. 새로 지은 문장은 <Ph>.
// 09-27 사용자 결정(빈 칸은 '-' 없이 비움)으로 '‘-’ 표시' 장을 뺐다: '-' 문장은 지우고, 시설 이야기 문단은 '무장애 정보가 있어도 비어 있는 칸' 조로,
// '무장애 정보가 없는 곳' 조는 '무장애 정보가 있는 곳·없는 곳' 장 첫머리로 옮겼다(글은 그대로, 점선 그대로).
// 09-27 점선 1차 정리(05_사이트/11_안건_점선_문구.md): 장 이름 '세 가지 항목' → '주차·접근로·화장실'(관광지 무장애 정보 쪽 절 이름),
// 정의 조 두 문단과 '비어 있는 칸' 조 본문 둘은 궁능 관람규칙 문장 틀로 바꾸고, '비어 있는 칸' 조는 제목을 떼고 정의 조 뒤 항으로 붙였다.
// 별표 줄, '무장애 정보가 없는 곳' 조(풀이 한 줄뿐), 숫자 표의 '세 항목에 모두 글이 있는 곳' 줄은 뺐다. 세 항목 이름(자료 칸 이름)은 점선을 뗐다.
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import Link from "next/link";
import { byName, places } from "@/data";
import { Section, SubPage } from "@/components/layout/PageParts";
import { BoardTable } from "@/components/royal";
import { Icon, type IconName } from "@/components/icons";
import { THREE_KEYS, menuPage, type ThreeKey } from "@/components/place-list/helpers";
import { THREE_TEXT } from "@/components/place-list/Parts";
import { STEPFREE_HREF, STEPFREE_PLACES } from "@/data/stepfree";
import s from "./bf.module.css";
import MenuSteps from "@/components/place/MenuSteps";

const HREF = "/barrier-free";
const page = menuPage(HREF);

export const metadata: Metadata = pageMetadata(page.title, HREF);

const THREE_ICON: Record<ThreeKey, IconName> = { parking: "parking", walk: "walk", toilet: "toilet" };

// 장 바로가기(궁능 "제1장 총칙" 격자에서 번호를 뗀 모양). 장 이름은 모두 자료 칸 이름·묶음 이름이라 점선 없음
const CHAPTERS: { id: string; name: string }[] = [
  { id: "ch1", name: "주차·접근로·화장실" },
  { id: "ch2", name: "무장애 정보가 있는 곳" },
  { id: "ch4", name: "무장애 정보가 있는 곳·없는 곳" },
];
const chapterName = (i: number) => CHAPTERS[i].name;

export default function BarrierFreeGuidePage() {
  const total = places.length;
  const registered = places.filter((p) => p.registered);
  const unregistered = places.filter((p) => !p.registered);
  const filled = (k: ThreeKey) => places.filter((p) => p.three[k]).length;
  // 예로 보일 곳: 첨성대(세 칸에 모두 글이 있는 곳). 없으면 세 칸에 모두 글이 있는 첫 곳(가나다순)
  const sample =
    places.find((p) => p.name === "첨성대" && THREE_KEYS.every((k) => p.three[k])) ??
    [...places].sort(byName).find((p) => THREE_KEYS.every((k) => p.three[k]));
  const subs = page.section.children?.filter((c) => c.href !== HREF) ?? [];
  const subCount: Record<string, number> = {
    "/barrier-free/listed": registered.length,
    "/barrier-free/unlisted": unregistered.length,
    [STEPFREE_HREF]: STEPFREE_PLACES.length,
  };

  return (
    <SubPage
      crumbs={[...page.crumbs, { label: page.title, href: HREF }]}
      title={page.title}
      side={page.section}
      current={HREF}
    >
      {/* 장 바로가기 */}
      <nav aria-label="이 페이지의 구성">
        <ul className={s.chapters}>
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className={s.chapter}>
                <span className={s.chapterName}>{chapterName(i)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 주차·접근로·화장실: 세 항목 표(궁능 한복무료관람 가이드라인 표) */}
      <Section id="ch1" className={s.anchor} title={chapterName(0)}>
        <div className={s.guideTable}>
          <BoardTable
            caption="무장애 정보 세 가지 항목: 구분과 세부내용"
            head={["구분", "세부내용"]}
            cols={["26%", "auto"]}
            align={["c", "l"]}
            rowHeader
            rows={THREE_KEYS.map((k) => [
              <span className={s.kind} key="k">
                <Icon name={THREE_ICON[k]} size={34} strokeWidth={1.5} />
                {THREE_TEXT[k]}
              </span>,
              <div className={s.detail} key="d">
                {sample && (
                  <span>
                    1. (예시) {sample.name}
                    <br />
                    <q className={s.sample}>{sample.three[k]}</q>
                  </span>
                )}
              </div>,
            ])}
          />
        </div>
      </Section>

      {/* 무장애 정보가 있는 곳(궁능 관람규칙 조 상자) */}
      <Section id="ch2" className={s.anchor} title={chapterName(1)}>
        <div className={s.article}>
          <h3 className={s.artTit}>정의</h3>
          <div className={s.artBox}>
            {/* 궁능 관람규칙 제2조 1호 "“일반공개”란 … 것을 말한다." 틀 */}
            <p>“무장애 정보가 있는 곳”이란 한국관광공사 관광정보의 ‘무장애 정보 등록’ 표시가 ‘예’인 관광지를 말한다.</p>
            {/* 궁능 관람규칙 제3조의2 ① "…은 다음의 각 호와 같다." 틀 */}
            <p>이 누리집의 목록이 모아 보이는 한국관광공사 무장애 여행 정보의 칸은 다음의 각 호와 같다.</p>
            <ul className={s.numList}>
              {THREE_KEYS.map((k) => (
                <li key={k}>{THREE_TEXT[k]}</li>
              ))}
            </ul>
            {/* 궁능 관람규칙 제3조 ③ 끝 "다만, … 않을 수 있다." 틀 */}
            <p>다만, 무장애 정보가 있는 곳이라도 칸에 글이 적혀 있지 않을 수 있다.</p>
            <p>다만, 시설이 있어도 한국관광공사 무장애 여행 정보에 적혀 있지 않을 수 있다.</p>
          </div>
        </div>
      </Section>

      {/* 무장애 정보가 있는 곳·없는 곳: 숫자 표 + 두 목록 쪽으로 */}
      <Section id="ch4" className={s.anchor} title={chapterName(2)}>
        <div className={s.summary}>
          <BoardTable
            caption={`관광지 ${total}곳의 무장애 정보 요약: 구분과 곳 수`}
            head={["구분", "곳 수"]}
            cols={["70%", "auto"]}
            align={["l", "c"]}
            rowHeader
            rows={[
              ["전체", total],
              ["무장애 정보가 있는 곳", registered.length],
              ["무장애 정보가 없는 곳", unregistered.length],
              ...THREE_KEYS.map((k) => [THREE_TEXT[k], filled(k)]),
            ]}
          />
        </div>
        <div className={s.moreLinks}>
          {subs.map((c) => (
            <Link key={c.href} href={c.href} className={s.moreLink}>
              {c.label} {subCount[c.href]}곳
              <Icon name="arrow-right" size={20} strokeWidth={2} />
            </Link>
          ))}
        </div>
      </Section>
      {/* 쪽 끝 이어 읽기(무장애 정보 메뉴 차례) */}
      <MenuSteps section={page.section} current={HREF} />
    </SubPage>
  );
}
