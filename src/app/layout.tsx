import type { Metadata, Viewport } from "next";
// KRDS HTML 컴포넌트 키트 CSS(공공누리 제1유형)를 먼저, 이 사이트의 틀 CSS(궁능 누리집 모양)를 나중에 읽는다.
import "@/styles/krds/css/component/output.css";
import "./globals.css";
import SiteHeader, { type AreaCard } from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { DisplaySettingsProvider } from "@/components/layout/DisplaySettings";
import { AREA_LINKS, SITE_NAME } from "@/site/ia";
import { areaPhoto, photoCreditOf } from "@/data/photos";
import { SITE_DESC, SITE_OG, SITE_URL } from "@/site/og";

// 링크 미리보기(site/og.ts): 사이트 기본 og 제목·설명·사진·종류·언어와 트위터 카드. og:url 은 쪽마다 그 쪽 주소로 둔다(site/og.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  openGraph: SITE_OG,
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// 휴대전화 전체메뉴 맨 위 권역 사진 카드(제1유형 사진)와 그 출처(짧은 꼴). photos.json을 클라이언트로 보내지 않으려고 여기서 고른다.
const areaCards: AreaCard[] = AREA_LINKS.map((a) => {
  const ph = areaPhoto(a.key);
  return { key: a.key, label: a.label, href: a.href, photo: ph?.url ?? null, credit: ph ? photoCreditOf(ph) : null };
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-krds-mode="light">
      <body>
        <DisplaySettingsProvider>
          <div id="wrap">
            <div id="krds-skip-link">
              <a href="#contents">본문 바로가기</a>
            </div>
            <SiteHeader areaCards={areaCards} />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </DisplaySettingsProvider>
      </body>
    </html>
  );
}
