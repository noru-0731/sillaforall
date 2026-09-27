// 링크 미리보기(오픈그래프·트위터 카드). 카카오톡·문자·SNS 에 주소를 붙였을 때 뜨는 제목·설명·사진.
// - 사이트 기본(app/layout.tsx): 제목 SITE_NAME("누구나 신라"), 설명은 meta description 그대로, 그림은 로고 그림 /og.png(09-27; 전에는 첫 쪽 넘기기 첫 장(HERO_IDS 첫째,
//   불국사 p34)의 제1유형 사진 큰 판). og:url 은 쪽마다 배포 주소 + 그 쪽 경로(첫 쪽은 app/page.tsx, 관광지가 아닌 쪽은 pageMetadata,
//   관광지 쪽은 placeMetadata). 레이아웃에 두면 모든 쪽이 첫 쪽 주소를 제 주소로 내세우게 되어 쪽마다 둔다(09-27 점검).
// - 관광지가 아닌 쪽: og 제목·설명·사진은 사이트 기본 그대로(명세), og:url 만 그 쪽 주소.
// - 관광지 쪽(places/[id] 과 그 아래 쪽): 제목은 <title> 과 같은 "대릉원 | 누구나 신라" 꼴, 사진은 그 곳의 제1유형 사진(coverPhoto)
//   큰 판, 없으면 사이트 기본. 제3유형 사진은 쓰지 않는다(미리보기가 사진을 잘라 보이므로 변경금지 사진은 안 됨).
// 주소는 metadataBase(배포 주소) 기준으로 풀린다.
import type { Metadata } from "next";
import { SITE_NAME } from "./ia";
import { coverPhoto, largeUrl, type Photo } from "@/data/photos";

/** 배포 주소(Vercel). 09-27 사용자 결정으로 gyeongju-guide.vercel.app → sillaway.vercel.app → sillaforall.vercel.app(옛 주소는 넘김, next.config) */
export const SITE_URL = "https://sillaforall.vercel.app";
/** meta description(사이트 전체) */
export const SITE_DESC = "경주 관광지 61곳의 위치와 무장애 정보를 모은 안내 사이트";

/** 첫 쪽 큰 넘기기 배너의 곳 차례(불국사, 첨성대, 동궁과 월지, 대릉원, 석굴암). 차례는 사용자가 바꿀 수 있다. app/page.tsx 가 쓴다 */
export const HERO_IDS = ["p34", "p39", "p47", "p51", "p28"];

type OgImage = { url: string; width?: number; height?: number };

function ogImageOf(ph: Photo): OgImage {
  const w = ph.large ? ph.lw : ph.w;
  const h = ph.large ? ph.lh : ph.h;
  return { url: largeUrl(ph), ...(w && h ? { width: w, height: h } : {}) };
}

/**
 * 사이트 기본 그림: 로고 그림 public/og.png(1200×630, 표장 + 이름, 도구/24_로고_그림.mjs 가 만듦).
 * 09-27 사용자: 카카오톡으로 보낼 때 로고가 들어가게. 관광지 쪽은 그 곳 사진(아래 placeMetadata), 그 곳 제1유형 사진이 없으면 이 그림.
 */
const SITE_IMAGE: OgImage | null = { url: "/og.png", width: 1200, height: 630 };

/** 사이트 기본 오픈그래프(og:url 없이) */
export const SITE_OG = {
  title: SITE_NAME,
  description: SITE_DESC,
  type: "website",
  locale: "ko_KR",
  ...(SITE_IMAGE ? { images: [SITE_IMAGE] } : {}),
} satisfies Metadata["openGraph"];

/** 관광지가 아닌 쪽 메타데이터: title 은 쪽 제목, og 는 사이트 기본에 og:url(그 쪽 경로, metadataBase 로 배포 주소가 붙는다)만 더한다 */
export function pageMetadata(title: string, path: string): Metadata {
  return { title, openGraph: { ...SITE_OG, url: path } };
}

/** 관광지 쪽 메타데이터: title 은 쪽 제목(틀 "%s | 누구나 신라"가 붙는다), og 제목은 <title> 과 같은 글, 사진은 그 곳 제1유형 사진 */
export function placeMetadata(id: string, title: string, path: string): Metadata {
  const ph = coverPhoto(id);
  const img = ph && ph.type === "Type1" ? ogImageOf(ph) : SITE_IMAGE;
  return {
    title,
    openGraph: { ...SITE_OG, title: `${title} | ${SITE_NAME}`, url: path, ...(img ? { images: [img] } : {}) },
  };
}
