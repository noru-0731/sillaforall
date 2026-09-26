// 쪽 끝 이어 읽기(deck 갈래). gov.uk 여러 부분 안내서의 본문 끝 'Previous : …' / 'Next : …' 꼴.
// 관광지 한 곳의 쪽 차례: 서브메인 → 소개 → 사진 → 무장애 정보 → 오시는 길(인쇄 쪽은 넣지 않는다). 쪽 이름은 왼쪽 메뉴 이름 그대로(placePages).
// 서브메인은 '다음'만. 오시는 길의 '다음'은 그 곳에서 가까운 세 곳(서브메인 '주변 관광지'와 같은 거리 계산·같은 글꼴, 서브메인으로).
// 두 칸은 PC 에서 나란히(이전 왼쪽, 다음 오른쪽), 본문이 좁으면(767 이하) 위아래로 쌓는다. 새 창으로 열지 않는다.
// 누르는 칸은 무장애 정보 보는 법의 장 바로가기 칸(궁능 관람규칙 장 격자: 높이 68, 1px 검정 선, 둥글기 8, 작은 글 14 + 이름 16) 치수.
import Link from "next/link";
import type { Place } from "@/data";
import { placePages } from "@/site/ia";
import { Icon } from "@/components/icons";
import { fmtDist, nearby } from "./placeData";
import { placeLand, titleLand } from "./landing";
import sm from "./Submain.module.css";
import s from "./PageSteps.module.css";

/** at: 0 서브메인, 1 소개, 2 사진, 3 무장애 정보, 4 오시는 길 */
export default function PageSteps({ place, at, className }: { place: Place; at: 0 | 1 | 2 | 3 | 4; className?: string }) {
  const pages = placePages(place);
  const prev = at > 0 ? pages[at - 1] : null;
  const next = at < pages.length - 1 ? pages[at + 1] : null;
  const near = next ? [] : nearby(place, 3);
  // 새 쪽은 제목 자리로 연다(landing.ts): 서브메인은 '○○ 관람 도우미' 제목, 나머지는 #contents
  const land = (href: string) => (href === pages[0].href ? placeLand(place.id) : titleLand(href));

  return (
    <nav className={[s.steps, at === 0 ? s.onSubmain : "", className ?? ""].filter(Boolean).join(" ")} aria-label={`${place.name} 이어 읽기`}>
      <ul className={`${s.list}${near.length ? " " + s.withNear : ""}`}>
        {prev && (
          <li className={s.prev}>
            <Link href={land(prev.href)} className={s.link}>
              <Icon name="chevron-left" size={22} strokeWidth={2} className={s.arrow} />
              <span className={s.txt}>
                <span className={s.dir}>이전</span>
                <span className="sr-only">: </span>
                <span className={s.name}>{prev.label}</span>
              </span>
            </Link>
          </li>
        )}
        {next && (
          <li className={s.next}>
            <Link href={land(next.href)} className={s.link}>
              <span className={s.txt}>
                <span className={s.dir}>다음</span>
                <span className="sr-only">: </span>
                <span className={s.name}>{next.label}</span>
              </span>
              <Icon name="chevron-right" size={22} strokeWidth={2} className={s.arrow} />
            </Link>
          </li>
        )}
        {near.length > 0 && (
          <li className={`${s.next} ${s.nearBox}`}>
            <p className={s.dir}>다음</p>
            <div className={sm.leftHead}>
              <h2 id={`${place.id}-steps-near`}>주변 관광지</h2>
            </div>
            <ul className={sm.nearList} aria-labelledby={`${place.id}-steps-near`}>
              {near.map(({ place: q, distM }) => (
                <li key={q.id}>
                  <Link href={placeLand(q.id)}>
                    <span className={sm.nearName}>{q.name}</span>
                    <span className={sm.nearDong}>
                      {q.dong}
                      {distM !== null && <> · 직선거리 {fmtDist(distM)}</>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
}
