// 무장애 정보 > 무장애 정보가 없는 곳(궁능 공지사항 모양): 권역 알약, "전체: N곳", 이름 검색, 게시판 표.
// 표는 무장애 정보가 없는 관광지와, 있으면 가장 가까운 등록 관광지(직선거리)를 보인다.
// 표 아래 점선 풀이 줄('가까운 등록 관광지는 …')은 09-27 점선 1차 정리로 뺐다(칸 이름 '인근 무장애 ‘명소’'와 값의 '(직선 …km)'가 같은 뜻, 11_안건_점선_문구.md).
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import { areaOf, areas, places } from "@/data";
import { SubPage } from "@/components/layout/PageParts";
import { groupByArea, menuPage } from "@/components/place-list/helpers";
import { THREE_TEXT } from "@/components/place-list/Parts";
import { BoardList, BoardPills, BoardState, type BoardRow } from "../_parts/Board";
import MenuSteps from "@/components/place/MenuSteps";

const HREF = "/barrier-free/unlisted";
const page = menuPage(HREF);

export const metadata: Metadata = pageMetadata(page.title, HREF);

export default function UnlistedPage() {
  const unlisted = groupByArea(places.filter((p) => !p.registered)).flatMap((g) => g.places);
  const label = (k: string) => areas.find((a) => a.key === k)!.label;
  const rows: BoardRow[] = unlisted.map((p) => ({
    id: p.id,
    name: p.name,
    dong: p.dong,
    area: areaOf(p),
    areaLabel: label(areaOf(p)),
    nearest: p.nearestRegistered,
  }));

  return (
    <BoardState>
      <SubPage
        crumbs={[...page.crumbs, { label: page.title, href: HREF }]}
        title={page.title}
        side={page.section}
        current={HREF}
        tabs={<BoardPills areas={areas.map((a) => ({ key: a.key, label: a.label }))} />}
      >
        <BoardList
          kind="unlisted"
          rows={rows}
          threeText={THREE_TEXT}
          caption="무장애 정보가 없는 곳 목록: 번호, 권역, 관광지, 읍면동, 인근 무장애 ‘명소’"
        />
        {/* 쪽 끝 이어 읽기(무장애 정보 메뉴 차례) */}
        <MenuSteps section={page.section} current={HREF} />
      </SubPage>
    </BoardState>
  );
}
