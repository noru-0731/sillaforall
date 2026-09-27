// 사진 한 장. 공공누리 제3유형(변경 금지) 사진은 fit을 무시하고 자르지 않는다(contain + 단색 바탕).
// 제1유형은 fit="cover"(기본)로 틀에 맞춰 잘라 쓴다. photo가 없으면 회색 판 + "등록된 사진이 없습니다."(궁능 빈 자리 틀).
// 크기: 부모가 정하거나 ratio("16/9" 등)·height로 준다. 사진 위에 글자를 겹치지 않는다(겹침 글자는 사진 밖에. 제1유형 출처 딱지만 예외, 아래).
// 출처(credit, 짧은 꼴 "ⓒ한국관광공사" 등): 제1유형은 사진 구석(creditAt, 기본 오른쪽 아래)에 작은 반투명 검정 딱지로 얹고,
//   제3유형은 사진 위에 얹지 않고 사진 틀 바로 아래 오른쪽 한 줄(.rc-pcredit-below)로 둔다(틀 뒤 형제로 그리므로 부모가 자리를 준다).
//   딱지 글은 보이는 글 그대로 읽힌다(대체 글 alt와 따로).
// 여러 판: photo에 srcset(줄여 둔 판 여러 폭, data/photos.ts localPhoto)이 있으면 그것을, 없고 large(같은 사진의 가로 1,600픽셀 안팎 판)가
//   있으면 "url, large" 두 판을 srcset으로 준다. 어느 판을 받을지는 브라우저가 sizes(기본 "100vw")와 화면 밀도를 보고 고른다.
//   sizes 는 자리마다 아래 SIZES 의 값을 준다(휴대전화는 사진이 그려지는 폭 ÷ 1.25, 넓은 화면은 그려지는 폭. 아래 설명).
// 사진 파일 주소(09-27 사용자 결정 "제1유형만 줄여 둠"):
//   - 관광정보 제1유형(변경 가능): 자리에 맞게 줄여 둔 판(public/photos/t1, 도구/21_사진_줄이기.py). 없는 사진은 원 주소.
//   - 관광사진 정보(한국관광콘텐츠랩): 저작권 정책의 "콘텐츠 캐싱(로컬서버 저장방식) 금지" 때문에 관광공사 서버 원 주소 그대로.
//     관광정보 목록에 들어 있어도 콘텐츠랩 사진과 같은 그림(주소가 /cms/resource_photo/ 등)이면 원 주소 그대로.
//   - 제3유형(변경 금지): 줄이지 않고 관광공사 서버 원 주소 그대로.
//   어느 쪽이든 출처 표기는 같다.
// 안 뜬 사진(관광공사 서버가 막히거나 느려 오류): 깨진 그림 표시 대신 사진이 없을 때와 같은 빈 판을 그리고 사진 곁 출처도 숨긴다(FailHide.tsx).
import type { Photo as PhotoData } from "@/data/photos";
import FailHide from "./FailHide";

/**
 * 자리마다 img sizes 값. 휴대전화 폭(767 이하)은 사진이 그려지는 폭(CSS 픽셀) ÷ 1.25(= × 0.8), 768 이상은 그려지는 폭 그대로.
 * - 그려지는 폭: 잘라 채우는(cover) 자리에서 칸이 사진보다 세로로 길면 사진은 칸보다 넓게 그려지므로,
 *   가로:세로 3:2 사진이 그려지는 폭(칸 높이 × 1.5)으로 셈했다. 칸 크기는 09-27 잰 값(글자 기본 크기). 칸 크기를 바꾸면 여기도 고친다.
 * - 브라우저는 srcset 가운데 "sizes × 화면 밀도" 이상인 가장 작은 판을 고른다(09-27 크롬 잰 값). 그래서
 *   휴대전화는 파일 한 픽셀이 화면 픽셀 1.25개보다 넓게 늘어나지 않는 판 가운데 가장 작은 것을 받고
 *   (예: 목록 카드는 화면 밀도 3이면 720 판, 2이면 480 판), 넓은 화면은 늘어나지 않는 판을 받는다(첫 쪽 가운데 카드만 1.16배).
 * - 알맞은 판이 없으면 가장 큰 판을 받는다(카드 칸은 960 까지. 첫 쪽 카드는 휴대전화 화면 밀도 3에서 늘림 1.4~1.5배, 원 주소 940 때 1.4~1.5배).
 */
export const SIZES = {
  /** 첫 쪽 넘기기 판: 휴대전화 폭 × 345(3:2 사진은 가로 518), 768 이상 폭 전체 × 550(3:2 사진은 가로 825 이상) */
  hero: "(max-width: 518px) 414px, (max-width: 767px) 80vw, (max-width: 825px) 825px, 100vw",
  /** 관광지 서브메인 맨 위 큰 사진: 휴대전화 폭 × 400(3:2 사진은 가로 600), 넓은 화면 폭 전체(1024 이상은 - 80) × 400~506 */
  top: "(max-width: 600px) 480px, (max-width: 767px) 80vw, 100vw",
  /** 서브 쪽 맨 위 그림 띠: 폭 전체(1024 이상은 - 80) × 130~185 */
  banner: "(max-width: 767px) 80vw, 100vw",
  /** 소개 쪽 맨 위 사진(101:50): 1023 이하 폭 - 46, 1024~1279 폭 - 126, 넓은 화면 850~1010 */
  introTop: "(max-width: 767px) calc(80vw - 37px), (max-width: 1023px) calc(100vw - 46px), (max-width: 1279px) calc(100vw - 126px), 1010px",
  /** 사이트 소개 쪽 사진: 휴대전화 (폭 - 30) × 3/4 칸(3:2 사진은 칸 폭의 1.125배), 1119 이하 폭 - 30, 넓은 화면 870~1030 */
  about: "(max-width: 767px) calc(90vw - 27px), (max-width: 1119px) calc(100vw - 30px), 1030px",
  /** 주변 관광지 넘기기 판: 1279 이하 폭 - 30(휴대전화 390 은 360×214), 넓은 화면 468~532×430(3:2 사진은 가로 645) */
  nearby: "(max-width: 767px) calc(80vw - 24px), (max-width: 1279px) calc(100vw - 30px), 645px",
  /** 서브메인 사진 띠(대표 사진이 들 때만 여러 판): 1279 이하 폭 - 30 × 170, 넓은 화면 836~950 × 135 */
  strip: "(max-width: 767px) calc(80vw - 24px), (max-width: 1279px) calc(100vw - 30px), 950px",
  /** 첫 쪽 카드: 휴대전화 239~249 × 300~320, 768 이상 229~259 × 320~370 세로 칸(3:2 사진은 가로 450~555. 넓은 화면은 옆 카드 480 기준) */
  homeCard: "(max-width: 767px) 384px, 480px",
  /** 목록·거점 카드: 휴대전화 130×169, 768 이상 165×215 세로 칸(3:2 사진은 가로 254, 323) */
  listCard: "(max-width: 767px) 203px, 323px",
} as const;

export default function Photo({
  photo,
  alt,
  fit = "cover",
  ratio,
  height,
  bg = "light",
  className,
  loading = "lazy",
  position,
  sizes = "100vw",
  credit,
  creditAt = "br",
  onFail,
}: {
  photo: (Pick<PhotoData, "url" | "type"> & Partial<Pick<PhotoData, "w" | "large" | "lw" | "from" | "by" | "srcset">>) | null | undefined;
  /** 대체 글(뜻 없는 꾸밈 사진이면 "") */
  alt: string;
  fit?: "cover" | "contain";
  /** 가로/세로 비(예: "3/2", "16/9"). 없으면 height 또는 부모 크기 */
  ratio?: string;
  /** 높이(CSS 값, 예: "40rem") */
  height?: string;
  /** 제3유형·contain일 때 남는 곳 바탕: light #f7f7f7, dark #131313 */
  bg?: "light" | "dark";
  className?: string;
  loading?: "lazy" | "eager";
  /** cover일 때 object-position(예: "50% 30%") */
  position?: string;
  /** srcset·large가 있을 때만 쓴다. img sizes 값(자리마다 SIZES 의 값) */
  sizes?: string;
  /** 사진 곁 출처(짧은 꼴). 없으면 적지 않는다 */
  credit?: string | null;
  /** 제1유형 출처 딱지를 얹을 구석: br 오른쪽 아래(기본), bl 왼쪽 아래, tr 오른쪽 위, tl 왼쪽 위 */
  creditAt?: CreditCorner;
  /** 사진이 안 떴을 때 부모에게 알림(클라이언트 컴포넌트에서만. 틀 밖에 둔 출처 등을 부모가 숨길 때) */
  onFail?: () => void;
}) {
  const style: React.CSSProperties = { aspectRatio: ratio, height };
  const empty = (
    <span className={`rc-photo rc-photo--empty${className ? " " + className : ""}`} style={{ ...style, minHeight: ratio || height ? undefined : "20rem" }}>
      등록된 사진이 없습니다.
    </span>
  );
  if (!photo) return empty;
  const contain = photo.type === "Type3" || fit === "contain";
  const cls = `rc-photo${contain ? " rc-photo--contain" : ""}${bg === "dark" ? " rc-photo--dark" : ""}${!ratio && !height ? " rc-photo--auto" : ""}${className ? " " + className : ""}`;
  // 줄여 둔 판 여러 폭(srcset)이 있으면 그것. 없고 큰 판이 있으면 두 판을 너비와 함께 준다(작은 판 너비를 모르면 940으로 본다. 관광공사 사진 목록의 보통 너비).
  const srcSet =
    photo.srcset ?? (photo.large && photo.large !== photo.url ? `${photo.url} ${photo.w ?? 940}w, ${photo.large} ${photo.lw ?? 1620}w` : undefined);
  const onPhoto = !!credit && photo.type === "Type1";
  return (
    <FailHide
      as="span"
      className={cls}
      style={style}
      data-kogl={photo.type}
      data-from={photo.from}
      data-by={photo.by}
      fallback={empty}
      after={credit && !onPhoto ? <CreditBelow text={credit} /> : undefined}
      onFail={onFail}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={loading}
        decoding="async"
        style={!contain && position ? { objectPosition: position } : undefined}
      />
      {onPhoto && <CreditTag text={credit} at={creditAt} />}
    </FailHide>
  );
}

export type CreditCorner = "br" | "bl" | "tr" | "tl";

/** 좁은 칸에서 줄이 바뀔 때 "ⓒ"만 홀로 한 줄에 남지 않게 뒤 글자와 붙인다(보이지 않는 이음 글자 U+2060, 읽기 도구는 읽지 않는다) */
const glue = (t: string) => t.replace(/ⓒ/g, "ⓒ\u2060");

/** 제1유형 사진 구석에 얹는 출처 딱지. 부모(사진 틀)가 position: relative 여야 한다 */
export function CreditTag({ text, at = "br", className }: { text: string; at?: CreditCorner; className?: string }) {
  return <span className={`rc-pcredit rc-pcredit--${at}${className ? " " + className : ""}`}>{glue(text)}</span>;
}

/** 사진 틀 바로 아래 오른쪽 한 줄 출처(제3유형, 그리고 딱지가 사진을 덮는 좁은 칸의 제1유형) */
export function CreditBelow({ text, className }: { text: string; className?: string }) {
  return <span className={`rc-pcredit-below${className ? " " + className : ""}`}>{glue(text)}</span>;
}
