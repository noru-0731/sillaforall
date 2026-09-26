// 관광지 지도 > 경주 전체. 궁능유적본부 누리집 관람코스 쪽 모양(배너·왼쪽 메뉴·알약 줄·지도 상자·이름 격자·고른 곳).
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import { MENU } from "@/site/ia";
import { SubPage } from "@/components/layout/PageParts";
import { KoglBox } from "@/components/royal";
import AreaPills from "@/components/map/AreaPills";
import MapExplorer from "@/components/map/MapExplorer";
import { explorerHubs, explorerIds, explorerPhotos, koglKeys } from "@/components/map/explorerData";

const SECTION = MENU[0];
const SELF = SECTION.children?.[0] ?? { label: "경주 전체", href: "/map" };

export const metadata: Metadata = pageMetadata(`${SECTION.label} - ${SELF.label}`, SELF.href);

export default function MapPage() {
  const ids = explorerIds("full");
  const photos = explorerPhotos(ids);
  return (
    <SubPage
      crumbs={[
        { label: SECTION.label, href: SECTION.href },
        { label: SELF.label, href: SELF.href },
      ]}
      title={SELF.label}
      side={SECTION}
      current={SELF.href}
      tabs={<AreaPills current={SELF.href} />}
    >
      <MapExplorer
        view="full"
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
