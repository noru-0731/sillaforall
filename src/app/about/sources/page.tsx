// 사이트 소개 > 자료 출처와 저작권(궁능 가이드 > 저작권정책 모양).
// 맨 위 안내 글(윗선 남색) → 공공누리 유형 카드(사진이 쓰는 두 유형) → • 줄과 (예시) 상자 → 출처별 칸.
// 자리표시 글만 있던 '한국관광 데이터랩' 칸과 맨 아래 문의 상자는 09-27 사용자 결정("자리표시 줄 빼기")으로 뺐다.
// KRDS 출처 문장은 행정안전부가 정한 그대로 둔다.
// 09-27 점선 1차 정리(05_사이트/11_안건_점선_문구.md): 유형 카드 아래 이 누리집 쓰임 줄 둘, '사진은 …' 점 줄, 카카오 칸 '지도(오시는 길, 편의시설)' 줄,
// 제공 기관 칸 괄호 설명, 이용허락 칸의 '… 표시 없음' 글은 뺐다(이용허락 칸은 빈칸, 09-27 사용자 "나머지는 그냥 비워요"와 같은 꼴).
// 오픈스트리트맵 칸 두 줄은 앞말·괄호를 떼어 편의시설 구분 이름('화장실·벤치·쉼터')과 자료 이름('버스 정류장')만 남겼다.
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import { Section, SubPage } from "@/components/layout/PageParts";
import { MENU } from "@/site/ia";
import { koglCondition, koglLabel, type KoglType } from "@/data/photos";
import { SOURCES } from "@/data/bf";
import { BUS_META, BUS_OSM_ROUTES_LEFT, TAGO_APIS } from "@/data/bus";
import { stepFreeSourceRows } from "@/data/stepfree";
import { GJ_SOURCE } from "@/data/gj";
import areas6 from "@/data/areas6.json";
import { BoardTable } from "@/components/royal";
import { NewWinIcon } from "@/components/layout/NewWin";
import s from "../about.module.css";

/** 경주문화관광 권역별 관광지(권역 여섯 쪽 가운데 첫 쪽) */
const AREAS6_URL: string = (areas6 as { areas: { gjUrl: string }[] }).areas[0].gjUrl;

const SECTION = MENU[3];
const PAGE = SECTION.children![1];

export const metadata: Metadata = pageMetadata(PAGE.label, PAGE.href);


/** 새 창으로 여는 바깥 링크. 새 창 표시는 KRDS ico-go 하나(NewWinIcon, 화면 읽기용 '(새 창)' 포함, 09-27) */
function OutLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={s.outLink} target="_blank" rel="noopener noreferrer" title="새 창 열림">
      {children}
      <NewWinIcon />
    </a>
  );
}

/**
 * 제공 기관 칸: 괄호 앞 기관 이름(포털에서 옮긴 글)만 적는다. 괄호 설명(Claude가 적은 글, 가 35번에서 점선)은 09-27 점선 1차 정리로 뺐다.
 * 예: "행정안전부(지방자치단체 기초자료 등록)" → "행정안전부"
 */
function providerCell(provider: string): string {
  return provider.replace(/\(.+\)$/, "");
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

// 무장애 시안(bf-draft): 가까운 편의시설·교통약자 이동지원센터·배리어프리 문화예술관광지에 쓴 공공데이터(amenities.json sources).
// 칸 값은 도구/06_편의시설.py 가 포털 쪽과 받은 파일에서 확인해 적은 것(2026-09-25).
const PORTAL_KEYS = ["toiletStd", "parking", "charger", "mobilityCenter", "bfCulture"] as const;
// 기준일 칸의 칸 이름은 곳마다 쪽 출처 줄과 같게 띄어 쓴다(data/bf.ts stdLabel: 데이터기준일자 → 데이터 기준 일자, 최종작성일 → 최종 작성일).
// '자료' 칸의 자료 이름은 포털 제목 그대로(주소와 같이 적는 인용).
const REF_DATE: Record<(typeof PORTAL_KEYS)[number], string> = {
  toiletStd: "데이터 기준 일자 2019-09-21",
  parking: "데이터 기준 일자 2026-04-16",
  charger: "데이터 기준 일자 2025-09-15",
  mobilityCenter: "데이터 기준 일자 2025-08-20",
  bfCulture: "최종 작성일 2022-11-25",
};

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
            </div>
          </li>
        </ul>

        <ul className={s.bullets}>
          <li>
            공공누리 제1유형부터 제4유형은 출처를 반드시 표시하여야 합니다.
            <div className={s.example}>
              <strong>(예시)</strong>
              {/* 출처 표시 예(유형까지 적은 긴 꼴). 사진 곁에는 짧은 꼴("ⓒ한국관광공사")만 적는다 */}
              사진: 한국관광공사 관광정보, {koglLabel("Type1")}
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
            <NewWinIcon />
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

      <Section id="portal" title="공공데이터포털(data.go.kr)">
        <BoardTable
          caption="가까운 편의시설, 교통약자 이동 지원, 버스 정류장·노선에 쓴 공공데이터: 자료, 제공 기관, 이용허락, 기준일, 주소"
          head={["자료", "제공 기관", "이용허락", "기준일", "주소"]}
          cols={["24%", "18%", "20%", "14%", "auto"]}
          align={["l", "l", "l", "c", "l"]}
          rows={[
            ...PORTAL_KEYS.map((k) => {
              const src = SOURCES[k];
              return [
                src.name.replace(/\(.*\)$/, ""),
                providerCell(src.provider),
                src.license.startsWith("이용허락범위 제한 없음") ? "이용허락범위 제한 없음" : "",
                REF_DATE[k],
                <OutLink key="u" href={src.url}>
                  {src.url.replace(/^https:\/\//, "")}
                </OutLink>,
              ];
            }),
            // 오시는 길 대중교통의 정류장 위치·이름·번호(도구/07_버스.py, 07_버스_읽는법.md 3-1)
            [
              BUS_META.molit.name,
              "국토교통부",
              BUS_META.molit.license,
              `정보수집일 ${BUS_META.molit.refDate}`,
              <OutLink key="u" href={BUS_META.molit.url}>
                {BUS_META.molit.url.replace(/^https:\/\//, "")}
              </OutLink>,
            ],
            // 오시는 길 대중교통의 노선 번호·기점·종점·첫차시간·막차시간·배차간격(도구/20_버스_TAGO.py). 이용허락은 포털 쪽 값 그대로(2026-09-26)
            ...TAGO_APIS.map((a) => [
              a.name,
              a.provider,
              a.license,
              `${BUS_META.tago.fetched} 받음`,
              <OutLink key="u" href={a.url}>
                {a.url.replace(/^https:\/\//, "")}
              </OutLink>,
            ]),
          ]}
        />
      </Section>

      {/* 관광지 무장애 정보 쪽 '경주시 무장애 여행정보' 절(도구/15_경주시_무장애.py). 원 쪽에 공공누리 표시가 없어 사실만 옮겼다.
          두 누리집으로 가는 링크는 싣지 않으므로 주소는 글자로만 둔다. */}
      <Section id="gyeongju" title="경주시 문화관광">
        <BoardTable
          caption="관광지 무장애 정보와 권역에 쓴 경주시 자료: 자료, 제공 기관, 이용허락, 기준일, 주소"
          head={["자료", "제공 기관", "이용허락", "기준일", "주소"]}
          cols={["24%", "18%", "20%", "14%", "auto"]}
          align={["l", "l", "l", "c", "l"]}
          rows={[
            [
              "무장애 여행정보",
              "경주시",
              "",
              `${GJ_SOURCE.checked} 확인`,
              <span key="u" className={s.plainUrl}>
                {GJ_SOURCE.url.replace(/^https:\/\//, "")}
              </span>,
            ],
            [
              "권역별 관광지",
              "경주시",
              "",
              "2026-09-26 확인",
              <span key="u" className={s.plainUrl}>
                {AREAS6_URL.replace(/^https:\/\//, "")}
              </span>,
            ],
          ]}
        />
      </Section>

      {/* 무장애 정보 > 계단 없는 길 쪽 끝 출처 줄의 자료(data/stepfree.json, 도구/19_계단없는길.py). 칸 값은 data/stepfree.ts */}
      <Section id="stepfree" title="계단 없는 길">
        <BoardTable
          caption="계단 없는 길에 쓴 자료: 자료, 제공 기관, 이용허락, 기준일, 주소"
          head={["자료", "제공 기관", "이용허락", "기준일", "주소"]}
          cols={["24%", "18%", "20%", "14%", "auto"]}
          align={["l", "l", "l", "c", "l"]}
          rows={stepFreeSourceRows().map((r) => [
            r.name,
            r.provider,
            r.licensePh ? "" : r.license,
            r.refDate,
            r.link ? (
              <OutLink key="u" href={r.url}>
                {r.url.replace(/^https:\/\//, "")}
              </OutLink>
            ) : (
              <span key="u" className={s.plainUrl}>
                {r.url.replace(/^https:\/\//, "")}
              </span>
            ),
          ])}
        />
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

      {/* 오시는 길·편의시설 지도(components/map/PlaceMap). 카카오 지도가 뜨지 않을 때는 오픈스트리트맵 지도(아래 칸)로 그린다 */}
      <Section id="kakao" title="Kakao 지도 API">
        <ul className={`${s.bullets} ${s.bulletsTight}`}>
          <li>© Kakao Corp.</li>
        </ul>
        <p>
          <OutLink href="https://apis.map.kakao.com">apis.map.kakao.com</OutLink>
        </p>
      </Section>

      <Section id="osm" title="오픈스트리트맵(OpenStreetMap)">
        <ul className={`${s.bullets} ${s.bulletsTight}`}>
          <li>
            화장실·벤치·쉼터
          </li>
          <li>
            {/* 노선 번호는 TAGO 로 바꿨다. TAGO 에서 짝을 못 찾아 오픈스트리트맵 노선이 남은 정류장이 있을 때만 '노선 번호'까지 */}
            {BUS_OSM_ROUTES_LEFT ? "버스 정류장·노선 번호" : "버스 정류장"}
          </li>
          <li>© OpenStreetMap 기여자</li>
          <li>ODbL(Open Database License)</li>
        </ul>
        <p>
          <OutLink href="https://www.openstreetmap.org/copyright">www.openstreetmap.org/copyright</OutLink>
        </p>
      </Section>
    </SubPage>
  );
}
