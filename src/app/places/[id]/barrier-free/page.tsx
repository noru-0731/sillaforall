// 관광지 무장애 정보(61곳). 궁능 누리집 "관람시간"(hours) 모양:
// 윗줄 상자(궁능 정기휴일 두 상자 → 우리: 주차·접근로·화장실 세 상자) + ※ 줄 → 표(궁능 일반관람시간 표 → 우리: 무장애 정보 칸).
// 한국관광공사 무장애 여행 정보 글은 손대지 않고 그대로 싣는다. 줄바꿈이 빠져 붙은 자리만 줄을 나눈다(lib/breaks.ts).
//
// 무장애 시안(bf-draft)에서 더한 것:
// - 무장애 여행 정보의 채워진 칸을 모두(예전에는 이동 일곱 칸만). 관광공사 묶음(지체장애, 시각장애, 청각장애, 영유아 가족)대로 나누고 칸 이름은 자료 그대로.
// - 무장애 정보가 없는 곳: 300m 안에서 무장애 정보가 있는 관광지·문화시설(barrierfree.json candidates)의 칸. 그 곳의 정보가 아님을 ※ 줄로 밝힌다.
// - 배리어프리 문화예술관광지(한국문화정보원) 행이 이름으로 짝지어진 12곳: Y/N 칸(09-26 평가 고침: 예/아니요 대신 편의시설 표와 같은 있음/없음·가능/불가, data/bf.ts stdValue).
// - 편의시설: 진짜 지도 위 번호 네모 + 목록 표(궁능 관람코스 편의시설 지도 모양, components/place/Amenities.tsx).
//
// 페르소나 장점 묶음3(morning)에서 더한 것:
// - 가10 쪽 머리에 문의 전화 줄(AccessAble 장소 이름 아래 전화 줄. 모양은 오시는 길 '연락처' 줄과 같다).
// - 가9 그 아래 글이 있는 칸의 그림 줄(카카오맵 매장 정보처럼 그림 + 칸 이름). 글이 있는 칸만 그린다(빈칸은 '없음'이 아니라서). '… 기타' 칸은 뺀다.
// - 가12 겹침 줄이기: 세 상자에 실은 칸(주차·접근로(없으면 출입통로)·화장실)은 아래 무장애 정보 표에서 뺀다.
//   절이 둘 이상이면 KRDS '이 페이지의 구성' 목차를 두고, 절마다 제목 줄을 눌러 접고 연다(궁능 자주 묻는 질문의 '열기'·'닫기'). 처음에는 모두 열려 있다.
//
// 경주시 무장애 여행정보(gjinfo)에서 더한 것:
// - 절 '경주시 무장애 여행정보'(원 누리집 쪽 이름). 관광공사 무장애 정보 절(표 절, 없으면 주차·접근로·화장실 절) 바로 다음.
//   원 쪽 곳 이름(작은 제목) + 구분/내용 표 + 출처 줄. 공공누리 표시가 없는 쪽이라 사실만 칸으로(data/gj.ts). 관광공사 값과 달라도 고치지 않는다.
import type { Metadata } from "next";
import { placeMetadata } from "@/site/og";
import Link from "next/link";
import { notFound } from "next/navigation";
import { placeById, places } from "@/data";
import { GJ_CREDIT, GJ_SOURCE, gjOf } from "@/data/gj";
import { amenitiesOf, bfCultureOf, bfFilledFieldsOf, bfGroupsOf, bfLabel, bfNeighborsOf, BF_CULTURE_SOURCE_LINE, BF_SOURCE, NEAR_RADII, sourceLines, stdLabel, stdValue, type AmenitySrc } from "@/data/bf";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { InPageNav, Ph, Section, SubPage } from "@/components/layout/PageParts";
import { parkingFill, toiletFill, walkFill } from "@/data/fill";
import { FillText } from "@/components/place/FillText";
import { Icon, type IconName } from "@/components/icons";
import { BoardTable, TipList } from "@/components/royal";
import { withJosa } from "@/lib/josa";
import { bfLines } from "@/lib/breaks";
import { nearestRegistered, phoneOf } from "@/components/place/placeData";
import { AmenityMap, AmenityTable, SourceLines, amenityPoints, legendOf } from "@/components/place/Amenities";
import FoldOpen from "@/components/place/FoldOpen";
import PageSteps from "@/components/place/PageSteps";
import { StepFreeOnPlace } from "@/components/place/StepFree";
import { parkingFirst } from "@/components/place/amenityOrder";
import { menuPage } from "@/components/place-list/helpers";
import { STEPFREE_HREF, stepFreeOf } from "@/data/stepfree";
import { GUGSEOK_NAME, gugseokUrl } from "@/data/gugseok";
import { NewWinIcon } from "@/components/layout/NewWin";
import s from "@/components/place/Place.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return p ? placeMetadata(p.id, `${p.name} 무장애 정보`, `/places/${p.id}/barrier-free`) : { title: "무장애 정보" };
}

const fmtM = (m: number) => `${m.toLocaleString("ko-KR")}m`;
const pre = (t: string) => <span className={s.pre}>{t}</span>;
const BF_CREDIT = `자료: ${BF_SOURCE.name}(${BF_SOURCE.fetched} 받음)`;

/** 관광공사 무장애 칸 → 그림(그림 줄, 가9). 없는 칸은 ⓘ */
const FIELD_ICON: Record<string, IconName> = {
  주차: "parking",
  대중교통: "bus",
  접근로: "walk",
  매표소: "ticket",
  홍보물: "leaflet",
  휠체어: "wheelchair",
  출입통로: "door",
  엘리베이터: "elevator",
  화장실: "toilet",
  관람석: "seat",
  객실: "bed",
  점자블록: "tactile",
  "보조견 동반": "dog",
  안내요원: "staff",
  "오디오 가이드": "headphones",
  "큰 활자 홍보물": "leaflet",
  "점자 홍보물": "braille",
  "유도안내 설비": "signpost",
  "자막 비디오 가이드": "caption",
  "청각장애 객실": "bed",
  유모차: "stroller",
  수유실: "bottle",
  "유아용 보조의자": "seat",
};

function Box({ icon, title, children }: { icon: IconName; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className={s.box}>
      <span className={s.boxIco}>
        <Icon name={icon} size={36} strokeWidth={1.5} />
      </span>
      <h3 className={s.boxTit}>{title}</h3>
      <p className={s.boxTxt}>{children}</p>
    </li>
  );
}

/** 접고 여는 절(가12). 제목 줄 전체가 누르는 자리. 여닫기 이름표는 궁능 자주 묻는 질문의 '열기'·'닫기' */
function Fold({ id, title, children }: { id: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className={`rc-section ${s.fold}`}>
      <details open data-fold="" className={s.foldBox}>
        <summary className={s.foldSum}>
          <h2 className="rc-section__tit">{title}</h2>
          <span className={s.foldCtl} aria-hidden="true">
            <span className={s.foldOn}>닫기</span>
            <span className={s.foldOff}>열기</span>
            <Icon name="chevron-down" size={22} strokeWidth={1.8} className={s.foldChev} />
          </span>
        </summary>
        {children}
      </details>
    </section>
  );
}

type Part = { id: string; title: React.ReactNode; body: React.ReactNode };

export default async function PlaceBarrierFree({ params }: Props) {
  const { id } = await params;
  const p = placeById(id);
  if (!p) notFound();

  const page = placePages(p)[3];
  const near = nearestRegistered(p);
  const neighbors = bfNeighborsOf(p.id);
  const bfc = bfCultureOf(p.id);
  const am = amenitiesOf(p.id);
  const items = parkingFirst(am?.items ?? []); // deck 갈래: 공영주차장을 맨 앞 종류로(오시는 길 번호와 같게)
  const tel = phoneOf(p.contact);
  const gg = gugseokUrl(p.id);
  const fields = bfFilledFieldsOf(p.id);
  const gj = gjOf(p.id);

  // 가12 겹침 줄이기: 세 상자에 실은 칸은 표에서 뺀다. 접근로 상자는 접근로 칸, 그 칸이 비면 출입통로 칸 글이다(types.ts three.walk).
  const allGroups = bfGroupsOf(p.id);
  const hasWalk = allGroups.some((g) => g.rows.some(([k]) => k === "접근로"));
  const inBox: Record<string, string | null> = {
    주차: p.three.parking,
    화장실: p.three.toilet,
    [hasWalk ? "접근로" : "출입통로"]: p.three.walk,
  };
  const groups = allGroups
    .map((g) => ({ ...g, rows: g.rows.filter(([k, v]) => !(inBox[k] && bfLines(inBox[k]!.trim()) === v)) }))
    .filter((g) => g.rows.length > 0);

  const parts: Part[] = [];

  parts.push({
    id: "three",
    title: "주차·접근로·화장실",
    body: p.registered ? (
      <>
        <ul className={s.boxes}>
          {/* 무장애 여행 정보 글이 없는 상자는 경주시·관광정보·가까운 편의시설로 채우고 자료 꼬리를 붙인다(data/fill.ts). 그래도 없으면 비워 둔다 */}
          <Box icon="parking" title="주차">
            {bfLines(p.three.parking) ?? <FillText fill={parkingFill(p)} />}
          </Box>
          <Box icon="walk" title="접근로">
            {bfLines(p.three.walk) ?? <FillText fill={walkFill(p)} />}
          </Box>
          <Box icon="toilet" title="화장실">
            {bfLines(p.three.toilet) ?? <FillText fill={toiletFill(p)} />}
          </Box>
        </ul>
        {groups.length === 0 && <SourceLines lines={[BF_CREDIT]} />}
      </>
    ) : (
      <>
      <ul className={s.boxes}>
        <Box icon="wheelchair" title="무장애 여행 정보">
          등록된 무장애 여행 정보가 없습니다.
        </Box>
        {near && (
          <Box icon="pin" title="인근 무장애 ‘명소’">
            {near.place ? (
              <>
                <Link href={`/places/${near.place.id}/barrier-free`}>{near.place.name}</Link>
                {near.text.slice(near.name.length)}
              </>
            ) : (
              near.text
            )}
          </Box>
        )}
      </ul>
      {/* 09-28(사용자 "알아서"): 미등록 곳도 관람 도우미와 같은 채운 값(data/fill.ts, 자료 꼬리)을 세 상자로 보인다.
          관람 도우미의 접근로·화장실 칸이 이 쪽으로 이어지는데, 전에는 '등록된 … 없습니다'만 있어 값이 끊겼다. 값이 없으면 빈칸 */}
      <ul className={`${s.boxes} ${s.boxesNext}`}>
        <Box icon="parking" title="주차">
          <FillText fill={parkingFill(p)} />
        </Box>
        <Box icon="walk" title="접근로">
          <FillText fill={walkFill(p)} />
        </Box>
        <Box icon="toilet" title="화장실">
          <FillText fill={toiletFill(p)} />
        </Box>
      </ul>
      </>
    ),
  });

  if (p.registered && groups.length > 0) {
    parts.push({
      id: "bf",
      title: `${p.name} 무장애 정보`,
      body: (
        <>
          {groups.map((g) => (
            <div key={g.name} className={s.bfGroup}>
              <h3 className={s.bfGroupTit}>{g.name}</h3>
              <BoardTable
                caption={`${p.name} 무장애 정보: ${g.name}`}
                head={["구분", "내용"]}
                cols={["25%", "auto"]}
                align={["c", "l"]}
                rowHeader
                rows={g.rows.map(([k, v]) => [bfLabel(k), pre(v)])}
              />
            </div>
          ))}
          <SourceLines lines={[BF_CREDIT]} />
        </>
      ),
    });
  }

  // 경주시 무장애 여행정보: 관광공사 이 곳 무장애 정보 절 바로 다음(무장애 정보가 없는 곳은 주차·접근로·화장실 절 다음, 인근 명소 절 앞)
  if (gj) {
    parts.push({
      id: "gj",
      title: GJ_SOURCE.section,
      body: (
        <>
          <div className={s.bfGroup}>
            <h3 className={s.bfGroupTit}>{gj.entry}</h3>
            <BoardTable
              caption={`${gj.entry} ${GJ_SOURCE.section}`}
              head={["구분", "내용"]}
              cols={["25%", "auto"]}
              align={["c", "l"]}
              rowHeader
              rows={gj.rows.map(([k, v]) => [k, pre(v)])}
            />
          </div>
          <SourceLines lines={[GJ_CREDIT]} />
        </>
      ),
    });
  }

  if (!p.registered && neighbors.length > 0) {
    parts.push({
      id: "nearby",
      title: "인근 무장애 ‘명소’",
      body: (
        <>
          {neighbors.map((n) => (
            <div key={n.contentId} className={s.bfGroup}>
              {/* 가 99번: 61곳 안 관광지의 기록이면 이름을 그 곳 무장애 정보 쪽으로 잇는다(글은 그대로) */}
              <h3 className={s.bfGroupTit}>
                {n.placeId ? (
                  <Link href={`/places/${n.placeId}/barrier-free`} className={s.cellLink}>
                    {n.title}
                  </Link>
                ) : (
                  n.title
                )}
              </h3>
              {/* 좌표를 빌린 곳(서악서원)은 빌린 좌표로 잰 거리라 적지 않는다(오시는 길·편의시설과 같은 규칙) */}
              <p className={s.bfMeta}>
                {n.typeLabel}
                {!p.approx && !n.coordsBorrowed && <> · 직선거리 {fmtM(n.distanceM)}</>}
              </p>
              <BoardTable
                caption={`${n.title} 무장애 정보`}
                head={["구분", "내용"]}
                cols={["25%", "auto"]}
                align={["c", "l"]}
                rowHeader
                rows={n.groups.flatMap((g) => g.rows).map(([k, v]) => [bfLabel(k), pre(v)])}
              />
            </div>
          ))}
          <TipList
            className={s.tipsAfterTable}
            items={[
              <Ph key="a">
                위 표는 {withJosa(p.name, "이/가")} 아니라 {p.approx ? "" : "300m 안에 있는 "}다른 곳의 한국관광공사 무장애 여행 정보입니다.
              </Ph>,
              ...(p.approx ? [<Ph key="b">지도 위 자리는 실제 자리와 조금 다를 수 있습니다.</Ph>] : []),
            ]}
          />
          <SourceLines lines={[BF_CREDIT]} />
        </>
      ),
    });
  }

  if (bfc) {
    parts.push({
      id: "bfculture",
      title: "배리어프리 문화예술관광지",
      body: (
        <>
          <p className={s.bfMeta}>
            {bfc.name} · 직선거리 {fmtM(bfc.distanceM)}
          </p>
          <BoardTable
            caption={`${bfc.name} 배리어프리 문화예술관광지 정보`}
            head={["구분", "내용"]}
            cols={["40%", "auto"]}
            align={["c", "c"]}
            rowHeader
            rows={[
              ...bfc.rows.map(([k, v]) => [stdLabel(k), stdValue(k, v)]),
              ...(bfc.hours ? [["운영시간", pre(bfc.hours)]] : []),
              ...(bfc.closed ? [["휴무일", pre(bfc.closed)]] : []),
            ]}
          />
          <SourceLines lines={[BF_CULTURE_SOURCE_LINE]} />
        </>
      ),
    });
  }

  if (am) {
    parts.push({
      id: "near",
      // '편의시설'은 궁능 관람코스 탭 이름(course.txt)이라 점선 없음(09-27 점선 1차 정리)
      title: "편의시설",
      body: (
        <>
          <AmenityMap
            lat={p.lat}
            lon={p.lon}
            name={p.name}
            tall
            points={amenityPoints(items, "am", am.rest)}
            legend={legendOf([...items.map((i) => i.kind), ...am.rest.map((r) => r.kind)], p.name)}
          />
          <AmenityTable items={items} idPrefix="am" caption={`${p.name} 가까운 편의시설: 번호, 구분, 이름, 직선거리, 내용, 자료`} />
          {/* 표 아래 점선 풀이 줄 넷(직선거리, 찾는 거리, 두 줄로 보이는 화장실, 벤치·쉼터)은 09-27 점선 1차 정리로 뺐다(11_안건_점선_문구.md).
              그 가운데 찾는 거리·자료 두 줄(전 나2·나3)은 점검(1km 밖 한 곳이 표에 왜 나오는지 화면에 글이 없음)으로 전 글(점선)로 되돌렸다. 정할 것: 다10 */}
          <TipList
            className={s.tipsAfterTable}
            items={[
              <Ph key="b">
                화장실은 {NEAR_RADII.toilet.toLocaleString("ko-KR")}m, 공영주차장은 {NEAR_RADII.parking}m 안에서 가까운 곳부터 몇 곳만 보입니다.{" "}
                {NEAR_RADII.toilet.toLocaleString("ko-KR")}m 안에 장애인 화장실이나 충전기가 없으면 가장 가까운 한 곳을 보입니다.
              </Ph>,
              <Ph key="c">같은 화장실이 두 자료에 함께 있으면 두 줄로 보일 수 있습니다. 공영주차장 자료에는 사찰·관광지 자체 주차장이 없습니다.</Ph>,
            ]}
          />
          <SourceLines
            lines={sourceLines([...new Set<AmenitySrc | "osmRest">([...items.map((i) => i.src), ...(am.rest.length ? ["osmRest" as const] : [])])])}
          />
        </>
      ),
    });
  }

  // deck 갈래: 계단 없는 길 쪽에 실린 곳이면 그 곳 덩어리를 맨 끝 절로(테마 쪽 링크와 함께)
  const sf = stepFreeOf(p.id);
  if (sf) {
    const sfTitle = menuPage(STEPFREE_HREF).title;
    parts.push({ id: "stepfree", title: sfTitle, body: <StepFreeOnPlace place={sf} title={sfTitle} /> });
  }

  // 절이 하나뿐이면 목차도 접기도 두지 않는다
  const fold = parts.length > 1;

  return (
    <SubPage crumbs={placeCrumbs(p, page)} title={page.label} banner={PLACE_BANNER} sideMenu={placeSideMenu(p)} current={page.href}>
      {(p.contact || gg || fields.length > 0) && (
        <div className={s.bfHead}>
          {/* 가10 문의 전화: 오시는 길 '연락처' 줄과 같은 모양, 관광정보 문의 글 그대로(번호만 전화 걸기 링크) */}
          {p.contact && (
            <div className={s.mapCon}>
              <Icon name="phone" size={18} strokeWidth={2} />
              <p className={s.mapConTit}>문의 전화</p>
              <p className={s.mapConTxt}>
                {tel ? (
                  <>
                    {p.contact.slice(0, p.contact.indexOf(tel))}
                    <a href={`tel:${tel.replace(/-/g, "")}`}>{tel}</a>
                    {p.contact.slice(p.contact.indexOf(tel) + tel.length)}
                  </>
                ) : (
                  p.contact
                )}
              </p>
            </div>
          )}
          {/* 09-28 밤: 대한민국 구석구석의 이 관광지 쪽(새 창). 그 쪽의 '관광정보 수정요청' 단추로 빈칸 보완을 한국관광공사에 요청할 수 있다.
              줄 이름은 구석구석 단추 이름, 링크 글은 누리집 이름 그대로(새로 지은 글 없음). 모양은 위 문의 전화 줄과 같다. 58곳(data/gugseok.ts) */}
          {gg && (
            <div className={s.mapCon}>
              <Icon name="info" size={18} strokeWidth={2} />
              <p className={s.mapConTit}>관광정보 수정요청</p>
              <p className={s.mapConTxt}>
                <a href={gg} target="_blank" rel="noopener noreferrer">
                  {GUGSEOK_NAME}
                  <NewWinIcon />
                </a>
              </p>
            </div>
          )}
          {/* 가9 글이 있는 칸 그림 줄. 아래 표와 같은 칸 이름이라 소리로 듣기는 건너뛴다 */}
          {fields.length > 0 && (
            <ul className={s.bfIcons} aria-label={`${p.name} 무장애 정보`} data-read-skip="">
              {fields.map((k) => (
                <li key={k}>
                  <Icon name={FIELD_ICON[k] ?? "info"} size={36} strokeWidth={1.5} />
                  <span>{bfLabel(k)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {fold && <InPageNav title={`${p.name} ${page.label}`} items={parts.map((x) => ({ id: x.id, label: x.title }))} />}

      {parts.map((x) =>
        fold ? (
          <Fold key={x.id} id={x.id} title={x.title}>
            {x.body}
          </Fold>
        ) : (
          <Section key={x.id} id={x.id} title={x.title}>
            {x.body}
          </Section>
        ),
      )}

      {fold && <FoldOpen />}
      {/* deck 갈래: 쪽 끝 이어 읽기 */}
      <PageSteps place={p} at={3} />
    </SubPage>
  );
}
