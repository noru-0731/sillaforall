// 관광지 목록 > 거점별: 연관 관광지 묶음마다 주차·접근로·화장실을 한 표로(09-29, 서식4 창의성 채점자 "같은 여행 안에서 정보가 끊기는 곳").
// 칸 값은 무장애 정보가 있는 곳 표(barrier-free/listed)와 같은 규칙: 한국관광공사 무장애 여행 정보 글 → 없으면 data/fill.ts 로 채운 값과 자료 꼬리 → 그것도 없으면 빈칸.
// 제목·머리 칸은 묶음 이름과 사이트 칸 이름(THREE_TEXT)만 쓴다(새 글 없음). 서버 컴포넌트.
import Link from "next/link";
import type { Place } from "@/data";
import { bfLines } from "@/lib/breaks";
import { parkingFill, toiletFill, walkFill, type Fill } from "@/data/fill";
import BoardTable from "@/components/royal/BoardTable";
import { FillText } from "@/components/place/FillText";
import { THREE_TEXT } from "./Parts";
import s from "./Hub.module.css";

function Cell({ text, fill }: { text: string | null; fill: Fill | null }) {
  if (text) return <span className={s.threeTxt}>{text}</span>;
  return fill ? (
    <span className={s.threeTxt}>
      <FillText fill={fill} />
    </span>
  ) : null;
}

export default function HubThree({ hub, places }: { hub: string; places: Place[] }) {
  const names = `${THREE_TEXT.parking}·${THREE_TEXT.walk}·${THREE_TEXT.toilet}`;
  const keys = ["parking", "walk", "toilet"] as const;
  const FILL = { parking: parkingFill, walk: walkFill, toilet: toiletFill };
  const items = places.map((p) => {
    const cells = keys.map((k) => {
      const text = bfLines(p.three[k]);
      return { k, text, fill: text ? null : FILL[k](p) };
    });
    return { p, cells };
  });
  const href = (p: Place) => `/places/${p.id}/barrier-free`;
  return (
    <div className={s.three}>
      <h3 className={s.threeTit}>
        {hub} {names}
      </h3>
      {/* 넓은 화면: 표 */}
      <div className={s.threeTable}>
        <BoardTable
          caption={`${hub} ${names}: 관광지, ${THREE_TEXT.parking}, ${THREE_TEXT.walk}, ${THREE_TEXT.toilet}`}
          head={["관광지", THREE_TEXT.parking, THREE_TEXT.walk, THREE_TEXT.toilet]}
          cols={["19%", "27%", "27%", "27%"]}
          align={["l", "l", "l", "l"]}
          rows={items.map(({ p, cells }) => [
            <Link key="n" href={href(p)}>
              {p.name}
            </Link>,
            ...cells.map((c) => <Cell key={c.k} text={c.text} fill={c.fill} />),
          ])}
          rowHeader
        />
      </div>
      {/* 좁은 화면: 목록(무장애 정보가 있는 곳 목록과 같은 모양) */}
      <ul className={s.mList}>
        {items.map(({ p, cells }) => (
          <li key={p.id} className={s.mItem}>
            <Link href={href(p)} className={s.mName}>
              {p.name}
            </Link>
            <dl className={s.mThree}>
              {cells.map((c) => (
                <div key={c.k}>
                  <dt>{THREE_TEXT[c.k]}</dt>
                  <dd>
                    <Cell text={c.text} fill={c.fill} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
