"use client";

// 서브메인 오른쪽 넘기기 판(궁능 gbg_submain의 알림판 넘기기 자리): 같은 권역 다른 관광지의 제1유형 사진.
// 사진은 제1유형만. 관광지 이름은 사진 왼쪽 아래 반투명 판, 오른쪽 아래에 "2/8 ‹ ‖ ›" 조작 상자(궁능 190×50)를 겹친다.
// 자동 넘김(궁능 알림판처럼): 6초마다 넘어가고 ‖ 단추로 멈춘다. 마우스를 올리거나 초점이 안에 있으면 잠시 멈추고,
// 움직임 줄이기 설정이면 켜지지 않는다(멈춤 단추도 숨김). 자동 넘김 중에는 이름을 소리 내어 읽지 않는다(aria-live off).
// 지금 사진의 출처(짧은 꼴 "ⓒ한국관광공사" 등)는 사진 오른쪽 위에 작은 딱지로 얹는다(아래 두 구석은 이름 판·조작 상자 자리).
// 사진 링크는 읽기 도구에서 숨기므로(aria-hidden) 딱지는 그 밖(판 안)에 둔다.
// 사진 파일: 관광정보 제1유형은 srcset(휴대전화 폭은 줄여 둔 480 판, 넓은 화면은 원 주소, SIZES_MID)이 온다(placeData nearbySlides).
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { CreditTag, SIZES_MID } from "@/components/royal/Photo";
import { useReducedMotion } from "@/components/home/bits";
import s from "./NearbySlider.module.css";

export type Slide = {
  id: string;
  name: string;
  dong: string;
  url: string;
  /** 줄여 둔 판과 원 주소(관광정보 제1유형만) */
  srcset?: string;
  credit: string;
};

const AUTO_MS = 6000;

export default function NearbySlider({
  slides,
  label,
}: {
  slides: Slide[];
  label: string;
}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const n = slides.length;
  const running = playing && !hold && !reduce && n > 1;

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), AUTO_MS);
    return () => window.clearInterval(t);
  }, [running, n]);

  if (!n) return null;
  const cur = slides[i];
  const go = (d: number) => setI((i + d + n) % n);
  return (
    <>
      <div
        className={s.root}
        ref={rootRef}
        role="region"
        aria-roledescription="넘기기"
        aria-label={label}
        onMouseEnter={() => setHold(true)}
        onMouseLeave={() => setHold(false)}
        onFocus={() => setHold(true)}
        onBlur={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node))
            setHold(false);
        }}
      >
        <Link
          href={`/places/${cur.id}`}
          className={s.photo}
          tabIndex={-1}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cur.url}
            srcSet={cur.srcset}
            sizes={cur.srcset ? SIZES_MID : undefined}
            alt=""
            loading="lazy"
            decoding="async"
            key={cur.url}
          />
        </Link>
        <div className={s.bar}>
          <p
            className={s.name}
            aria-live={running ? "off" : "polite"}
            aria-atomic="true"
          >
            <Link href={`/places/${cur.id}`}>
              {cur.name}
              <span className={s.dong}>{cur.dong}</span>
            </Link>
          </p>
          {n > 1 && (
            <div className={s.ctrl}>
              <span className={s.count}>
                <b>{i + 1}</b>/{n}
              </span>
              <button type="button" className={s.btn} onClick={() => go(-1)}>
                <Icon name="chevron-left" size={20} strokeWidth={2} />
                <span className="sr-only">이전</span>
              </button>
              {!reduce && (
                <button
                  type="button"
                  className={s.btn}
                  onClick={() => setPlaying(!playing)}
                >
                  <Icon
                    name={playing ? "pause" : "play"}
                    size={18}
                    strokeWidth={2.2}
                  />
                  <span className="sr-only">
                    {playing ? "자동 넘김 멈춤" : "자동 넘김 시작"}
                  </span>
                </button>
              )}
              <button type="button" className={s.btn} onClick={() => go(1)}>
                <Icon name="chevron-right" size={20} strokeWidth={2} />
                <span className="sr-only">다음</span>
              </button>
            </div>
          )}
        </div>
        <CreditTag text={cur.credit} at="tr" />
      </div>
    </>
  );
}
