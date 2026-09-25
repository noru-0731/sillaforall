// 관광지 소개(61곳). 궁능 누리집 "경복궁 소개·역사"(gbg_intro) 모양:
// 어긋난 테두리 큰 사진 → 작은 건물 그림(궁능 ic_wrap 자리, 직접 그린 선 그림) → 굵은 첫 문장(가운데) → 본문 → "기본 정보" 표(궁능 "역사" 표 자리).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { placeById, places } from "@/data";
import type { Place } from "@/data";
import { photoCreditOf } from "@/data/photos";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { BoardTable, OffsetPhoto, Photo } from "@/components/royal";
import { anyPhoto, areaLabelOf, coverPhoto, phoneOf, splitOverview } from "@/components/place/placeData";
import IntroMark from "@/components/place/IntroMark";
import s from "@/components/place/Place.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return { title: p ? `${p.name} 소개` : "관광지 소개" };
}

const EMPTY = <Ph>적힌 내용 없음</Ph>;

/** 표 칸 글: 비면 "적힌 내용 없음", 줄바꿈은 살린다 */
function cell(v: string | null) {
  return v ? <span className={s.pre}>{v.trim()}</span> : EMPTY;
}

function contactCell(p: Place) {
  if (!p.contact) return EMPTY;
  const tel = phoneOf(p.contact);
  if (!tel) return cell(p.contact);
  const [before, after] = [p.contact.slice(0, p.contact.indexOf(tel)), p.contact.slice(p.contact.indexOf(tel) + tel.length)];
  return (
    <>
      {before}
      <a href={`tel:${tel.replace(/-/g, "")}`} className={s.cellLink}>
        {tel}
      </a>
      {after}
    </>
  );
}

export default async function PlaceIntro({ params }: Props) {
  const { id } = await params;
  const p = placeById(id);
  if (!p) notFound();

  const page = placePages(p)[1];
  const photo = coverPhoto(p.id) ?? anyPhoto(p.id);
  const ov = splitOverview(p.overview);

  const rows: React.ReactNode[][] = [
    ["주소", cell(p.address)],
    ["읍면동·권역", `${p.dong} · ${areaLabelOf(p)}`],
    ["이용시간", cell(p.hours)],
    ["쉬는 날", cell(p.closed)],
    ["이용요금", cell(p.fee)],
    ["주차", cell(p.parkingInfo)],
    ["문의", contactCell(p)],
  ];

  return (
    <SubPage crumbs={placeCrumbs(p, page)} title={page.label} banner={PLACE_BANNER} sideMenu={placeSideMenu(p)} current={page.href}>
      <div>
        <OffsetPhoto>
          <Photo photo={photo} alt={`${p.name} 사진`} ratio="101/50" bg="light" loading="eager" />
        </OffsetPhoto>
        {photo && <p className={s.photoCredit}>{photoCreditOf(photo)}</p>}
        <IntroMark className={s.introMark} />

        {ov ? (
          <>
            <p className={s.introTit}>{ov.first}</p>
            {ov.rest.length > 0 && (
              <div className={s.introBody}>
                {ov.rest.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className={s.introTit}>
            <Ph>한국관광공사 관광정보에 소개 글이 없습니다.</Ph>
          </p>
        )}
      </div>

      <Section id="basic" title="기본 정보">
        <BoardTable
          caption={`${p.name} 기본 정보`}
          head={["구분", "내용"]}
          cols={["25%", "auto"]}
          align={["c", "l"]}
          rowHeader
          rows={rows}
        />
      </Section>
    </SubPage>
  );
}
