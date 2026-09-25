// 목록 쪽(/list, /list/abc, /list/hub)이 서버에서 만들어 클라이언트 부품에 넘기는 자료의 모양.
// 클라이언트 부품은 이 파일의 형만 쓴다(places.json·photos.json을 클라이언트로 보내지 않기 위해).
import type { AreaKey } from "@/data/types";
import type { KoglType } from "@/data/photos";

export type CardPhoto = { url: string; type: KoglType } | null;

/** 카드 한 장(궁능 문화행사 카드 모양) */
export type CardPlace = {
  id: string;
  name: string;
  area: AreaKey;
  areaLabel: string;
  dong: string;
  address: string | null;
  hours: string | null;
  photo: CardPhoto;
};

/** 게시판 표 한 줄(궁능 공지사항 표 모양) */
export type BoardRow = {
  id: string;
  name: string;
  area: AreaKey;
  areaLabel: string;
  dong: string;
  registered: boolean;
  hasPhoto: boolean;
};

/** 권역 고르기(알약·범례) */
export type AreaOption = { key: AreaKey; label: string; count: number };
