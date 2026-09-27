// 사진 도우미. 사진은 두 곳에서 온다(photos.json, 만드는 도구: 도구/03_사진.py → 도구/04_갤러리사진.py).
//  - 관광정보(TourAPI detailImage2·detailCommon2): 관광지마다 관광공사가 올린 사진. 제1유형과 제3유형이 섞여 있다.
//  - 관광사진 정보(PhotoGalleryService1, 옛 포토코리아 → 한국관광콘텐츠랩 고품질사진): 제목·촬영지로 관광지가 확실한 사진만 짝지었고,
//    한국관광콘텐츠랩에서 공공누리 제1유형으로 확인된 사진만 넣었다. 촬영자(by)가 있다.
// Type1 = 공공누리 제1유형(출처표시, 변경 가능): 잘라 쓰는 자리(배너, 카드, 배경)에 쓸 수 있다.
// Type3 = 공공누리 제3유형(출처표시, 변경 금지): 자르지 않는다. <Photo>가 알아서 contain + 단색 바탕으로 보인다.
// 큰 판(large): 같은 사진을 관광공사 서버가 가로 1,600픽셀 안팎으로도 두고 있으면 그 주소. 큰 자리(첫 화면, 배너, 관광지 맨 위)에 쓴다.
// 서버 컴포넌트에서 부른다(photos.json이 수백 KB라 클라이언트로 보내지 않는다). 클라이언트에는 결과만 props로 넘긴다.
// 사진 파일 주소(09-27 사용자 결정 "제1유형만 줄여 둠", 아래 "줄여 둔 판"):
//  - 관광정보 제1유형(변경 가능): 자리에 맞게 줄여 둔 판(public/photos/t1, 도구/21_사진_줄이기.py)이 있으면 그것을 쓴다. 자리마다 localPhoto(사진, 자리)를 지난다.
//  - 관광사진 정보(한국관광콘텐츠랩): 저작권 정책의 "콘텐츠 캐싱(로컬서버 저장방식) 금지" 때문에 줄여 두지 않고 관광공사 서버 주소 그대로.
//    관광정보 목록에 들어 있어도 콘텐츠랩 사진과 같은 그림(주소가 /cms/resource_photo/, 번호가 콘텐츠랩 목록·관광사진 정보에 있음)이면 같다.
//  - 제3유형(변경 금지): 줄이지 않고 관광공사 서버 주소 그대로.
//  - 사진 쪽(/photos) 넘기기 전체 목록은 줄인 판을 쓰지 않는다(원 주소, "원본 보기"는 큰 판).
// 출처 글(짧은 꼴 "ⓒ한국관광공사" 등)과 공공누리 이름은 credit.ts에 있다(photos.json 없이 클라이언트 부품도 부르려고). 여기서 다시 내보낸다.
// 채운 사진(09-27, photos_extra.json, 만드는 도구: 도구/22_사진_채우기.py): 사진이 없거나 제3유형뿐이거나 콘텐츠랩 사진만 몇 장인 곳에
//  이용 조건을 확인한 사진을 원 자료 사진 뒤에 더한다(아래 "채운 사진").
import raw from "./photos.json";
import localRaw from "./photos_local.json";
import extraRaw from "./photos_extra.json";
import type { AreaKey } from "./types";
import type { KoglType, PhotoLicense, PhotoSource } from "./credit";

export type { KoglType, PhotoLicense, PhotoSource } from "./credit";
export { galleryCredit, koglCondition, koglLabel, koglKeyOf, photoCreditOf, TOURAPI_CREDIT } from "./credit";
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
  /** 어디서 온 사진: tourapi = 관광정보, gallery = 관광사진 정보, heritage = 국가유산청, wikimedia = 위키미디어 공용, gyeongju = 경주시정뉴스(채운 사진) */
  from?: PhotoSource;
  /** 촬영자(관광사진 정보 사진만) */
  by?: string;
  /** 사진 곁 출처(짧은 꼴)를 적어 둔 사진만(국가유산청·위키미디어·경주시정뉴스). 없으면 from·by 로 만든다(photoCreditOf) */
  credit?: string;
  /** 국가유산청·위키미디어·경주시정뉴스 사진의 이용허락 칸(사진 쪽 아래 상자, 지도 쪽 상자) */
  lic?: PhotoLicense;
  /** 표지(잘라 쓰는 큰 자리: 맨 위 큰 사진, 카드, 첫 화면, 공유 그림)로 고르지 않는 사진. 사진 안에 저작자 워터마크가 있는 채운 사진(위키미디어 용굴 4장).
   *  사진 띠·작은 사진 줄·사진 쪽에는 보인다 */
  noCover?: boolean;
  /** 사이트에 줄여 둔 판(public/photos/x/<file>-<폭>.jpg)의 파일 이름과 폭 목록(작은 것부터). 국가유산청·위키미디어·경주시정뉴스 사진만 */
  file?: string;
  ws?: number[];
  hs?: number[];
  /** 줄여 둔 판 여러 폭("주소 폭w, …", img srcset 값). 큰 자리에 localPhoto(사진, "big")로 받았을 때만 있다 */
  srcset?: string;
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

// ─── 채운 사진(photos_extra.json) ───
// 09-27 사용자 "사진 없는건 알아서 다 채우라니까요?". 도구/22_사진_채우기.py 가 사진마다 원 자료의 이용 조건 칸을 확인하고 적는다
// (확인한 원문 따옴은 도구/out/22_사진_채우기.md). 원 자료 사진(대표사진 → 관광정보 목록 → 관광사진 정보) 뒤에 붙는다.
//  - gallery: 관광사진 정보(한국관광콘텐츠랩, 공공누리 제1유형). 캐싱 금지라 관광공사 서버 원 주소 그대로.
//  - heritage: 국가유산청 국가유산 이미지(공공누리 제1유형, API 칸 imageNuri "A"). 변경이 되므로 public/photos/x 에 줄여 둔 판.
//  - wikimedia: 위키미디어 공용(CC BY-SA 등, 변경 허용). public/photos/x 에 줄여 둔 판(BY-SA 는 줄인 판도 같은 허락).
//  - gyeongju: 경주시정뉴스(경주시청 최신기사, 기사 쪽마다 공공누리 제1유형 상자). public/photos/x 에 줄여 둔 판. 출처 "ⓒ경주시청".
//  국가유산청·위키미디어·경주시정뉴스 사진은 잘라 써도 되는 사진이라 type 을 "Type1"(잘라 쓰는 자리에 쓸 수 있음)로 둔다. 공공누리 상자는 from 으로 가린다.
// 표지(coverPhoto)는 차례대로 고르므로, 원 자료에 제1유형이 있으면 그것이 그대로 표지이고, 없으면 채운 사진의 첫 제1유형이 표지가 된다.
// noCover 인 사진(사진 안에 저작자 워터마크가 있는 위키미디어 용굴 4장)은 표지·큰 자리로 고르지 않는다(coverPhoto, bigPhoto).
type Extra = {
  from: PhotoSource;
  type: string;
  name: string;
  credit: string;
  /** gallery: 원 주소 */
  url?: string;
  small?: string;
  w?: number;
  h?: number;
  large?: string;
  lw?: number;
  lh?: number;
  by?: string;
  /** heritage·wikimedia·gyeongju: 줄여 둔 판 */
  file?: string;
  ws?: number[];
  hs?: number[];
  orig?: string;
  page?: string;
  org?: string;
  title?: string;
  author?: string;
  license?: string;
  licenseUrl?: string;
  /** gyeongju: 공공누리 출처 줄의 누리집 주소(www.gyeongju.go.kr) */
  site?: string;
  /** 사진 안에 워터마크가 있어 표지로 쓰지 않는 사진 */
  noCover?: boolean;
};
const EXTRA = extraRaw as unknown as Record<string, Extra[]>;
const xUrl = (file: string, w: number) => `/photos/x/${file}-${w}.jpg`;

function extraPhoto(x: Extra): Photo {
  const lic: PhotoLicense = {
    ...(x.org ? { org: x.org } : {}),
    ...(x.title ? { title: x.title } : {}),
    ...(x.author ? { author: x.author } : {}),
    ...(x.license ? { license: x.license } : {}),
    ...(x.licenseUrl ? { licenseUrl: x.licenseUrl } : {}),
    ...(x.page ? { page: x.page } : {}),
    ...(x.site ? { site: x.site } : {}),
  };
  if (x.file && x.ws?.length && x.hs?.length) {
    const ws = x.ws;
    const hs = x.hs;
    // 보통 자리 판: 960 이하 가운데 가장 큰 것. 큰 판: 가장 큰 폭(보통 자리 판보다 클 때만)
    const mid = ws.filter((w) => w <= 960).length - 1;
    const i = mid >= 0 ? mid : 0;
    const top = ws.length - 1;
    return {
      url: xUrl(x.file, ws[i]),
      small: xUrl(x.file, ws[0]),
      name: x.name,
      type: asType(x.type),
      w: ws[i],
      h: hs[i],
      ...(top > i ? { large: xUrl(x.file, ws[top]), lw: ws[top], lh: hs[top] } : {}),
      from: x.from,
      credit: x.credit,
      lic,
      ...(x.noCover ? { noCover: true } : {}),
      file: x.file,
      ws,
      hs,
    };
  }
  return {
    url: https(x.url ?? ""),
    small: https(x.small || x.url || ""),
    name: x.name,
    type: asType(x.type),
    ...sized(x),
    from: x.from,
    ...(x.by ? { by: x.by } : {}),
    ...(x.from === "gallery" ? {} : { credit: x.credit, lic }),
  };
}

/** 자료 출처 쪽(/about/sources)에 적을 채운 사진 목록: 국가유산청 사진(유산마다 한 줄), 위키미디어 사진(파일마다 한 줄),
 *  경주시정뉴스 사진(기사마다 한 줄, 자료 이름은 기사 제목). 곳 id 차례 */
export type ExtraSourceRow = {
  placeIds: string[];
  from: "heritage" | "wikimedia" | "gyeongju";
  name: string;
  who: string;
  license: string;
  licenseUrl?: string;
  got: string;
  page: string;
  count: number;
};
export function extraSources(): ExtraSourceRow[] {
  const out: ExtraSourceRow[] = [];
  const ids = Object.keys(EXTRA).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  for (const id of ids)
    for (const x of EXTRA[id] as (Extra & { heritage?: string; got?: string })[]) {
      if (x.from !== "heritage" && x.from !== "wikimedia" && x.from !== "gyeongju") continue;
      const name = x.from === "heritage" ? (x.heritage ?? x.title ?? x.name) : (x.title ?? x.name);
      const hit = out.find((r) => r.from === x.from && r.name === name);
      if (hit) {
        hit.count += 1;
        if (!hit.placeIds.includes(id)) hit.placeIds.push(id);
        continue;
      }
      out.push({
        placeIds: [id],
        from: x.from,
        name,
        who: x.from === "heritage" ? (x.org ?? "국가유산청") : x.from === "gyeongju" ? (x.org ?? "경주시청") : (x.author ?? ""),
        license: x.license ?? "",
        ...(x.licenseUrl ? { licenseUrl: x.licenseUrl } : {}),
        got: x.got ?? "",
        page: x.page ?? "",
        count: 1,
      });
    }
  return out;
}

/** 그 관광지의 사진 전부: 대표사진 → 관광정보 목록 → 관광사진 정보 → 채운 사진 차례. 같은 사진은 한 번만. */
export function photosOf(id: string): Photo[] {
  const e = DB[id];
  if (!e) return (EXTRA[id] ?? []).map(extraPhoto);
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
  for (const x of EXTRA[id] ?? []) push(extraPhoto(x));
  return out;
}

/** 제1유형 사진만(대표사진 포함, 차례 유지) */
export function type1List(id: string): Photo[] {
  return photosOf(id).filter((p) => p.type === "Type1");
}

/** 잘라 써도 되는 대표 사진: 제1유형 대표사진 → 없으면 제1유형 목록 첫 장(관광사진 정보·채운 사진 포함, noCover 사진은 빼고) → 없으면 null */
export function coverPhoto(id: string): Photo | null {
  const m = mainPhoto(id);
  if (m?.type === "Type1") return m;
  return type1List(id).find((p) => !p.noCover) ?? null;
}

/** 아무 사진이나 한 장: 대표사진 → 목록 첫 장 → null. 제3유형일 수 있으니 반드시 <Photo>로 보인다. */
export function anyPhoto(id: string): Photo | null {
  return photosOf(id)[0] ?? null;
}

/** 사진이 한 장이라도 있는지 */
export const hasPhoto = (id: string) => photosOf(id).length > 0;

// ─── 줄여 둔 판(public/photos/t1) ───
// 관광정보 제1유형 사진을 여러 폭으로 줄여 둔 판(JPEG 품질 80, 진행형, sRGB). 도구/21_사진_줄이기.py 가 관광공사 서버의 가장 큰 판
// (large, 없으면 url)을 받아 만들고, 만든 폭을 photos_local.json(사진 번호 → 폭 목록, 작은 것부터)에 적는다. 파일은 /photos/t1/<번호>-<폭>.jpg.
// 폭(원본보다 큰 폭은 없다): 대표 사진 480·720·960·1600(원본이 960보다 작으면 480·720·원본 폭), 배너·따로 고른 사진 960·1600,
//   소개 쪽 본문 옆 사진 480.
// 09-27: 93장 202개 파일, 합 23,462,337바이트(예산 25MB. 넘으면 도구가 품질 78 → 카드 720 판 빼기 → 1600 판 빼기 차례로 줄인다).
// 제1유형은 공공누리 조건상 줄이기·형식 바꾸기가 되고, 출처 표기(ⓒ한국관광공사)는 원 주소일 때와 같다.
// 목록에 없는 사진(관광사진 정보, 콘텐츠랩 사진과 같은 그림, 제3유형, 대상 자리에 쓰지 않는 제1유형)은 원 주소 그대로 돌려준다.
// 어느 판을 받을지는 브라우저가 srcset 과 sizes(휴대전화는 사진이 그려지는 폭 ÷ 1.25, 넓은 화면은 그려지는 폭)·화면 밀도로 고른다. sizes 값은 components/royal/Photo.tsx 의 SIZES.
const LOCAL_W = localRaw as Record<string, number[]>;
const localUrl = (n: string, w: number) => `/photos/t1/${n}-${w}.jpg`;
/** 카드 칸이 받을 가장 큰 판. 첫 쪽 카드(세로 칸에 가로 사진을 잘라 채움)가 화면 밀도 3 휴대전화에서 1600 판을 받지 않게 */
const CARD_MAX = 960;

/**
 * 자리(도구/21_사진_줄이기.py 의 대상 고르기와 같다. 자리를 늘리거나 바꾸면 도구도 같이 고친다):
 * - small = 작은 칸(480 한 장): 휴대전화 전체메뉴 권역 카드, 소개 쪽 본문 옆 사진
 * - card = 카드 칸(480·720·960 srcset): 첫 쪽 카드, 목록·거점 카드
 * - big = 큰 칸(만든 폭 전부 srcset): 첫 쪽 넘기기 판, 서브 쪽 배너, 관광지 맨 위 큰 사진, 소개 쪽 맨 위 사진, 사이트 소개 쪽 사진,
 *   주변 관광지 넘기기 판, 서브메인 사진 띠(띠 사진은 대표 사진이 들 때만 줄여 둔 판이 있고, 나머지는 원 주소)
 */
export type PhotoSlot = "small" | "card" | "big";

/**
 * 그 자리에 쓸 주소로 바꾼 사진. 관광정보 제1유형이고 줄여 둔 판이 있을 때만 바뀌고, 아니면 받은 사진 그대로.
 * - small: url(과 small)이 480 판 한 장이고 large·srcset 은 없다. 원 주소 판이 이미 480 이하면 받은 사진 그대로.
 * - card: url 은 가장 작은 판(480), srcset 은 960 이하 판 전부. sizes 는 SIZES.homeCard·SIZES.listCard.
 * - big: url 은 960 안팎 판, large 는 가장 큰 판, srcset 은 만든 폭 전부. sizes 는 자리마다 SIZES 의 값.
 * <Photo>는 srcset 이 있으면 그것을 쓴다. 사진을 서로 견줄 때(맨 위 사진과 같은 장인지 등)는 바꾸기 전 사진의 url 로 견준다.
 */
export function localPhoto<T extends Photo>(p: T, slot: PhotoSlot): T {
  // 채운 사진 가운데 줄여 둔 판이 있는 것(국가유산청·위키미디어·경주시정뉴스, public/photos/x)
  if (p.file && p.ws?.length) return localExtra(p, slot);
  // 콘텐츠랩 주소 꼴(/cms/resource_photo/)은 관광정보 목록에 들어 있어도 줄인 판을 쓰지 않는다(도구도 만들지 않는다)
  if (p.from !== "tourapi" || p.type !== "Type1" || p.url.includes("/resource_photo/")) return p;
  const n = numOf(p.url);
  const all = LOCAL_W[n];
  if (!all?.length) return p;
  const ratio = p.lw && p.lh ? p.lh / p.lw : p.w && p.h ? p.h / p.w : 0;
  const hOf = (w: number) => (ratio ? { h: Math.round(w * ratio) } : {});
  const set = (ws: number[]) => ws.map((w) => `${localUrl(n, w)} ${w}w`).join(", ");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { large, lw, lh, srcset, small, ...rest } = p;
  if (slot === "big") {
    const base = all.filter((w) => w <= 960).at(-1) ?? all[0];
    const top = all[all.length - 1];
    // 큰 자리 판(960 이상, 원본이 그보다 작으면 원본 폭)을 만든 사진만. 480 판만 있는 사진(소개 쪽 본문 옆 사진)이 사진 띠에 들면 원 주소
    if (top < Math.min(960, Math.max(p.w ?? 0, p.lw ?? 0) || 940)) return p;
    return {
      ...rest,
      url: localUrl(n, base),
      w: base,
      ...hOf(base),
      ...(top > base ? { large: localUrl(n, top), lw: top, ...(ratio ? { lh: Math.round(top * ratio) } : {}) } : {}),
      srcset: set(all),
    } as T;
  }
  // 작은·카드 칸: 원 주소 판이 이미 480 이하(세로 사진 418×627 등)면 원 주소 그대로(도구도 이때는 만들지 않는다)
  const ow = p.w ?? 940;
  const ws = slot === "card" ? all.filter((w) => w <= CARD_MAX) : all.filter((w) => w <= 480).slice(-1);
  if (!ws.length || ws[0] >= ow) return p;
  const w = ws[0];
  return { ...rest, url: localUrl(n, w), small: localUrl(n, w), w, ...hOf(w), ...(ws.length > 1 ? { srcset: set(ws) } : {}) } as T;
}

/**
 * 채운 사진(국가유산청·위키미디어·경주시정뉴스)의 자리 판. 폭은 도구/22_사진_채우기.py 가 만든 것(가로 사진 480·960·1600, 세로 사진 480·960, 원본보다 크지 않게).
 * small: 가장 작은 판 한 장. card: 960 이하 판 전부(srcset). big: 만든 폭 전부(srcset), url 은 960 이하 가장 큰 판, large 는 가장 큰 판.
 */
function localExtra<T extends Photo>(p: T, slot: PhotoSlot): T {
  const ws = p.ws!;
  const hs = p.hs ?? [];
  const file = p.file!;
  const set = (list: number[]) => list.map((w) => `${xUrl(file, w)} ${w}w`).join(", ");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { large, lw, lh, srcset, small, ...rest } = p;
  const hOf = (w: number) => (hs[ws.indexOf(w)] ? { h: hs[ws.indexOf(w)] } : {});
  if (slot === "small") return { ...rest, url: xUrl(file, ws[0]), small: xUrl(file, ws[0]), w: ws[0], ...hOf(ws[0]) } as T;
  if (slot === "card") {
    const list = ws.filter((w) => w <= CARD_MAX);
    const use = list.length ? list : [ws[0]];
    return { ...rest, url: xUrl(file, use[0]), small: xUrl(file, use[0]), w: use[0], ...hOf(use[0]), ...(use.length > 1 ? { srcset: set(use) } : {}) } as T;
  }
  const base = ws.filter((w) => w <= 960).at(-1) ?? ws[0];
  const top = ws[ws.length - 1];
  return {
    ...rest,
    url: xUrl(file, base),
    w: base,
    ...hOf(base),
    ...(top > base ? { large: xUrl(file, top), lw: top, ...(hs[ws.length - 1] ? { lh: hs[ws.length - 1] } : {}) } : {}),
    ...(ws.length > 1 ? { srcset: set(ws) } : {}),
  } as T;
}

// 첫 화면 넘기기 판·사이트 소개 쪽이 대표 사진 대신 따로 고른 사진(사진 번호). 동궁과 월지(p47)는 대표사진이 제3유형이라
// coverPhoto 가 목록 첫 장 3029037(가로 940, 큰 판 없음)을 고르므로 관광정보 3422660 '동궁과 월지 (2)'(제1유형, 큰 판 1619×1080)를 골랐다(09-26).
// 도구/21_사진_줄이기.py 가 이 표를 읽어 큰 자리 판을 만든다.
const HERO_PICK: Record<string, string> = { p47: "3422660" };

/** 첫 화면 넘기기 판·사이트 소개 쪽 사진(큰 자리): 따로 고른 사진이 있으면 그것, 없으면 coverPhoto(잘라 써도 되는 제1유형). 줄여 둔 판으로 */
export function heroPhoto(id: string): Photo | null {
  const pick = HERO_PICK[id];
  const p = (pick && photosOf(id).find((x) => numOf(x.url) === pick)) || coverPhoto(id);
  return p ? localPhoto(p, "big") : null;
}

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
  const all = type1List(id).filter((p) => !p.noCover);
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
// 관광정보 제1유형이고 줄여 둔 판이 있으면 그것(localPhoto "big")을 쓴다: url 은 가장 큰 판, srcset 은 만든 폭 전부(sizes 는 SIZES.banner).
// "/list"·"/places"의 월정교 3052894 는 주소가 /cms/resource_photo/ 이고 콘텐츠랩 목록에 같은 번호가 있어(촬영자 황성훈) 줄여 두지 않고
// 관광공사 서버의 큰 판 그대로다(09-27 점검).
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
  // 줄여 둔 판이 있으면 그것(url 은 가장 큰 판, srcset 은 만든 폭 전부)
  const loc = hit ? localPhoto(hit, "big") : null;
  if (loc?.srcset)
    return { url: loc.large ?? loc.url, w: loc.lw ?? loc.w, h: loc.lh ?? loc.h, srcset: loc.srcset, type: "Type1", from: loc.from, placeId: b.placeId, placeName: b.placeName };
  if (hit?.large) return { url: hit.large, w: hit.lw, h: hit.lh, type: "Type1", from: hit.from, by: hit.by, placeId: b.placeId, placeName: b.placeName };
  // 고른 사진에 큰 판이 없으면 고른 사진 그대로(같은 관광지의 큰 사진 bigPhoto(placeId)로 바꿀지는 사용자가 정한다).
  return { url: b.url, ...(hit?.w ? { w: hit.w, h: hit.h } : {}), type: "Type1", from: hit?.from ?? "tourapi", placeId: b.placeId, placeName: b.placeName };
}

// ─── 권역 사진(휴대전화 전체메뉴의 권역 카드) ───
// 권역에 든 이름난 곳 하나의 대표사진(관광정보 대표사진이 제1유형인 곳). 권역 다섯이던 때 카드(첨성대·불국사·문무대왕릉·
// 화랑의언덕·옥산서원) 가운데 그 곳이 든 권역의 카드는 그대로 두고, 서악·북부권은 옥산서원(세계유산)을 남겼다.
// 새로 고른 둘: 보문관광단지권 = 권역 이름과 같은 곳, 남산권 = 오릉(세계유산 대릉원지구, 경주시 남산권 목록 첫 항목).
const AREA_PHOTO_PLACE: Record<AreaKey, string> = {
  bomun: "p49", // 보문관광단지
  city: "p39", // 첨성대
  bulguk: "p34", // 불국사
  east: "p29", // 문무대왕릉
  namsan: "p24", // 오릉
  seoak: "p04", // 옥산서원
};
/** 권역 대표 사진(제1유형, 잘라 써도 됨. 작은 칸이라 줄여 둔 480 판이 있으면 그것). 없으면 null */
export function areaPhoto(key: AreaKey): (Photo & { placeId: string }) | null {
  const id = AREA_PHOTO_PLACE[key];
  const p = coverPhoto(id);
  return p ? { ...localPhoto(p, "small"), placeId: id } : null;
}
