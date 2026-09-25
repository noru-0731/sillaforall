"use client";

// 관광지 사진 넘기기(궁능 "경복궁 이야기" gbg_story의 사진 칸 모양).
// 위: "1/5" + 오른쪽 ‹ › 검정 네모 단추 → 큰 사진(1030×489) → 사진 이름 + "원본 보기" → 작은 사진 줄 → 공공누리 글자 상자.
// 제3유형 사진은 <Photo>가 자르지 않는다(contain). 사진 이름은 사진 위에 겹치지 않고 사진 아래 줄에 둔다.
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Ph } from "@/components/layout/Ph";
import { KoglBox, Photo } from "@/components/royal";
import type { ViewerPhoto } from "./placeData";
import s from "./PhotoViewer.module.css";

export default function PhotoViewer({ photos, placeName }: { photos: ViewerPhoto[]; placeName: string }) {
  const [i, setI] = useState(0);
  const n = photos.length;
  const thumbsRef = useRef<HTMLUListElement>(null);
  const moved = useRef(false);

  // 작은 사진 줄은 한 줄 가로 넘김(궁능 swiper_thumb01). 고른 작은 사진이 줄 안에 보이도록 옆으로만 민다.
  useEffect(() => {
    if (!moved.current) return;
    const ul = thumbsRef.current;
    const li = ul?.children[i] as HTMLElement | undefined;
    if (!ul || !li) return;
    const left = li.getBoundingClientRect().left - ul.getBoundingClientRect().left + ul.scrollLeft;
    if (left < ul.scrollLeft || left + li.offsetWidth > ul.scrollLeft + ul.clientWidth) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      ul.scrollTo({ left: left - (ul.clientWidth - li.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
  }, [i]);

  if (!n) {
    return (
      <div className={`${s.root} ${s.empty}`}>
        <Photo photo={null} alt="" ratio="1030/489" />
      </div>
    );
  }

  const cur = photos[i];
  const pick = (j: number) => {
    moved.current = true;
    setI(j);
  };
  const go = (d: number) => pick((i + d + n) % n);

  return (
    <div className={s.root} role="region" aria-roledescription="넘기기" aria-label={`${placeName} 사진`}>
      <div className={s.head}>
        <p className={s.count} aria-live="polite" aria-atomic="true">
          <b>{i + 1}</b>/{n}
          <span className="sr-only"> 번째 사진, {cur.name}</span>
        </p>
        {n > 1 && (
          <div className={s.arrows}>
            <button type="button" className={s.arrow} onClick={() => go(-1)}>
              <Icon name="chevron-left" size={26} strokeWidth={1.8} />
              <span className="sr-only">이전 사진</span>
            </button>
            <button type="button" className={s.arrow} onClick={() => go(1)}>
              <Icon name="chevron-right" size={26} strokeWidth={1.8} />
              <span className="sr-only">다음 사진</span>
            </button>
          </div>
        )}
      </div>

      <Photo key={cur.url} photo={cur} alt={cur.name} ratio="1030/489" bg="dark" loading="eager" />

      <div className={s.bar}>
        <p className={s.name}>{cur.made ? <Ph>{cur.name}</Ph> : cur.name}</p>
        <a href={cur.url} target="_blank" rel="noopener noreferrer" className={s.orig}>
          원본 보기
          <Icon name="external" size={18} strokeWidth={1.8} />
          <span className="sr-only">(새 창)</span>
        </a>
      </div>

      {n > 1 && (
        <ul className={s.thumbs} aria-label="작은 사진" ref={thumbsRef}>
          {photos.map((ph, j) => (
            <li key={ph.url}>
              <button
                type="button"
                className={`${s.thumb}${j === i ? " " + s.thumbOn : ""}`}
                aria-current={j === i ? "true" : undefined}
                onClick={() => pick(j)}
              >
                <Photo photo={{ url: ph.small, type: ph.type }} alt="" ratio="196/93" bg="light" />
                <span className="sr-only">
                  {j + 1}번째 사진 보기: {ph.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <KoglBox type={cur.type} by={cur.by} className={s.kogl} />
    </div>
  );
}
