"use client";
// 관광지 목록 > 지역별(궁능유적본부 누리집 문화행사 쪽 모양, 나무 파일 events_1440).
// 왼쪽(357) = 달력 자리에 경주 권역 작은 지도: 머리(지금 권역 이름 28px + ‹ › 검정 단추), 지도, 권역 색 범례.
// 오른쪽(623) = 알약(전체 + 권역) + "전체 61곳" + 카드 줄. 지도·범례·알약 어느 것을 눌러도 같은 권역으로 거른다.
import { useState } from "react";
import type { AreaKey } from "@/data/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";
import PillTabs from "@/components/royal/PillTabs";
import MapView from "@/components/map/MapView";
import { CreditLines, PlaceCardList } from "./PlaceCards";
import type { AreaOption, CardPlace } from "./types";
import s from "./AreaList.module.css";

type Pick = "all" | AreaKey;

export default function AreaListView({ cards, options, credits }: { cards: CardPlace[]; options: AreaOption[]; credits: string[] }) {
  const [cur, setCur] = useState<Pick>("all");
  const order: Pick[] = ["all", ...options.map((o) => o.key)];
  const idx = order.indexOf(cur);
  const go = (d: number) => setCur(order[(idx + d + order.length) % order.length]);
  const curLabel = cur === "all" ? "경주 전체" : (options.find((o) => o.key === cur)?.label ?? "");
  const shown = cur === "all" ? cards : cards.filter((c) => c.area === cur);
  const toggle = (k: AreaKey) => setCur(cur === k ? "all" : k);

  return (
    <div className={s.wrap}>
      <div className={s.left}>
        <div className={s.sticky}>
          <div className={s.head}>
            <p className={s.headTit}>{curLabel}</p>
            <div className={s.nav}>
              <button type="button" className={s.navBtn} onClick={() => go(-1)} aria-label="이전 권역" title="이전 권역">
                <Icon name="chevron-left" size={16} strokeWidth={2} />
              </button>
              <button type="button" className={s.navBtn} onClick={() => go(1)} aria-label="다음 권역" title="다음 권역">
                <Icon name="chevron-right" size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className={s.mapBox}>
            <MapView
              view="full"
              interactive={false}
              labels={false}
              legend={false}
              plain
              placeIds={cur === "all" ? undefined : shown.map((c) => c.id)}
              onAreaSelect={toggle}
              selectedArea={cur === "all" ? null : cur}
              ariaLabel="경주 권역 지도"
            />
          </div>
          <ul className={s.caption} aria-label="권역 범례">
            <li>
              <button type="button" className={cn(s.capBtn, cur === "all" && s.capOn)} aria-pressed={cur === "all"} onClick={() => setCur("all")}>
                전체
              </button>
            </li>
            {options.map((o) => (
              <li key={o.key}>
                <button
                  type="button"
                  className={cn(s.capBtn, cur === o.key && s.capOn)}
                  style={{ "--c": `var(--rc-area-${o.key})` } as React.CSSProperties}
                  aria-pressed={cur === o.key}
                  onClick={() => toggle(o.key)}
                >
                  <span className={s.capDot} aria-hidden="true" />
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.tabWrap}>
          <PillTabs
            className={s.pills}
            label="권역 고르기"
            current={cur}
            onSelect={(v) => setCur(v as Pick)}
            items={[{ label: "전체", value: "all" }, ...options.map((o) => ({ label: o.label, value: o.key, area: o.key }))]}
          />
          <p className={s.count} aria-live="polite">
            {cur === "all" ? "전체" : curLabel} {shown.length}곳
          </p>
        </div>
        <PlaceCardList items={shown} />
        <CreditLines lines={credits} />
      </div>
    </div>
  );
}
