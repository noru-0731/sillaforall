// 관광공사 관광정보의 소개 정보(detailIntro2)와 반복 정보(detailInfo2)에서, 사이트에 아직 없던 칸.
// intro_extra.json 만드는 곳: 05_사이트/도구/13_소개정보.py (받은 날·칸별 곳 수: 도구/out/13_소개정보_읽는법.md).
// 칸 이름은 관광공사가 붙인 한국어 이름(곳마다 다른 띄어쓰기는 한 가지로 맞춤)이고, 글은 자료 그대로(<br>만 줄바꿈으로 바꿈)다.
// - fee: 이용요금. 문화시설은 detailIntro2 usefee, 관광지는 detailInfo2 "입장료"(곳에 따라 "입 장 료", "관람료") 글.
//   places.json fee가 비어 있을 때 이 값을 쓴다(data/index.ts).
// - feeRows: 이용요금 줄 바로 아래에 둘 요금 칸(시설이용료, 주차요금).
// - rows: 그 밖의 칸(관람 소요시간, 유모차 대여, 체험 안내, 수용인원, 규모, 개장일, 신용카드, 화장실, 이용 가능 시설 …). 글이 있는 칸만.
// 콘텐츠 번호가 없는 서악서원과, 좌표·주소·사진만 관광정보 '강동 워터파크'(2044527)에서 가져온 블루원워터파크(가 88번)는 없다.
import raw from "./intro_extra.json";

type Row = [string, string];
type Extra = { contentId: string; contentTypeId: string; fee: string | null; feeFrom: string | null; feeRows: Row[]; rows: Row[] };

const EXTRA = raw as unknown as Record<string, Extra>;

/** 관광공사 관광정보의 이용요금 글. 없으면 null */
export const extraFeeOf = (id: string): string | null => EXTRA[id]?.fee ?? null;

/** 이용요금 줄 아래에 둘 요금 칸(시설이용료, 주차요금). 없으면 빈 목록 */
export const extraFeeRowsOf = (id: string): Row[] => EXTRA[id]?.feeRows ?? [];

/** 그 밖에 더할 칸. 없으면 빈 목록 */
export const extraRowsOf = (id: string): Row[] => EXTRA[id]?.rows ?? [];
