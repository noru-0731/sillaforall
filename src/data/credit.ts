// 사진 출처 글(짧은 꼴)과 공공누리 이름. photos.json을 읽지 않는 작은 모듈이라 클라이언트 부품(사진 넘기기, 지도 쪽)도 부른다.
// 사진 곁 출처는 짧게 적는다(사용자 09-26: 출처 표기 줄이기). 레퍼런스 05_사이트/레퍼런스/출처_표기/01_사진_출처_표기_레퍼런스.md:
//  - 관광정보 사진: "ⓒ한국관광공사"
//  - 관광사진 정보(한국관광콘텐츠랩) 사진: 한국관광콘텐츠랩이 정한 꼴 "ⓒ한국관광콘텐츠랩-촬영자"(촬영자가 없으면 "ⓒ한국관광콘텐츠랩")
// "사진:" 머리말과 공공누리 유형은 사진 곁에 적지 않는다. 유형은 자료 출처 쪽(/about/sources)과 사진 쪽 공공누리 상자(KoglBox)에 있다.

export type KoglType = "Type1" | "Type3";

/** "공공누리 제1유형" / "공공누리 제3유형" */
export const koglLabel = (type: KoglType) => (type === "Type1" ? "공공누리 제1유형" : "공공누리 제3유형");
/** 유형 조건 풀이: "출처표시" / "출처표시, 변경금지" */
export const koglCondition = (type: KoglType) => (type === "Type1" ? "출처표시" : "출처표시, 변경금지");

/** 관광정보(TourAPI) 사진의 출처 */
export const TOURAPI_CREDIT = "ⓒ한국관광공사";
/** 관광사진 정보 사진의 출처(한국관광콘텐츠랩이 정한 꼴 "ⓒ한국관광콘텐츠랩-촬영자"). 촬영자가 없으면 "ⓒ한국관광콘텐츠랩" */
export const galleryCredit = (by?: string) => (by ? `ⓒ한국관광콘텐츠랩-${by}` : "ⓒ한국관광콘텐츠랩");

/** 사진 한 장의 출처(짧은 꼴): 관광사진 정보 사진은 "ⓒ한국관광콘텐츠랩-촬영자", 나머지(관광정보)는 "ⓒ한국관광공사" */
export function photoCreditOf(p: { from?: "tourapi" | "gallery"; by?: string }): string {
  return p.from === "gallery" ? galleryCredit(p.by) : TOURAPI_CREDIT;
}
