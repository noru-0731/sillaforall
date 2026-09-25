// 관광지 목록 > 거점별: 분석 보고서의 거점 묶음(HUBS)마다 그 묶음에 든 관광지.
// 궁능유적본부 누리집 "경복궁 이야기"의 위쪽 칸 격자 + 문화행사 카드 줄 모양.
import type { Metadata } from "next";
import { HUBS, places } from "@/data";
import { SubPage } from "@/components/layout/PageParts";
import { menuPage } from "@/components/place-list/helpers";
import { cardsOf, creditsFor } from "@/components/place-list/cardData";
import HubView from "@/components/place-list/HubView";

const HREF = "/list/hub";
const page = menuPage(HREF);

export const metadata: Metadata = { title: page.title };

export default function ListHubPage() {
  const groups = HUBS.map((hub) => ({ hub, cards: cardsOf(places.filter((p) => p.cluster === hub)) }));
  return (
    <SubPage
      crumbs={[...page.crumbs, { label: page.title, href: HREF }]}
      title={page.title}
      side={page.section}
      current={HREF}
    >
      <HubView groups={groups} credits={creditsFor(groups.flatMap((g) => g.cards))} />
    </SubPage>
  );
}
