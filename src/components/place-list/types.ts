// 목록 쪽(/list, /list/abc, /list/hub)이 서버에서 만들어 클라이언트 부품에 넘기는 자료의 모양.
// 클라이언트 부품은 이 파일의 형만 쓴다(places.json·photos.json을 클라이언트로 보내지 않기 위해).
import type { AreaKey } from "@/data/types";
import type { KoglType, PhotoLicense, PhotoSource } from "@/data/photos";

/** from·by: 관광사진 정보(한국관광콘텐츠랩) 사진이면 "gallery"와 촬영자. credit·lic: 채운 사진(국가유산청·위키미디어·경주시정뉴스)의 짧은 출처와 이용허락 칸.
 *  srcset: 줄여 둔 판 여러 폭(관광정보 제1유형·채운 사진) */
export type CardPhoto = { url: string; type: KoglType; from?: PhotoSource; by?: string; credit?: string; lic?: PhotoLicense; srcset?: string } | null;

/** 카드 한 장(궁능 문화행사 카드 모양) */
export type CardPlace = {
  id: string;
  name: string;
  area: AreaKey;
  areaLabel: string;
  dong: string;
  address: string | null;
  hours: string | null;
  /** 쉬는 날(관광정보 글, 붙은 줄은 나눔) */
  closed: string | null;
  /** 분류(관광공사 소분류 이름 그대로) */
  category: string | null;
  photo: CardPhoto;
  /** 한국관광공사 무장애 여행 정보에 올라 있는지(무장애 정보가 있는 곳) */
  registered: boolean;
  /** 글이 적힌 칸이 있는 무장애 묶음 이름(지체장애, 시각장애, 청각장애, 영유아 가족 차례). 보이기만 한다 */
  bfGroups: string[];
  /** 카드 사진의 출처(짧은 꼴, photoCreditOf). 사진이 없으면 null. 사진 곁에 적는다 */
  credit: string | null;
};

/** 게시판 표 한 줄(궁능 공지사항 표 모양) */
export type BoardRow = {
  id: string;
  name: string;
  area: AreaKey;
  areaLabel: string;
  dong: string;
  /** 분류(관광공사 소분류 이름 그대로) */
  category: string | null;
  /** 쉬는 날(관광정보 글, 붙은 줄은 나눔) */
  closed: string | null;
  registered: boolean;
  hasPhoto: boolean;
};

/** 권역 고르기(알약·범례) */
export type AreaOption = { key: AreaKey; label: string; count: number };
