// 채운 빈 칸의 값 + 자료 꼬리(data/fill.ts). 관광공사 무장애 여행 정보 글과 구별되게 끝에 짧은 자료 이름을 괄호로 붙인다.
// 꼬리: 경주시 무장애 여행정보 → (경주시), 한국관광공사 관광정보 → (관광정보), 가까운 편의시설 → (편의시설 자료).
// '편의시설 자료'는 무장애 정보 쪽 '편의시설' 절(점선)에서 딴 새 말이라 점선이다.
import { Ph } from "@/components/layout/Ph";
import type { Fill } from "@/data/fill";

export function FillTail({ src }: { src: Fill["src"] }) {
  if (src === "gj") return <>(경주시)</>;
  if (src === "tour") return <>(관광정보)</>;
  return (
    <>
      (<Ph>편의시설 자료</Ph>)
    </>
  );
}

/** 값과 꼬리. fill 이 없으면 아무것도 그리지 않는다(빈칸) */
export function FillText({ fill }: { fill: Fill | null }) {
  if (!fill) return null;
  return (
    <>
      {fill.text} <FillTail src={fill.src} />
    </>
  );
}
