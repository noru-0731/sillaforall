// 관광지 카드 줄(궁능유적본부 누리집 문화행사 카드 모양, 나무 파일 events_1440):
// 사진(165×215) 왼쪽 · 권역 배지 · 이름 · 주소 · 이용시간 · [자세히보기] [지도에서 보기].
// 페르소나 장점 취합: 이용시간 아래에 쉬는 날·분류(가6, 경주문화관광 요약정보 줄), 무장애 묶음 이름표(가8, 열린관광 목록 카드 이름표).
// 이름표는 그 묶음에 글이 적힌 칸이 있다는 표시이고 누르는 거르기가 아니다. 무장애 정보가 없는 곳은 줄을 두지 않는다.
// 글이 없는 칸은 "-"(components/layout/Dash.tsx). "-" 칸이 있는 카드가 보이면 카드 줄 바로 아래에 뜻풀이 한 줄(DashNote, 쓰는 쪽에서 cardHasDash로 판단).
// 훅이 없어 서버·클라이언트 어디서나 쓴다. @/data를 부르지 않는다(클라이언트로 places.json을 보내지 않게).
import Link from "next/link";
import Photo from "@/components/royal/Photo";
import { Icon } from "@/components/icons";
import { DASH } from "@/components/layout/Dash";
import type { CardPlace } from "./types";
import s from "./Cards.module.css";

/** 카드에 "-" 칸(주소·이용시간·쉬는 날·분류 가운데 글이 없는 칸)이 있는지 */
export const cardHasDash = (c: CardPlace) => c.address == null || c.hours == null || c.closed == null || c.category == null;

export function PlaceCard({ c, headingLevel = 3 }: { c: CardPlace; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <li className={s.card}>
      <div className={s.img}>
        <Photo photo={c.photo} alt="" ratio="165/215" bg="light" />
      </div>
      <div className={s.txt}>
        <span className={s.ctg} style={{ "--c": `var(--rc-area-${c.area})` } as React.CSSProperties}>
          {c.areaLabel}
        </span>
        <H className={s.tit}>{c.name}</H>
        <dl className={s.info}>
          <div>
            <dt>
              <Icon name="pin" size={13} strokeWidth={1.8} />
              주소 :
            </dt>
            <dd>{c.address ?? DASH}</dd>
          </div>
          <div>
            <dt>
              <Icon name="clock" size={13} strokeWidth={1.8} />
              이용시간 :
            </dt>
            <dd className={s.hours}>{c.hours ?? DASH}</dd>
          </div>
          <div>
            <dt>
              <Icon name="calendar" size={13} strokeWidth={1.8} />
              쉬는 날 :
            </dt>
            <dd className={s.hours}>{c.closed ?? DASH}</dd>
          </div>
          <div>
            <dt>
              <Icon name="list" size={13} strokeWidth={1.8} />
              분류 :
            </dt>
            <dd>{c.category ?? DASH}</dd>
          </div>
          {c.bfGroups.length > 0 && (
            <div>
              <dt>
                <Icon name="wheelchair" size={13} strokeWidth={1.8} />
                무장애 정보 :
              </dt>
              <dd>
                <ul className={s.tags}>
                  {c.bfGroups.map((g) => (
                    <li key={g} className={s.tag}>
                      {g}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
        <div className={s.btns}>
          <Link href={`/places/${c.id}`} className={s.btn}>
            <span className="sr-only">{c.name} </span>자세히보기
          </Link>
          <Link href={`/map/${c.area}?place=${c.id}`} className={s.btn}>
            <span className="sr-only">{c.name} </span>지도에서 보기
          </Link>
        </div>
      </div>
    </li>
  );
}

/** 카드 여러 장. 위 2px 남색 선, 아래 1px 회색 선(궁능 event_con_list) */
export function PlaceCardList({ items, headingLevel = 3, className }: { items: CardPlace[]; headingLevel?: 2 | 3; className?: string }) {
  return (
    <ul className={`${s.list}${className ? " " + className : ""}`}>
      {items.map((c) => (
        <PlaceCard key={c.id} c={c} headingLevel={headingLevel} />
      ))}
    </ul>
  );
}

/** 사진 출처 줄(카드 줄 아래) */
export function CreditLines({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <div className={s.credit}>
      {lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}
