// 공통 푸터(궁능유적본부 누리집 모양): 위 줄 링크 + 관련사이트 펼침, 아래 회색 판에 사이트 이름·만든 곳·출처.
// 정부 누리집이 아니므로 인증 마크·운영기관 식별자는 넣지 않는다. KRDS 출처 문장은 지우지 않는다.
import Link from "next/link";
import { SITE_NAME } from "@/site/ia";
import { Ph } from "./Ph";
import FooterRelated from "./FooterRelated";

export default function SiteFooter() {
  return (
    <footer className="rc-footer">
      <div className="rc-ft-top">
        <div className="rc-ft-inner">
          <ul className="rc-ft-links">
            <li>
              <Link href="/about/sources">자료 출처와 저작권</Link>
            </li>
            <li>
              <Link href="/about/guide">이용 안내</Link>
            </li>
            <li>
              <Link href="/sitemap">사이트맵</Link>
            </li>
          </ul>
          <FooterRelated />
        </div>
      </div>
      <div className="rc-ft-btm">
        <div className="rc-ft-inner">
          <p className="rc-ft-logo">{SITE_NAME}</p>
          <div className="rc-ft-txt">
            <p className="rc-ft-maker">
              만든 곳 <Ph>2026 한국관광 데이터랩 활용 경진대회 출품 팀</Ph>
            </p>
            <ul className="rc-ft-credit">
              <li>
                본 저작물은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 ‘범정부 UI/UX 디자인시스템(KRDS)’을
                이용하였으며, 해당 저작물은 ‘
                <a href="https://www.krds.go.kr" target="_blank" rel="noopener noreferrer" title="새 창 열림">
                  KRDS 디자인시스템 홈페이지(www.krds.go.kr)
                </a>
                ’에서 무료로 다운받으실 수 있습니다.
              </li>
              <li>관광지 사진과 소개글: 한국관광공사 관광정보(TourAPI)</li>
              <li>읍면동 경계선: 통계청 SGIS 행정구역 경계(2026년 7월), vuski/admdongkor 가공(CC BY 4.0)</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
