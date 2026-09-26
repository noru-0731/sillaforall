// 관광지 소개(61곳). 궁능 누리집 "경복궁 소개·역사"(gbg_intro) 모양:
// 어긋난 테두리 큰 사진 → 작은 건물 그림(궁능 ic_wrap 자리, 직접 그린 선 그림) → 굵은 첫 문장(가운데) → 본문 → "기본 정보" 표(궁능 "역사" 표 자리).
// "기본 정보" 표의 요금 칸(시설이용료·주차요금)과 문의 아래 줄(관람 소요시간·유모차 대여·체험 안내·화장실 …)은
// 관광정보 소개·반복 정보(data/introExtra.ts, 도구/13_소개정보.py). 칸 이름은 관광공사 이름, 글이 있는 칸만 줄을 둔다.
// 요금 글은 붙은 "- "·"[" 앞에서 줄을 나눠 보인다(hoursLines, 글자는 그대로).
// 본문은 관광공사 개요를 문단으로 나눈 것(data/overview.json, 도구/12_버스_문단_사이트.py). 글자는 원문 그대로, 나누기만 했다.
// 본문은 궁능 "궁궐의 역사"(story_history) 모양: 왼쪽에 사진을 세로로 쌓고(309×213, 사이 20) 오른쪽에 글(왼쪽 30 띄움).
//   사진은 큰 사진과 다른 장, 제1유형 먼저. 장 수는 본문 높이에 맞춘다(sideCount). 휴대전화는 사진 3칸 격자 뒤에 글.
//   궁능은 사진마다 아래에 이름 띠를 얹지만, 우리 사진 이름은 대부분 관광지 이름이나 파일 이름이라 띠를 넣지 않았다.
// 사진 출처(짧은 꼴 "ⓒ한국관광공사" 등)는 사진마다 곁에: 제1유형은 사진 오른쪽 아래에 얹고, 제3유형은 사진 틀 바로 아래 오른쪽 한 줄.
// 사진 파일(09-27 "제1유형만 줄여 둠"): 관광정보 제1유형은 줄여 둔 판(data/photos.ts localPhoto). 맨 위 사진은 큰 자리(여러 폭,
// sizes 는 SIZES.introTop), 본문 옆 사진은 작은 자리(480 판). 그 밖은 원 주소.
import type { Metadata } from "next";
import { placeMetadata } from "@/site/og";
import { notFound } from "next/navigation";
import { placeById, places } from "@/data";
import type { Place } from "@/data";
import { localPhoto, photoCreditOf } from "@/data/photos";
import type { Photo as PhotoData } from "@/data/photos";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { Section, SubPage } from "@/components/layout/PageParts";
import { DASH, DashNote } from "@/components/layout/Dash";
import { BoardTable, CreditBelow, OffsetPhoto, Photo, SIZES } from "@/components/royal";
import { overviewParas } from "@/data/overview";
import { extraFeeRowsOf, extraRowsOf } from "@/data/introExtra";
import { gluedLines, hoursLines, hoursNoteLines } from "@/lib/breaks";
import { anyPhoto, areaLabelOf, cleanPhotoName, coverPhoto, phoneOf, photosOf, splitParas } from "@/components/place/placeData";
import IntroMark from "@/components/place/IntroMark";
import PageSteps from "@/components/place/PageSteps";
import s from "@/components/place/Place.module.css";
import st from "./intro.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return p ? placeMetadata(p.id, `${p.name} 소개`, `/places/${p.id}/intro`) : { title: "관광지 소개" };
}

const EMPTY = DASH;

/**
 * 본문 옆 사진 장 수: 본문이 PC 글 칸(691px, 16px 글, 줄 27.2px, 한 줄 52자 안팎(띄어쓰기 포함), 문단 사이 27)에서 차지할 높이를
 * 사진 한 칸(213 + 사이 20)으로 나눈 값. 1~5장(궁능 story_history는 5장).
 */
function sideCount(paras: string[]): number {
  const lines = paras.reduce((n, x) => n + Math.ceil(x.length / 52), 0);
  const h = lines * 27.2 + Math.max(0, paras.length - 1) * 27;
  return Math.max(1, Math.min(5, Math.round((h + 20) / 233)));
}

/** 본문 옆 사진: 맨 위 큰 사진과 다른 장, 제1유형 먼저(차례 유지). 작은 칸이라 큰 판(large)은 넘기지 않고, 관광정보 제1유형은 줄여 둔 480 판. */
function sidePhotos(id: string, topUrl: string | null, n: number): PhotoData[] {
  const rest = photosOf(id).filter((x) => x.url !== topUrl);
  const ordered = [...rest.filter((x) => x.type === "Type1"), ...rest.filter((x) => x.type !== "Type1")];
  return ordered.slice(0, n).map((x) => {
    const { url, type, name, from, by } = localPhoto(x, "small");
    return { url, type, name, from, by };
  });
}

/** 표 칸 글: 비면 "-", 줄바꿈은 살린다 */
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
  const top = coverPhoto(p.id) ?? anyPhoto(p.id);
  const ov = splitParas(overviewParas(p.id));
  // 본문 옆 사진은 맨 위 사진과 다른 장(바꾸기 전 주소로 견준다)
  const side = ov && ov.rest.length ? sidePhotos(p.id, top?.url ?? null, sideCount(ov.rest)) : [];
  // 맨 위 사진: 큰 자리(줄여 둔 판이 있으면 여러 폭)
  const photo = top && localPhoto(top, "big");
  const body = ov?.rest.map((x, i) => <p key={i}>{x}</p>);

  const rows: React.ReactNode[][] = [
    ["주소", cell(p.address)],
    ["읍면동·권역", `${p.dong} · ${areaLabelOf(p)}`],
    ["이용시간", cell(hoursNoteLines(p.hours))],
    ["쉬는 날", cell(hoursLines(p.closed))],
    ["이용요금", cell(hoursLines(p.fee))],
    ...extraFeeRowsOf(p.id).map(([k, v]) => [k, cell(hoursLines(v))]),
    ["주차", cell(p.parkingInfo)],
    ["문의", contactCell(p)],
    ...extraRowsOf(p.id).map(([k, v]) => [k, cell(gluedLines(v))]),
  ];

  return (
    <SubPage crumbs={placeCrumbs(p, page)} title={page.label} banner={PLACE_BANNER} sideMenu={placeSideMenu(p)} current={page.href}>
      <div>
        <OffsetPhoto>
          <Photo
            photo={photo}
            alt={`${p.name} 사진`}
            ratio="101/50"
            bg="light"
            loading="eager"
            sizes={SIZES.introTop}
            credit={photo?.type === "Type1" ? photoCreditOf(photo) : null}
          />
        </OffsetPhoto>
        {/* 제3유형: 사진 위에 얹지 않고 사진(어긋난 테두리 틀) 아래 오른쪽 한 줄 */}
        {photo && photo.type !== "Type1" && <CreditBelow text={photoCreditOf(photo)} className={s.photoCredit} />}
        <IntroMark className={s.introMark} />

        {ov ? (
          <>
            <p className={s.introTit}>{ov.first}</p>
            {ov.rest.length > 0 &&
              (side.length ? (
                <div className={st.story}>
                  <div className={st.pics}>
                    <ul className={st.picList}>
                      {side.map((ph) => (
                        <li key={ph.url}>
                          <Photo
                            photo={ph}
                            alt={cleanPhotoName(ph.name) ?? `${p.name} 사진`}
                            ratio="309/213"
                            bg="light"
                            credit={ph.type === "Type1" ? photoCreditOf(ph) : null}
                          />
                          {/* 사진 아래 한 줄 출처: 제3유형은 늘, 제1유형은 휴대전화 3칸 격자(칸 가로 115 안팎)에서만. PC 제1유형은 사진 위 딱지 */}
                          <CreditBelow text={photoCreditOf(ph)} className={ph.type === "Type1" ? st.picCreditM : undefined} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${s.introBody} ${st.body}`}>{body}</div>
                </div>
              ) : (
                <div className={s.introBody}>{body}</div>
              ))}
          </>
        ) : (
          <p className={s.introTit}>
            등록된 소개 글이 없습니다.
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
        {/* "-" 칸이 있으면 표 바로 아래 뜻풀이 한 줄 */}
        {rows.some(([, v]) => v === EMPTY) && <DashNote className={s.tipsAfterTable} />}
      </Section>
      {/* deck 갈래: 쪽 끝 이어 읽기 */}
      <PageSteps place={p} at={1} />
    </SubPage>
  );
}
