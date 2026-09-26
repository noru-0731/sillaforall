// 목록·무장애 쪽의 작은 부품: 쪽 안 바로가기 줄, 곳 수, 사진 출처, 무장애 세 항목 이름.
import type { ThreeKey } from "./helpers";
import s from "./PlaceList.module.css";

/** 쪽 안 바로가기(KRDS 태그 링크, tag_link.html). 같은 쪽 안의 묶음으로 건너뛴다. */
export function JumpLinks({
  ariaLabel,
  items,
  letters = false,
}: {
  ariaLabel: string;
  items: { id: string; label: React.ReactNode }[];
  /** 글자 하나짜리(초성) 바로가기: 누르기 쉽게 크게 */
  letters?: boolean;
}) {
  return (
    <nav aria-label={ariaLabel} className={s.jump}>
      <ul className="krds-tag-wrap large">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={`krds-btn-tag link${letters ? " " + s.letter : ""}`}>
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** 묶음 제목 옆 곳 수('곳'은 "전체: N곳"과 같은 단위라 점선 없음, 09-27 점선 1차 정리) */
export function Count({ n }: { n: number }) {
  return (
    <span className={s.count}>
      {n}곳
    </span>
  );
}

/** 무장애 세 항목의 이름. 한국관광공사 무장애 여행 정보의 칸 이름(주차·접근로·화장실)이라 점선 없음(09-27 점선 1차 정리). */
export const THREE_TEXT: Record<ThreeKey, string> = { parking: "주차", walk: "접근로", toilet: "화장실" };

export function ThreeLabel({ k }: { k: ThreeKey }) {
  return <>{THREE_TEXT[k]}</>;
}

/** 한국관광공사 무장애 여행 정보 글. 비어 있으면 빈칸 */
export function RegistryText({ text }: { text: string | null }) {
  return text ? <span className={s.regText}>{text}</span> : null;
}
