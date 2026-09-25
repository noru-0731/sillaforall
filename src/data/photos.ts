// 사진 도우미. 사진은 두 곳에서 온다(photos.json, 만드는 도구: 도구/03_사진.py → 도구/04_갤러리사진.py).
//  - 관광정보(TourAPI detailImage2·detailCommon2): 관광지마다 관광공사가 올린 사진. 제1유형과 제3유형이 섞여 있다.
//  - 관광사진 정보(PhotoGalleryService1, 옛 포토코리아 → 한국관광콘텐츠랩 고품질사진): 제목·촬영지로 관광지가 확실한 사진만 짝지었고,
//    한국관광콘텐츠랩에서 공공누리 제1유형으로 확인된 사진만 넣었다. 촬영자(by)가 있다.
// Type1 = 공공누리 제1유형(출처표시, 변경 가능): 잘라 쓰는 자리(배너, 카드, 배경)에 쓸 수 있다.
// Type3 = 공공누리 제3유형(출처표시, 변경 금지): 자르지 않는다. <Photo>가 알아서 contain + 단색 바탕으로 보인다.
// 큰 판(large): 같은 사진을 관광공사 서버가 가로 1,600픽셀 안팎으로도 두고 있으면 그 주소. 큰 자리(첫 화면, 배너, 관광지 맨 위)에 쓴다.
// 서버 컴포넌트에서 부른다(photos.json이 수백 KB라 클라이언트로 보내지 않는다). 클라이언트에는 결과만 props로 넘긴다.
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
  /** url 사진의 가로·세로 픽셀(잰 값. 모르면 없음) */
  w?: number;
  h?: number;
  /** 같은 사진의 더 큰 판 주소(없으면 없음)와 그 가로·세로 픽셀 */
  large?: string;
  lw?: number;
  lh?: number;
  /** 어디서 온 사진: tourapi = 관광정보, gallery = 관광사진 정보 */
  from?: "tourapi" | "gallery";
  /** 촬영자(관광사진 정보 사진만) */
  by?: string;
};

type Sized = { w?: number; h?: number; large?: string; lw?: number; lh?: number };
type Entry = {
  contentId: string | null;
  main: ({ url: string | null; type: string | null } & Sized) | null;
  gallery: ({ url: string; small: string; name: string; type: string } & Sized)[];
  /** 관광사진 정보(갤러리) 사진. 모두 제1유형. 없으면 없음 */
  photoGallery?: ({ url: string; small: string; name: string; type: string; by: string; month?: string; galleryId?: string; conlabId?: string } & Sized)[];
};
const DB = raw as unknown as Record<string, Entry>;

const https = (u: string) => u.replace(/^http:\/\//, "https://");
const asType = (t: string): KoglType => (t === "Type1" ? "Type1" : "Type3");
const sized = (s: Sized): Sized => ({
  ...(s.w ? { w: s.w, h: s.h } : {}),
  ...(s.large ? { large: https(s.large), lw: s.lw, lh: s.lh } : {}),
});
/** 사진 번호(관광공사 서버 주소 끝의 숫자). 두 출처에 같은 사진이 있으면 한 번만 쓰려고 */
const numOf = (u: string) => u.match(/\/(\d+)(?:_image\d_\d)?\.\w+$/)?.[1] ?? u;

/** 관광공사 콘텐츠 번호(없으면 null) */
export const contentIdOf = (id: string): string | null => DB[id]?.contentId ?? null;

/** 대표사진만(없으면 null) */
export function mainPhoto(id: string): Photo | null {
  const m = DB[id]?.main;
  return m?.url ? { url: https(m.url), type: asType(m.type ?? ""), ...sized(m), from: "tourapi" } : null;
}

/** 그 관광지의 사진 전부: 대표사진 → 관광정보 목록 → 관광사진 정보 차례. 같은 사진은 한 번만. */
export function photosOf(id: string): Photo[] {
  const e = DB[id];
  if (!e) return [];
  const out: Photo[] = [];
  const seen = new Set<string>();
  const push = (p: Photo) => {
    const k = numOf(p.url);
    if (seen.has(k)) return;
    seen.add(k);
    out.push(p);
  };
  const m = mainPhoto(id);
  if (m) push(m);
  for (const g of e.gallery ?? [])
    if (g.url) push({ url: https(g.url), small: https(g.small || g.url), name: g.name, type: asType(g.type), ...sized(g), from: "tourapi" });
  for (const g of e.photoGallery ?? [])
    if (g.url && g.type === "Type1")
      push({ url: https(g.url), small: https(g.small || g.url), name: g.name, type: "Type1", ...sized(g), from: "gallery", by: g.by });
  return out;
}

/** 제1유형 사진만(대표사진 포함, 차례 유지) */
export function type1List(id: string): Photo[] {
  return photosOf(id).filter((p) => p.type === "Type1");
}

/** 잘라 써도 되는 대표 사진: 제1유형 대표사진 → 없으면 제1유형 목록 첫 장(관광사진 정보 포함) → 없으면 null */
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

// ─── 큰 자리 ───
/** 이 사진을 가장 크게 받을 수 있는 가로 픽셀(모르면 0) */
export const widthOf = (p: Pick<Photo, "w" | "lw">) => Math.max(p.w ?? 0, p.lw ?? 0);
/** 큰 판이 있으면 그 주소, 없으면 url */
export const largeUrl = (p: Pick<Photo, "url" | "large">) => p.large ?? p.url;

/**
 * 큰 자리(첫 화면 넘기기, 관광지 맨 위 큰 사진 등)에 쓸 제1유형 사진: 가로 사진 가운데
 * 가로 min픽셀 이상으로 받을 수 있는 것을 대표사진 → 목록 차례로 먼저 고르고, 없으면 가장 큰 것. 제1유형이 없으면 null.
 * 돌려주는 url은 그대로(작은 판)이고, 큰 판은 large에 있다. 화면에는 largeUrl(사진)이나 <Photo>(large가 있으면 알아서 큰 판)를 쓴다.
 */
export function bigPhoto(id: string, min = 1400): Photo | null {
  const all = type1List(id);
  const wide = all.filter((p) => !p.w || !p.h || p.w >= p.h);
  const biggest = (l: Photo[]) => [...l].sort((a, b) => widthOf(b) - widthOf(a))[0];
  return wide.find((p) => widthOf(p) >= min) ?? all.find((p) => widthOf(p) >= min) ?? biggest(wide) ?? biggest(all) ?? null;
}

/** 주소로 사진 찾기(배너처럼 주소를 박아 둔 곳에서 크기·큰 판을 알려고) */
function findByUrl(url: string): Photo | null {
  const k = numOf(url);
  for (const id of Object.keys(DB)) {
    const hit = photosOf(id).find((p) => numOf(p.url) === k);
    if (hit) return hit;
  }
  return null;
}

// ─── 배너(서브 쪽 맨 위 185px 띠) ───
// 1차 메뉴마다 유명한 곳의 제1유형 가로 사진(940×627 등)을 골라 고정했다. 사용자가 바꿀 수 있다.
// 돌려주는 url은 같은 사진의 큰 판(가로 1,620픽셀 안팎)이 있으면 그것이다. 09-25 기준 여섯 가운데 "/barrier-free"(첨성대와 둘레 길)만
// 큰 판이 없어 940픽셀 그대로다. 같은 관광지의 큰 사진은 bigPhoto("p39")(첨성대 대표사진, 1,620)이지만 띠에 넣으면 첨성대 윗부분이 잘린다.
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
  const hit = findByUrl(b.url);
  if (hit?.large) return { url: hit.large, w: hit.lw, h: hit.lh, type: "Type1", from: hit.from, by: hit.by, placeId: b.placeId, placeName: b.placeName };
  // 고른 사진에 큰 판이 없으면 고른 사진 그대로(같은 관광지의 큰 사진 bigPhoto(placeId)로 바꿀지는 사용자가 정한다).
  return { url: b.url, ...(hit?.w ? { w: hit.w, h: hit.h } : {}), type: "Type1", from: hit?.from ?? "tourapi", placeId: b.placeId, placeName: b.placeName };
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
/** 관광사진 정보 사진의 출처(한국관광콘텐츠랩이 정한 꼴 "ⓒ한국관광콘텐츠랩-촬영자"). 촬영자가 없으면 "ⓒ한국관광콘텐츠랩" */
export const galleryCredit = (by?: string) => (by ? `ⓒ한국관광콘텐츠랩-${by}` : "ⓒ한국관광콘텐츠랩");
/**
 * 사진 한 장의 출처 한 줄. 관광정보 사진은 photoCredit(type)과 같고,
 * 관광사진 정보 사진은 "사진: ⓒ한국관광콘텐츠랩-촬영자, 공공누리 제1유형".
 */
export function photoCreditOf(p: Pick<Photo, "type" | "from" | "by">): string {
  return p.from === "gallery" ? `사진: ${galleryCredit(p.by)}, ${koglLabel(p.type)}` : photoCredit(p.type);
}

/**
 * 여러 사진의 출처 줄(카드 줄·사진 띠·넘기기 판 아래 한곳에 적을 때).
 * 관광정보 사진은 쓴 유형을 모아 한 줄("사진: 한국관광공사 관광정보, 공공누리 제1유형·제3유형"),
 * 관광사진 정보 사진은 촬영자마다 한 줄("사진: ⓒ한국관광콘텐츠랩-촬영자, 공공누리 제1유형"). 사진이 없으면 빈 목록.
 */
export function creditLines(list: (Pick<Photo, "type" | "from" | "by"> | null | undefined)[]): string[] {
  const ps = list.filter((p): p is Pick<Photo, "type" | "from" | "by"> => !!p);
  const types = new Set(ps.filter((p) => p.from !== "gallery").map((p) => p.type));
  const out: string[] = [];
  if (types.size) {
    const kinds = (["Type1", "Type3"] as const).filter((t) => types.has(t)).map((t) => (t === "Type1" ? "제1유형" : "제3유형"));
    out.push(`사진: 한국관광공사 관광정보, 공공누리 ${kinds.join("·")}`);
  }
  const bys = [...new Set(ps.filter((p) => p.from === "gallery").map((p) => p.by ?? ""))];
  for (const by of bys) out.push(photoCreditOf({ type: "Type1", from: "gallery", by: by || undefined }));
  return out;
}
