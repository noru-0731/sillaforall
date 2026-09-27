// 사이트 소개 > 만든 까닭(궁능 기관소개 > 인사말 모양).
// 큰 사진(제1유형, 아래가 흐려짐) → 왼쪽 표장(우리 아이콘 src/app/icon.svg) + 오른쪽 큰 제목, 파란 환영 한 줄, 본문.
// 본문은 예전 /about 글(모두 임시 문구)을 문단으로 옮겼다. 궁능 문장을 바꿔 쓴 줄만 <Ph> 없이 둔다.
// '…적습니다' 자리표시 네 줄은 09-27 사용자 결정("자리표시 줄 빼기")으로 뺐다.
// 첫 문단은 09-27 점선 1차 정리로 첫 쪽 '경주 관광지' 칸 설명 글(궁능 첫 쪽 문장을 바꿔 쓴 글, 점선 없음)과 같은 문장으로 바꿨다.
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import Link from "next/link";
import { Ph, SubPage } from "@/components/layout/PageParts";
import { withJosa } from "@/lib/josa";
import { MENU, SITE_NAME } from "@/site/ia";
import { places, placeById } from "@/data";
import { coverPhoto, heroPhoto, localPhoto, photoCreditOf } from "@/data/photos";
import { SIZES } from "@/components/royal/Photo";
import FailHide from "@/components/royal/FailHide";
import s from "./about.module.css";

const SECTION = MENU[3];
const PAGE = SECTION.children![0];
const SOURCES = SECTION.children![1];

export const metadata: Metadata = pageMetadata(PAGE.label, PAGE.href);

// 사진: 동궁과 월지(궁능 인사말의 부용정 사진 자리 — 물에 비친 전각). 제1유형 사진만 쓴다.
// 출처는 사진 오른쪽 아래에 작은 딱지로 얹는다(곳 이름 · 짧은 꼴, 예: "동궁과 월지 · ⓒ한국관광공사").
// 첫 화면 넘기기 판과 같은 사진: 관광정보 3422660 '동궁과 월지 (2)'(photos.ts heroPhoto 의 HERO_PICK). 제1유형이라 줄여 둔 판(960·1600 폭)을 쓴다.
const PHOTO_PLACE = "p47";

export default function AboutPage() {
  const own = heroPhoto(PHOTO_PLACE);
  const alt = coverPhoto("p37");
  const photo = own ?? (alt && localPhoto(alt, "big"));
  const photoPlace = placeById(own ? PHOTO_PLACE : "p37")?.name ?? "";
  // 줄여 둔 판 여러 폭이 있으면 그것, 없고 큰 판이 있으면 두 판을 너비와 함께(sizes 는 SIZES.about: 사진 칸은 본문 폭 1,030, 휴대전화는 4:3 칸)
  const srcSet = photo?.srcset ?? (photo?.large ? `${photo.url} ${photo.w ?? 940}w, ${photo.large} ${photo.lw ?? 1620}w` : undefined);

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
      {/* 사진이 안 뜨면(FailHide) 사진이 없을 때와 같이 사진 칸째 뺀다 */}
      {photo && (
        <FailHide as="figure" className={s.gFigure}>
          <div className={s.gPhoto}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              srcSet={srcSet}
              sizes={srcSet ? SIZES.about : undefined}
              alt={`${photoPlace} 풍경`}
              loading="eager"
              decoding="async"
            />
          </div>
          <figcaption className="rc-pcredit rc-pcredit--br">
            {photoPlace} · {photoCreditOf(photo)}
          </figcaption>
        </FailHide>
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
            <p>
              {withJosa(SITE_NAME, "은/는")} 한눈에 볼 수 있는 경주 관광지 {places.length}곳의 위치와 무장애 정보를 제공합니다.
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
            <p>감사합니다.</p>
            <p>{SITE_NAME} 만든 팀</p>
          </div>
        </div>
      </div>
    </SubPage>
  );
}
