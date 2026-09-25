// 관광지 목록 > 지역별. 궁능유적본부 누리집 문화행사 쪽 모양(왼쪽 작은 지도, 오른쪽 알약 + 카드 줄).
import type { Metadata } from "next";
import { SubPage } from "@/components/layout/PageParts";
import { menuPage } from "@/components/place-list/helpers";
import { areaOptions, cardsByArea, creditsFor } from "@/components/place-list/cardData";
import AreaListView from "@/components/place-list/AreaListView";

const HREF = "/list";
const page = menuPage(HREF);

export const metadata: Metadata = { title: page.title };

export default function ListByAreaPage() {
  const cards = cardsByArea();
  return (
    <SubPage
      crumbs={[...page.crumbs, { label: page.title, href: HREF }]}
      title={page.title}
      side={page.section}
      current={HREF}
    >
      <AreaListView cards={cards} options={areaOptions()} credits={creditsFor(cards)} />
    </SubPage>
  );
}
