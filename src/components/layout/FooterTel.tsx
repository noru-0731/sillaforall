"use client";

// 푸터 "관광지별 연락처 ∨"(궁능 푸터 아래 판의 "관리소별 연락처" 회색 단추). 누르면 아래에 표가 펼쳐진다.
// 표는 서버(SiteFooter)에서 그려 children으로 받는다.
import { useId, useState } from "react";
import { Icon } from "@/components/icons";
import f from "./Footer.module.css";

export default function FooterTel({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={f.tel}>
      <button type="button" className={f.telBtn} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {label}
        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} strokeWidth={2} />
      </button>
      <div className={f.telWrap} id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
