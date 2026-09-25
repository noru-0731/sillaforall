// 작은 공통 부품: 검정 띠 제목, 아이콘 + 소제목, 어긋난 테두리 틀, ⓘ 안내 상자, 검정 동그라미 단추, ※ 줄.
// 모두 서버·클라이언트 어디서나 쓸 수 있다(CircleButton의 onClick은 클라이언트 컴포넌트 안에서만).
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";

/** 검정 띠 제목(궁능 오시는 길 "주차 및 요금안내"). href를 주면 링크(쪽 안 이동 등). */
export function BlackBar({ children, href, id, as = "h3" }: { children: React.ReactNode; href?: string; id?: string; as?: "h2" | "h3" | "p" }) {
  if (href)
    return (
      <a className="rc-blackbar" href={href} id={id}>
        {children}
      </a>
    );
  const T = as;
  return (
    <T className="rc-blackbar" id={id}>
      {children}
    </T>
  );
}

/** 아이콘 + 소제목(궁능 오시는 길 "지하철"). 아래 1px 선. plain이면 선 없이. */
export function IconHeading({
  icon,
  children,
  as = "h3",
  plain,
  id,
}: {
  icon: IconName;
  children: React.ReactNode;
  as?: "h2" | "h3" | "h4" | "p";
  plain?: boolean;
  id?: string;
}) {
  const T = as;
  return (
    <T className={`rc-iconhead${plain ? " rc-iconhead--plain" : ""}`} id={id}>
      <Icon name={icon} size={26} strokeWidth={1.6} />
      <span>{children}</span>
    </T>
  );
}

/** 사진 오른쪽 아래로 어긋난 1px 테두리 틀(궁능 소개 쪽 큰 사진). 안에 <Photo>를 넣는다. */
export function OffsetPhoto({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rc-offset${className ? " " + className : ""}`}>{children}</div>;
}

/** ⓘ 회색 안내 상자 */
export function InfoBox({ title, children, className }: { title?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rc-infobox${className ? " " + className : ""}`}>
      <Icon name="info" size={24} strokeWidth={1.8} />
      <div>
        {title && <strong className="rc-infobox__tit">{title}</strong>}
        {children}
      </div>
    </div>
  );
}

/** 검정 동그라미 단추(→, 큰 + 등). label은 읽기 도구용 글(화면에는 안 보임). */
export function CircleButton({
  icon = "arrow-right",
  label,
  href,
  onClick,
  size = "md",
  variant = "ink",
  className,
}: {
  icon?: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
  size?: "md" | "lg";
  variant?: "ink" | "line";
  className?: string;
}) {
  const cls = `rc-cbtn${size === "lg" ? " rc-cbtn--lg" : ""}${variant === "line" ? " rc-cbtn--line" : ""}${className ? " " + className : ""}`;
  const inner = (
    <>
      <Icon name={icon} size={size === "lg" ? 30 : 22} strokeWidth={1.8} />
      <span className="sr-only">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className={cls} title={label}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={cls} onClick={onClick} title={label}>
      {inner}
    </button>
  );
}

/** ※ 줄(안내 문장 목록) */
export function TipList({ items, className }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={`rc-tips${className ? " " + className : ""}`}>
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}
