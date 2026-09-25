"use client";

// 서브메인 오른쪽 넘기기 판(궁능 gbg_submain의 알림판 넘기기 자리): 같은 권역 다른 관광지의 제1유형 사진.
// 사진은 제1유형만. 관광지 이름은 사진 왼쪽 아래 반투명 판, 오른쪽 아래에 "2/8 ‹ ›" 조작 상자(궁능 190×50)를 겹친다.
// 자동 넘김은 넣지 않았다(어르신이 읽는 동안 바뀌지 않게). 그래서 멈춤 단추도 없다.
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import s from "./NearbySlider.module.css";

export type Slide = { id: string; name: string; dong: string; url: string };

export default function NearbySlider({ slides, label }: { slides: Slide[]; label: string }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  if (!n) return null;
  const cur = slides[i];
  const go = (d: number) => setI((i + d + n) % n);
  return (
    <div className={s.root} role="region" aria-roledescription="넘기기" aria-label={label}>
      <Link href={`/places/${cur.id}`} className={s.photo} tabIndex={-1} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cur.url} alt="" loading="lazy" decoding="async" key={cur.url} />
      </Link>
      <div className={s.bar}>
        <p className={s.name} aria-live="polite" aria-atomic="true">
          <Link href={`/places/${cur.id}`}>
            {cur.name}
            <span className={s.dong}>{cur.dong}</span>
          </Link>
        </p>
        {n > 1 && (
          <div className={s.ctrl}>
            <span className={s.count}>
              <b>{i + 1}</b>/{n}
              <span className="sr-only"> 번째</span>
            </span>
            <button type="button" className={s.btn} onClick={() => go(-1)}>
              <Icon name="chevron-left" size={20} strokeWidth={2} />
              <span className="sr-only">이전</span>
            </button>
            <button type="button" className={s.btn} onClick={() => go(1)}>
              <Icon name="chevron-right" size={20} strokeWidth={2} />
              <span className="sr-only">다음</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
