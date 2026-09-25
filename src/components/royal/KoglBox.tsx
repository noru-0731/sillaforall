// 공공누리 글자 상자. 궁능 누리집의 "OPEN 공공누리" 그림 상자 자리에 공식 표시 그림 대신 글자로 만든 상자를 둔다.
// 문장은 궁능 문장을 바꿔 쓴 것(명세 5절)이라 <Ph> 없이 쓴다.
// by(촬영자)를 주면 관광사진 정보(한국관광콘텐츠랩) 사진으로 보고, 한국관광콘텐츠랩이 정한 출처 꼴("출처 : ⓒ한국관광콘텐츠랩-촬영자")을 한 줄 더 적는다.
// 이 줄은 궁능에 짝이 없어 <Ph>로 감싼다.
import type { KoglType } from "@/data/photos";
import { galleryCredit, koglCondition } from "@/data/photos";
import { Ph } from "@/components/layout/Ph";

export default function KoglBox({ type, by, className }: { type: KoglType; by?: string; className?: string }) {
  const n = type === "Type1" ? "1" : "3";
  return (
    <div className={`rc-kogl${className ? " " + className : ""}`}>
      <p className="rc-kogl__mark" aria-hidden="true">
        <span>공공누리</span>
        <b>제{n}유형</b>
      </p>
      <p className="rc-kogl__txt">
        한국관광공사가 보유한 이 사진은 &quot;공공누리&quot; 제{n}유형({koglCondition(type)}) 조건에 따라 이용할 수 있습니다.
        {by && (
          <>
            <br />
            <Ph>출처 : {galleryCredit(by)}</Ph>
          </>
        )}
      </p>
    </div>
  );
}
