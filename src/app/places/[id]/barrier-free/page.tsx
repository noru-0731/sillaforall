// 관광지 무장애 정보(61곳). 궁능 누리집 "관람시간"(hours) 모양:
// 윗줄 상자(궁능 정기휴일 두 상자 → 우리: 주차·걷는 길·화장실 세 상자) + ※ 줄 → 표(궁능 일반관람시간 표 → 우리: 무장애 정보 칸).
// 명부(한국관광공사 무장애 여행 정보) 글은 손대지 않고 그대로 싣는다. 줄바꿈이 빠져 붙은 자리만 줄을 나눈다(lib/breaks.ts).
//
// 무장애 시안(bf-draft)에서 더한 것:
// - 명부의 채워진 칸을 모두(예전에는 이동 일곱 칸만). 관광공사 묶음(지체장애, 시각장애, 청각장애, 영유아 가족)대로 나누고 칸 이름은 자료 그대로.
// - 명부에 없는 곳: 300m 안에서 명부에 오른 관광지·문화시설(barrierfree.json candidates)의 칸. 그 곳의 정보가 아님을 ※ 줄로 밝힌다.
// - 배리어프리 문화예술관광지(한국문화정보원) 행이 이름으로 짝지어진 12곳: Y/N 칸.
// - 가까운 편의시설: 진짜 지도 위 번호 네모 + 목록 표(궁능 관람코스 편의시설 지도 모양, components/place/Amenities.tsx).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { placeById, places } from "@/data";
import { amenitiesOf, bfCultureOf, bfGroupsOf, bfNeighborsOf, BF_SOURCE, NEAR_RADII, sourceLines, type AmenitySrc } from "@/data/bf";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { Icon, type IconName } from "@/components/icons";
import { BoardTable, TipList } from "@/components/royal";
import { withJosa } from "@/lib/josa";
import { bfLines } from "@/lib/breaks";
import { nearestRegistered } from "@/components/place/placeData";
import { AmenityMap, AmenityTable, SourceLines, amenityPoints, legendOf } from "@/components/place/Amenities";
import s from "@/components/place/Place.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return { title: p ? `${p.name} 무장애 정보` : "무장애 정보" };
}

const EMPTY = <Ph>적힌 내용 없음</Ph>;
const fmtM = (m: number) => `${m.toLocaleString("ko-KR")}m`;
const pre = (t: string) => <span className={s.pre}>{t}</span>;
const BF_CREDIT = `자료: ${BF_SOURCE.name}(${BF_SOURCE.fetched} 받음)`;

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

export default async function PlaceBarrierFree({ params }: Props) {
  const { id } = await params;
  const p = placeById(id);
  if (!p) notFound();

  const page = placePages(p)[3];
  const near = nearestRegistered(p);
  const groups = bfGroupsOf(p.id);
  const neighbors = bfNeighborsOf(p.id);
  const bfc = bfCultureOf(p.id);
  const am = amenitiesOf(p.id);
  const items = am?.items.map((i) => ({ ...i, show: i.no })) ?? [];

  return (
    <SubPage crumbs={placeCrumbs(p, page)} title={page.label} banner={PLACE_BANNER} sideMenu={placeSideMenu(p)} current={page.href}>
      {p.registered ? (
        <>
          <Section title="주차·접근로·화장실">
            <ul className={s.boxes}>
              <Box icon="parking" title="주차">
                {bfLines(p.three.parking) ?? EMPTY}
              </Box>
              <Box icon="walk" title="접근로">
                {bfLines(p.three.walk) ?? EMPTY}
              </Box>
              <Box icon="toilet" title="화장실">
                {bfLines(p.three.toilet) ?? EMPTY}
              </Box>
            </ul>
          </Section>

          <Section title={`${p.name} 무장애 정보`}>
            {groups.map((g) => (
              <div key={g.name} className={s.bfGroup}>
                <h3 className={s.bfGroupTit}>{g.name}</h3>
                <BoardTable
                  caption={`${p.name} 무장애 정보: ${g.name}`}
                  head={["구분", "내용"]}
                  cols={["25%", "auto"]}
                  align={["c", "l"]}
                  rowHeader
                  rows={g.rows.map(([k, v]) => [k === "휠체어" ? "휠체어대여" : k, pre(v)])}
                />
              </div>
            ))}
            <TipList className={s.tipsAfterTable} items={[<Ph key="a">명부에 글이 적힌 칸만 보입니다.</Ph>]} />
            <SourceLines lines={[BF_CREDIT]} />
          </Section>
        </>
      ) : (
        <>
          <Section title="주차·접근로·화장실">
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
          </Section>

          {neighbors.length > 0 && (
            <Section title={<Ph>가까운 곳의 무장애 정보</Ph>}>
              {neighbors.map((n) => (
                <div key={n.contentId} className={s.bfGroup}>
                  <h3 className={s.bfGroupTit}>{n.title}</h3>
                  {/* 좌표를 빌린 곳(서악서원)은 빌린 좌표로 잰 거리라 적지 않는다(오시는 길·가까운 편의시설과 같은 규칙) */}
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
                    rows={n.groups.flatMap((g) => g.rows).map(([k, v]) => [k, pre(v)])}
                  />
                </div>
              ))}
              <TipList
                className={s.tipsAfterTable}
                items={[
                  <Ph key="a">
                    위 표는 {withJosa(p.name, "이/가")} 아니라 {p.approx ? "" : "300m 안에 있는 "}다른 곳의 한국관광공사 무장애 여행 정보입니다.
                  </Ph>,
                  ...(p.approx
                    ? [<Ph key="b">지도 위 자리는 가까운 곳의 좌표를 빌려 쓴 것이라 실제 자리와 조금 다를 수 있습니다.</Ph>]
                    : []),
                ]}
              />
              <SourceLines lines={[BF_CREDIT]} />
            </Section>
          )}
        </>
      )}

      {bfc && (
        <Section title="배리어프리 문화예술관광지">
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
              ...bfc.rows.map(([k, v]) => [k, v === "Y" ? "예" : v === "N" ? "아니요" : v]),
              ...(bfc.hours ? [["운영시간", pre(bfc.hours)]] : []),
              ...(bfc.closed ? [["휴무일", pre(bfc.closed)]] : []),
            ]}
          />
          <TipList
            className={s.tipsAfterTable}
            items={[<Ph key="a">이름이 같은 행을 옮겼습니다. 표의 예는 자료의 Y, 아니요는 N입니다.</Ph>]}
          />
          <SourceLines lines={["자료: 한국문화정보원_전국 배리어프리 문화예술관광지(최종작성일 2022-11-25)"]} />
        </Section>
      )}

      {am && (
        <Section id="near" title={<Ph>가까운 편의시설</Ph>}>
          <AmenityMap
            lat={p.lat}
            lon={p.lon}
            name={p.name}
            tall
            points={amenityPoints(items, "am", am.rest)}
            legend={legendOf([...items.map((i) => i.kind), ...am.rest.map((r) => r.kind)], p.name)}
          />
          <AmenityTable items={items} idPrefix="am" caption={`${p.name} 가까운 편의시설: 번호, 구분, 이름, 직선거리, 내용, 자료`} />
          <TipList
            className={s.tipsAfterTable}
            items={[
              <Ph key="a">거리는 두 곳 사이의 직선거리입니다. 길을 따라 걷는 거리와 다릅니다.</Ph>,
              <Ph key="b">
                화장실은 {NEAR_RADII.toilet.toLocaleString("ko-KR")}m, 공영주차장은 {NEAR_RADII.parking}m 안에서 가까운 곳부터 몇 곳만 보입니다.{" "}
                {NEAR_RADII.toilet.toLocaleString("ko-KR")}m 안에 장애인 화장실이나 충전기가 없으면 가장 가까운 한 곳을 보입니다.
              </Ph>,
              <Ph key="c">같은 화장실이 두 자료에 함께 있으면 두 줄로 보일 수 있습니다. 공영주차장 자료에는 사찰·관광지 자체 주차장이 없습니다.</Ph>,
              ...(am.rest.length ? [<Ph key="d">벤치·쉼터는 {NEAR_RADII.benchShelter}m 안의 것을 지도에만 표시했습니다.</Ph>] : []),
            ]}
          />
          <SourceLines
            lines={sourceLines([...new Set<AmenitySrc | "osmRest">([...items.map((i) => i.src), ...(am.rest.length ? ["osmRest" as const] : [])])])}
          />
        </Section>
      )}
    </SubPage>
  );
}
