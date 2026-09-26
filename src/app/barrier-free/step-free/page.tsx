// 무장애 정보 > 계단 없는 길(deck 갈래, 09-26 저녁 사용자 방향: 나이가 있는 분은 계단 말고 데크길 자체를 찾는다).
// 쪽 이름은 레퍼런스의 이름('계단 없는 길', 데크길 레퍼런스 이름 셈 5곳). 쪽 첫머리 풀이 글은 두지 않는다.
// 묶음 셋: 무장애나눔길(자료 이름) → 데크길(무장애나눔길 서비스 노면 칸의 값) → 평탄한 길(새 말, 점선).
// 묶음마다 곳 덩어리(곳 이름 → 칸 표, 칸마다 출처). 쪽 맨 끝에 출처 줄(자료 이름과 본 날짜)을 한 번, 그 뒤 이어 읽기(MenuSteps, 메뉴 차례의 이전 쪽).
// 자료: data/stepfree.json(도구/19_계단없는길.py). 사진은 넣지 않는다.
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import { InPageNav, Ph, Section, SubPage } from "@/components/layout/PageParts";
import { menuPage } from "@/components/place-list/helpers";
import { SourceLines } from "@/components/place/Amenities";
import { StepFreeBlock } from "@/components/place/StepFree";
import MenuSteps from "@/components/place/MenuSteps";
import { STEPFREE_GROUPS, STEPFREE_HREF, STEPFREE_PLACES, stepFreeSourceLines } from "@/data/stepfree";
import sf from "@/components/place/StepFree.module.css";

const HREF = STEPFREE_HREF;
const page = menuPage(HREF);

export const metadata: Metadata = pageMetadata(page.title, HREF);

export default function StepFreePage() {
  const groups = STEPFREE_GROUPS.map((g) => ({
    g,
    id: `sf-${g.key}`,
    label: g.ph ? <Ph>{g.label}</Ph> : g.label,
    places: STEPFREE_PLACES.filter((p) => p.group === g.key),
  })).filter((x) => x.places.length > 0);

  return (
    <SubPage crumbs={[...page.crumbs, { label: page.title, href: HREF }]} title={page.title} side={page.section} current={HREF}>
      <InPageNav title={page.title} items={groups.map((x) => ({ id: x.id, label: x.label }))} />
      {groups.map((x) => (
        <Section key={x.id} id={x.id} className={sf.anchor} title={x.label}>
          {x.places.map((p) => (
            <StepFreeBlock key={p.id} place={p} />
          ))}
        </Section>
      ))}
      <div className={sf.pageSources}>
        <SourceLines lines={stepFreeSourceLines()} />
      </div>
      {/* 쪽 끝 이어 읽기(무장애 정보 메뉴 차례) */}
      <MenuSteps section={page.section} current={HREF} />
    </SubPage>
  );
}
