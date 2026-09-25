// 관광지 무장애 정보(61곳). 궁능 누리집 "관람시간"(hours) 모양:
// 윗줄 상자(궁능 정기휴일 두 상자 → 우리: 주차·걷는 길·화장실 세 상자) + ※ 줄 → 표(궁능 일반관람시간 표 → 우리: 이동 일곱 항목).
// 명부(한국관광공사 무장애 여행 정보) 글은 손대지 않고 그대로 싣는다.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { placeById, places } from "@/data";
import { placeCrumbs, placePages, placeSideMenu, PLACE_BANNER } from "@/site/ia";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { Icon, type IconName } from "@/components/icons";
import { BoardTable } from "@/components/royal";
import { nearestRegistered } from "@/components/place/placeData";
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

  return (
    <SubPage crumbs={placeCrumbs(p, page)} title={page.label} banner={PLACE_BANNER} sideMenu={placeSideMenu(p)} current={page.href}>
      {p.registered ? (
        <>
          <Section title="주차·접근로·화장실">
            <ul className={s.boxes}>
              <Box icon="parking" title="주차">
                {p.three.parking ?? EMPTY}
              </Box>
              <Box icon="walk" title="접근로">
                {p.three.walk ?? EMPTY}
              </Box>
              <Box icon="toilet" title="화장실">
                {p.three.toilet ?? EMPTY}
              </Box>
            </ul>
          </Section>

          <Section title={`${p.name} 무장애 정보`}>
            <BoardTable
              caption={`${p.name} 무장애 정보`}
              head={["구분", "내용"]}
              cols={["25%", "auto"]}
              align={["c", "l"]}
              rowHeader
              rows={Object.entries(p.move).map(([k, v]) => [k === "휠체어" ? "휠체어대여" : k, v ?? EMPTY])}
            />
          </Section>
        </>
      ) : (
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
      )}
    </SubPage>
  );
}
