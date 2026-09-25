// 무장애 정보 > 무장애 정보 보는 법(궁능 관람규칙·한복무료관람 가이드라인 모양).
// 회색 안내 상자 → 장 바로가기 격자 → 제1장 세 항목 표(가이드라인 표) → 제2·3장 조 상자(관람규칙) → 제4장 숫자 표.
// 숫자는 모두 places.json에서 센다. 새로 지은 문장은 <Ph>.
import type { Metadata } from "next";
import Link from "next/link";
import { byName, places } from "@/data";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { BoardTable, TipList } from "@/components/royal";
import { Icon, type IconName } from "@/components/icons";
import { THREE_KEYS, menuPage, type ThreeKey } from "@/components/place-list/helpers";
import { THREE_TEXT } from "@/components/place-list/Parts";
import s from "./bf.module.css";

const HREF = "/barrier-free";
const page = menuPage(HREF);

export const metadata: Metadata = { title: page.title };

// 세 항목에 무엇이 적히는지(임시 문구)
const THREE_DESC: Record<ThreeKey, string> = {
  parking: "장애인 주차 구역이 있는지 적는 칸입니다.",
  walk: "입구까지 가는 길과 출입구에 턱이나 경사로가 있는지 적는 칸입니다.",
  toilet: "장애인 화장실이 있는지 적는 칸입니다.",
};
// 명부의 어느 칸 글을 옮기는지(05_사이트/도구/01_자료.py: 걷는 길 = 접근로, 비면 출입통로)
const THREE_FROM: Record<ThreeKey, string> = {
  parking: "명부의 ‘주차’ 칸 글을 그대로 옮깁니다.",
  walk: "명부의 ‘접근로’ 칸 글을 옮기고, 그 칸이 비어 있으면 ‘출입통로’ 칸 글을 옮깁니다.",
  toilet: "명부의 ‘화장실’ 칸 글을 그대로 옮깁니다.",
};
const THREE_ICON: Record<ThreeKey, IconName> = { parking: "parking", walk: "walk", toilet: "toilet" };
// 명부의 칸 이름(한국관광공사 무장애 여행 정보)
const THREE_COLS: Record<ThreeKey, string> = { parking: "명부의 주차 칸", walk: "명부의 접근로·출입통로 칸", toilet: "명부의 화장실 칸" };

// 장 바로가기(궁능 "제1장 총칙" 격자)
const CHAPTERS = [
  { id: "ch1", name: "세 가지 항목" },
  { id: "ch2", name: "명부에 오른 곳" },
  { id: "ch3", name: "적힌 내용 없음" },
  { id: "ch4", name: "정보가 적힌 곳·없는 곳" },
];

export default function BarrierFreeGuidePage() {
  const total = places.length;
  const registered = places.filter((p) => p.registered);
  const unregistered = places.filter((p) => !p.registered);
  const filled = (k: ThreeKey) => places.filter((p) => p.three[k]).length;
  const allThree = places.filter((p) => THREE_KEYS.every((k) => p.three[k])).length;
  const regGap = registered.filter((p) => THREE_KEYS.some((k) => !p.three[k])).length;
  const withNearest = unregistered.filter((p) => p.nearestRegistered).length;
  // 예로 보일 곳: 첨성대(세 칸이 모두 적힌 곳). 없으면 세 칸이 모두 적힌 첫 곳(가나다순)
  const sample =
    places.find((p) => p.name === "첨성대" && THREE_KEYS.every((k) => p.three[k])) ??
    [...places].sort(byName).find((p) => THREE_KEYS.every((k) => p.three[k]));
  const subs = page.section.children?.filter((c) => c.href !== HREF) ?? [];
  const subCount: Record<string, number> = {
    "/barrier-free/listed": registered.length,
    "/barrier-free/unlisted": unregistered.length,
  };

  return (
    <SubPage
      crumbs={[...page.crumbs, { label: page.title, href: HREF }]}
      title={page.title}
      side={page.section}
      current={HREF}
    >
      {/* 회색 안내 상자(궁능 관람규칙 맨 위) */}
      <div className={s.intro}>
        <div className={s.introBody}>
          <h2 className={s.introTit}>{page.title}</h2>
          <p className={s.introTxt}>
            관광지에 가시기 전에 꼭 확인해 주셔야 할 사항입니다
            <br />
            모두에게 기분좋은 여행이 될 수 있도록 무장애 정보를 살펴보시기 바랍니다
          </p>
        </div>
        <span className={s.introIcon} aria-hidden="true">
          <Icon name="wheelchair" size={90} strokeWidth={1.1} />
        </span>
      </div>

      {/* 장 바로가기 */}
      <nav aria-label="이 페이지의 구성">
        <ul className={s.chapters}>
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className={s.chapter}>
                <span className={s.chapterNo}>제{i + 1}장</span>
                <span className={s.chapterName}>
                  <Ph>{c.name}</Ph>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 제1장: 세 항목 표(궁능 한복무료관람 가이드라인 표) */}
      <Section
        id="ch1"
        className={s.anchor}
        title={
          <>
            제1장 <Ph>{CHAPTERS[0].name}</Ph>
          </>
        }
      >
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
                <span>
                  1. <Ph>{THREE_DESC[k]}</Ph>
                </span>
                <span>
                  2. <Ph>{THREE_FROM[k]}</Ph>
                </span>
                {sample && (
                  <span>
                    3. <Ph>적힌 예({sample.name})</Ph>
                    <br />
                    <q className={s.sample}>{sample.three[k]}</q>
                  </span>
                )}
                <span className={s.detailTip}>
                  <Ph>
                    관광지 {total}곳 가운데 {filled(k)}곳에 적혀 있습니다.
                  </Ph>
                </span>
              </div>,
            ])}
          />
        </div>
        <p className={s.footnote}>
          * <Ph>세 항목의 글은 한국관광공사 무장애 여행 정보에 적힌 글을 그대로 옮긴 것입니다.</Ph>
        </p>
      </Section>

      {/* 제2장: 명부에 오른 곳(궁능 관람규칙 조 상자) */}
      <Section
        id="ch2"
        className={s.anchor}
        title={
          <>
            제2장 <Ph>{CHAPTERS[1].name}</Ph>
          </>
        }
      >
        <div className={s.article}>
          <h3 className={s.artTit}>
            1. <Ph>명부에 올라 있다는 뜻</Ph>
          </h3>
          <div className={s.artBox}>
            <p>
              <Ph>
                한국관광공사 관광정보에는 관광지마다 ‘무장애 정보 등록’ 표시가 있습니다. 이 표시가 ‘예’인 곳을 이 누리집에서는 ‘명부에
                오른 곳’이라고 부릅니다.
              </Ph>
            </p>
            <p>
              <Ph>
                명부에 오른 곳에는 무장애 여행 정보 28가지 항목을 적는 칸이 있습니다. 이 누리집의 목록은 그 가운데 세 가지를 모아
                보여 드립니다.
              </Ph>
            </p>
            <ul className={s.numList}>
              {THREE_KEYS.map((k) => (
                <li key={k}>
                  <Ph>
                    {THREE_TEXT[k]}({THREE_COLS[k]})
                  </Ph>
                </li>
              ))}
            </ul>
            <TipList
              items={[
                <Ph key="a">
                  경주 관광지 {total}곳 가운데 {registered.length}곳이 명부에 올라 있습니다.
                </Ph>,
              ]}
            />
          </div>
        </div>
        <div className={s.article}>
          <h3 className={s.artTit}>
            2. <Ph>명부에 올라도 비어 있는 칸</Ph>
          </h3>
          <div className={s.artBox}>
            <p>
              <Ph>명부에 올라 있다는 것은 무장애 정보를 적는 칸이 있다는 뜻입니다. 칸마다 글이 모두 적혀 있다는 뜻은 아닙니다.</Ph>
            </p>
            <TipList
              items={[
                <Ph key="a">
                  명부에 오른 {registered.length}곳 가운데 {regGap}곳은 세 항목 가운데 하나 이상이 비어 있습니다.
                </Ph>,
              ]}
            />
          </div>
        </div>
      </Section>

      {/* 제3장: 적힌 내용 없음 */}
      <Section
        id="ch3"
        className={s.anchor}
        title={
          <>
            제3장 <Ph>{CHAPTERS[2].name}</Ph>
          </>
        }
      >
        <div className={s.article}>
          <h3 className={s.artTit}>
            1. <Ph>적힌 내용 없음의 뜻</Ph>
          </h3>
          <div className={s.artBox}>
            <p>
              <Ph>‘적힌 내용 없음’은 명부의 그 칸에 글이 없다는 뜻입니다.</Ph>
            </p>
            <p>
              <Ph>시설이 없다는 뜻은 아닙니다. 시설이 있어도 명부에 적히지 않았을 수 있습니다.</Ph>
            </p>
          </div>
        </div>
        <div className={s.article}>
          <h3 className={s.artTit}>
            2. <Ph>명부에 오르지 않은 곳</Ph>
          </h3>
          <div className={s.artBox}>
            <p>
              <Ph>
                명부에 오르지 않은 {unregistered.length}곳은 세 항목이 모두 ‘적힌 내용 없음’으로 보입니다.
              </Ph>
            </p>
            <TipList
              items={[
                <Ph key="a">
                  이 가운데 {withNearest}곳은 ‘정보가 없는 곳’ 목록에 가장 가까운 등록 관광지를 함께 적었습니다.
                </Ph>,
              ]}
            />
          </div>
        </div>
      </Section>

      {/* 제4장: 숫자 표 + 두 목록 쪽으로 */}
      <Section
        id="ch4"
        className={s.anchor}
        title={
          <>
            제4장 <Ph>{CHAPTERS[3].name}</Ph>
          </>
        }
      >
        <div className={s.summary}>
          <BoardTable
            caption={`관광지 ${total}곳의 무장애 정보 요약: 구분과 곳 수`}
            head={["구분", "곳 수"]}
            cols={["70%", "auto"]}
            align={["l", "c"]}
            rowHeader
            rows={[
              [<Ph key="k">전체 관광지</Ph>, total],
              [<Ph key="k">명부에 오른 곳</Ph>, registered.length],
              [<Ph key="k">명부에 오르지 않은 곳</Ph>, unregistered.length],
              ...THREE_KEYS.map((k) => [<Ph key="k">{THREE_TEXT[k]} 글이 적힌 곳</Ph>, filled(k)]),
              [<Ph key="k">세 항목이 모두 적힌 곳</Ph>, allThree],
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
    </SubPage>
  );
}
