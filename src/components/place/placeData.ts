// 관광지 쪽(61곳 × 5쪽)이 함께 쓰는 자료 도우미. 서버 컴포넌트에서만 부른다(photos.json을 클라이언트로 보내지 않으려고).
import { areaOf, areas, byName, places } from "@/data";
import type { Place } from "@/data";
import { anyPhoto, coverPhoto, localPhoto, photoCreditOf, photosOf, type1List } from "@/data/photos";
import type { Photo } from "@/data/photos";

export type { Place, Photo };

export { anyPhoto, coverPhoto, photosOf, type1List };

/** 권역 이름("보문관광단지권" 등) */
export function areaLabelOf(p: Place): string {
  const k = areaOf(p);
  return areas.find((a) => a.key === k)?.label ?? k;
}

/** 같은 권역 관광지(가나다순). self=false면 자기는 뺀다. */
export function sameArea(p: Place, self = true): Place[] {
  const k = areaOf(p);
  return places.filter((q) => areaOf(q) === k && (self || q.id !== p.id)).sort(byName);
}

/** 두 곳 사이 직선 거리(km, 대략) */
export function distKm(a: Pick<Place, "lat" | "lon">, b: Pick<Place, "lat" | "lon">): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 주변 관광지 한 줄: 그 곳과 직선거리(m). 좌표를 빌린 곳(approx)이 한쪽이라도 끼면 거리는 null(무장애 시안 규칙과 같음) */
export type NearPlace = { place: Place; distM: number | null };

/** 서브메인 아래 "주변 관광지": 같은 권역에서 가까운 차례로 n곳과 직선거리 */
export function nearby(p: Place, n = 9): NearPlace[] {
  return sameArea(p, false)
    .map((q) => ({ q, d: distKm(p, q) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => ({ place: x.q, distM: p.approx || x.q.approx ? null : Math.round(x.d * 1000) }));
}

/** 서브메인 "연관 관광지"(09-28): 같은 연관 관광지 묶음(places.json cluster, 데이터랩 「중심-연관 관광지 지도」로 묶은 곳)의 다른 곳을
 *  권역과 상관없이 가까운 차례로. 묶음이 없는 곳은 빈 목록 */
export function hubMates(p: Place): NearPlace[] {
  if (!p.cluster) return [];
  return places
    .filter((q) => q.cluster === p.cluster && q.id !== p.id)
    .map((q) => ({ q, d: distKm(p, q) }))
    .sort((a, b) => a.d - b.d)
    .map((x) => ({ place: x.q, distM: p.approx || x.q.approx ? null : Math.round(x.d * 1000) }));
}

/** 직선거리 글: 1km 아래는 m(무장애 시안 "직선거리 131m" 꼴), 1km부터는 km 소수 한 자리 */
export function fmtDist(m: number): string {
  return m < 1000 ? `${m.toLocaleString("ko-KR")}m` : `${(m / 1000).toFixed(1)}km`;
}

/** credit: 그 사진의 출처(짧은 꼴: "ⓒ한국관광공사" / "ⓒ한국관광콘텐츠랩-촬영자").
 *  srcset: 관광정보 제1유형이고 줄여 둔 판이 있으면 여러 폭(localPhoto "big"). 부품은 SIZES.nearby 와 함께 쓴다 */
export type NearbySlide = { id: string; name: string; dong: string; url: string; srcset?: string; credit: string };

/**
 * 서브메인 오른쪽 넘기기 판: 같은 권역 다른 관광지의 제1유형 사진(가까운 차례).
 * 같은 권역에 제1유형 사진이 있는 곳이 하나도 없으면 권역을 가리지 않고 가까운 곳에서 고른다(권역 여섯에서는 그런 곳이 없다).
 */
export function nearbySlides(p: Place, n = 8): NearbySlide[] {
  const pick = (list: Place[]) =>
    list
      .map((q) => ({ q, d: distKm(p, q), c: coverPhoto(q.id) }))
      .filter((x) => x.c)
      .sort((a, b) => a.d - b.d)
      .slice(0, n)
      .map((x) => {
        const m = localPhoto(x.c!, "big");
        return { id: x.q.id, name: x.q.name, dong: x.q.dong, url: m.url, ...(m.srcset ? { srcset: m.srcset } : {}), credit: photoCreditOf(x.c!) };
      });
  const same = pick(sameArea(p, false));
  if (same.length) return same;
  return pick(places.filter((q) => q.id !== p.id));
}

// 관광공사 분류 → 띠 1 문장("경주의 {분류} {이름}을 소개합니다.")에 넣을 낱말.
// 궁능 문장 "조선의 법궁 경복궁을 소개합니다."의 "법궁" 자리. 분류가 여러 낱말이면 하나만 골랐다. 사용자가 고칠 수 있다.
const CATEGORY_WORD: Record<string, string> = {
  "고분, 능": "고분",
  "골목길, 문화거리": "문화거리",
  "기타역사유적지": "역사 유적지",
  "마을관광지": "마을",
  "미술관/화랑": "미술관",
  "불교": "사찰",
  "산, 고개, 오름, 봉우리": "산",
  "성ㆍ산성ㆍ성곽": "성곽",
  "연못·늪": "연못",
  "타워 / 전망대": "전망대",
  "항구/포구": "항구",
  "해변. 해수욕장": "해변",
  "해안절경": "해안 절경",
};
export function categoryWord(p: Place): string | null {
  if (!p.category) return null;
  return CATEGORY_WORD[p.category] ?? p.category;
}

/** 문의 글에서 전화번호 하나(첫 번호)를 뽑는다. "경주시청 관광컨벤션과 054-779-6082" → "054-779-6082" */
export function phoneOf(contact: string | null): string | null {
  if (!contact) return null;
  const m = contact.match(/0\d{1,2}-\d{3,4}-\d{4}|1\d{3}-\d{4}/);
  return m ? m[0] : null;
}

/**
 * 서브메인 사진 띠 4개의 제1유형 사진: 제1유형 목록에서 서로 다른 장. 맨 위 큰 사진과 겹치지 않게 그것은 맨 뒤로 돌린다.
 * 모자라면 null. 제1유형은 띠 칸에 맞춰 잘라 쓴다.
 */
export function stripPhotos(id: string, heroUrl: string | null): (Photo | null)[] {
  const list = type1List(id);
  const ordered = [...list.filter((x) => x.url !== heroUrl), ...list.filter((x) => x.url === heroUrl)];
  return [0, 1, 2, 3].map((i) => ordered[i] ?? null);
}

/** 서브메인 사진 띠 한 칸에 들어갈 것 */
export type StripSlot =
  | { kind: "type1"; photo: Photo } // 제1유형 한 장(띠 칸에 맞춰 자름)
  | { kind: "film"; photos: Photo[] } // 제3유형 여러 장(자르지 않고 띠 높이에 맞춰 나란히)
  | { kind: "empty" }; // 사진 없음(옅은 단색 판)

/** 제3유형 띠 한 칸에 놓는 최대 장 수(PC 950×135 칸에 가로 사진 4장 안팎) */
const FILM_MAX = 4;

/**
 * 서브메인 사진 띠 4개: 제1유형이 있으면 그 사진, 모자란 띠는 제3유형 사진 여러 장(필름 줄), 그것도 없으면 빈 판.
 * 제3유형은 띠마다 다른 사진부터 쓴다: 띠 한 칸 장 수 = 남는 사진을 모자란 띠 수로 나눈 값(2~4장, 사진 수 이하),
 * 띠마다 그 장 수만큼 이어서 가져가고, 끝에 닿으면 처음부터 다시 쓴다. 맨 위 큰 사진은 맨 뒤로 돌린다.
 */
export function stripSlots(id: string, heroUrl: string | null): StripSlot[] {
  const t1 = stripPhotos(id, heroUrl);
  // 제4유형(변경 금지, 주사암 1장)도 제3유형처럼 자르지 않는 필름 줄에 둔다
  const all3 = photosOf(id).filter((x) => x.type !== "Type1");
  const t3 = [...all3.filter((x) => x.url !== heroUrl), ...all3.filter((x) => x.url === heroUrl)];
  const need = t1.filter((x) => !x).length;
  const k = t3.length;
  const per = k && need ? Math.min(FILM_MAX, k, Math.max(2, Math.ceil(k / need))) : 0;
  let f = 0;
  return t1.map((ph): StripSlot => {
    if (ph) return { kind: "type1", photo: ph };
    if (!k) return { kind: "empty" };
    const start = (f * per) % k;
    f += 1;
    return { kind: "film", photos: Array.from({ length: per }, (_, t) => t3[(start + t) % k]) };
  });
}

/** 제3유형 필름 줄 한 칸의 출처(짧은 꼴). 같은 출처는 한 번만 적는다(제3유형은 모두 관광정보 사진이라 보통 "ⓒ한국관광공사" 하나) */
export function stripCredit(slot: { photos: Photo[] }): string {
  return [...new Set(slot.photos.map((ph) => photoCreditOf(ph)))].join(", ");
}

/** 사진 이름이 파일 이름("경북_경주_…_외부_06.jpg", "경주_보리사(경주) (2)")이면 쓰지 않는다. */
export function cleanPhotoName(name?: string | null): string | null {
  const t = (name ?? "").trim();
  if (!t) return null;
  if (/\.(jpe?g|png|gif|webp)$/i.test(t)) return null;
  if (t.includes("_")) return null;
  return t;
}

/** made: 관광공사 사진 이름이 없어 붙인 이름("{관광지} {n}", 열린관광 사진 이름 꼴이라 09-27부터 점선 없음). by: 관광사진 정보 사진의 촬영자.
 *  credit: 사진 곁 출처(짧은 꼴). from·lic: 어디서 온 사진과 채운 사진(국가유산청·위키미디어·경주시정뉴스)의 이용허락 칸(사진 아래 상자를 고른다) */
export type ViewerPhoto = {
  url: string;
  small: string;
  type: Photo["type"];
  name: string;
  made?: boolean;
  by?: string;
  credit: string;
  from?: Photo["from"];
  lic?: Photo["lic"];
};

/** 사진 쪽 넘기기에 넘길 사진 목록(보일 이름 포함). 이름이 없으면 "{관광지} {n}"(열린관광 사진 이름 꼴). */
export function viewerPhotos(p: Place): ViewerPhoto[] {
  return photosOf(p.id).map((ph, i) => {
    const clean = cleanPhotoName(ph.name);
    return {
      url: ph.url,
      small: ph.small ?? ph.url,
      type: ph.type,
      name: clean ?? `${p.name} ${i + 1}`,
      made: !clean,
      credit: photoCreditOf(ph),
      ...(ph.from ? { from: ph.from } : {}),
      ...(ph.from === "gallery" ? { by: ph.by ?? "" } : {}),
      ...(ph.lic ? { lic: ph.lic } : {}),
    };
  });
}

/** 가장 가까운 등록 관광지: 글 그대로 + (61곳 안에 있으면) 그 관광지 */
export function nearestRegistered(p: Place): { text: string; name: string; place: Place | null } | null {
  const t = p.nearestRegistered;
  if (!t) return null;
  const name = t.replace(/\s*\(직선[^)]*\)\s*$/, "").trim();
  const hit = places.find((q) => q.name === name || q.rawName === name || q.apiName === name) ?? null;
  return { text: t, name, place: hit };
}

/**
 * 관광공사 개요 문단(data/overview.json)을 첫 문장과 나머지 문단으로 나눈다(소개 쪽: 첫 문장은 굵게, 나머지는 본문).
 * 첫 문장은 첫 문단에서 "다." 또는 "요." 다음에 빈칸이나 끝이 오는 자리까지. 첫 문단의 남은 글이 본문 첫 문단이 된다.
 */
export function splitParas(paras: string[]): { first: string; rest: string[] } | null {
  if (!paras.length) return null;
  const [p0, ...more] = paras;
  const m = p0.match(/^[\s\S]*?[다요]\.(?=\s|$)/);
  const first = (m ? m[0] : p0).trim();
  const rest = [p0.slice(m ? m[0].length : p0.length).trim(), ...more].filter(Boolean);
  return { first, rest };
}

/** 카카오맵 길찾기 주소(새 창). 이름·좌표만 넣는다. */
export const kakaoTo = (p: Place) => `https://map.kakao.com/link/to/${encodeURIComponent(p.name)},${p.lat},${p.lon}`;
