"use client";

// 서브 쪽 틀에서 누르면 움직이는 부분: 왼쪽 메뉴(3단 여닫기), 휴대전화 검정 드롭다운 막대, 공유·인쇄 단추.
// PageParts.tsx(서버)가 쓴다. 쪽에서 직접 쓸 일은 없다.
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { SideMenu, SideMenuLink } from "@/site/ia";
import { Caret, Icon } from "@/components/icons";

/** PC 왼쪽 메뉴(폭 250): 검정 머리 + 테두리 상자 목록. 3단이 있는 항목은 누르면 여닫힌다. */
export function SideMenuNav({ menu, current }: { menu: SideMenu; current: string }) {
  const hasCur = (links?: SideMenuLink[]) => !!links?.some((l) => l.href === current);
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(menu.items.filter((it) => it.children?.length).map((it) => [it.href, hasCur(it.children) || it.href === current])),
  );
  const uid = useId();

  return (
    <nav className="rc-lnb" aria-label={`${menu.title} 메뉴`}>
      <h2 className="rc-lnb__tit">{menu.title}</h2>
      <ul className="rc-lnb__list">
        {menu.items.map((it, i) => {
          const kids = it.children ?? [];
          const isCur = it.href === current || hasCur(kids);
          if (!kids.length) {
            return (
              <li className="rc-lnb__item" key={it.href}>
                <Link href={it.href} className={`rc-lnb__link${isCur ? " is-current" : ""}`} aria-current={it.href === current ? "page" : undefined}>
                  {it.label}
                </Link>
              </li>
            );
          }
          const isOpen = !!open[it.href];
          const subId = `${uid}-sub-${i}`;
          return (
            <li className={`rc-lnb__item${isOpen ? " is-open" : ""}`} key={it.href}>
              <button
                type="button"
                className={`rc-lnb__toggle${isCur ? " is-current" : ""}`}
                aria-expanded={isOpen}
                aria-controls={subId}
                onClick={() => setOpen((o) => ({ ...o, [it.href]: !o[it.href] }))}
              >
                {it.label}
                <span className="rc-lnb__chev" aria-hidden="true">
                  <Icon name="chevron-down" size={14} strokeWidth={2} />
                </span>
              </button>
              <ul className="rc-lnb__sub" id={subId} hidden={!isOpen}>
                {kids.map((k) => (
                  <li key={k.href}>
                    <Link href={k.href} aria-current={k.href === current ? "page" : undefined}>
                      {k.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** 휴대전화 검정 막대: 지금 쪽 이름 + ▼. 누르면 같은 단 목록이 검정 바탕으로 펼쳐진다. */
export function MobileMenuBar({ label, links, current }: { label: string; links: SideMenuLink[]; current: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  if (!links.length) return null;
  return (
    <div className="rc-mbar" ref={ref}>
      <button type="button" className="rc-mbar__btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span>
          {label}
          <span className="sr-only"> (같은 메뉴의 다른 쪽 {open ? "닫기" : "보기"})</span>
        </span>
        <Caret up={open} size={16} />
      </button>
      <ul className="rc-mbar__list" id={id} hidden={!open}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} aria-current={l.href === current ? "page" : undefined} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 쪽 제목 오른쪽 동그란 단추: 공유(주소 복사 또는 휴대전화 공유 창)와 인쇄. QR은 뺐다. */
export function PageTools({ title }: { title: string }) {
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = (t: string) => {
    setMsg(t);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 3000);
  };
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const share = async () => {
    const url = window.location.href;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    // 휴대전화 등 공유 창이 있는 곳은 그 창을, 없으면 주소를 복사한다
    if (nav.share && window.matchMedia("(max-width: 1023px)").matches) {
      try {
        await nav.share({ title, url });
        return;
      } catch {
        // 사용자가 닫았거나 막힘 → 복사로 넘어간다
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      say("이 쪽 주소를 복사했습니다.");
    } catch {
      say(`주소: ${url}`);
    }
  };

  return (
    <div className="rc-tools">
      <button type="button" className="rc-tool rc-tool--share" onClick={share} title="공유하기(주소 복사)">
        <Icon name="share" size={30} strokeWidth={1.6} />
        <span className="sr-only">공유하기(이 쪽 주소 복사)</span>
      </button>
      <button type="button" className="rc-tool rc-tool--print" onClick={() => window.print()} title="인쇄하기">
        <Icon name="print" size={30} strokeWidth={1.6} />
        <span className="sr-only">인쇄하기</span>
      </button>
      <p className="rc-tools__msg" aria-hidden="true">
        {msg}
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {msg}
      </p>
    </div>
  );
}
