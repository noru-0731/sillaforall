"use client";

// 푸터 오른쪽 "관련사이트 바로가기 ∨" 펼침. 누르면 위로 목록이 열린다. Esc·바깥 누름으로 닫힌다.
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { NewWinIcon } from "./NewWin";

const SITES = [
  { label: "대한민국 구석구석(한국관광공사)", href: "https://korean.visitkorea.or.kr" },
  { label: "경주문화관광", href: "https://www.gyeongju.go.kr/tour" },
  { label: "한국관광 데이터랩", href: "https://datalab.visitkorea.or.kr" },
  { label: "KRDS 디자인시스템", href: "https://www.krds.go.kr" },
];

export default function FooterRelated() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <div className="rc-ft-related" ref={ref}>
      <ul id={id} hidden={!open}>
        {SITES.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" title="새 창 열림">
              {s.label}
              <NewWinIcon />
            </a>
          </li>
        ))}
      </ul>
      <button type="button" ref={btn} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        관련사이트 바로가기
        <Icon name="chevron-down" size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}
