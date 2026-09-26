// 사이트 소개 > 만든 까닭(궁능 기관소개 > 인사말 모양).
// 큰 사진(제1유형, 아래가 흐려짐) → 왼쪽 표장(우리 아이콘 src/app/icon.svg) + 오른쪽 큰 제목, 파란 환영 한 줄, 본문.
// 본문은 예전 /about 글(모두 임시 문구)을 문단으로 옮겼다. 궁능 문장을 바꿔 쓴 줄만 <Ph> 없이 둔다.
import type { Metadata } from "next";
import Link from "next/link";
import { Ph, SubPage } from "@/components/layout/PageParts";
import { MENU, SITE_NAME } from "@/site/ia";
import { places, placeById } from "@/data";
import { coverPhoto, photoCreditOf, type1List } from "@/data/photos";
import s from "./about.module.css";

const SECTION = MENU[3];
const PAGE = SECTION.children![0];
const SOURCES = SECTION.children![1];

export const metadata: Metadata = { title: PAGE.label };

// 사진: 동궁과 월지(궁능 인사말의 부용정 사진 자리 — 물에 비친 전각). 제1유형 사진만 쓴다.
// 출처는 사진 오른쪽 아래에 작은 딱지로 얹는다(곳 이름 · 짧은 꼴, 예: "동궁과 월지 · ⓒ한국관광공사").
const PHOTO_PLACE = "p47";
const PHOTO_URL_HINT = "3029037";

export default function AboutPage() {
  const list = type1List(PHOTO_PLACE);
  const photo = list.find((p) => p.url.includes(PHOTO_URL_HINT)) ?? list[0] ?? coverPhoto("p37");
  const photoPlace = placeById(list.length ? PHOTO_PLACE : "p37")?.name ?? "";

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
      {photo && (
        <figure className={s.gFigure}>
          <div className={s.gPhoto}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={`${photoPlace} 풍경`} loading="eager" decoding="async" />
          </div>
          <figcaption className="rc-pcredit rc-pcredit--br">
            {photoPlace} · {photoCreditOf(photo)}
          </figcaption>
        </figure>
      )}

      <div className={s.gBody}>
        <div className={s.gMark}>
          <span className={s.gSeal}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt={`${SITE_NAME} 표장`} />
          </span>
        </div>
        <div className={s.gText}>
          <h2 className={s.gTit}>
            {SITE_NAME}
            <br />
            만든 까닭
          </h2>
          <p className={s.gWelcome}>{SITE_NAME} 누리집 방문을 환영합니다.</p>

          <div className={s.gProse}>
            {/* 예전 /about "보고서 요약" */}
            <p>
              <Ph>분석에서 드러난 문제를 두세 문장으로 적습니다.</Ph>
            </p>
            <p>
              <Ph>문제를 보여 주는 근거를 적습니다.</Ph>
            </p>
            <p>
              <Ph>경주 관광지 {places.length}곳의 위치와 무장애 여행 정보를 한곳에 모읍니다.</Ph>
            </p>
            <ul>
              <li>
                <Ph>관광객 자료: 한국관광 데이터랩</Ph>
              </li>
              <li>관광지 사진과 소개글: 한국관광공사 관광정보(TourAPI)</li>
              <li>읍면동 경계선: 통계청 SGIS 행정구역 경계(2026년 7월), vuski/admdongkor 가공(CC BY 4.0)</li>
            </ul>
            <p>
              <Link href={SOURCES.href}>{SOURCES.label}</Link>
            </p>
            {/* 예전 /about "만든 사람", "관련 제출물" */}
            <p>
              <Ph>만든 팀과 맡은 일을 적습니다.</Ph>
            </p>
            <p>
              <Ph>2026 한국관광 데이터랩 활용 경진대회 제출물과의 관계를 적습니다.</Ph>
            </p>
            <p>감사합니다.</p>
            <p>{SITE_NAME} 만든 팀</p>
          </div>
        </div>
      </div>
    </SubPage>
  );
}
