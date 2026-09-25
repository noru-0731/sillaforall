"use client";

// 여러 개를 함께 고르는 알약 줄(거르기 줄). 알약 모양은 PillTabs와 같은 .rc-pill(궁능 공지사항·문화행사 알약: 높이 35, 16px 700, 1px 테두리).
// 줄 앞 이름은 궁능 관람코스 "코스안내"(아이콘 20 + 18px 400), 줄 끝 곳 수는 궁능 문화행사 "2026.9.25 행사"(20px 600) 자리.
// 맨 앞 "전체"는 고른 것을 모두 푼다(아무것도 안 고르면 "전체"가 눌린 상태). 눌린 "전체"는 궁능 공지사항처럼 분홍→파랑 무늬,
// allTone="ink"면 궁능 문화행사처럼 검정(같은 쪽 권역 알약의 "전체"와 맞춘다).
// 고른 알약은 검정으로 채우고 앞에 ✓를 붙인다(색만으로 알리지 않게). 읽기 도구에는 aria-pressed로 알린다.
import { useId } from "react";
import { Icon, type IconName } from "@/components/icons";
import s from "./FilterPills.module.css";

export type FilterPillItem = { label: string; value: string };

export default function FilterPills({
  label,
  icon,
  items,
  selected,
  onChange,
  allLabel = "전체",
  allTone = "grad",
  count,
  note,
  className,
}: {
  /** 줄 앞 이름(화면에 보임, 묶음 이름으로도 읽힘) */
  label: React.ReactNode;
  /** 줄 앞 이름 아이콘 */
  icon?: IconName;
  items: FilterPillItem[];
  /** 고른 값들 */
  selected: readonly string[];
  /** 새로 고른 값들(items 차례) */
  onChange: (next: string[]) => void;
  /** 맨 앞 "모두 풀기" 알약 이름 */
  allLabel?: string;
  /** 눌린 "전체"의 색: grad = 분홍→파랑(궁능 공지사항), ink = 검정(궁능 문화행사) */
  allTone?: "grad" | "ink";
  /** 줄 끝 곳 수(바뀌면 읽기 도구가 읽는다) */
  count?: React.ReactNode;
  /** 줄 아래 ※ 한 줄 */
  note?: React.ReactNode;
  className?: string;
}) {
  const uid = useId();
  const titId = `${uid}-tit`;
  const none = selected.length === 0;
  const toggle = (v: string) => {
    const on = selected.includes(v);
    onChange(items.map((it) => it.value).filter((x) => (x === v ? !on : selected.includes(x))));
  };

  return (
    <div className={`${s.wrap}${className ? " " + className : ""}`}>
      <div className={s.row}>
        <div className={s.group} role="group" aria-labelledby={titId}>
          <span className={s.tit} id={titId}>
            {icon && <Icon name={icon} size={20} strokeWidth={1.8} />}
            {label}
          </span>
          <ul className={`rc-pills ${s.list}`}>
            <li>
              <button
                type="button"
                className={`rc-pill${allTone === "grad" ? " rc-pill--grad" : ""} ${s.pill}${none ? " is-active" : ""}`}
                aria-pressed={none}
                onClick={() => onChange([])}
              >
                {allLabel}
              </button>
            </li>
            {items.map((it) => {
              const on = selected.includes(it.value);
              return (
                <li key={it.value}>
                  <button
                    type="button"
                    className={`rc-pill ${s.pill}${on ? " is-active" : ""}`}
                    aria-pressed={on}
                    onClick={() => toggle(it.value)}
                  >
                    {on && <Icon name="check" size={16} strokeWidth={2.4} className={s.check} />}
                    {it.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {count !== undefined && (
          <p className={s.count} aria-live="polite">
            {count}
          </p>
        )}
      </div>
      {note && (
        <ul className={`rc-tips ${s.note}`}>
          <li>{note}</li>
        </ul>
      )}
    </div>
  );
}
