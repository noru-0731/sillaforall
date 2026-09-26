import type { Metadata, Viewport } from "next";
// KRDS HTML 컴포넌트 키트 CSS(공공누리 제1유형)를 먼저, 이 사이트의 틀 CSS(궁능 누리집 모양)를 나중에 읽는다.
import "@/styles/krds/css/component/output.css";
import "./globals.css";
import SiteHeader, { type AreaCard } from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { DisplaySettingsProvider } from "@/components/layout/DisplaySettings";
import { RouteTop, ToTop } from "@/components/layout/PageTop";
import { AREA_LINKS, SITE_NAME } from "@/site/ia";
import { areaPhoto, photoCreditOf } from "@/data/photos";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "경주 관광지 61곳의 위치와 무장애 정보를 모은 안내 사이트",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// 휴대전화 전체메뉴 맨 위 권역 사진 카드(제1유형 사진)와 그 출처(짧은 꼴). photos.json을 클라이언트로 보내지 않으려고 여기서 고른다.
const areaCards: AreaCard[] = AREA_LINKS.map((a) => {
  const ph = areaPhoto(a.key);
  return { key: a.key, label: a.label, href: a.href, photo: ph?.url ?? null, credit: ph ? photoCreditOf(ph) : null };
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  // data-scroll-behavior: KRDS reset 의 html scroll-behavior: smooth 를 Next 가 쪽 옮길 때만 끄게 한다(없으면 새 쪽이 맨 위가 아닌 자리에서 열림, components/layout/PageTop.tsx)
  return (
    <html lang="ko" data-krds-mode="light" data-scroll-behavior="smooth">
      <body>
        <DisplaySettingsProvider>
          <div id="wrap">
            <div id="krds-skip-link">
              <a href="#contents">본문 바로가기</a>
            </div>
            <SiteHeader areaCards={areaCards} />
            <main>{children}</main>
            <SiteFooter />
            <ToTop />
          </div>
          <RouteTop />
        </DisplaySettingsProvider>
      </body>
    </html>
  );
}
