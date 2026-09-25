"use client";

// 넘기기(슬라이더) 기본. 이전/다음 단추, "3 / 16" 쪽 수, 자동 넘김이면 멈춤/재생 단추.
// - 움직임 줄이기 설정(prefers-reduced-motion)이면 자동 넘김을 끈다.
// - 마우스를 올리거나 키보드 초점이 안에 있으면 자동 넘김을 잠시 멈춘다.
// - 자동 넘김 중에는 aria-live를 끄고(off), 멈추면 polite로 쪽 수를 읽어 준다(WAI-ARIA 넘기기 규칙).
// - 보이지 않는 칸은 inert로 막아 Tab이 들어가지 않게 한다.
// 조작 막대 위치: controls="overlay"(사진 오른쪽 아래 둥근 검정 판) | "below"(아래) | "none"(바깥에서 index로 조정).
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";

export default function Slider({
  slides,
  label,
  auto = 0,
  perView = 1,
  gap = 0,
  controls = "overlay",
  tone = "dark",
  index: controlled,
  onIndexChange,
  loop = true,
  className,
  slideLabel,
}: {
  slides: React.ReactNode[];
  /** 읽기 도구용 이름(예: "첨성대 사진") */
  label: string;
  /** 자동 넘김 간격(ms). 0이면 끔(기본) */
  auto?: number;
  /** 한 번에 보이는 칸 수(카드 줄은 3 등). 한 칸씩 넘어간다 */
  perView?: number;
  /** 칸 사이(px) */
  gap?: number;
  controls?: "overlay" | "below" | "none";
  /** 조작 막대 색: dark(검정 판, 흰 글자) | light(흰 판) */
  tone?: "dark" | "light";
  /** 바깥에서 쥐는 지금 칸(작은 사진 줄과 맞출 때) */
  index?: number;
  onIndexChange?: (i: number) => void;
  /** 끝에서 처음으로 돌아가기 */
  loop?: boolean;
  className?: string;
  /** 칸 이름(읽기 도구용): (i, n) => "사진 3 / 16" */
  slideLabel?: (i: number, n: number) => string;
}) {
  const n = slides.length;
  const maxIdx = Math.max(0, n - perView);
  const [inner, setInner] = useState(0);
  const idx = Math.min(controlled ?? inner, maxIdx);
  const [playing, setPlaying] = useState(auto > 0);
  const [hold, setHold] = useState(false);
  const [reduce, setReduce] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => {
      setReduce(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const go = useCallback(
    (i: number) => {
      let j = i;
      if (j > maxIdx) j = loop ? 0 : maxIdx;
      if (j < 0) j = loop ? maxIdx : 0;
      setInner(j);
      onIndexChange?.(j);
    },
    [maxIdx, loop, onIndexChange],
  );

  const running = auto > 0 && playing && !hold && !reduce && n > perView;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => go(idx + 1), auto);
    return () => clearInterval(t);
  }, [running, auto, idx, go]);

  if (!n) return null;
  const pct = 100 / perView;
  const pages = maxIdx + 1;

  const ctrl = controls !== "none" && pages > 1 && (
    <div className={`rc-slider__ctrl${tone === "light" ? " rc-slider__ctrl--light" : ""}`}>
      <button type="button" className="rc-slider__btn" aria-controls={id} onClick={() => go(idx - 1)} disabled={!loop && idx === 0}>
        <Icon name="chevron-left" size={22} strokeWidth={2} />
        <span className="sr-only">이전</span>
      </button>
      <span className="rc-slider__count" aria-live={running ? "off" : "polite"} aria-atomic="true">
        <b>{idx + 1}</b> / {pages}
        <span className="sr-only"> 번째</span>
      </span>
      <button type="button" className="rc-slider__btn" aria-controls={id} onClick={() => go(idx + 1)} disabled={!loop && idx === maxIdx}>
        <Icon name="chevron-right" size={22} strokeWidth={2} />
        <span className="sr-only">다음</span>
      </button>
      {auto > 0 && !reduce && (
        <button type="button" className="rc-slider__btn" onClick={() => setPlaying(!playing)}>
          <Icon name={playing ? "pause" : "play"} size={20} strokeWidth={2.2} />
          <span className="sr-only">{playing ? "자동 넘김 멈춤" : "자동 넘김 시작"}</span>
        </button>
      )}
    </div>
  );

  return (
    <div
      className={`rc-slider${className ? " " + className : ""}`}
      role="region"
      aria-roledescription="넘기기"
      aria-label={label}
      ref={rootRef}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setHold(false);
      }}
    >
      <div className="rc-slider__viewport">
        <div
          className="rc-slider__track"
          id={id}
          style={{ transform: `translateX(calc(${-idx * pct}% - ${idx * gap / perView}px))`, gap: gap ? `${gap}px` : undefined }}
        >
          {slides.map((s, i) => {
            const shown = i >= idx && i < idx + perView;
            return (
              <div
                className="rc-slider__slide"
                key={i}
                role="group"
                aria-roledescription="칸"
                aria-label={slideLabel ? slideLabel(i, n) : `${i + 1} / ${n}`}
                aria-hidden={!shown}
                inert={!shown}
                style={perView !== 1 || gap ? { flexBasis: `calc(${pct}% - ${(gap * (perView - 1)) / perView}px)` } : undefined}
              >
                {s}
              </div>
            );
          })}
        </div>
      </div>
      {controls === "overlay" && ctrl && <div style={{ position: "absolute", right: "1.5rem", bottom: "1.5rem", zIndex: 2 }}>{ctrl}</div>}
      {controls === "below" && ctrl && <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>{ctrl}</div>}
    </div>
  );
}
