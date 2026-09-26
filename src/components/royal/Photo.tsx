// 사진 한 장. 공공누리 제3유형(변경 금지) 사진은 fit을 무시하고 자르지 않는다(contain + 단색 바탕).
// 제1유형은 fit="cover"(기본)로 틀에 맞춰 잘라 쓴다. photo가 없으면 회색 판 + "등록된 사진이 없습니다."(궁능 빈 자리 틀).
// 크기: 부모가 정하거나 ratio("16/9" 등)·height로 준다. 사진 위에 글자를 겹치지 않는다(겹침 글자는 사진 밖에. 제1유형 출처 딱지만 예외, 아래).
// 출처(credit, 짧은 꼴 "ⓒ한국관광공사" 등): 제1유형은 사진 구석(creditAt, 기본 오른쪽 아래)에 작은 반투명 검정 딱지로 얹고,
//   제3유형은 사진 위에 얹지 않고 사진 틀 바로 아래 오른쪽 한 줄(.rc-pcredit-below)로 둔다(틀 뒤 형제로 그리므로 부모가 자리를 준다).
//   딱지 글은 보이는 글 그대로 읽힌다(대체 글 alt와 따로).
// 큰 판: photo에 large(같은 사진의 가로 1,600픽셀 안팎 판)가 있으면 srcset으로 함께 주어, 넓은 화면·고해상도 화면에서는 브라우저가 큰 판을 받는다.
//   sizes(기본 "100vw")는 이 사진이 화면에서 차지하는 너비다. 카드처럼 작은 자리에는 large를 넘기지 않거나 sizes를 작게 준다.
// 사진 파일은 관광공사 서버 주소를 그대로 쓴다(한국관광콘텐츠랩 저작권 정책: 콘텐츠 캐싱(로컬서버 저장방식) 금지).
import type { Photo as PhotoData } from "@/data/photos";

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
}: {
  photo: (Pick<PhotoData, "url" | "type"> & Partial<Pick<PhotoData, "w" | "large" | "lw" | "from" | "by">>) | null | undefined;
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
  /** large가 있을 때만 쓴다. 이 사진이 화면에서 차지하는 너비(img sizes 값) */
  sizes?: string;
  /** 사진 곁 출처(짧은 꼴). 없으면 적지 않는다 */
  credit?: string | null;
  /** 제1유형 출처 딱지를 얹을 구석: br 오른쪽 아래(기본), bl 왼쪽 아래, tr 오른쪽 위, tl 왼쪽 위 */
  creditAt?: CreditCorner;
}) {
  const style: React.CSSProperties = { aspectRatio: ratio, height };
  if (!photo) {
    return (
      <span className={`rc-photo rc-photo--empty${className ? " " + className : ""}`} style={{ ...style, minHeight: ratio || height ? undefined : "20rem" }}>
        등록된 사진이 없습니다.
      </span>
    );
  }
  const contain = photo.type === "Type3" || fit === "contain";
  const cls = `rc-photo${contain ? " rc-photo--contain" : ""}${bg === "dark" ? " rc-photo--dark" : ""}${!ratio && !height ? " rc-photo--auto" : ""}${className ? " " + className : ""}`;
  // 큰 판이 있으면 두 판을 너비와 함께 준다(작은 판 너비를 모르면 940으로 본다. 관광공사 사진 목록의 보통 너비).
  const srcSet = photo.large && photo.large !== photo.url ? `${photo.url} ${photo.w ?? 940}w, ${photo.large} ${photo.lw ?? 1620}w` : undefined;
  const onPhoto = !!credit && photo.type === "Type1";
  const frame = (
    <span className={cls} style={style} data-kogl={photo.type} data-from={photo.from} data-by={photo.by}>
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
    </span>
  );
  if (!credit || onPhoto) return frame;
  return (
    <>
      {frame}
      <CreditBelow text={credit} />
    </>
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
