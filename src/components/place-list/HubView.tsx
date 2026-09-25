"use client";
// 관광지 목록 > 거점별. 위쪽 칸 격자는 궁능유적본부 누리집 "경복궁 이야기" 쪽(나무 파일 story_1440)의 전각 칸,
// 아래는 문화행사 카드 줄(events_1440)과 같은 카드. 고른 칸은 검정 바탕 흰 글자 ▼, 나머지는 오른쪽에 ─.
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { Caret, Icon } from "@/components/icons";
import { CreditLines, PlaceCardList } from "./PlaceCards";
import type { CardPlace } from "./types";
import s from "./Hub.module.css";

export default function HubView({ groups, credits }: { groups: { hub: string; cards: CardPlace[] }[]; credits: string[] }) {
  const uid = useId();
  const [i, setI] = useState(0);
  const g = groups[i];
  return (
    <div className={s.wrap}>
      <ul className={s.grid} aria-label="거점 고르기">
        {groups.map((it, k) => {
          const on = k === i;
          return (
            <li key={it.hub} className={cn(s.cell, on && s.cellOn)}>
              <button type="button" className={s.btn} aria-pressed={on} aria-controls={`${uid}-panel`} onClick={() => setI(k)}>
                <span>{it.hub}</span>
                {on ? <Caret size={12} /> : <Icon name="minus" size={16} strokeWidth={1.6} />}
              </button>
            </li>
          );
        })}
      </ul>

      {g && (
        <section id={`${uid}-panel`} className={s.panel} aria-labelledby={`${uid}-tit`}>
          <h2 id={`${uid}-tit`} className={s.tit}>
            {g.hub}
            <span className={s.count}>{g.cards.length}곳</span>
          </h2>
          <PlaceCardList items={g.cards} />
          <CreditLines lines={credits} />
        </section>
      )}
    </div>
  );
}
