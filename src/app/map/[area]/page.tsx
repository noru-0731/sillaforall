// 관광지 지도 > 권역 하나. 권역 다섯 쪽을 미리 만든다(generateStaticParams).
// 모양은 경주 전체 쪽과 같다(궁능 관람코스). ?place=id 로 들어오면 그 곳을 고른 채로 연다.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areaByKey, areas } from "@/data";
import { MENU } from "@/site/ia";
import { SubPage } from "@/components/layout/PageParts";
import { KoglBox } from "@/components/royal";
import AreaPills from "@/components/map/AreaPills";
import MapExplorer from "@/components/map/MapExplorer";
import { explorerHubs, explorerIds, explorerPhotos, koglKeys } from "@/components/map/explorerData";

type Props = { params: Promise<{ area: string }> };

const SECTION = MENU[0];

export const dynamicParams = false;

export function generateStaticParams() {
  return areas.map((a) => ({ area: a.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  const a = areaByKey(area);
  return { title: a ? `${SECTION.label} - ${a.label}` : SECTION.label };
}

export default async function AreaMapPage({ params }: Props) {
  const { area } = await params;
  const a = areaByKey(area);
  if (!a) notFound();

  const href = `/map/${a.key}`;
  const ids = explorerIds(a.key);
  const photos = explorerPhotos(ids);
  return (
    <SubPage
      crumbs={[
        { label: SECTION.label, href: SECTION.href },
        { label: a.label, href },
      ]}
      title={a.label}
      side={SECTION}
      current={href}
      tabs={<AreaPills current={href} />}
    >
      <MapExplorer
        view={a.key}
        ids={ids}
        hubs={explorerHubs(ids)}
        photos={photos}
        kogl={{
          Type1: <KoglBox type="Type1" />,
          Type3: <KoglBox type="Type3" />,
          ...Object.fromEntries(koglKeys(photos).bys.map((by) => [`by:${by}`, <KoglBox key={by} type="Type1" by={by} />])),
        }}
      />
    </SubPage>
  );
}
