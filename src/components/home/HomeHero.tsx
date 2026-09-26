"use client";
// 첫 쪽 칸 1(궁능 main_s0): 큰 넘기기 배너 → 산호색 가운데 띠 → 바로가기 줄 5칸.
// - 배너 사진은 제1유형만(page.tsx에서 고름). 글자는 사진 위에 바로 얹지 않고 반투명 검정 판 위에 둔다.
// - 오른쪽 아래 둥근 검정 판: ‹ 3 | 5 › 와 멈춤 단추(둘레 원이 자동 넘김 시간을 보여 준다).
//   자동 넘김은 멈출 수 있고, 마우스를 올리거나 초점이 안에 있으면 잠시 멈추고, 움직임 줄이기 설정이면 켜지지 않는다.
// - 바로가기 줄의 ▲ 칸은 눌러야 펼쳐진다(마우스 올림으로 열지 않음). Esc·바깥 누름으로 닫힌다.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import Photo, { SIZES_BIG } from "@/components/royal/Photo";
import { Ph } from "@/components/layout/Ph";
import { useReducedMotion } from "./bits";
import s from "./home.module.css";

export type HeroSlide = {
  id: string;
  name: string;
  /** 관광공사 분류(없으면 null) */
  kicker: string | null;
  /** "권역 · 읍면동" */
  meta: string;
  /** srcset: 줄여 둔 판 여러 폭(관광정보 제1유형, data/photos.ts localPhoto). 있으면 <Photo>가 그것을 쓴다 */
  photo: { url: string; type: "Type1"; w?: number; large?: string; lw?: number; srcset?: string };
  /** 사진 출처(짧은 꼴 "ⓒ한국관광공사" 등. 서버에서 photoCreditOf로 만듦). 글 상자 안 이름·권역 아래에 둔다 */
  credit: string;
};
export type QuickItem = {
  label: string;
  href: string;
  icon: IconName;
  children?: { label: string; href: string }[];
  /** 궁능에 짝이 없어 새로 지은 이름(점선 밑줄 Ph로 보인다) */
  ph?: boolean;
};

const AUTO_MS = 6000;
const RING = 2 * Math.PI * 20; // 멈춤 단추 둘레 원(지름 40)의 길이

export default function HomeHero({
  siteName,
  slides,
  band,
  quick,
}: {
  siteName: string;
  slides: HeroSlide[];
  band: { label: string; href: string }[];
  quick: QuickItem[];
}) {
  const n = slides.length;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const reduce = useReducedMotion();
  const trackId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const running = playing && !hold && !reduce && n > 1;

  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n]);

  return (
    <section className={s.hero} aria-labelledby="home-h1">
      <h1 id="home-h1" className="sr-only">
        {siteName}
      </h1>

      {n > 0 && (
        <div
          className={s.visual}
          ref={rootRef}
          role="region"
          aria-roledescription="넘기기"
          aria-label="관광지 사진"
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={(e) => {
            if (!rootRef.current?.contains(e.relatedTarget as Node)) setHold(false);
          }}
        >
          <div className={s.visualTrack} id={trackId} style={{ transform: `translateX(${-idx * 100}%)` }}>
            {slides.map((sl, i) => {
              const on = i === idx;
              return (
                <div
                  key={sl.id}
                  className={s.visualSlide}
                  role="group"
                  aria-roledescription="칸"
                  aria-label={`${i + 1} / ${n}`}
                  aria-hidden={!on}
                  inert={!on}
                >
                  <Photo photo={sl.photo} alt={sl.name} height="100%" sizes={SIZES_BIG} loading={i === 0 ? "eager" : "lazy"} />
                  <div className={s.visualPanel}>
                    {sl.kicker && <p className={s.visualKicker}>{sl.kicker}</p>}
                    <p className={s.visualName}>
                      <Link href={`/places/${sl.id}`}>{sl.name}</Link>
                    </p>
                    <p className={s.visualMeta}>{sl.meta}</p>
                    <p className={s.visualCredit}>{sl.credit}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {n > 1 && (
            <div className={s.visualCtrl}>
              <button type="button" className={s.visualBtn} aria-controls={trackId} onClick={() => go(idx - 1)}>
                {/* 궁능 화살표 7×21 칸: 24칸 그림의 꺾쇠 부분만 잘라 그린다 */}
                <Icon name="chevron-left" viewBox="8 5 8 14" width={7} height={12} strokeWidth={1.8} />
                <span className="sr-only">이전 사진</span>
              </button>
              <span className={s.visualCount} aria-live={running ? "off" : "polite"} aria-atomic="true">
                <span className={s.visualNum}>{idx + 1}</span>
                <span className={s.visualDiv} aria-hidden="true" />
                <span className="sr-only">/</span>
                <span className={s.visualNum}>{n}</span>
              </span>
              <button type="button" className={s.visualBtn} aria-controls={trackId} onClick={() => go(idx + 1)}>
                <Icon name="chevron-right" viewBox="8 5 8 14" width={7} height={12} strokeWidth={1.8} />
                <span className="sr-only">다음 사진</span>
              </button>
              {!reduce && (
                <button type="button" className={s.visualPause} onClick={() => setPlaying(!playing)}>
                  <svg className={s.ring} width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                    <circle className={s.ringTrack} cx="24" cy="24" r="20" />
                    {/* 둘레가 한 바퀴 다 차면 다음 칸으로(애니메이션 끝 = 넘길 때). 멈추면 원도 멈춘다. */}
                    <circle
                      key={idx}
                      className={s.ringProg}
                      cx="24"
                      cy="24"
                      r="20"
                      style={{ strokeDasharray: RING, strokeDashoffset: RING, animationDuration: `${AUTO_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                      onAnimationEnd={() => go(idx + 1)}
                    />
                  </svg>
                  <Icon name={playing ? "pause" : "play"} size={18} strokeWidth={2.4} />
                  <span className="sr-only">{playing ? "자동 넘김 멈춤" : "자동 넘김 시작"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 산호색 가운데 띠 */}
      <nav className={s.band} aria-label="경주 여행 바로가기">
        <ul className={s.bandList}>
          {band.map((b) => (
            <li key={b.href}>
              <Link href={b.href} className={s.bandLink}>
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <QuickRow items={quick} />
    </section>
  );
}

/** 바로가기 줄 5칸. ▲ 칸은 단추(눌러서 위로 펼침), 나머지는 링크. */
function QuickRow({ items }: { items: QuickItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const popRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLElement>(null);
  const popId = useId();

  // 펼치면 첫 링크로 초점을 옮긴다(펼침판은 줄 밖에 있어 휴대전화 가로 넘기기 칸에 잘리지 않는다).
  // 줄이 화면 위쪽에 있으면 위로 열린 판이 고정 머리 밑에 가려지므로, 먼저 판이 머리 아래에 다 보이게 쪽을 옮긴다
  // (머리 높이만큼 비키는 값은 home.module.css .quickPop의 scroll-margin-top).
  useEffect(() => {
    if (open === null) return;
    const pop = popRef.current;
    pop?.scrollIntoView({ block: "nearest" });
    pop?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      if (!rowRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const close = (focusTo: number | null) => {
    setOpen(null);
    if (focusTo !== null) itemRefs.current[focusTo]?.focus();
  };

  const onPopKey = (e: React.KeyboardEvent) => {
    if (open === null) return;
    const links = Array.from(popRef.current?.querySelectorAll<HTMLElement>("a") ?? []);
    const first = links[0];
    const last = links[links.length - 1];
    if (e.key === "Escape") {
      e.preventDefault();
      close(open);
    } else if (e.key === "Tab" && e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      close(open);
    } else if (e.key === "Tab" && !e.shiftKey && document.activeElement === last) {
      if (open + 1 < items.length) {
        e.preventDefault();
        close(open + 1);
      } else setOpen(null);
    }
  };

  const cur = open !== null ? items[open] : null;

  return (
    <nav className={s.quick} aria-label="자주 찾는 메뉴" ref={rowRef}>
      <ul className={s.quickList}>
        {items.map((q, i) => {
          const body = (
            <>
              <Icon name={q.icon} size={36} strokeWidth={1.5} className={s.quickIcon} />
              <span>{q.ph ? <Ph>{q.label}</Ph> : q.label}</span>
            </>
          );
          return (
            <li key={q.href + i} className={s.quickItem}>
              {q.children ? (
                <button
                  type="button"
                  className={s.quickLink}
                  aria-expanded={open === i}
                  aria-controls={open === i ? popId : undefined}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {body}
                  <Icon name={open === i ? "chevron-down" : "chevron-up"} size={16} strokeWidth={2.4} className={s.quickCaret} />
                  <span className="sr-only"> 열기</span>
                </button>
              ) : (
                <Link
                  href={q.href}
                  className={s.quickLink}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {cur?.children && (
        <div
          id={popId}
          className={s.quickPop}
          ref={popRef}
          style={{ "--i": open } as React.CSSProperties}
          onKeyDown={onPopKey}
        >
          <p className={s.quickPopTit}>{cur.label}</p>
          <ul>
            {cur.children.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className={s.quickPopLink} onClick={() => setOpen(null)}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
