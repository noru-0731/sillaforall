// 경주시 문화관광 무장애 여행정보(경주문화관광 누리집 > 여행도우미 > 무장애 여행정보)의 사실 칸. 서버 컴포넌트에서만 부른다.
// - gj_bf.json: 만드는 곳 도구/15_경주시_무장애.py, 읽는법 도구/out/15_경주시_무장애_읽는법.md
// - 원 쪽에 소개된 15곳 가운데 61곳과 짝지은 12곳(places). 뺀 곳과 까닭은 entries·읽는법 문서에 있다.
// - 원 쪽에 공공누리 표시가 없어 문장은 옮기지 않고 사실만 '칸 이름 : 짧은 값'으로 옮겼다. 사진·전화번호·링크는 없다.
// - 관광공사 무장애 여행 정보와 값이 다른 곳도 고치지 않고 둘 다 싣는다(읽는법 6절).
import raw from "./gj_bf.json";

type GjPlace = { entry: string; rows: [string, string][] };
const GJ = raw as unknown as {
  meta: { source: string; section: string; url: string; checked: string; fieldOrder: string[] };
  places: Record<string, GjPlace>;
};

/** 출처 이름, 절 제목(원 쪽 이름), 원 쪽 주소(자료 출처 쪽에 글자로만), 확인한 날 */
export const GJ_SOURCE = { name: GJ.meta.source, section: GJ.meta.section, url: GJ.meta.url, checked: GJ.meta.checked };
export const GJ_CREDIT = `자료: ${GJ.meta.source}(${GJ.meta.checked} 확인)`;

/** 이 곳의 경주시 무장애 여행정보(원 쪽 곳 이름과 구분·내용 줄). 짝이 없으면 null */
export function gjOf(id: string): GjPlace | null {
  return GJ.places[id] ?? null;
}
