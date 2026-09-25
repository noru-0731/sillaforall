// 관광지 목록 > 가나다순. 궁능유적본부 누리집 공지사항 쪽 모양(알약 줄 + 전체 곳 수 + 이름 검색 + 게시판 표).
import type { Metadata } from "next";
import { SubPage } from "@/components/layout/PageParts";
import { menuPage } from "@/components/place-list/helpers";
import { areaOptions, boardRows } from "@/components/place-list/cardData";
import { AbcBoard, AbcPills, AbcProvider } from "@/components/place-list/AbcBoard";

const HREF = "/list/abc";
const page = menuPage(HREF);

export const metadata: Metadata = { title: page.title };

export default function ListAbcPage() {
  const options = areaOptions();
  return (
    <AbcProvider>
      <SubPage
        crumbs={[...page.crumbs, { label: page.title, href: HREF }]}
        title={page.title}
        side={page.section}
        current={HREF}
        tabs={<AbcPills options={options} />}
      >
        <AbcBoard rows={boardRows()} options={options} />
      </SubPage>
    </AbcProvider>
  );
}
