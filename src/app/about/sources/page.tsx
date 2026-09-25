// 사이트 소개 > 자료 출처와 저작권(궁능 가이드 > 저작권정책 모양).
// 맨 위 안내 글(윗선 남색) → 공공누리 유형 카드(사진이 쓰는 두 유형) → • 줄과 (예시) 상자 → 출처별 칸 → 문의 상자.
// KRDS 출처 문장은 행정안전부가 정한 그대로 둔다.
import type { Metadata } from "next";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { Icon } from "@/components/icons";
import { MENU } from "@/site/ia";
import { koglCondition, photoCredit, type KoglType } from "@/data/photos";
import s from "../about.module.css";

const SECTION = MENU[3];
const PAGE = SECTION.children![1];

export const metadata: Metadata = { title: PAGE.label };


/** 새 창으로 여는 바깥 링크 */
function OutLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={s.outLink} target="_blank" rel="noopener noreferrer" title="새 창 열림">
      {children}
      <Icon name="external" size={18} strokeWidth={1.8} />
    </a>
  );
}

/** 공공누리 표시 그림 대신 글자 상자 */
function KoglText({ type }: { type: KoglType }) {
  return (
    <span className={s.kogl} aria-hidden="true">
      <span>공공누리</span>
      <span>
        {type === "Type1" ? "제1유형" : "제3유형"} {koglCondition(type)}
      </span>
    </span>
  );
}

export default function SourcesPage() {
  return (
    <SubPage
      crumbs={[
        { label: SECTION.label, href: SECTION.href },
        { label: PAGE.label, href: PAGE.href },
      ]}
      title={PAGE.label}
      side={SECTION}
      current={PAGE.href}
    >
      {/* 맨 위 안내 글(궁능 저작권정책 첫 상자) */}
      <div className={s.stmt}>
        <p>화면 구성은 국가유산청 궁능유적본부 누리집(royal.khs.go.kr)을 참고했습니다.</p>
      </div>

      <Section id="kogl" title="공공저작물 자유이용허락표시기준(공공누리, KOGL)">
        <ul className={s.cards}>
          <li className={s.card}>
            <h3 className={s.cardHead}>제1유형 : 출처표시</h3>
            <div className={s.cardBody}>
              <KoglText type="Type1" />
              <p>공공저작물의 출처를 명시하고, 상업적 활용 여부에 관계없이 이용하며, 2차적저작물 작성 등 변경하여 이용할 수 있다.</p>
              <p className={s.cardUse}>
                <Ph>이 누리집에서는 배너, 카드처럼 사진을 잘라 쓰는 자리에 씁니다.</Ph>
              </p>
            </div>
          </li>
          <li className={s.card}>
            <h3 className={s.cardHead}>제3유형 : 출처표시+변경금지</h3>
            <div className={s.cardBody}>
              <KoglText type="Type3" />
              <p>
                공공저작물의 출처를 명시하여, 상업적 활용 여부에 관계없이 이용할 수 있으나, 2차적저작물 작성 등 변경하여 이용하는 것은
                금지된다.
              </p>
              <p className={s.cardUse}>
                <Ph>
                  이 누리집은 제3유형 사진을 자르지 않고 사진 전체가 보이게 씁니다. 남는 곳은 단색 바탕으로 두고, 흐리게 하거나 글자를
                  겹치지 않습니다.
                </Ph>
              </p>
            </div>
          </li>
        </ul>

        <ul className={s.bullets}>
          <li>
            <Ph>사진은 한국관광공사 관광정보(TourAPI)와 관광사진 정보(한국관광콘텐츠랩)의 사진입니다.</Ph>
          </li>
          <li>
            공공누리 제1유형부터 제4유형은 출처를 반드시 표시하여야 합니다.
            <div className={s.example}>
              <strong>(예시)</strong>
              {photoCredit("Type1")}
            </div>
          </li>
        </ul>
      </Section>

      <Section id="krds" title="범정부 UI/UX 디자인시스템(KRDS)">
        <p className={`${s.sourceText}`}>
          본 저작물은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 ‘범정부 UI/UX 디자인시스템(KRDS)’을
          이용하였으며, 해당 저작물은 ‘
          <a href="https://www.krds.go.kr" className={s.inlineLink} target="_blank" rel="noopener noreferrer" title="새 창 열림">
            KRDS 디자인시스템 홈페이지(www.krds.go.kr)
          </a>
          ’에서 무료로 다운받으실 수 있습니다.
        </p>
      </Section>

      <Section id="tourapi" title="한국관광공사 TourAPI">
        <ul className={`${s.bullets} ${s.bulletsTight}`}>
          <li>관광정보</li>
          <li>무장애 여행 정보</li>
          <li>대표사진</li>
          <li>관광사진 정보</li>
        </ul>
        <p>
          <OutLink href="https://api.visitkorea.or.kr/#/useServiceGuide/2">api.visitkorea.or.kr/#/useServiceGuide/2</OutLink>
        </p>
        <p>
          <OutLink href="https://knto.or.kr/helpdeskCopyrightguide">knto.or.kr/helpdeskCopyrightguide</OutLink>
        </p>
      </Section>

      <Section id="boundary" title="읍면동 경계선">
        <ul className={`${s.bullets} ${s.bulletsTight}`}>
          <li>통계청 SGIS 행정구역 경계(2026년 7월)</li>
          <li>vuski/admdongkor 가공</li>
          <li>CC BY 4.0</li>
        </ul>
        <p>
          <OutLink href="https://github.com/vuski/admdongkor">github.com/vuski/admdongkor</OutLink>
        </p>
      </Section>

      <Section id="osm" title="오픈스트리트맵(OpenStreetMap)">
        <ul className={`${s.bullets} ${s.bulletsTight}`}>
          <li>© OpenStreetMap 기여자</li>
          <li>ODbL(Open Database License)</li>
        </ul>
        <p>
          <OutLink href="https://www.openstreetmap.org/copyright">www.openstreetmap.org/copyright</OutLink>
        </p>
      </Section>

      <Section id="datalab" title="한국관광 데이터랩">
        <p className={s.sourceText}>
          <Ph>분석에 쓴 자료의 이름, 기간, 항목을 적습니다.</Ph>
        </p>
      </Section>

      {/* 맨 아래 문의 상자(궁능 "저작권 정책 관련 문의") */}
      <div className={s.contact}>
        <p>
          <strong>자료 출처 관련 문의 : </strong>
          <Ph>만든 팀 연락처를 적을 자리</Ph>
        </p>
      </div>
    </SubPage>
  );
}
