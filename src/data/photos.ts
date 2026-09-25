// 사진 도우미. 사진은 모두 한국관광공사 관광정보(TourAPI) 사진(photos.json)이다.
// Type1 = 공공누리 제1유형(출처표시, 변경 가능): 잘라 쓰는 자리(배너, 카드, 배경)에 쓸 수 있다.
// Type3 = 공공누리 제3유형(출처표시, 변경 금지): 자르지 않는다. <Photo>가 알아서 contain + 단색 바탕으로 보인다.
// 서버 컴포넌트에서 부른다(photos.json이 110KB라 클라이언트로 보내지 않는다). 클라이언트에는 결과만 props로 넘긴다.
import raw from "./photos.json";
import type { AreaKey } from "./types";

export type KoglType = "Type1" | "Type3";
export type Photo = {
  url: string;
  type: KoglType;
  /** 관광공사가 붙인 사진 이름(파일 이름일 때도 있다). 대표사진은 없음 */
  name?: string;
  /** 작은 사진 주소(없으면 url과 같다) */
  small?: string;
};

type Entry = {
  contentId: string;
  main: { url: string | null; type: string | null } | null;
  gallery: { url: string; small: string; name: string; type: string }[];
};
const DB = raw as unknown as Record<string, Entry>;

const https = (u: string) => u.replace(/^http:\/\//, "https://");
const asType = (t: string): KoglType => (t === "Type1" ? "Type1" : "Type3");

/** 관광공사 콘텐츠 번호(없으면 null) */
export const contentIdOf = (id: string): string | null => DB[id]?.contentId ?? null;

/** 대표사진만(없으면 null) */
export function mainPhoto(id: string): Photo | null {
  const m = DB[id]?.main;
  return m?.url ? { url: https(m.url), type: asType(m.type ?? "") } : null;
}

/** 그 관광지의 사진 전부: 대표사진 → 목록 차례. 같은 주소는 한 번만. */
export function photosOf(id: string): Photo[] {
  const e = DB[id];
  if (!e) return [];
  const out: Photo[] = [];
  const seen = new Set<string>();
  const push = (p: Photo) => {
    if (seen.has(p.url)) return;
    seen.add(p.url);
    out.push(p);
  };
  const m = mainPhoto(id);
  if (m) push(m);
  for (const g of e.gallery) if (g.url) push({ url: https(g.url), small: https(g.small || g.url), name: g.name, type: asType(g.type) });
  return out;
}

/** 제1유형 사진만(대표사진 포함, 차례 유지) */
export function type1List(id: string): Photo[] {
  return photosOf(id).filter((p) => p.type === "Type1");
}

/** 잘라 써도 되는 대표 사진: 제1유형 대표사진 → 없으면 제1유형 목록 첫 장 → 없으면 null */
export function coverPhoto(id: string): Photo | null {
  const m = mainPhoto(id);
  if (m?.type === "Type1") return m;
  return type1List(id)[0] ?? null;
}

/** 아무 사진이나 한 장: 대표사진 → 목록 첫 장 → null. 제3유형일 수 있으니 반드시 <Photo>로 보인다. */
export function anyPhoto(id: string): Photo | null {
  return photosOf(id)[0] ?? null;
}

/** 사진이 한 장이라도 있는지 */
export const hasPhoto = (id: string) => photosOf(id).length > 0;

// ─── 배너(서브 쪽 맨 위 185px 띠) ───
// 1차 메뉴마다 유명한 곳의 제1유형 가로 사진(940×627 등)을 골라 고정했다. 사용자가 바꿀 수 있다.
export type BannerSection = "/map" | "/list" | "/barrier-free" | "/about" | "/places" | "/sitemap";
const BANNERS: Record<BannerSection, { placeId: string; placeName: string; url: string }> = {
  // 대릉원 봉분 능선(대릉원 목록 7번)
  "/map": { placeId: "p51", placeName: "대릉원", url: "https://tong.visitkorea.or.kr/cms/resource/96/4105796_image2_1.jpg" },
  // 월정교 전경(대표사진)
  "/list": { placeId: "p37", placeName: "월정교", url: "https://tong.visitkorea.or.kr/cms/resource_photo/94/3052894_image2_1.jpg" },
  // 첨성대와 둘레 길(첨성대 목록 4번)
  "/barrier-free": { placeId: "p39", placeName: "첨성대", url: "https://tong.visitkorea.or.kr/cms/resource/04/3554504_image2_1.jpg" },
  // 옥산서원 누마루(대표사진)
  "/about": { placeId: "p04", placeName: "옥산서원", url: "https://tong.visitkorea.or.kr/cms/resource/52/3501352_image2_1.jpg" },
  // 관광지 쪽: 월정교(관광지 목록과 같게)
  "/places": { placeId: "p37", placeName: "월정교", url: "https://tong.visitkorea.or.kr/cms/resource_photo/94/3052894_image2_1.jpg" },
  // 사이트맵: 오릉(대표사진)
  "/sitemap": { placeId: "p24", placeName: "오릉", url: "https://tong.visitkorea.or.kr/cms/resource/77/4056777_image2_1.jpg" },
};

export type BannerPhoto = Photo & { placeId: string; placeName: string };

/** 메뉴별 배너 사진(제1유형). section은 1차 메뉴 주소("/map" 등) 또는 "/places", "/sitemap". 모르는 값이면 "/list"의 것. */
export function bannerPhoto(section: string): BannerPhoto {
  const key = (Object.keys(BANNERS) as BannerSection[]).find((k) => section === k || section.startsWith(k + "/")) ?? "/list";
  const b = BANNERS[key];
  return { url: b.url, type: "Type1", placeId: b.placeId, placeName: b.placeName };
}

// ─── 권역 사진(휴대전화 전체메뉴의 권역 카드) ───
const AREA_PHOTO_PLACE: Record<AreaKey, string> = {
  city: "p39", // 첨성대
  bomun: "p34", // 불국사
  east: "p29", // 문무대왕릉
  southwest: "p01", // 화랑의언덕
  north: "p04", // 옥산서원
};
/** 권역 대표 사진(제1유형, 잘라 써도 됨). 없으면 null */
export function areaPhoto(key: AreaKey): (Photo & { placeId: string }) | null {
  const id = AREA_PHOTO_PLACE[key];
  const p = coverPhoto(id);
  return p ? { ...p, placeId: id } : null;
}

// ─── 공공누리 표시 ───
/** "공공누리 제1유형" / "공공누리 제3유형" */
export const koglLabel = (type: KoglType) => (type === "Type1" ? "공공누리 제1유형" : "공공누리 제3유형");
/** 유형 조건 풀이: "출처표시" / "출처표시, 변경금지" */
export const koglCondition = (type: KoglType) => (type === "Type1" ? "출처표시" : "출처표시, 변경금지");
/** 사진 아래 한 줄 출처: "사진: 한국관광공사 관광정보, 공공누리 제1유형" */
export const photoCredit = (type: KoglType) => `사진: 한국관광공사 관광정보, ${koglLabel(type)}`;
