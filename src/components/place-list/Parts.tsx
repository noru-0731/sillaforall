// 목록·무장애 쪽의 작은 부품: 쪽 안 바로가기 줄, 곳 수, 사진 출처, 무장애 세 항목 이름.
import { Ph } from "@/components/layout/PageParts";
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

/** 묶음 제목 옆 곳 수 */
export function Count({ n }: { n: number }) {
  return (
    <span className={s.count}>
      {n}
      <Ph>곳</Ph>
    </span>
  );
}

/** 사진을 보여 준 쪽 끝에 한 번 */
export function PhotoCredit() {
  return (
    <p className={s.credit}>
      <Ph>사진: 한국관광공사</Ph>
    </p>
  );
}

/** 무장애 세 항목의 이름. 문구는 사용자 확인 전이라 한곳에 모아 둔다. */
export const THREE_TEXT: Record<ThreeKey, string> = { parking: "주차", walk: "걷는 길", toilet: "화장실" };

export function ThreeLabel({ k }: { k: ThreeKey }) {
  return <Ph>{THREE_TEXT[k]}</Ph>;
}

/** 명부 글. 비어 있으면 임시 문구 */
export function RegistryText({ text }: { text: string | null }) {
  return text ? <span className={s.regText}>{text}</span> : <Ph>적힌 내용 없음</Ph>;
}
