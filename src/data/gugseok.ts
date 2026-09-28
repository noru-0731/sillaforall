// 대한민국 구석구석 관광지 쪽 주소(09-28 밤). 쪽마다 '관광정보 수정요청' 단추가 있어, 무장애 정보 빈칸을 본 사람이 한국관광공사에 보완을 요청하는 길이 된다.
// 주소 번호는 구석구석 검색으로 받고, 그 쪽이 돌려준 관광정보 콘텐츠 번호가 61곳 TourAPI 번호와 같은 것만 남겼다(gugseok.json _about). 58곳.
import G from "./gugseok.json";

const PLACES = G.places as Record<string, { cotId: string; cid: string; title: string }>;

export const GUGSEOK_NAME = "대한민국 구석구석";

/** 그 곳의 구석구석 관광지 쪽 주소. 번호가 맞는 쪽을 못 찾은 곳(3곳)은 null */
export function gugseokUrl(placeId: string): string | null {
  const g = PLACES[placeId];
  return g ? `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${g.cotId}` : null;
}
