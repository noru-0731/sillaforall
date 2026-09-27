"use client";

// 관광지 사진 넘기기(궁능 "경복궁 이야기" gbg_story의 사진 칸 모양).
// 위: "1/5" + 오른쪽 ‹ › 검정 네모 단추 → 큰 사진(1030×489) → 단추 줄("원본 보기") → 작은 사진 줄 → 공공누리 글자 상자.
// 사진 이름: 궁능은 큰 사진 오른쪽 아래 어두운 상자(18px, 줄 50, 좌우 15, 검정 70%)에 둔다.
//   제1유형은 그대로 사진 위 오른쪽 아래에 얹는다. 제3유형(변경 금지)은 사진 위에 글을 얹을 수 없어 사진 아래 단추 줄 왼쪽에 둔다.
// 사진 출처(짧은 꼴 "ⓒ한국관광공사" 등): 제1유형은 큰 사진 왼쪽 위에 작은 딱지로 얹고(오른쪽 아래는 이름 상자 자리.
//   왼쪽 아래에 두었더니 휴대전화에서 글자를 키우면 길어진 이름 상자가 딱지를 덮었다),
//   제3유형은 큰 사진 틀 바로 아래 오른쪽 한 줄. 작은 사진 줄(고르는 단추)에는 적지 않는다(고른 사진이 큰 사진에 출처와 함께 보인다).
//   아래 공공누리 글자 상자는 궁능 모양 그대로 둔다. 국가유산청 사진은 기관 이름·출처 줄이 국가유산청 것으로, 위키미디어 사진(CC)은
//   같은 자리에 저작자·이용허락·파일 쪽 링크 상자(CcBox)를 둔다(09-27 사진 채우기).
// "원본 보기"는 궁능 "이 저작물만 다운로드" 자리(14px 500, 높이 50, 좌우 20, 검정 바탕). 궁능에 짝이 없는 글이라 <Ph>.
//   관광공사 사진 서버가 다른 누리집에서 파일을 받아 가는 허락(CORS)을 주지 않아 내려받기 대신 새 창으로 연다.
//   같은 사진의 큰 판(large)이 있으면 그 주소를 연다.
// 안 뜬 사진(09-27, 관광공사 서버가 막히거나 느려 오류. royal/FailHide.tsx): 작은 사진이든 큰 사진이든 오류가 나면 그 사진을
//   쪽 수("1/5")·‹ › 차례·작은 사진 줄에서 뺀다. 숨긴 사진이 분모에 남아 "1/5"인데 넘기면 빈 칸이 나오던 것을 막는다.
//   모두 안 뜨면 사진이 없는 곳과 같은 빈 판만 남긴다.
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Ph } from "@/components/layout/Ph";
import { NewWinIcon } from "@/components/layout/NewWin";
import { Photo, PhotoLicenseBox } from "@/components/royal";
import type { ViewerPhoto } from "./placeData";
import s from "./PhotoViewer.module.css";
import FailHide from "@/components/royal/FailHide";

/** large: 같은 사진의 큰 판 주소(있으면 "원본 보기"가 이것을 연다). tall: 세로 사진(세로 > 가로) */
export type ViewerItem = ViewerPhoto & { large?: string; tall?: boolean };

/** 가리킨 사진 i 가 안 뜬 사진이면 넘기던 쪽(dir: › 1, ‹ -1)으로 가장 가까운 뜬 사진(끝에 닿으면 반대 끝). live 는 뜬 사진의 원래 차례 번호(오름차순) */
function nearestLive(live: number[], i: number, dir: number) {
  if (live.includes(i)) return i;
  if (dir > 0) return live.find((j) => j > i) ?? live[0];
  for (let k = live.length - 1; k >= 0; k--) if (live[k] < i) return live[k];
  return live[live.length - 1];
}

export default function PhotoViewer({ photos, placeName }: { photos: ViewerItem[]; placeName: string }) {
  // i: photos 원래 차례(주소 "#photo-번호"와 같은 차례). 안 뜬 사진을 가리킬 수 있어 보일 사진은 아래 at 으로 다시 고른다
  const [i, setI] = useState(0);
  // 마지막으로 넘긴 쪽. ‹ 로 간 사진이 안 뜨면 뒤쪽 뜬 사진으로 가야 한다(앞쪽으로 가면 방금 보던 사진으로 되돌아간다)
  const [dir, setDir] = useState(1);
  // 안 뜬 사진의 주소(09-27). 작은 사진 줄 FailHide 와 큰 사진 Photo 의 onFail 로 모은다
  const [bad, setBad] = useState<ReadonlySet<string>>(() => new Set());
  const total = photos.length;
  // 쪽 수와 ‹ › 차례는 뜬 사진만 센다(안 뜬 사진은 분모에서 빠진다). pos: 보이는 사진이 뜬 사진 가운데 몇째인지(0부터)
  const live = photos.flatMap((ph, j) => (bad.has(ph.url) ? [] : [j]));
  const n = live.length;
  const at = n ? nearestLive(live, i, dir) : -1;
  const pos = live.indexOf(at);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  // 서브메인 작은 사진(가15)에서 왔으면 주소 끝 "#photo-번호"의 사진부터 보이고, 넘기기 칸으로 내려온다(번호는 1부터, photosOf 차례).
  // 그 사진이 안 떴으면 at 이 가장 가까운 다음 뜬 사진을 고른다. total(원래 장수)로 거르는 것은 뜬 장수가 줄 때 다시 돌지 않게.
  useEffect(() => {
    const m = window.location.hash.match(/^#photo-(\d+)$/);
    const j = m ? Number(m[1]) - 1 : -1;
    if (j < 0 || j >= total) return;
    moved.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 주소의 # 부분은 화면을 그린 뒤에만 읽을 수 있다
    setI(j);
    rootRef.current?.scrollIntoView({ block: "start" });
  }, [total]);

  // 작은 사진 줄은 한 줄 가로 넘김(궁능 swiper_thumb01). 고른 작은 사진이 줄 안에 보이도록 옆으로만 민다.
  // 줄에는 뜬 사진만 있으므로 pos째 칸이 보이는 사진이다(안 뜬 사진으로 옮겨 가 at 만 바뀌어도 다시 본다)
  useEffect(() => {
    if (!moved.current) return;
    const ul = thumbsRef.current;
    const li = ul?.children[pos] as HTMLElement | undefined;
    if (!ul || !li) return;
    const left = li.getBoundingClientRect().left - ul.getBoundingClientRect().left + ul.scrollLeft;
    if (left < ul.scrollLeft || left + li.offsetWidth > ul.scrollLeft + ul.clientWidth) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      ul.scrollTo({ left: left - (ul.clientWidth - li.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
  }, [at, pos]);

  // 사진이 없거나 모두 안 떴으면 사진이 없는 곳과 같은 빈 판만(쪽 수·단추·작은 사진 줄·공공누리 상자 없음)
  if (!n) {
    return (
      <div className={`${s.root} ${s.empty}`}>
        <Photo photo={null} alt="" ratio="1030/489" />
      </div>
    );
  }

  const cur = photos[at];
  // 제1유형만 사진 위에 이름 상자를 얹는다(제3유형은 사진 아래 줄)
  const onPhoto = cur.type === "Type1";
  // 지은 이름 "{관광지} {n}"은 열린관광 사진 이름 꼴("국립경주박물관 1")이라 점선 없음(09-27 점선 1차 정리, 레퍼런스/문구/01_문구_대조.md I01·I02)
  const nameText = cur.name;
  const pick = (j: number, d = 1) => {
    moved.current = true;
    setI(j);
    setDir(d);
  };
  // ‹ › 는 뜬 사진 차례로만 돈다
  const go = (d: number) => pick(live[(pos + d + n) % n], d);
  const fail = (url: string) => setBad((b) => (b.has(url) ? b : new Set(b).add(url)));

  return (
    <div className={s.root} ref={rootRef} role="region" aria-roledescription="넘기기" aria-label={`${placeName} 사진`}>
      <div className={s.head}>
        <p className={s.count} aria-live="polite" aria-atomic="true">
          <b>{pos + 1}</b>/{n}
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
          // 큰 사진만 안 떠도(작은 사진은 떴어도) 차례에서 빼고 다음 뜬 사진으로 옮긴다. 늦게 부르는 작은 사진은 아직 오류를 모를 수 있다
          onFail={() => fail(cur.url)}
        />
        {onPhoto && <p className={s.cap}>{nameText}</p>}
      </div>

      <div className={s.bar}>
        {!onPhoto && <p className={s.name}>{nameText}</p>}
        <a href={cur.large ?? cur.url} target="_blank" rel="noopener noreferrer" className={s.orig}>
          <Ph>원본 보기</Ph>
          <NewWinIcon />
        </a>
      </div>

      {n > 1 && (
        <ul className={s.thumbs} aria-label="작은 사진" ref={thumbsRef}>
          {/* 뜬 사진만 그린다(큰 사진만 안 뜬 것도 뺀다). 작은 사진이 안 뜨면 FailHide 가 칸을 숨기고 onFail 로 차례에서도 뺀다 */}
          {live.map((j, k) => {
            const ph = photos[j];
            return (
              <FailHide as="li" key={ph.url} onFail={() => fail(ph.url)}>
                <button
                  type="button"
                  className={`${s.thumb}${j === at ? " " + s.thumbOn : ""}`}
                  aria-current={j === at ? "true" : undefined}
                  onClick={() => pick(j)}
                >
                  <Photo photo={{ url: ph.small, type: ph.type }} alt="" ratio="196/93" bg="light" />
                  <span className="sr-only">
                    {k + 1}번째 사진 보기: {ph.name}
                  </span>
                </button>
              </FailHide>
            );
          })}
        </ul>
      )}

      {/* 공공누리 상자(관광정보·관광사진 정보·국가유산청 사진). 위키미디어 사진(CC)은 그 자리에 저작자·이용허락·파일 쪽 링크 상자 */}
      <PhotoLicenseBox photo={cur} className={s.kogl} />
    </div>
  );
}
