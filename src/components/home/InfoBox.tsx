// 안내 상자(제목 + 한두 줄). 서버 컴포넌트.
import s from "./InfoBox.module.css";

export default function InfoBox({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className={s.box}>
      <i className={`svg-icon ico-information-fill ${s.icon}`} aria-hidden="true"></i>
      <div className={s.body}>
        <p className={s.title}>{title}</p>
        {children && <div className={s.text}>{children}</div>}
      </div>
    </div>
  );
}
