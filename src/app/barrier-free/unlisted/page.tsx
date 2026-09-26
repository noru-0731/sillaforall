// 무장애 정보 > 무장애 정보가 없는 곳(궁능 공지사항 모양): 권역 알약, "전체: N곳", 이름 검색, 게시판 표.
// 표는 무장애 정보가 없는 관광지와, 있으면 가장 가까운 등록 관광지(직선거리)를 보인다.
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import { areaOf, areas, places } from "@/data";
import { Ph, SubPage } from "@/components/layout/PageParts";
import { TipList } from "@/components/royal";
import { groupByArea, menuPage } from "@/components/place-list/helpers";
import { THREE_TEXT } from "@/components/place-list/Parts";
import { BoardList, BoardPills, BoardState, type BoardRow } from "../_parts/Board";
import s from "../bf.module.css";
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
        <TipList
          className={s.tips}
          items={[
            <Ph key="a">가까운 등록 관광지는 무장애 정보가 있는 관광지 가운데 가장 가까운 곳과 직선거리입니다.</Ph>,
            <Ph key="b">물어볼 곳: 가기 전에 확인할 수 있는 곳을 적을 자리</Ph>,
          ]}
        />
        {/* 쪽 끝 이어 읽기(무장애 정보 메뉴 차례) */}
        <MenuSteps section={page.section} current={HREF} />
      </SubPage>
    </BoardState>
  );
}
