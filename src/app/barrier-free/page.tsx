// 무장애 정보 > 무장애 정보 보는 법(궁능 관람규칙·한복무료관람 가이드라인 모양).
// 장 바로가기 격자 → 세 항목 표(가이드라인 표) → 둘째·셋째 장 조 상자(관람규칙) → 숫자 표. 맨 위 회색 안내 상자는 문구 대조 E01로 뺐다.
// 장·조 번호("제1장", 조 제목 앞 "1.")는 09-26 저녁 사용자 결정으로 뗐다. 장·조 이름만 둔다.
// 숫자는 모두 places.json에서 센다. 새로 지은 문장은 <Ph>.
import type { Metadata } from "next";
import Link from "next/link";
import { byName, places } from "@/data";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { BoardTable } from "@/components/royal";
import { Icon, type IconName } from "@/components/icons";
import { THREE_KEYS, menuPage, type ThreeKey } from "@/components/place-list/helpers";
import { THREE_TEXT } from "@/components/place-list/Parts";
import { STEPFREE_HREF, STEPFREE_PLACES } from "@/data/stepfree";
import s from "./bf.module.css";
import MenuSteps from "@/components/place/MenuSteps";

const HREF = "/barrier-free";
const page = menuPage(HREF);

export const metadata: Metadata = { title: page.title };

const THREE_ICON: Record<ThreeKey, IconName> = { parking: "parking", walk: "walk", toilet: "toilet" };

// 장 바로가기(궁능 "제1장 총칙" 격자에서 번호를 뗀 모양). ph: 새로 지은 이름이면 점선, 묶음 이름만으로 된 이름은 점선 없음
const CHAPTERS: { id: string; name: string; ph: boolean }[] = [
  { id: "ch1", name: "세 가지 항목", ph: true },
  { id: "ch2", name: "무장애 정보가 있는 곳", ph: false },
  { id: "ch3", name: "‘-’ 표시", ph: true },
  { id: "ch4", name: "무장애 정보가 있는 곳·없는 곳", ph: false },
];
const chapterName = (i: number) => (CHAPTERS[i].ph ? <Ph>{CHAPTERS[i].name}</Ph> : CHAPTERS[i].name);

export default function BarrierFreeGuidePage() {
  const total = places.length;
  const registered = places.filter((p) => p.registered);
  const unregistered = places.filter((p) => !p.registered);
  const filled = (k: ThreeKey) => places.filter((p) => p.three[k]).length;
  const allThree = places.filter((p) => THREE_KEYS.every((k) => p.three[k])).length;
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

      {/* 세 가지 항목: 세 항목 표(궁능 한복무료관람 가이드라인 표) */}
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
                <Ph>{THREE_TEXT[k]}</Ph>
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
        <p className={s.footnote}>
          * <Ph>세 항목의 글은 한국관광공사 무장애 여행 정보에 적힌 글을 그대로 옮긴 것입니다.</Ph>
        </p>
      </Section>

      {/* 무장애 정보가 있는 곳(궁능 관람규칙 조 상자) */}
      <Section id="ch2" className={s.anchor} title={chapterName(1)}>
        <div className={s.article}>
          <h3 className={s.artTit}>정의</h3>
          <div className={s.artBox}>
            <p>
              <Ph>
                한국관광공사 관광정보에는 관광지마다 ‘무장애 정보 등록’ 표시가 있습니다. 이 표시가 ‘예’인 곳을 이 누리집에서는 ‘무장애
                정보가 있는 곳’이라고 부릅니다.
              </Ph>
            </p>
            <p>
              <Ph>
                무장애 정보가 있는 곳에는 무장애 여행 정보 28가지 항목을 적는 칸이 있습니다. 이 누리집의 목록은 그 가운데 세 가지를 모아
                보여 드립니다.
              </Ph>
            </p>
            <ul className={s.numList}>
              {THREE_KEYS.map((k) => (
                <li key={k}>
                  <Ph>{THREE_TEXT[k]}</Ph>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={s.article}>
          <h3 className={s.artTit}>
            <Ph>무장애 정보가 있어도 비어 있는 칸</Ph>
          </h3>
          <div className={s.artBox}>
            <p>
              <Ph>
                한국관광공사 무장애 여행 정보에 올라 있다는 것은 무장애 정보를 적는 칸이 있다는 뜻입니다. 칸마다 글이 모두 적혀 있다는
                뜻은 아닙니다.
              </Ph>
            </p>
          </div>
        </div>
      </Section>

      {/* ‘-’ 표시(빈 칸 표시, components/layout/Dash.tsx) */}
      <Section id="ch3" className={s.anchor} title={chapterName(2)}>
        <div className={s.article}>
          <h3 className={s.artTit}>
            <Ph>‘-’ 표시의 뜻</Ph>
          </h3>
          <div className={s.artBox}>
            <p>
              <Ph>‘-’ 표시는 한국관광공사 무장애 여행 정보의 그 칸에 글이 없다는 뜻입니다.</Ph>
            </p>
            <p>
              <Ph>시설이 없다는 뜻은 아닙니다. 시설이 있어도 한국관광공사 무장애 여행 정보에 적히지 않았을 수 있습니다.</Ph>
            </p>
          </div>
        </div>
        <div className={s.article}>
          <h3 className={s.artTit}>무장애 정보가 없는 곳</h3>
          <div className={s.artBox}>
            <p>
              <Ph>무장애 정보가 없는 곳의 무장애 정보 쪽에는 ‘등록된 무장애 여행 정보가 없습니다.’가 보입니다.</Ph>
            </p>
          </div>
        </div>
      </Section>

      {/* 무장애 정보가 있는 곳·없는 곳: 숫자 표 + 두 목록 쪽으로 */}
      <Section id="ch4" className={s.anchor} title={chapterName(3)}>
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
              [<Ph key="k">세 항목에 모두 글이 있는 곳</Ph>, allThree],
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
