// 사진 한 장. 공공누리 제3유형(변경 금지) 사진은 fit을 무시하고 자르지 않는다(contain + 단색 바탕).
// 제1유형은 fit="cover"(기본)로 틀에 맞춰 잘라 쓴다. photo가 없으면 회색 판 + "사진 준비 중".
// 크기: 부모가 정하거나 ratio("16/9" 등)·height로 준다. 사진 위에 글자를 겹치지 않는다(겹침 글자는 사진 밖에).
// 큰 판: photo에 large(같은 사진의 가로 1,600픽셀 안팎 판)가 있으면 srcset으로 함께 주어, 넓은 화면·고해상도 화면에서는 브라우저가 큰 판을 받는다.
//   sizes(기본 "100vw")는 이 사진이 화면에서 차지하는 너비다. 카드처럼 작은 자리에는 large를 넘기지 않거나 sizes를 작게 준다.
// 사진 파일은 관광공사 서버 주소를 그대로 쓴다(한국관광콘텐츠랩 저작권 정책: 콘텐츠 캐싱(로컬서버 저장방식) 금지).
import type { Photo as PhotoData } from "@/data/photos";
import { Ph } from "@/components/layout/Ph";

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
}) {
  const style: React.CSSProperties = { aspectRatio: ratio, height };
  if (!photo) {
    return (
      <span className={`rc-photo rc-photo--empty${className ? " " + className : ""}`} style={{ ...style, minHeight: ratio || height ? undefined : "20rem" }}>
        <Ph>사진 준비 중</Ph>
      </span>
    );
  }
  const contain = photo.type === "Type3" || fit === "contain";
  const cls = `rc-photo${contain ? " rc-photo--contain" : ""}${bg === "dark" ? " rc-photo--dark" : ""}${!ratio && !height ? " rc-photo--auto" : ""}${className ? " " + className : ""}`;
  // 큰 판이 있으면 두 판을 너비와 함께 준다(작은 판 너비를 모르면 940으로 본다. 관광공사 사진 목록의 보통 너비).
  const srcSet = photo.large && photo.large !== photo.url ? `${photo.url} ${photo.w ?? 940}w, ${photo.large} ${photo.lw ?? 1620}w` : undefined;
  return (
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
    </span>
  );
}
