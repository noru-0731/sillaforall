// 관광지 오시는 길(61곳). 궁능 누리집 "오시는 길"(directions) 모양:
// 제목 아래 알약 줄(같은 권역 관광지의 오시는 길, 지금 곳 채움, 한 줄 + ‹ ›) → "{이름} 오시는 길" → 지도(테두리 상자)
// → 주소(앞에 우편번호, 궁능 "(03045) 서울 …")·연락처 줄 + 길찾기 → 검정 띠 "주차 및 이용안내"
// → 대중교통·자가용(아이콘 소제목) → 주차 안내 상자 → 이용요금 표.
// 지도: 궁능처럼 도로가 보이는 진짜 지도(PlaceMap: 카카오 지도, 카카오 SDK 가 뜨지 않으면 오픈스트리트맵 RealMap).
// 좌표를 이웃 곳에서 빌린 곳(approx: 서악서원)은 진짜 지도에 핀을 꽂지 않고 우리 그린 지도(MapView)를 그대로 쓴다.
// (블루원워터파크는 09-26 가 88번으로 관광정보 '강동 워터파크'(2044527) 좌표를 써서 approx 가 아니다.)
//
// 무장애 시안(bf-draft)에서 더한 것:
// - 지도 위에 500m 안 공영주차장(장애인전용주차구역이 있는 곳은 1km 안까지) 번호 네모, 주차 안내 아래에 같은 번호의 표.
//   (전국주차장정보표준데이터, 도구/10_편의시설_지도.py). 화장실·충전기는 무장애 정보 쪽 "편의시설"에 있다.
// - 대중교통 아래에 경주시교통약자이동지원센터(전국교통약자이동지원센터정보표준데이터, 시 전체 한 곳).
//
// 페르소나 장점 취합(가1·가2·가13)에서 더한 것:
// - 대중교통 첫머리에 가까운 정류장 셋(궁능 버스 칸 "경복궁 하차 / 간선 …" 모양: 굵은 제목에 정류장 이름과 번호, 아래 줄에 직선거리와 노선 번호).
//   자료는 data/bus.json(도구/12_버스_문단_사이트.py → 도구/20_버스_TAGO.py). 좌표를 빌린 서악서원은 거리 없이 이름이 맞은 정류장.
//   노선 번호는 국토교통부 TAGO(정류소별경유노선). 노선 줄을 누르면 노선별 기점·종점·첫차시간·막차시간·배차간격 표가 펼쳐진다(components/place/BusStops.tsx).
// - 그 아래 경주역(KTX) 칸: 경주역(KTX) 정류장에서 이 곳 정류장 쪽으로 가는 노선 번호(국립경주박물관 교통안내 "철도" 칸 자리).
// - 이용시간·쉬는 날·무장애 글은 붙은 줄을 나눠 보인다(lib/breaks.ts, 글자는 그대로).
//
// 빈 칸은 "-"(09-26 저녁). "-"가 쪽 여러 곳(정류장 노선, 무장애 대중교통, 주차 안내, 이용안내 표)에 흩어질 수 있어 뜻풀이 한 줄은 쪽 끝(이용안내 표 아래)에 한 번.
import type { Metadata } from "next";
import { placeMetadata } from "@/site/og";
import { notFound } from "next/navigation";
import { areaOf, placeById, places, zipOf } from "@/data";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { DASH, DashNote } from "@/components/layout/Dash";
import { Icon } from "@/components/icons";
import { BlackBar, BoardTable, IconHeading, PillTabs, TipList } from "@/components/royal";
import MapView from "@/components/map/MapView";
import PlaceMap from "@/components/map/PlaceMap";
import { kakaoTo, phoneOf, sameArea } from "@/components/place/placeData";
import { amenitiesOf, MOBILITY, NEAR_RADII, sourceLines } from "@/data/bf";
import { KTX_NAME, busSourceLines, busStopsOf, ktxLinesOf } from "@/data/bus";
import { BusStopUnits, busHasDash, stopTitle } from "@/components/place/BusStops";
import { extraFeeRowsOf } from "@/data/introExtra";
import { bfLines, hoursLines, hoursNoteLines } from "@/lib/breaks";
import { AmenityTable, SourceLines, amenityPoints, legendOf } from "@/components/place/Amenities";
// 교통약자이동지원센터 칸 이름·출처 줄(09-27 점검). 위 "@/data/bf" 줄과 합쳐도 된다(그 줄 바로 밑 버스 import 를 bus 갈래가 고쳐 따로 둠)
import { MOBILITY_SOURCE_LINE, stdLabel } from "@/data/bf";
import PageSteps from "@/components/place/PageSteps";
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
  return p ? placeMetadata(p.id, `${p.name} 오시는 길`, `/places/${p.id}/directions`) : { title: "오시는 길" };
}

const EMPTY = DASH;

/** 원(돈) 선 아이콘: 공통 아이콘에 없어 여기서 직접 그렸다(궁능 "주차요금" 아이콘 자리) */
function WonIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 8.5 9.5 16l2.5-6 2.5 6 2-7.5M7 12h10" />
    </svg>
  );
}

export default async function PlaceDirections({ params }: Props) {
  const { id } = await params;
  const p = placeById(id);
  if (!p) notFound();

  const page = placePages(p)[4];
  const key = areaOf(p);
  const tel = phoneOf(p.contact);
  const reg = p.registered;
  const zip = zipOf(p.id);
  // 궁능 오시는 길 제목 아래 궁 알약 줄 자리: 같은 권역 관광지(가나다순)의 오시는 길
  const pills = (
    <PillTabs
      label="관광지 고르기"
      current={page.href}
      scroll="always"
      items={sameArea(p).map((q) => ({ label: q.name, href: `/places/${q.id}/directions`, area: key }))}
    />
  );

  // 주차 안내 상자의 점 줄: 관광정보의 일반 주차 글 + 무장애 여행 정보의 주차 글(있을 때만)
  const parking: { label: string; text: string }[] = [];
  if (p.parkingInfo) parking.push({ label: "한국관광공사 관광정보", text: p.parkingInfo.trim() });
  if (reg && p.move["주차"]) parking.push({ label: "한국관광공사 무장애 여행 정보", text: bfLines(p.move["주차"]!) });

  // 가까운 공영주차장(번호는 이 쪽에서 1부터 다시 매김)
  const pk = (amenitiesOf(p.id)?.items ?? []).filter((i) => i.kind === "parking").map((i, n) => ({ ...i, show: n + 1 }));
  const M = MOBILITY;

  // 가까운 버스 정류장 셋과 경주역(KTX)에서 오는 노선
  const stops = busStopsOf(p.id);
  const ktx = ktxLinesOf(p.id);

  // 무장애 여행 정보 대중교통 글(없으면 "-")
  const bfBus = bfLines((reg && p.move["대중교통"]) || null);
  // 이 쪽에 "-"가 하나라도 있으면 쪽 끝에 뜻풀이 한 줄
  const dashed = busHasDash(stops) || !bfBus || !parking.length || !p.fee || !p.hours || !p.closed;

  return (
    <SubPage crumbs={placeCrumbs(p, page)} title={page.label} banner={PLACE_BANNER} sideMenu={placeSideMenu(p)} current={page.href} tabs={pills}>
      <Section title={`${p.name} 오시는 길`}>
        <div className={s.mapBox}>
          {p.approx ? (
            <MapView
              view={key}
              highlightId={p.id}
              placeIds={sameArea(p).map((q) => q.id)}
              height="clamp(32rem, 40vw, 42.9rem)"
              ariaLabel={`${p.name} 위치 지도`}
            />
          ) : (
            <PlaceMap
              lat={p.lat}
              lon={p.lon}
              name={p.name}
              label={`${p.name} 위치 지도`}
              zoom={16}
              points={pk.length ? amenityPoints(pk, "pk") : undefined}
              legend={pk.length ? legendOf(["parking"], p.name) : undefined}
            />
          )}
        </div>
        {p.approx && (
          <p className={s.approx}>
            <Ph>지도 위 자리는 실제 자리와 조금 다를 수 있습니다.</Ph>
          </p>
        )}
        <div className={s.mapTxt}>
          <div className={s.mapCons}>
            {p.address && (
              <div className={s.mapCon}>
                <Icon name="pin" size={18} strokeWidth={2} />
                <p className={s.mapConTit}>주소</p>
                <p className={s.mapConTxt}>
                  {zip && <>({zip}) </>}
                  {p.address}
                </p>
              </div>
            )}
            {p.contact && (
              <div className={s.mapCon}>
                <Icon name="phone" size={18} strokeWidth={2} />
                <p className={s.mapConTit}>연락처</p>
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
          </div>
          <a href={kakaoTo(p)} target="_blank" rel="noopener noreferrer" className={s.btnMap}>
            길찾기<span className="sr-only">(카카오맵, 새 창)</span>
            <NewWinIcon sr={false} />
          </a>
        </div>
      </Section>

      <div className={s.trans}>
        <BlackBar href="#parking">주차 및 이용안내</BlackBar>

        <div className={s.transCon}>
          <IconHeading icon="bus">대중교통</IconHeading>
          <BusStopUnits stops={stops} />
          {ktx.length > 0 && (
            <div className={s.transUnit}>
              <p className={s.transUnitTit}>{KTX_NAME}</p>
              <p className={s.transUnitTxt}>
                {ktx.map((l) => `노선 ${l.routes.join(", ")} → ${stopTitle(l.name, l.stopNos.join(", ") || null)}`).join("\n")}
              </p>
            </div>
          )}
          {stops.length > 0 && (
            <div className={s.busNote}>
              {stops.some((b) => b.distM !== null) && (
                <TipList items={[<Ph key="a">거리는 두 곳 사이의 직선거리입니다. 길을 따라 걷는 거리와 다릅니다.</Ph>]} />
              )}
              <SourceLines lines={busSourceLines(p.id)} />
            </div>
          )}
          <div className={s.transUnit}>
            <p className={s.transUnitTit}>한국관광공사 무장애 여행 정보</p>
            <p className={s.transUnitTxt}>{bfBus || EMPTY}</p>
          </div>
          <div className={s.transUnit}>
            <p className={s.transUnitTit}>{M.name}</p>
            <ul className={`${s.dotList} ${s.transDots}`}>
              <li>
                <span className={s.dotLabel}>{stdLabel("예약접수전화번호")}</span>
                <a href={`tel:${M.phone.replace(/-/g, "")}`}>{M.phone}</a>
              </li>
              <li>
                <span className={s.dotLabel}>{stdLabel("보유차량종류")}</span>
                {M.vehicles}({stdLabel("슬로프형휠체어차량대수")} {M.slope})
              </li>
              <li>
                <span className={s.dotLabel}>{stdLabel("사전예약신청기간")}</span>
                {M.reserve}({stdLabel("예약접수")} 평일 {M.reserveHours.weekday}, 주말 {M.reserveHours.weekend})
              </li>
              <li>
                <span className={s.dotLabel}>
                  {stdLabel("차량관내운행지역")}·{stdLabel("차량관외운행지역")}
                </span>
                {M.area.inside} / {M.area.outside}
              </li>
              <li>
                <span className={s.dotLabel}>{stdLabel("차량이용요금")}</span>
                {M.fare}
              </li>
              <li>
                <span className={s.dotLabel}>{stdLabel("차량이용대상")}</span>
                {M.target.join("\n")}
              </li>
            </ul>
            <SourceLines lines={[MOBILITY_SOURCE_LINE]} />
          </div>
        </div>

        {p.address && (
          <div className={s.transCon}>
            <IconHeading icon="car">자가용</IconHeading>
            <div className={s.transUnit}>
              <p className={s.transUnitTit}>내비게이션</p>
              <p className={s.transUnitTxt}>{p.address}</p>
            </div>
          </div>
        )}
      </div>

      <div className={s.infoWrap}>
        <div className={s.infoTit}>
          <IconHeading icon="parking" plain id="parking">
            주차 안내
          </IconHeading>
        </div>
        <div className={s.bdBox}>
          {parking.length ? (
            <ul className={s.dotList}>
              {parking.map((x) => (
                <li key={x.label}>
                  <span className={s.dotLabel}>{x.label}</span>
                  {x.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className={s.transUnitTxt}>{EMPTY}</p>
          )}
        </div>
        {pk.length > 0 && (
          <div className={s.pkWrap}>
            <p className={s.transUnitTit}>
              <Ph>공영주차장</Ph>
            </p>
            <AmenityTable items={pk} idPrefix="pk" showKind={false} caption={`${p.name} 가까운 공영주차장: 번호, 이름, 직선거리, 내용, 자료`} />
            <TipList
              className={s.tipsAfterTable}
              items={[
                <Ph key="a">
                  번호는 위 지도의 번호와 같습니다. 거리는 두 곳 사이의 직선거리입니다. {NEAR_RADII.parking}m 안의 공영주차장과, 장애인 전용 주차 구역이 있는 가장 가까운 곳(1km 안)을 보입니다.
                </Ph>,
              ]}
            />
            <SourceLines lines={sourceLines(["parking"])} />
          </div>
        )}
      </div>

      <div className={s.infoWrap}>
        <h3 className={`rc-iconhead rc-iconhead--plain ${s.infoTit}`}>
          <WonIcon />
          <span>이용안내</span>
        </h3>
        <BoardTable
          caption={`${p.name} 이용요금과 이용시간`}
          head={["구분", "내용"]}
          cols={["25%", "auto"]}
          align={["c", "l"]}
          rowHeader
          rows={[
            ["이용요금", p.fee ? <span className={s.pre}>{hoursLines(p.fee.trim())}</span> : EMPTY],
            ...extraFeeRowsOf(p.id).map(([k, v]) => [k, <span key={k} className={s.pre}>{hoursLines(v)}</span>]),
            ["이용시간", p.hours ? <span className={s.pre}>{hoursNoteLines(p.hours.trim())}</span> : EMPTY],
            ["쉬는 날", p.closed ? <span className={s.pre}>{hoursLines(p.closed.trim())}</span> : EMPTY],
          ]}
        />
        {dashed && <DashNote className={s.tipsAfterTable} />}
      </div>
      {/* deck 갈래: 쪽 끝 이어 읽기(다음: 주변 관광지 세 곳) */}
      <PageSteps place={p} at={4} />
    </SubPage>
  );
}
