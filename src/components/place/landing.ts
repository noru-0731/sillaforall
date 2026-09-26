// 이어 읽기(쪽 끝 이전·다음: PageSteps, MenuSteps)와 주변 관광지 링크가 새 쪽을 열 자리(09-26 평가 04 A④ 고침).
// 그대로 맨 위에서 열면 휴대전화(특히 글자 가장 크게)의 첫 화면에 사진·배너만 있고 곳 이름이 1화면 넘게 아래에 있었다.
// - 서브 쪽(소개·사진·무장애 정보·오시는 길, 무장애 정보 메뉴 쪽): #contents(빵부스러기 + 쪽 제목 h1). 머리 밑에 가리지 않게 globals.css 의 #contents scroll-margin-top.
// - 관광지 서브메인: 쪽 제목 h1 이 화면에 숨겨져 있어, 곳 이름이 보이는 첫 제목 '○○ 관람 도우미'(h2) 자리. Submain.module.css 의 scroll-margin-top.
// 서버·클라이언트 어디서나 부른다(자료를 부르지 않는다).
export const SUBMAIN_TITLE_ID = "quick-tit";

/** 관광지 서브메인을 '○○ 관람 도우미' 제목 자리로 여는 주소 */
export const placeLand = (id: string) => `/places/${id}#${SUBMAIN_TITLE_ID}`;

/** 서브 쪽을 본문 시작(빵부스러기·쪽 제목) 자리로 여는 주소 */
export const titleLand = (href: string) => `${href}#contents`;

/** 위 두 도착 자리의 # 이름. 공유 단추가 주소를 건넬 때 이 # 는 뗀다(받은 사람은 쪽 맨 위에서 열리게, 09-27 점검) */
export const LAND_HASHES = ["contents", SUBMAIN_TITLE_ID];
