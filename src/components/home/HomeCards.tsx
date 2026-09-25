"use client";
// 첫 쪽 칸 2(궁능 main_s1 "궁·능 행사"): 제목·설명, 오른쪽 넘기기 조작(‹ 3 ── 18 › ‖)과 큰 +,
// 세로로 긴 사진 카드 가로 넘기기(가운데 카드를 크게·파란 테두리로). 끝에서 처음으로 이어진다.
// - 카드 위 탭 두 개: {권역} / 무장애 정보 있음·없음(명부 등록 여부). 카드 글: 이름, "주소 : …".
// - 사진: 제1유형은 잘라 채우고, 제3유형은 <Photo>가 자르지 않고 담는다(남는 곳 단색). 없으면 빈 판.
// - 자동 넘김은 멈출 수 있고, 마우스를 올리거나 초점이 안에 있으면 잠시 멈추고, 움직임 줄이기 설정이면 켜지지 않는다.
// - 키보드: 카드에 초점이 오면 그 카드가 가운데로 온다(가려진 카드로 Tab이 들어가도 보이게).
import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import type { AreaKey } from "@/data/types";
import type { KoglType } from "@/data/photos";
import { Icon } from "@/components/icons";
import Photo from "@/components/royal/Photo";
import IntroMark from "@/components/place/IntroMark";
import { MoreLink, useReducedMotion } from "./bits";
import s from "./home.module.css";

export type CardItem = {
  id: string;
  name: string;
  area: AreaKey;
  areaLabel: string;
  registered: boolean;
  address: string;
  photo: { url: string; type: KoglType } | null;
};

const AUTO_MS = 5000;
/** 가운데에서 이만큼(칸 수) 떨어진 카드까지 그린다. 더 먼 카드는 숨긴다(끝↔처음 이어 붙일 때 화면을 가로지르지 않게). */
const REACH = 3;

export default function HomeCards({
  title,
  desc,
  moreHref,
  items,
  credits,
}: {
  title: string;
  desc: React.ReactNode;
  moreHref: string;
  items: CardItem[];
  /** 카드 사진 출처 줄(서버에서 creditLines로 만듦). 없으면 유형만 보고 관광정보 한 줄 */
  credits?: string[];
}) {
  const n = items.length;
  // 처음 가운데 카드는 셋째(궁능 첫 화면처럼 "3"). 왼쪽 두 칸도 사진 있는 카드가 오게.
  const [idx, setIdx] = useState(Math.min(2, Math.max(0, items.length - 1)));
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const reduce = useReducedMotion();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const running = playing && !hold && !reduce && n > 1;
  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n]);

  /** 가운데(idx)에서 i번 카드까지 떨어진 칸 수(-n/2 ~ n/2) */
  const offsetOf = (i: number) => {
    let d = (((i - idx) % n) + n) % n;
    if (d > n / 2) d -= n;
    return d;
  };

  const hasType3 = items.some((it) => it.photo?.type === "Type3");

  return (
    <section className={s.cardsSec} aria-labelledby="home-cards-title">
      {/* 바탕의 흐린 선 그림(궁능 main_s1의 궁궐 선 그림 자리). 궁능 그림 대신 소개 쪽과 같은 직접 그린 기와 건물 선 그림 */}
      <IntroMark className={s.cardsArt} />
      <div className={s.inner}>
        <div className={s.head}>
          <h2 id="home-cards-title" className={s.secTitle}>
            {title}
          </h2>
          <p className={s.secText}>{desc}</p>
          <MoreLink href={moreHref} label={`${title} 더 보기`} className={s.headMore} />

          {n > 1 && (
            <div className={s.cardsCtrl}>
              <button type="button" className={s.ctrlBtn} aria-controls={listId} onClick={() => go(idx - 1)}>
                {/* 궁능 화살표 8×14: 24칸 그림의 꺾쇠 부분만 잘라 그린다 */}
                <Icon name="chevron-left" viewBox="8 5 8 14" width={8} height={14} strokeWidth={1.6} />
                <span className="sr-only">이전 관광지</span>
              </button>
              <span className={s.ctrlCount} aria-live={running ? "off" : "polite"} aria-atomic="true">
                <span className={s.ctrlNum}>{idx + 1}</span>
                <span className={s.ctrlBar} aria-hidden="true">
                  <span style={{ width: `${100 / n}%`, left: `${(100 * idx) / n}%` }} />
                </span>
                <span className="sr-only">/</span>
                <span className={s.ctrlNum}>{n}</span>
              </span>
              <button type="button" className={s.ctrlBtn} aria-controls={listId} onClick={() => go(idx + 1)}>
                <Icon name="chevron-right" viewBox="8 5 8 14" width={8} height={14} strokeWidth={1.6} />
                <span className="sr-only">다음 관광지</span>
              </button>
              {!reduce && (
                <button type="button" className={`${s.ctrlBtn} ${s.ctrlStop}`} onClick={() => setPlaying(!playing)}>
                  <Icon name={playing ? "pause" : "play"} size={20} strokeWidth={2.6} />
                  <span className="sr-only">{playing ? "자동 넘김 멈춤" : "자동 넘김 시작"}</span>
                </button>
              )}
              {/* 보이지 않는 시계: 애니메이션이 끝나면 다음 카드로. 멈추면 시계도 멈춘다. */}
              {!reduce && (
                <span
                  key={idx}
                  className={s.timer}
                  style={{ animationDuration: `${AUTO_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                  onAnimationEnd={() => go(idx + 1)}
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>

        <div
          className={s.cardsView}
          ref={rootRef}
          role="region"
          aria-roledescription="넘기기"
          aria-label={`${title} 카드`}
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={(e) => {
            if (!rootRef.current?.contains(e.relatedTarget as Node)) setHold(false);
          }}
        >
          <ul className={s.cardTrack} id={listId}>
            {items.map((it, i) => {
              const d = offsetOf(i);
              const far = Math.abs(d) > REACH;
              const cls = `${s.cardItem}${d === 0 ? " " + s.isCenter : ""}${far ? " " + s.isFar : ""}`;
              const style = {
                "--sgn": Math.sign(d),
                "--abs": Math.abs(d),
                "--c": `var(--rc-area-${it.area})`,
              } as React.CSSProperties;
              return (
                <li key={it.id} className={cls} style={style} aria-hidden={far || undefined} inert={far}>
                  <div className={s.cardTabs}>
                    <span className={`${s.cardTab} ${s.cardTabArea}`}>{it.areaLabel}</span>
                    <span className={`${s.cardTab} ${it.registered ? s.cardTabOn : s.cardTabOff}`}>
                      {it.registered ? "무장애 정보 있음" : "무장애 정보 없음"}
                    </span>
                  </div>
                  <Link href={`/places/${it.id}`} className={s.card} onFocus={() => d !== 0 && setIdx(i)}>
                    <span className={s.cardPhoto}>
                      <Photo photo={it.photo} alt="" height="100%" bg="light" />
                    </span>
                    <span className={s.cardTxt}>
                      <span className={s.cardName}>{it.name}</span>
                      <span className={s.cardAddr}>
                        <span className={s.cardAddrKey}>주소 :</span> {it.address}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <p className={s.cardsCredit}>
          {credits?.length
            ? credits.map((c, i) => (
                <span key={c}>
                  {i > 0 && <br />}
                  {c}
                </span>
              ))
            : `사진: 한국관광공사 관광정보, 공공누리 제1유형${hasType3 ? "·제3유형" : ""}`}
        </p>
      </div>
    </section>
  );
}
