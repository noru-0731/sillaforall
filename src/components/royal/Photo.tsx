// 사진 한 장. 공공누리 제3유형(변경 금지) 사진은 fit을 무시하고 자르지 않는다(contain + 단색 바탕).
// 제1유형은 fit="cover"(기본)로 틀에 맞춰 잘라 쓴다. photo가 없으면 회색 판 + "사진 준비 중".
// 크기: 부모가 정하거나 ratio("16/9" 등)·height로 준다. 사진 위에 글자를 겹치지 않는다(겹침 글자는 사진 밖에).
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
}: {
  photo: Pick<PhotoData, "url" | "type"> | null | undefined;
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
  return (
    <span className={cls} style={style} data-kogl={photo.type}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={alt} loading={loading} decoding="async" style={!contain && position ? { objectPosition: position } : undefined} />
    </span>
  );
}
