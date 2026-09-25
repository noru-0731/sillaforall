"use client";
// 첫 쪽 칸 3(궁능 main_s2 "궁·능 소통"): 제목, 알약 탭 3개(정보가 적힌 곳 / 정보가 없는 곳 / 거점별)와 큰 +,
// 왼쪽 흰 카드 안 목록 10줄([권역] 이름 … 읍면동), 오른쪽 흰 카드 = 경주 전체 지도 판(누르면 /map).
// 아래쪽 파란 띠 바탕(무늬 없이 단색 흐름), 뒤에 흐린 큰 영문 "GYEONGJU".
import { useId, useState } from "react";
import Link from "next/link";
import type { AreaKey } from "@/data/types";
import MapView from "@/components/map/MapView";
import { Icon } from "@/components/icons";
import { MoreLink } from "./bits";
import s from "./home.module.css";

export type BoardRow = { id: string; name: string; dong: string; area: AreaKey; badge: string };
export type BoardList = { key: string; label: string; href: string; rows: BoardRow[]; hub?: boolean };

export default function HomeBoard({ title, lists }: { title: string; lists: BoardList[] }) {
  const [cur, setCur] = useState(lists[0]?.key);
  const list = lists.find((l) => l.key === cur) ?? lists[0];
  const panelId = useId();

  return (
    <section className={s.boardSec} aria-labelledby="home-board-title">
      <p className={s.ghost} aria-hidden="true">
        GYEONGJU
      </p>
      <div className={`${s.inner} ${s.board}`}>
        <div className={s.boardLeft}>
          <h2 id="home-board-title" className={s.secTitle}>
            {title}
          </h2>
          <div className={s.pills} role="group" aria-label={`${title} 목록 고르기`}>
            {lists.map((l) => (
              <button
                key={l.key}
                type="button"
                className={s.pill}
                aria-pressed={l.key === list.key}
                aria-controls={panelId}
                onClick={() => setCur(l.key)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <MoreLink href={list.href} label={`${list.label} 더 보기`} className={s.boardMore} />

          <ul className={s.boardList} id={panelId} aria-label={list.label}>
            {list.rows.map((r) => (
              <li key={r.id} className={s.boardRow}>
                <Link href={`/places/${r.id}`} className={s.boardLink}>
                  <span
                    className={`${s.badge}${list.hub ? " " + s.badgeHub : ""}`}
                    style={list.hub ? undefined : ({ "--c": `var(--rc-area-${r.area})` } as React.CSSProperties)}
                  >
                    {r.badge}
                  </span>
                  <span className={s.boardName}>{r.name}</span>
                  <span className={s.boardDong}>{r.dong}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.boardRight}>
          <Link href="/map" className={s.mapCard} aria-label="관광지 지도 더보기">
            <div className={s.mapBox}>
              <MapView view="full" interactive={false} showAreas={false} height="var(--home-map-h)" ariaLabel="경주 전체 관광지 지도" />
            </div>
            <div className={s.mapBar}>
              관광지 지도 더보기
              <Icon name="arrow-right" size={22} strokeWidth={2} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
