// 관광지 사진(61곳). 궁능 누리집 "경복궁 이야기"(gbg_story) 모양:
// 윗선 바로 아래 칸 격자(궁능: 전각 이름 → 우리: 같은 권역 관광지, 누르면 그 관광지 사진 쪽) → 관광지 이름 → 사진 넘기기
// → 설명 문단(궁능: 작은 사진 줄 아래 고른 전각의 설명 → 우리: 관광공사 개요, 소개 쪽과 같은 글).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { placeById, places } from "@/data";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { SubPage } from "@/components/layout/PageParts";
import { Caret } from "@/components/icons";
import { sameArea, viewerPhotos } from "@/components/place/placeData";
import PhotoViewer from "@/components/place/PhotoViewer";
import s from "@/components/place/Place.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return { title: p ? `${p.name} 사진` : "관광지 사진" };
}

export default async function PlacePhotos({ params }: Props) {
  const { id } = await params;
  const p = placeById(id);
  if (!p) notFound();

  const page = placePages(p)[2];
  const same = sameArea(p);
  const photos = viewerPhotos(p);
  const gridLabel = "같은 권역 관광지 사진";
  const paras = (p.overview ?? "")
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean);

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
    </SubPage>
  );
}
