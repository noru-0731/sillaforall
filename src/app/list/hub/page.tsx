// 관광지 목록 > 거점별: 분석 보고서의 거점 묶음(HUBS)마다 그 묶음에 든 관광지.
// 궁능유적본부 누리집 "경복궁 이야기"의 위쪽 칸 격자 + 문화행사 카드 줄 모양.
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import { HUBS, byName, places } from "@/data";
import { SubPage } from "@/components/layout/PageParts";
import { menuPage } from "@/components/place-list/helpers";
import { cardsOf } from "@/components/place-list/cardData";
import HubView from "@/components/place-list/HubView";
import HubThree from "@/components/place-list/HubThree";

const HREF = "/list/hub";
const page = menuPage(HREF);

export const metadata: Metadata = pageMetadata(page.title, HREF);

export default function ListHubPage() {
  // 09-29: 묶음마다 카드 아래에 주차·접근로·화장실 표(HubThree, 카드와 같은 가나다순)
  const groups = HUBS.map((hub) => {
    const ps = places.filter((p) => p.cluster === hub);
    return { hub, cards: cardsOf(ps), three: <HubThree hub={hub} places={[...ps].sort(byName)} /> };
  });
  return (
    <SubPage
      crumbs={[...page.crumbs, { label: page.title, href: HREF }]}
      title={page.title}
      side={page.section}
      current={HREF}
    >
      <HubView groups={groups} />
    </SubPage>
  );
}
