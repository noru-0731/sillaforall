"use client";

// 알약 줄(궁능 공지사항·관람코스의 궁 선택 줄). 링크(href) 또는 단추(onSelect) 두 가지로 쓴다.
// 권역 색 테두리: item.area = "city" 등을 주면 그 권역 색으로 테두리·글자, 고르면 그 색으로 채운다.
// "전체"처럼 분홍→파랑 무늬로 채우려면 item.grad = true.
// scroll: 알약이 많을 때 한 줄로 두고 양옆 ‹ › 단추로 넘긴다(궁능 휴대전화 공지사항·자주 묻는 질문의 알약 줄).
//   "mobile" = 본문 폭 767 이하에서만 한 줄(PC는 여러 줄로 접힘), "always" = 늘 한 줄. 넘칠 때만 ‹ ›가 보인다.
//   처음 열 때 고른 알약이 보이게 줄을 옮겨 둔다.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AreaKey } from "@/data/types";
import { Icon } from "@/components/icons";
import ps from "./PillScroll.module.css";

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
  scroll,
}: {
  items: PillItem[];
  /** 지금 고른 값(href 또는 value) */
  current?: string;
  /** 주면 단추로 그린다(클라이언트 컴포넌트 안에서만) */
  onSelect?: (value: string) => void;
  /** 읽기 도구용 이름(예: "권역 고르기") */
  label: string;
  className?: string;
  /** 한 줄 + ‹ › 넘기기: "mobile"(좁은 화면만) | "always" */
  scroll?: "mobile" | "always";
}) {
  const list = <PillList items={items} current={current} onSelect={onSelect} label={label} className={className} />;
  if (!scroll) return list;
  return (
    <PillScroller mode={scroll}>
      {list}
    </PillScroller>
  );
}

/** 알약 줄 한 줄 넘기기 틀: 줄이 넘칠 때만 양옆 ‹ › 단추가 보인다. */
function PillScroller({ mode, children }: { mode: "mobile" | "always"; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ over: false, start: true, end: true });

  const ulOf = () => box.current?.querySelector<HTMLUListElement>("ul.rc-pills") ?? null;
  const measure = useCallback(() => {
    const ul = ulOf();
    if (!ul) return;
    const over = ul.scrollWidth - ul.clientWidth > 1;
    setEdge({ over, start: ul.scrollLeft <= 1, end: ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 1 });
  }, []);

  useEffect(() => {
    const ul = ulOf();
    if (!ul) return;
    // 고른 알약이 보이게(쪽 전체는 움직이지 않고 줄만)
    const on = ul.querySelector<HTMLElement>(".is-active");
    if (on && ul.scrollWidth > ul.clientWidth) {
      const li = on.parentElement as HTMLElement;
      ul.scrollLeft = Math.max(0, li.offsetLeft - ul.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2);
    }
    // 넘침 여부는 ResizeObserver가 처음 한 번 부르는 것으로 잰다(관찰을 시작하면 바로 한 번 불린다)
    ul.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    return () => {
      ul.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const move = (dir: number) => {
    const ul = ulOf();
    if (!ul) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ul.scrollBy({ left: dir * Math.max(120, ul.clientWidth * 0.8), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div ref={box} className={`${ps.wrap} ${mode === "always" ? ps.always : ps.mobile}${edge.over ? " " + ps.over : ""}`}>
      <button type="button" className={`${ps.btn} ${ps.prev}`} onClick={() => move(-1)} disabled={edge.start} hidden={!edge.over}>
        <Icon name="chevron-left" size={26} strokeWidth={1.6} />
        <span className="sr-only">이전</span>
      </button>
      {children}
      <button type="button" className={`${ps.btn} ${ps.next}`} onClick={() => move(1)} disabled={edge.end} hidden={!edge.over}>
        <Icon name="chevron-right" size={26} strokeWidth={1.6} />
        <span className="sr-only">다음</span>
      </button>
    </div>
  );
}

function PillList({
  items,
  current,
  onSelect,
  label,
  className,
}: {
  items: PillItem[];
  current?: string;
  onSelect?: (value: string) => void;
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
