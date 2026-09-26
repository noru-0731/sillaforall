// 무장애 정보 > 무장애 정보가 있는 곳(궁능 공지사항 모양): 권역 알약, "전체: N곳", 이름 검색, 게시판 표.
// (무장애 시안 bf-draft: 표 위 무장애 조건 거르기 줄을 뺐다.)
// 표는 무장애 정보가 있는 관광지마다 주차·접근로·화장실 칸의 한국관광공사 무장애 여행 정보 글을 한 줄에(가7, 붙은 줄은 나눔, 없으면 빈칸),
// 관광지 이름 아래에 글이 적힌 칸이 있는 무장애 묶음 이름표(가8)를 보인다. 칸마다 온 글은 관광지의 무장애 정보 쪽에 있다.
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import { areaOf, areas, places } from "@/data";
import { bfGroupNamesOf } from "@/data/bf";
import { bfLines } from "@/lib/breaks";
import { SubPage } from "@/components/layout/PageParts";
import { TipList } from "@/components/royal";
import { groupByArea, menuPage } from "@/components/place-list/helpers";
import { THREE_TEXT } from "@/components/place-list/Parts";
import { BoardList, BoardPills, BoardState, type BoardRow } from "../_parts/Board";
import s from "../bf.module.css";
import MenuSteps from "@/components/place/MenuSteps";

const HREF = "/barrier-free/listed";
const page = menuPage(HREF);

export const metadata: Metadata = pageMetadata(page.title, HREF);

export default function ListedPage() {
  const listed = groupByArea(places.filter((p) => p.registered)).flatMap((g) => g.places);
  const label = (k: string) => areas.find((a) => a.key === k)!.label;
  const rows: BoardRow[] = listed.map((p) => ({
    id: p.id,
    name: p.name,
    dong: p.dong,
    area: areaOf(p),
    areaLabel: label(areaOf(p)),
    three: { parking: bfLines(p.three.parking), walk: bfLines(p.three.walk), toilet: bfLines(p.three.toilet) },
    groups: bfGroupNamesOf(p.id),
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
          kind="listed"
          rows={rows}
          threeText={THREE_TEXT}
          caption={`무장애 정보가 있는 곳 목록: 번호, 권역, 관광지(무장애 묶음), ${THREE_TEXT.parking}, ${THREE_TEXT.walk}, ${THREE_TEXT.toilet}`}
        />
        {/* 궁능 관람코스 "번호를 클릭하시면 아래 화면에서 시설사진을 볼 수 있습니다." 틀(09-27 점선 1차 정리) */}
        <TipList
          className={s.tips}
          items={["관광지 이름을 누르시면 그 관광지의 무장애 정보 쪽에서 적힌 글을 볼 수 있습니다."]}
        />
        {/* 쪽 끝 이어 읽기(무장애 정보 메뉴 차례) */}
        <MenuSteps section={page.section} current={HREF} />
      </SubPage>
    </BoardState>
  );
}
