// 관광지 오시는 길(61곳). 궁능 누리집 "오시는 길"(directions) 모양:
// "{이름} 오시는 길" → 지도(테두리 상자) → 주소·연락처 줄 + 길찾기 → 검정 띠 "주차 및 이용안내"
// → 대중교통·자가용(아이콘 소제목) → 주차 안내 상자 → 이용요금 표.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areaOf, placeById, places } from "@/data";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { Icon } from "@/components/icons";
import { BlackBar, BoardTable, IconHeading } from "@/components/royal";
import MapView from "@/components/map/MapView";
import { kakaoTo, phoneOf, sameArea } from "@/components/place/placeData";
import s from "@/components/place/Place.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return { title: p ? `${p.name} 오시는 길` : "오시는 길" };
}

const EMPTY = <Ph>적힌 내용 없음</Ph>;

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

  // 주차 안내 상자의 점 줄: 관광정보의 일반 주차 글 + 무장애 여행 정보의 주차 글(있을 때만)
  const parking: { label: string; text: string }[] = [];
  if (p.parkingInfo) parking.push({ label: "한국관광공사 관광정보", text: p.parkingInfo.trim() });
  if (reg && p.move["주차"]) parking.push({ label: "한국관광공사 무장애 여행 정보", text: p.move["주차"]! });

  return (
    <SubPage crumbs={placeCrumbs(p, page)} title={page.label} banner={PLACE_BANNER} sideMenu={placeSideMenu(p)} current={page.href}>
      <Section title={`${p.name} 오시는 길`}>
        <div className={s.mapBox}>
          <MapView
            view={key}
            highlightId={p.id}
            placeIds={sameArea(p).map((q) => q.id)}
            height="clamp(32rem, 40vw, 42.9rem)"
            ariaLabel={`${p.name} 위치 지도`}
          />
        </div>
        {p.approx && (
          <p className={s.approx}>
            <Ph>지도 위 자리는 가까운 곳의 좌표를 빌려 쓴 것이라 실제 자리와 조금 다를 수 있습니다.</Ph>
          </p>
        )}
        <div className={s.mapTxt}>
          <div className={s.mapCons}>
            {p.address && (
              <div className={s.mapCon}>
                <Icon name="pin" size={18} strokeWidth={2} />
                <p className={s.mapConTit}>주소</p>
                <p className={s.mapConTxt}>{p.address}</p>
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
          </a>
        </div>
      </Section>

      <div className={s.trans}>
        <BlackBar href="#parking">주차 및 이용안내</BlackBar>

        <div className={s.transCon}>
          <IconHeading icon="bus">대중교통</IconHeading>
          <div className={s.transUnit}>
            <p className={s.transUnitTit}>한국관광공사 무장애 여행 정보</p>
            <p className={s.transUnitTxt}>{(reg && p.move["대중교통"]) || EMPTY}</p>
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
      </div>

      <div className={s.infoWrap}>
        <h3 className={`rc-iconhead rc-iconhead--plain ${s.infoTit}`}>
          <WonIcon />
          <span>이용요금</span>
        </h3>
        <BoardTable
          caption={`${p.name} 이용요금과 이용시간`}
          head={["구분", "내용"]}
          cols={["25%", "auto"]}
          align={["c", "l"]}
          rowHeader
          rows={[
            ["이용요금", p.fee ? <span className={s.pre}>{p.fee.trim()}</span> : EMPTY],
            ["이용시간", p.hours ? <span className={s.pre}>{p.hours.trim()}</span> : EMPTY],
            ["쉬는 날", p.closed ? <span className={s.pre}>{p.closed.trim()}</span> : EMPTY],
          ]}
        />
      </div>
    </SubPage>
  );
}
