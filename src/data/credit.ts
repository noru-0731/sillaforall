// 사진 출처 글(짧은 꼴)과 공공누리 이름. photos.json을 읽지 않는 작은 모듈이라 클라이언트 부품(사진 넘기기, 지도 쪽)도 부른다.
// 사진 곁 출처는 짧게 적는다(사용자 09-26: 출처 표기 줄이기). 레퍼런스 05_사이트/레퍼런스/출처_표기/01_사진_출처_표기_레퍼런스.md:
//  - 관광정보 사진: "ⓒ한국관광공사"
//  - 관광사진 정보(한국관광콘텐츠랩) 사진: 한국관광콘텐츠랩이 정한 꼴 "ⓒ한국관광콘텐츠랩-촬영자"(촬영자가 없으면 "ⓒ한국관광콘텐츠랩")
//  - 국가유산청 국가유산 이미지(공공누리 제1유형, 09-27 사진 채우기): "ⓒ국가유산청"
//  - 위키미디어 공용 사진(CC 이용허락, 09-27 사진 채우기): "ⓒ저작자, 이용허락 이름"(예: "ⓒEggmoon, CC BY-SA 3.0")
//  - 경주시정뉴스 사진(경주시청 최신기사, 공공누리 제1유형, 09-27 사진 채우기): "ⓒ경주시청"(기사 쪽 공공누리 상자의 기관 이름 '경주시청이 창작한 …')
//  국가유산청·위키미디어·경주시정뉴스 사진은 도구/22_사진_채우기.py 가 짧은 꼴을 photos_extra.json 의 credit 칸에 적어 두고, 여기서는 그 값을 그대로 쓴다.
// "사진:" 머리말과 공공누리 유형은 사진 곁에 적지 않는다. 유형은 자료 출처 쪽(/about/sources)과 사진 쪽 공공누리 상자(KoglBox)에 있다.

export type KoglType = "Type1" | "Type3";

/** 사진이 어디서 왔는지: tourapi 관광정보, gallery 관광사진 정보(한국관광콘텐츠랩), heritage 국가유산청, wikimedia 위키미디어 공용, gyeongju 경주시정뉴스(경주시청) */
export type PhotoSource = "tourapi" | "gallery" | "heritage" | "wikimedia" | "gyeongju";

/**
 * 국가유산청·위키미디어·경주시정뉴스 사진의 이용허락 칸(photos_extra.json 그대로). 사진 쪽 아래 상자와 지도 쪽 상자가 쓴다.
 * org: 저작권을 가진 기관(국가유산청, 경주시청), title: 원 자료의 사진 이름(경주시정뉴스는 기사 제목), author: 저작자(위키미디어), license: 이용허락 이름,
 * licenseUrl: 이용허락 쪽 주소(위키미디어), page: 원 자료 쪽 주소(국가유산포털 그 유산 쪽, 위키미디어 파일 쪽, 경주시정뉴스 기사 쪽),
 * site: 공공누리 출처 줄에 적는 기관 누리집 주소(경주시정뉴스 www.gyeongju.go.kr. 없으면 국가유산청 www.khs.go.kr)
 */
export type PhotoLicense = { org?: string; title?: string; author?: string; license?: string; licenseUrl?: string; page?: string; site?: string };

/** "공공누리 제1유형" / "공공누리 제3유형" */
export const koglLabel = (type: KoglType) => (type === "Type1" ? "공공누리 제1유형" : "공공누리 제3유형");
/** 유형 조건 풀이: "출처표시" / "출처표시, 변경금지" */
export const koglCondition = (type: KoglType) => (type === "Type1" ? "출처표시" : "출처표시, 변경금지");

/** 관광정보(TourAPI) 사진의 출처 */
export const TOURAPI_CREDIT = "ⓒ한국관광공사";
/** 관광사진 정보 사진의 출처(한국관광콘텐츠랩이 정한 꼴 "ⓒ한국관광콘텐츠랩-촬영자"). 촬영자가 없으면 "ⓒ한국관광콘텐츠랩" */
export const galleryCredit = (by?: string) => (by ? `ⓒ한국관광콘텐츠랩-${by}` : "ⓒ한국관광콘텐츠랩");

/**
 * 사진 한 장의 출처(짧은 꼴): 적어 둔 출처(credit, 국가유산청·위키미디어·경주시정뉴스 사진)가 있으면 그것,
 * 관광사진 정보 사진은 "ⓒ한국관광콘텐츠랩-촬영자", 나머지(관광정보)는 "ⓒ한국관광공사"
 */
export function photoCreditOf(p: { from?: PhotoSource; by?: string; credit?: string }): string {
  if (p.credit) return p.credit;
  return p.from === "gallery" ? galleryCredit(p.by) : TOURAPI_CREDIT;
}

/**
 * 공공누리 상자(지도 쪽)를 고르는 열쇠: 관광정보 사진은 유형("Type1"/"Type3"), 관광사진 정보 사진은 "by:촬영자".
 * 국가유산청·위키미디어·경주시정뉴스 사진은 사진마다 상자 글이 달라 열쇠 없이 사진의 이용허락 칸(lic)으로 그 자리에서 만든다(null).
 */
export function koglKeyOf(p: { type: KoglType; from?: PhotoSource; by?: string }): string | null {
  if (p.from === "heritage" || p.from === "wikimedia" || p.from === "gyeongju") return null;
  return p.from === "gallery" ? `by:${p.by ?? ""}` : p.type;
}
