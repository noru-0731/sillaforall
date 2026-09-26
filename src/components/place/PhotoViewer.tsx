"use client";

// 관광지 사진 넘기기(궁능 "경복궁 이야기" gbg_story의 사진 칸 모양).
// 위: "1/5" + 오른쪽 ‹ › 검정 네모 단추 → 큰 사진(1030×489) → 단추 줄("원본 보기") → 작은 사진 줄 → 공공누리 글자 상자.
// 사진 이름: 궁능은 큰 사진 오른쪽 아래 어두운 상자(18px, 줄 50, 좌우 15, 검정 70%)에 둔다.
//   제1유형은 그대로 사진 위 오른쪽 아래에 얹는다. 제3유형(변경 금지)은 사진 위에 글을 얹을 수 없어 사진 아래 단추 줄 왼쪽에 둔다.
// 사진 출처(짧은 꼴 "ⓒ한국관광공사" 등): 제1유형은 큰 사진 왼쪽 위에 작은 딱지로 얹고(오른쪽 아래는 이름 상자 자리.
//   왼쪽 아래에 두었더니 휴대전화에서 글자를 키우면 길어진 이름 상자가 딱지를 덮었다),
//   제3유형은 큰 사진 틀 바로 아래 오른쪽 한 줄. 작은 사진 줄(고르는 단추)에는 적지 않는다(고른 사진이 큰 사진에 출처와 함께 보인다).
//   아래 공공누리 글자 상자는 궁능 모양 그대로 둔다.
// "원본 보기"는 궁능 "이 저작물만 다운로드" 자리(14px 500, 높이 50, 좌우 20, 검정 바탕). 궁능에 짝이 없는 글이라 <Ph>.
//   관광공사 사진 서버가 다른 누리집에서 파일을 받아 가는 허락(CORS)을 주지 않아 내려받기 대신 새 창으로 연다.
//   같은 사진의 큰 판(large)이 있으면 그 주소를 연다.
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Ph } from "@/components/layout/Ph";
import { KoglBox, Photo } from "@/components/royal";
import type { ViewerPhoto } from "./placeData";
import s from "./PhotoViewer.module.css";

/** large: 같은 사진의 큰 판 주소(있으면 "원본 보기"가 이것을 연다). tall: 세로 사진(세로 > 가로) */
export type ViewerItem = ViewerPhoto & { large?: string; tall?: boolean };

export default function PhotoViewer({ photos, placeName }: { photos: ViewerItem[]; placeName: string }) {
  const [i, setI] = useState(0);
  const n = photos.length;
  const thumbsRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  // 서브메인 작은 사진(가15)에서 왔으면 주소 끝 "#photo-번호"의 사진부터 보이고, 넘기기 칸으로 내려온다(번호는 1부터, photosOf 차례)
  useEffect(() => {
    const m = window.location.hash.match(/^#photo-(\d+)$/);
    const j = m ? Number(m[1]) - 1 : -1;
    if (j < 0 || j >= n) return;
    moved.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 주소의 # 부분은 화면을 그린 뒤에만 읽을 수 있다
    setI(j);
    rootRef.current?.scrollIntoView({ block: "start" });
  }, [n]);

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
  // 제1유형만 사진 위에 이름 상자를 얹는다(제3유형은 사진 아래 줄)
  const onPhoto = cur.type === "Type1";
  const nameText = cur.made ? <Ph>{cur.name}</Ph> : cur.name;
  const pick = (j: number) => {
    moved.current = true;
    setI(j);
  };
  const go = (d: number) => pick((i + d + n) % n);

  return (
    <div className={s.root} ref={rootRef} role="region" aria-roledescription="넘기기" aria-label={`${placeName} 사진`}>
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

      <div className={s.stage}>
        {/* 세로 사진은 1030×489 칸에 맞춰 자르면 가운데 띠만 남아(09-26 보리사마애석불) 제1유형이라도 자르지 않고 전체를 보인다 */}
        <Photo
          key={cur.url}
          photo={{ url: cur.url, type: cur.type }}
          alt={cur.name}
          ratio="1030/489"
          bg="dark"
          loading="eager"
          fit={cur.tall ? "contain" : "cover"}
          credit={cur.credit}
          creditAt="tl"
        />
        {onPhoto && <p className={s.cap}>{nameText}</p>}
      </div>

      <div className={s.bar}>
        {!onPhoto && <p className={s.name}>{nameText}</p>}
        <a href={cur.large ?? cur.url} target="_blank" rel="noopener noreferrer" className={s.orig}>
          <Ph>원본 보기</Ph>
          <Icon name="external" size={16} strokeWidth={1.8} />
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
