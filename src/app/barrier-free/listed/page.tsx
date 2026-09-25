// 무장애 정보 > 정보가 적힌 곳(궁능 공지사항 모양): 권역 알약, "전체: N곳", 이름 검색, 게시판 표.
// 표 위에 무장애 조건 거르기 줄(주차·걷는 길·화장실·휠체어·엘리베이터, 여러 개는 모두 갖춘 곳만, 주소 뒤 ?조건=).
// 표는 명부에 오른 관광지마다 주차·걷는 길·화장실 칸에 글이 있는지(○ / −)를 보인다. 글 자체는 관광지의 무장애 정보 쪽에 있다.
import type { Metadata } from "next";
import { areaOf, areas, places } from "@/data";
import { Ph, SubPage } from "@/components/layout/PageParts";
import { TipList } from "@/components/royal";
import { groupByArea, menuPage } from "@/components/place-list/helpers";
import { THREE_TEXT } from "@/components/place-list/Parts";
import { condsOf } from "@/components/place-list/barrierConds";
import { BoardList, BoardPills, BoardState, type BoardRow } from "../_parts/Board";
import s from "../bf.module.css";

const HREF = "/barrier-free/listed";
const page = menuPage(HREF);

export const metadata: Metadata = { title: page.title };

export default function ListedPage() {
  const listed = groupByArea(places.filter((p) => p.registered)).flatMap((g) => g.places);
  const label = (k: string) => areas.find((a) => a.key === k)!.label;
  const rows: BoardRow[] = listed.map((p) => ({
    id: p.id,
    name: p.name,
    dong: p.dong,
    area: areaOf(p),
    areaLabel: label(areaOf(p)),
    three: { parking: !!p.three.parking, walk: !!p.three.walk, toilet: !!p.three.toilet },
    conds: condsOf(p),
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
          caption={`무장애 정보가 적힌 곳 목록: 번호, 권역, 관광지, ${THREE_TEXT.parking}, ${THREE_TEXT.walk}, ${THREE_TEXT.toilet}(○ 적힘, − 적힌 내용 없음)`}
        />
        <TipList
          className={s.tips}
          items={[
            <Ph key="a">○ 표시는 한국관광공사 무장애 여행 정보에 그 항목의 글이 적혀 있다는 뜻이고, − 표시는 적힌 내용이 없다는 뜻입니다.</Ph>,
            <Ph key="b">관광지 이름을 누르면 그 관광지의 무장애 정보 쪽에서 적힌 글을 그대로 볼 수 있습니다.</Ph>,
          ]}
        />
      </SubPage>
    </BoardState>
  );
}
