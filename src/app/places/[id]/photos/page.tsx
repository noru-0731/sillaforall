// 관광지 사진(61곳). 궁능 누리집 "경복궁 이야기"(gbg_story) 모양:
// 윗선 바로 아래 칸 격자(궁능: 전각 이름 → 우리: 같은 권역 관광지, 누르면 그 관광지 사진 쪽) → 관광지 이름 → 사진 넘기기
// → 설명 문단(궁능: 작은 사진 줄 아래 고른 전각의 설명 → 우리: 관광공사 개요, 소개 쪽과 같은 글·같은 문단 나누기).
// 궁능의 "전체 다운로드"·"이 저작물만 다운로드"는 없다: 관광공사 사진 서버가 다른 누리집에서 파일을 받아 가는 허락(CORS)을 주지 않아
// 브라우저에서 파일로 내려받게 할 수 없다. 대신 "원본 보기"(새 창)가 그 자리에 있다(PhotoViewer).
import type { Metadata } from "next";
import { placeMetadata } from "@/site/og";
import Link from "next/link";
import { notFound } from "next/navigation";
import { placeById, places } from "@/data";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { SubPage } from "@/components/layout/PageParts";
import { Caret } from "@/components/icons";
import { overviewParas } from "@/data/overview";
import { photosOf, sameArea, viewerPhotos } from "@/components/place/placeData";
import PhotoViewer from "@/components/place/PhotoViewer";
import type { ViewerItem } from "@/components/place/PhotoViewer";
import PageSteps from "@/components/place/PageSteps";
import s from "@/components/place/Place.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return p ? placeMetadata(p.id, `${p.name} 사진`, `/places/${p.id}/photos`) : { title: "관광지 사진" };
}

export default async function PlacePhotos({ params }: Props) {
  const { id } = await params;
  const p = placeById(id);
  if (!p) notFound();

  const page = placePages(p)[2];
  const same = sameArea(p);
  // "원본 보기"가 열 주소: 같은 사진의 큰 판(가로 1,620픽셀 안팎)이 있으면 그것. viewerPhotos는 photosOf와 같은 차례다.
  // 세로 사진(세로 > 가로)은 표시해 두었다가 큰 사진 칸(1030×489)에서 자르지 않고 전체를 보인다(PhotoViewer).
  const all = photosOf(p.id);
  const photos: ViewerItem[] = viewerPhotos(p).map((v, i) => {
    const a = all[i];
    const tall = !!(a?.w && a.h && a.h > a.w);
    return { ...v, ...(a?.large ? { large: a.large } : {}), ...(tall ? { tall } : {}) };
  });
  const gridLabel = "같은 권역 관광지 사진";
  const paras = overviewParas(p.id);

  return (
    <SubPage crumbs={placeCrumbs(p, page)} title={page.label} banner={PLACE_BANNER} sideMenu={placeSideMenu(p)} current={page.href}>
      {/* PC: 칸 격자 */}
      <nav aria-label={gridLabel}>
        <ul className={s.tabGrid}>
          {same.map((q) => (
            <li key={q.id}>
              <Link href={`/places/${q.id}/photos`} aria-current={q.id === p.id ? "page" : undefined}>
                {q.name}
                {q.id === p.id && (
                  <span className={s.tabCaret}>
                    <Caret size={12} />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        {/* 휴대전화: 펼침 상자 */}
        <details className={s.tabDrop}>
          <summary>
            {p.name}
            <Caret size={14} />
          </summary>
          <ul>
            {same.map((q) => (
              <li key={q.id}>
                <Link href={`/places/${q.id}/photos`} aria-current={q.id === p.id ? "page" : undefined}>
                  {q.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>

      <h2 className={s.photoTit}>{p.name}</h2>
      <PhotoViewer photos={photos} placeName={p.name} />
      {paras.length > 0 && (
        <div className={s.photoDesc}>
          {paras.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      )}
      {/* deck 갈래: 쪽 끝 이어 읽기 */}
      <PageSteps place={p} at={2} />
    </SubPage>
  );
}
