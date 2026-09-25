// 공공누리 글자 상자. 궁능 누리집의 "OPEN 공공누리" 그림 상자 자리에 공식 표시 그림 대신 글자로 만든 상자를 둔다.
// 문장은 궁능 문장을 바꿔 쓴 것(명세 5절)이라 <Ph> 없이 쓴다.
import type { KoglType } from "@/data/photos";
import { koglCondition } from "@/data/photos";

export default function KoglBox({ type, className }: { type: KoglType; className?: string }) {
  const n = type === "Type1" ? "1" : "3";
  return (
    <div className={`rc-kogl${className ? " " + className : ""}`}>
      <p className="rc-kogl__mark" aria-hidden="true">
        <span>공공누리</span>
        <b>제{n}유형</b>
      </p>
      <p className="rc-kogl__txt">
        한국관광공사가 보유한 이 사진은 &quot;공공누리&quot; 제{n}유형({koglCondition(type)}) 조건에 따라 이용할 수 있습니다.
      </p>
    </div>
  );
}
