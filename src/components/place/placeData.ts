// 관광지 쪽(61곳 × 5쪽)이 함께 쓰는 자료 도우미. 서버 컴포넌트에서만 부른다(photos.json을 클라이언트로 보내지 않으려고).
import { areaOf, areas, byName, places } from "@/data";
import type { Place } from "@/data";
import { anyPhoto, coverPhoto, creditLines, photoCreditOf, photosOf, type1List } from "@/data/photos";
import type { Photo } from "@/data/photos";

export type { Place, Photo };

export { anyPhoto, coverPhoto, photosOf, type1List };

/** 권역 이름("보문·불국사" 등) */
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

/** 서브메인 아래 "주변 관광지": 같은 권역에서 가까운 차례로 n곳 */
export function nearby(p: Place, n = 9): Place[] {
  return sameArea(p, false)
    .map((q) => ({ q, d: distKm(p, q) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.q);
}

/** credit: 그 사진의 출처 한 줄(관광정보 / 관광사진 정보 촬영자) */
export type NearbySlide = { id: string; name: string; dong: string; url: string; credit: string };

/**
 * 서브메인 오른쪽 넘기기 판: 같은 권역 다른 관광지의 제1유형 사진(가까운 차례).
 * 같은 권역에 제1유형 사진이 있는 곳이 하나도 없으면(서쪽·남쪽 읍면의 화랑의언덕 등) 권역을 가리지 않고 가까운 곳에서 고른다.
 */
export function nearbySlides(p: Place, n = 8): NearbySlide[] {
  const pick = (list: Place[]) =>
    list
      .map((q) => ({ q, d: distKm(p, q), c: coverPhoto(q.id) }))
      .filter((x) => x.c)
      .sort((a, b) => a.d - b.d)
      .slice(0, n)
      .map((x) => ({ id: x.q.id, name: x.q.name, dong: x.q.dong, url: x.c!.url, credit: photoCreditOf(x.c!) }));
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
  const all3 = photosOf(id).filter((x) => x.type === "Type3");
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

/**
 * 띠에 실제로 쓴 사진대로 출처 줄: "사진: 한국관광공사 관광정보, 공공누리 제1유형·제3유형",
 * 관광사진 정보 사진이 있으면 " / 사진: ⓒ한국관광콘텐츠랩-촬영자, 공공누리 제1유형"을 잇는다. 사진이 없으면 null
 */
export function stripCredit(slots: StripSlot[]): string | null {
  const used = slots.flatMap((x) => (x.kind === "type1" ? [x.photo] : x.kind === "film" ? x.photos : []));
  const lines = creditLines(used);
  return lines.length ? lines.join(" / ") : null;
}

/** 사진 이름이 파일 이름("경북_경주_…_외부_06.jpg", "경주_보리사(경주) (2)")이면 쓰지 않는다. */
export function cleanPhotoName(name?: string | null): string | null {
  const t = (name ?? "").trim();
  if (!t) return null;
  if (/\.(jpe?g|png|gif|webp)$/i.test(t)) return null;
  if (t.includes("_")) return null;
  return t;
}

/** made: 관광공사 사진 이름이 없어 새로 지은 이름("{관광지} 사진 {n}", 궁능에 짝 없음 → 화면에서 <Ph>). by: 관광사진 정보 사진의 촬영자 */
export type ViewerPhoto = { url: string; small: string; type: Photo["type"]; name: string; made?: boolean; by?: string };

/** 사진 쪽 넘기기에 넘길 사진 목록(보일 이름 포함). 이름이 없으면 "{관광지} 사진 {n}". */
export function viewerPhotos(p: Place): ViewerPhoto[] {
  return photosOf(p.id).map((ph, i) => {
    const clean = cleanPhotoName(ph.name);
    return {
      url: ph.url,
      small: ph.small ?? ph.url,
      type: ph.type,
      name: clean ?? `${p.name} 사진 ${i + 1}`,
      made: !clean,
      ...(ph.from === "gallery" ? { by: ph.by ?? "" } : {}),
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
 * 관광공사 개요를 첫 문장과 나머지 문단으로 나눈다(소개 쪽: 첫 문장은 굵게, 나머지는 본문).
 * 문단은 줄바꿈으로 나눈다.
 */
export function splitOverview(text: string | null): { first: string; rest: string[] } | null {
  const t = (text ?? "").trim();
  if (!t) return null;
  const m = t.match(/^[\s\S]*?[다요]\.(?=\s|$)/);
  const first = (m ? m[0] : t).trim();
  const rest = t
    .slice(m ? m[0].length : t.length)
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { first, rest };
}

/** 카카오맵 길찾기 주소(새 창). 이름·좌표만 넣는다. */
export const kakaoTo = (p: Place) => `https://map.kakao.com/link/to/${encodeURIComponent(p.name)},${p.lat},${p.lon}`;
