"use client";

// 알약 줄(궁능 공지사항·관람코스의 궁 선택 줄). 링크(href) 또는 단추(onSelect) 두 가지로 쓴다.
// 권역 색 테두리: item.area = "city" 등을 주면 그 권역 색으로 테두리·글자, 고르면 그 색으로 채운다.
// "전체"처럼 분홍→파랑 무늬로 채우려면 item.grad = true.
import Link from "next/link";
import type { AreaKey } from "@/data/types";

export type PillItem = {
  label: React.ReactNode;
  /** 링크로 쓸 때 주소 */
  href?: string;
  /** 단추로 쓸 때 값(onSelect로 돌아온다). 없으면 href를 값으로 쓴다 */
  value?: string;
  /** 권역 색 테두리 */
  area?: AreaKey;
  /** 임의 색(CSS 색 또는 var(...)). area보다 우선 */
  color?: string;
  /** 고르면 분홍→파랑 무늬(궁능 "전체") */
  grad?: boolean;
  /** 이름 뒤 작은 숫자(예: 곳 수) */
  count?: number;
};

export default function PillTabs({
  items,
  current,
  onSelect,
  label,
  className,
}: {
  items: PillItem[];
  /** 지금 고른 값(href 또는 value) */
  current?: string;
  /** 주면 단추로 그린다(클라이언트 컴포넌트 안에서만) */
  onSelect?: (value: string) => void;
  /** 읽기 도구용 이름(예: "권역 고르기") */
  label: string;
  className?: string;
}) {
  return (
    <ul className={`rc-pills${className ? " " + className : ""}`} aria-label={label}>
      {items.map((it) => {
        const val = it.value ?? it.href ?? String(it.label);
        const on = current === val;
        const color = it.color ?? (it.area ? `var(--rc-area-${it.area})` : undefined);
        const cls = `rc-pill${it.area ? " rc-pill--area" : ""}${it.grad ? " rc-pill--grad" : ""}${on ? " is-active" : ""}`;
        const style = color ? ({ "--pill-color": color } as React.CSSProperties) : undefined;
        const body = (
          <>
            {it.label}
            {it.count !== undefined && <span className="rc-pill__count">{it.count}</span>}
          </>
        );
        return (
          <li key={val}>
            {onSelect || !it.href ? (
              <button type="button" className={cls} style={style} aria-pressed={on} onClick={() => onSelect?.(val)}>
                {body}
              </button>
            ) : (
              <Link href={it.href} className={cls} style={style} aria-current={on ? "page" : undefined}>
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** 오른쪽 작은 탭 묶음(궁능 관람코스의 "전체 / 둘러보기 / 편의시설"). 단추만. */
export function SegTabs({
  items,
  current,
  onSelect,
  label,
  className,
}: {
  items: { label: React.ReactNode; value: string }[];
  current: string;
  onSelect: (value: string) => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={`rc-seg${className ? " " + className : ""}`} role="group" aria-label={label}>
      {items.map((it) => (
        <button
          type="button"
          key={it.value}
          className={`rc-seg__btn${current === it.value ? " is-active" : ""}`}
          aria-pressed={current === it.value}
          onClick={() => onSelect(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
