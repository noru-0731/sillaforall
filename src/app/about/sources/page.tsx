// 사이트 소개 > 자료 출처와 저작권(궁능 가이드 > 저작권정책 모양).
// 맨 위 안내 글(윗선 남색) → 공공누리 유형 카드(사진이 쓰는 두 유형) → • 줄과 (예시) 상자 → 출처별 칸.
// 자리표시 글만 있던 '한국관광 데이터랩' 칸과 맨 아래 문의 상자는 09-27 사용자 결정("자리표시 줄 빼기")으로 뺐다.
// 09-28(사용자 "알아서"): '한국관광 데이터랩' 칸을 사실 칸(메뉴 이름, 제공 기관, 기간, 주소)만으로 되살렸다. 새로 지은 글은 없다.
// 09-28 밤: 데이터랩 칸 아래에 누구나 신라 칸(관광지 61곳 무장애 정보 CSV 내려받기)을 더했다.
// KRDS 출처 문장은 행정안전부가 정한 그대로 둔다.
// 09-27 점선 1차 정리(05_사이트/11_안건_점선_문구.md): 유형 카드 아래 이 누리집 쓰임 줄 둘, '사진은 …' 점 줄, 카카오 칸 '지도(오시는 길, 편의시설)' 줄,
// 제공 기관 칸 괄호 설명, 이용허락 칸의 '… 표시 없음' 글은 뺐다(이용허락 칸은 빈칸, 09-27 사용자 "나머지는 그냥 비워요"와 같은 꼴).
// 오픈스트리트맵 칸 두 줄은 앞말·괄호를 떼어 편의시설 구분 이름('화장실·벤치·쉼터')과 자료 이름('버스 정류장')만 남겼다.
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import { Section, SubPage } from "@/components/layout/PageParts";
import { MENU } from "@/site/ia";
import { extraSources, koglCondition, koglLabel, koglNo, type KoglType } from "@/data/photos";
import { placeById } from "@/data";
import { SOURCES } from "@/data/bf";
import { BUS_META, BUS_OSM_ROUTES_LEFT, TAGO_APIS } from "@/data/bus";
import { stepFreeSourceRows } from "@/data/stepfree";
import { GJ_SOURCE } from "@/data/gj";
import areas6 from "@/data/areas6.json";
import { BoardTable } from "@/components/royal";
import { NewWinIcon } from "@/components/layout/NewWin";
import { Ph } from "@/components/layout/Ph";
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
        제{koglNo(type)}유형 {koglCondition(type)}
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

// 채운 사진의 출처 줄(국가유산청 유산마다, 위키미디어 파일마다, 경주시정뉴스 기사마다)
const EXTRA_ROWS = extraSources();
const HERITAGE = EXTRA_ROWS.filter((r) => r.from === "heritage");
const WIKIMEDIA = EXTRA_ROWS.filter((r) => r.from === "wikimedia");
const GJ_NEWS = EXTRA_ROWS.filter((r) => r.from === "gyeongju");
/** 사진을 쓴 관광지 이름(여럿이면 가운뎃점으로) */
const placesLabel = (ids: string[]) => ids.map((id) => placeById(id)?.name ?? id).join("·");
/** 위키미디어 파일 쪽 주소의 한글을 읽을 수 있게(%EA… → 한글). 풀 수 없으면 그대로 */
function safeDecode(u: string): string {
  try {
    return decodeURIComponent(u);
  } catch {
    return u;
  }
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
          {/* 제4유형: 주사암 국가유산청 사진 1장(09-27 사용자 결정). 문장은 궁능 저작권정책의 제4유형 문장 그대로 */}
          <li className={s.card}>
            <h3 className={s.cardHead}>제4유형 : 출처표시+상업적 이용금지+변경금지</h3>
            <div className={s.cardBody}>
              <KoglText type="Type4" />
              <p>
                공공저작물의 출처를 명시하여 이용할 수 있으나, 상업적 목적으로 이용하거나 2차적저작물 작성 등 변경하여 이용하는 것은
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

      {/* 관광지 61곳과 첫 쪽 19곳(data/places.json side·share60), 연관 관광지 묶음(cluster)을 고른 한국관광 데이터랩 자료.
          연관 관광지 묶음은 이 메뉴의 원자료인 '관광지별 연관 관광지 정보'(공공데이터포털 15128560)의 28달 명단으로 만들었다(11차 제출 근거표 A1).
          이용허락 칸은 다른 칸과 같이 빈칸(09-27 "나머지는 그냥 비워요") */}
      <Section id="datalab" title="한국관광 데이터랩">
        <BoardTable
          caption="관광지 목록과 연관 관광지에 쓴 한국관광 데이터랩 자료: 자료, 제공 기관, 이용허락, 기준일, 주소"
          head={["자료", "제공 기관", "이용허락", "기준일", "주소"]}
          cols={["24%", "18%", "20%", "14%", "auto"]}
          align={["l", "l", "l", "c", "l"]}
          rows={[
            [
              "관광지별 성/연령 방문 집중률",
              "한국관광공사",
              "",
              "2026년 1~8월",
              <OutLink key="u" href="https://datalab.visitkorea.or.kr">
                datalab.visitkorea.or.kr
              </OutLink>,
            ],
            [
              "중심-연관 관광지 지도",
              "한국관광공사",
              "",
              "2024년 5월~2026년 8월",
              <OutLink key="u" href="https://datalab.visitkorea.or.kr">
                datalab.visitkorea.or.kr
              </OutLink>,
            ],
          ]}
        />
      </Section>

      {/* 09-28 밤: 관광지 61곳 무장애 정보 표(CSV, app/sillaforall-61.csv/route.ts). 칸 값은 관람 도우미와 같고, 칸마다 자료 이름을 옆 칸에 적었다.
          표 이름 '관광지 61곳 무장애 정보'는 사이트 메뉴·칸 이름을 이은 새 말이라 <Ph>. 칸 꼴은 위 데이터랩 칸과 같다(이용허락 칸 빈칸) */}
      <Section id="sillaforall" title="누구나 신라">
        <BoardTable
          caption="누구나 신라에서 내려받는 자료: 자료, 제공 기관, 이용허락, 기준일, 주소"
          head={["자료", "제공 기관", "이용허락", "기준일", "주소"]}
          cols={["24%", "18%", "20%", "14%", "auto"]}
          align={["l", "l", "l", "c", "l"]}
          rows={[
            [
              <Ph key="n">관광지 61곳 무장애 정보(CSV)</Ph>,
              "누구나 신라",
              "",
              "2026-09-28",
              <a key="u" href="/sillaforall-61.csv" download className={s.outLink}>
                sillaforall-61.csv
              </a>,
            ],
            // 09-28 밤: 전국 256개 시군구 관광지 6,683곳(데이터랩 관광지별 성/연령 방문 집중률 2026년 1~8월, 관광정보 목록 안)의
            // 구분(노년층 중심·세대 공통·청년층 중심)과 무장애 여행 정보 등록 여부. 데이터랩 비중 값은 싣지 않는다.
            // 만든 곳: 12차/산출/전국_집중률_대조(fetch.mjs, analyze.py) → public/sillaforall-national.csv
            [
              <Ph key="n">전국 관광지 무장애 정보 등록(CSV)</Ph>,
              "누구나 신라",
              "",
              "2026-09-28",
              <a key="u" href="/sillaforall-national.csv" download className={s.outLink}>
                sillaforall-national.csv
              </a>,
            ],
          ]}
        />
      </Section>

      {/* 채운 사진(09-27, data/photos_extra.json, 도구/22_사진_채우기.py): 국가유산청 국가유산 이미지. 유산마다 한 줄.
          자료 칸은 국가유산청 자료의 국가유산 이름과 사진을 쓴 관광지, 주소는 국가유산포털의 그 유산 쪽 */}
      {HERITAGE.length > 0 && (
        <Section id="heritage" title="국가유산청 국가유산 이미지">
          <BoardTable
            caption="관광지 사진에 쓴 국가유산청 사진: 자료, 제공 기관, 이용허락, 기준일, 주소"
            head={["자료", "제공 기관", "이용허락", "기준일", "주소"]}
            cols={["24%", "18%", "20%", "14%", "auto"]}
            align={["l", "l", "l", "c", "l"]}
            rows={HERITAGE.map((r) => [
              `${r.name}(${placesLabel(r.placeIds)}, ${r.count}장)`,
              r.who,
              r.license,
              `${r.got} 받음`,
              <OutLink key="u" href={r.page}>
                {r.page.replace(/^https:\/\//, "")}
              </OutLink>,
            ])}
          />
          <p>
            <OutLink href="https://www.khs.go.kr/html/HtmlPage.do?pg=/guide/copyright.jsp&mn=NS_08_03">www.khs.go.kr/html/HtmlPage.do?pg=/guide/copyright.jsp</OutLink>
          </p>
        </Section>
      )}

      {/* 채운 사진 가운데 위키미디어 공용 사진: 파일마다 저작자·이용허락·파일 쪽 링크(CC 이용허락의 출처 표시) */}
      {WIKIMEDIA.length > 0 && (
        <Section id="wikimedia" title="위키미디어 공용(Wikimedia Commons)">
          <BoardTable
            caption="관광지 사진에 쓴 위키미디어 공용 사진: 자료, 저작자, 이용허락, 기준일, 주소"
            head={["자료", "저작자", "이용허락", "기준일", "주소"]}
            cols={["24%", "18%", "20%", "14%", "auto"]}
            align={["l", "l", "l", "c", "l"]}
            rows={WIKIMEDIA.map((r) => [
              `${r.name}(${placesLabel(r.placeIds)})`,
              r.who,
              r.licenseUrl ? (
                <OutLink key="l" href={r.licenseUrl}>
                  {r.license}
                </OutLink>
              ) : (
                r.license
              ),
              `${r.got} 받음`,
              <OutLink key="u" href={r.page}>
                {safeDecode(r.page.replace(/^https:\/\//, ""))}
              </OutLink>,
            ])}
          />
        </Section>
      )}

      {/* 채운 사진 가운데 경주시정뉴스(경주시청 최신기사) 사진: 기사마다 한 줄. 자료 칸은 기사 제목과 사진을 쓴 관광지,
          이용허락은 기사 쪽 공공누리 상자('경주시청이 창작한 최신기사 저작물은 "공공누리" 제1유형:출처표시 …'), 주소는 그 기사 쪽 */}
      {GJ_NEWS.length > 0 && (
        <Section id="gyeongju-news" title="경주시정뉴스">
          <BoardTable
            caption="관광지 사진에 쓴 경주시정뉴스 사진: 자료, 제공 기관, 이용허락, 기준일, 주소"
            head={["자료", "제공 기관", "이용허락", "기준일", "주소"]}
            cols={["24%", "18%", "20%", "14%", "auto"]}
            align={["l", "l", "l", "c", "l"]}
            rows={GJ_NEWS.map((r) => [
              `${r.name}(${placesLabel(r.placeIds)}, ${r.count}장)`,
              r.who,
              r.license,
              `${r.got} 받음`,
              <OutLink key="u" href={r.page}>
                {r.page.replace(/^https:\/\//, "")}
              </OutLink>,
            ])}
          />
        </Section>
      )}

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
            // 오시는 길 대중교통의 노선 번호·기점·종점·첫차시간·막차시간·배차간격(도구/20_버스_TAGO.py)과 주 노선(도구/23_버스_주노선.py).
            // 이용허락은 포털 쪽 값 그대로(2026-09-26). 자료 칸은 '이름(쓴 작업, …)' 꼴(계단 없는 길 칸과 같은 꼴), 작업 이름은 포털 화면 글 그대로
            ...TAGO_APIS.map((a) => [
              `${a.name}(${a.ops.join(", ")})`,
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
