import type { Metadata, Viewport } from "next";
// KRDS HTML 컴포넌트 키트 CSS(공공누리 제1유형)를 먼저, 이 사이트의 틀 CSS(궁능 누리집 모양)를 나중에 읽는다.
import "@/styles/krds/css/component/output.css";
import "./globals.css";
import SiteHeader, { type AreaCard } from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { DisplaySettingsProvider } from "@/components/layout/DisplaySettings";
import { AREA_LINKS, SITE_NAME } from "@/site/ia";
import { areaPhoto } from "@/data/photos";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "경주 관광지 61곳의 위치와 무장애 정보를 모은 안내 사이트",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// 휴대전화 전체메뉴 맨 위 권역 사진 카드(제1유형 사진). photos.json을 클라이언트로 보내지 않으려고 여기서 고른다.
const areaCards: AreaCard[] = AREA_LINKS.map((a) => ({ key: a.key, label: a.label, href: a.href, photo: areaPhoto(a.key)?.url ?? null }));

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
