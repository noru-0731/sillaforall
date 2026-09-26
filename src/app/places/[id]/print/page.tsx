// 한 곳 모아 인쇄(61곳, 페르소나 장점 취합 가14). AccessAble 장소 안내의 'Print/Save as PDF' 한 번 자리.
// 소개·무장애 정보·오시는 길 세 쪽을 따로 뽑으면 인쇄 세 번에 A4 여섯 장이고 큰 제목이 쪽 이름이었다.
// 이 쪽은 큰 제목이 곳 이름이고, 세 쪽의 글 자료만 한 쪽에 모은다(지도·사진·알약 줄·검정 띠·길찾기 단추는 싣지 않는다).
// - 기본 정보: 소개 쪽 기본 정보 표와 같은 칸.
// - 무장애 정보: 명부에 오른 곳은 무장애 정보 쪽의 칸 전부(묶음별 표, 세 상자에 실은 칸도 표에). 명부에 없는 곳은 그 쪽의 두 상자 글.
//   그 뒤에 경주시 무장애 여행정보 표(짝지은 12곳, 무장애 정보 쪽과 같은 표, data/gj.ts).
// - 오시는 길: 가까운 정류장 셋·경주역(KTX) 노선(오시는 길 쪽과 같은 글), 무장애 여행 정보 대중교통 글(있을 때만), 교통약자이동지원센터 예약 전화.
// 글은 모두 이미 다른 쪽에 있는 이름표와 자료 값이다. 단추는 서브 쪽 인쇄 단추 그대로(휴대전화에서도 보인다).
// 들어오는 곳: 관광지 서브메인 관람 도우미 제목 아래 인쇄 단추. 메뉴·사이트맵에는 싣지 않는다.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areaLabelOf, nearestRegistered, phoneOf } from "@/components/place/placeData";
import { placeById, places, zipOf } from "@/data";
import type { Place } from "@/data";
import { bfGroupsOf, bfLabel, BF_SOURCE, MOBILITY } from "@/data/bf";
import { extraFeeRowsOf, extraRowsOf } from "@/data/introExtra";
import { GJ_CREDIT, GJ_SOURCE, gjOf } from "@/data/gj";
import { BUS_SOURCE_LINES, KTX_NAME, busStopsOf, ktxLinesOf } from "@/data/bus";
import { placeCrumbs, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { BoardTable, IconHeading, TipList } from "@/components/royal";
import { SourceLines } from "@/components/place/Amenities";
import { bfLines, gluedLines, hoursLines } from "@/lib/breaks";
import s from "@/components/place/Place.module.css";
import pr from "./print.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return { title: p ? `${p.name} 인쇄` : "인쇄" };
}

const EMPTY = <Ph>적힌 내용 없음</Ph>;
const fmtM = (m: number) => `${m.toLocaleString("ko-KR")}m`;
const pre = (t: string) => <span className={s.pre}>{t}</span>;
const cell = (v: string | null) => (v ? pre(v.trim()) : EMPTY);
const BF_CREDIT = `자료: ${BF_SOURCE.name}(${BF_SOURCE.fetched} 받음)`;

/** 문의 글 그대로, 번호만 전화 걸기 링크(소개 쪽 기본 정보 표와 같음) */
function contactCell(p: Place) {
  if (!p.contact) return EMPTY;
  const tel = phoneOf(p.contact);
  if (!tel) return cell(p.contact);
  const at = p.contact.indexOf(tel);
  return (
    <>
      {p.contact.slice(0, at)}
      <a href={`tel:${tel.replace(/-/g, "")}`} className={s.cellLink}>
        {tel}
      </a>
      {p.contact.slice(at + tel.length)}
    </>
  );
}

export default async function PlacePrint({ params }: Props) {
  const { id } = await params;
  const p = placeById(id);
  if (!p) notFound();

  const href = `/places/${p.id}/print`;
  const zip = zipOf(p.id);
  const groups = p.registered ? bfGroupsOf(p.id) : [];
  const near = p.registered ? null : nearestRegistered(p);
  const gj = gjOf(p.id);
  const stops = busStopsOf(p.id);
  const ktx = ktxLinesOf(p.id);
  const stopTit = (name: string, no: string | null) => `${name} 정류장${no ? `(${no})` : ""}`;
  const bfBus = p.registered ? bfLines(p.move["대중교통"]) : null;

  return (
    <SubPage
      crumbs={placeCrumbs(p, { label: "인쇄", href })}
      title={p.name}
      banner={PLACE_BANNER}
      sideMenu={placeSideMenu(p)}
      current={href}
      printAlways
    >
      <div className={pr.root}>
        <Section id="basic" title="기본 정보">
          <BoardTable
            caption={`${p.name} 기본 정보`}
            head={["구분", "내용"]}
            cols={["25%", "auto"]}
            align={["c", "l"]}
            rowHeader
            rows={[
              ["주소", p.address ? `${zip ? `(${zip}) ` : ""}${p.address}` : EMPTY],
              ["읍면동·권역", `${p.dong} · ${areaLabelOf(p)}`],
              ["이용시간", cell(hoursLines(p.hours))],
              ["쉬는 날", cell(hoursLines(p.closed))],
              ["이용요금", cell(hoursLines(p.fee))],
              ...extraFeeRowsOf(p.id).map(([k, v]) => [k, cell(hoursLines(v))]),
              ["주차", cell(p.parkingInfo)],
              ["문의", contactCell(p)],
              ...extraRowsOf(p.id).map(([k, v]) => [k, cell(gluedLines(v))]),
            ]}
          />
        </Section>

        <Section id="bf" title="무장애 정보">
          {groups.length > 0 ? (
            <>
              {groups.map((g) => (
                <div key={g.name} className={`${s.bfGroup} ${pr.keep}`}>
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
          ) : (
            <>
              <p className={s.transUnitTxt}>등록된 무장애 여행 정보가 없습니다.</p>
              {near && (
                <div className={s.transUnit}>
                  <p className={s.transUnitTit}>인근 무장애 ‘명소’</p>
                  <p className={s.transUnitTxt}>
                    {near.place ? (
                      <>
                        <Link href={`/places/${near.place.id}/barrier-free`}>{near.place.name}</Link>
                        {near.text.slice(near.name.length)}
                      </>
                    ) : (
                      near.text
                    )}
                  </p>
                </div>
              )}
            </>
          )}
          {gj && (
            <div className={`${s.bfGroup} ${pr.gj} ${pr.keep}`}>
              <h3 className={s.bfGroupTit}>{GJ_SOURCE.section}</h3>
              <p className={s.bfMeta}>{gj.entry}</p>
              <BoardTable
                caption={`${gj.entry} ${GJ_SOURCE.section}`}
                head={["구분", "내용"]}
                cols={["25%", "auto"]}
                align={["c", "l"]}
                rowHeader
                rows={gj.rows.map(([k, v]) => [k, pre(v)])}
              />
              <SourceLines lines={[GJ_CREDIT]} />
            </div>
          )}
        </Section>

        <Section id="dir" title="오시는 길">
          <IconHeading icon="bus">대중교통</IconHeading>
          {stops.map((b) => (
            <div key={b.stopNo ?? b.name} className={`${s.transUnit} ${pr.keep}`}>
              <p className={s.transUnitTit}>{stopTit(b.name, b.stopNo)}</p>
              <p className={s.transUnitTxt}>
                {b.distM !== null && `직선거리 ${fmtM(b.distM)}\n`}
                노선 {b.routes.length ? b.routes.join(", ") : EMPTY}
              </p>
            </div>
          ))}
          {ktx.length > 0 && (
            <div className={`${s.transUnit} ${pr.keep}`}>
              <p className={s.transUnitTit}>{KTX_NAME}</p>
              <p className={s.transUnitTxt}>
                {ktx.map((l) => `노선 ${l.routes.join(", ")} → ${stopTit(l.name, l.stopNos.join(", ") || null)}`).join("\n")}
              </p>
            </div>
          )}
          {stops.length > 0 && (
            <div className={s.busNote}>
              {stops.some((b) => b.distM !== null) && (
                <TipList items={[<Ph key="a">거리는 두 곳 사이의 직선거리입니다. 길을 따라 걷는 거리와 다릅니다.</Ph>]} />
              )}
              <SourceLines lines={BUS_SOURCE_LINES} />
            </div>
          )}
          {bfBus && (
            <div className={`${s.transUnit} ${pr.keep}`}>
              <p className={s.transUnitTit}>한국관광공사 무장애 여행 정보</p>
              <p className={s.transUnitTxt}>{bfBus}</p>
            </div>
          )}
          <div className={`${s.transUnit} ${pr.keep}`}>
            <p className={s.transUnitTit}>{MOBILITY.name}</p>
            <ul className={`${s.dotList} ${s.transDots}`}>
              <li>
                <span className={s.dotLabel}>예약접수전화번호</span>
                <a href={`tel:${MOBILITY.phone.replace(/-/g, "")}`}>{MOBILITY.phone}</a>
              </li>
            </ul>
            <SourceLines lines={[`자료: 전국교통약자이동지원센터정보표준데이터(데이터기준일자 ${MOBILITY.refDate})`]} />
          </div>
        </Section>
      </div>
    </SubPage>
  );
}
