"use client";

// 공통 머리: PC 왼쪽 고정 막대 + 고정 머리(로고 글자, 1차 메뉴, 남색 권역 띠, 분홍 동그라미) + 1차 메뉴 펼침판,
// 휴대전화 머리(로고 + 분홍 + 검정 동그라미)와 전체메뉴. 모양은 궁능유적본부 누리집을 따랐다.
// 펼침판은 KRDS 규칙대로 눌러야 열린다(마우스 올림으로 열지 않음). Esc·바깥 누름·쪽 옮김으로 닫힌다.
// 3차 목록(궁능: 2차 칸 ∨ → 3차): 3차가 있는 2차 칸은 여닫는 단추가 되고, 누르면 칸 아래에 3차 목록이 열린다(한 번에 하나).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AREA_LINKS, LEFT_BAR, MENU, SITE_NAME, depth3Of, sectionOf } from "@/site/ia";
import { Icon } from "@/components/icons";
import { useDisplaySettings } from "./DisplaySettings";
import d3 from "./HeaderParts.module.css";

/** 휴대전화 전체메뉴 맨 위 권역 사진 카드(서버에서 골라 넘긴다: layout.tsx) */
export type AreaCard = { key: string; label: string; href: string; photo: string | null };

const isHere = (pathname: string, href: string) => pathname === href;

export default function SiteHeader({ areaCards }: { areaCards: AreaCard[] }) {
  const pathname = usePathname();
  const current = sectionOf(pathname);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [openD3, setOpenD3] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const openSettings = useDisplaySettings();

  // 쪽을 옮기면 메뉴를 닫는다(렌더 중에 주소 바뀜을 알아채는 React 권장 방식)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenIdx(null);
    setOpenD3(null);
    setMobileOpen(false);
  }

  // PC 펼침판: 바깥 누름, Esc로 닫는다. Esc로 닫으면 누른 단추로 초점을 돌려준다.
  useEffect(() => {
    if (openIdx === null) return;
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenIdx(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const i = openIdx;
        setOpenIdx(null);
        btnRefs.current[i]?.focus();
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openIdx]);

  // 1차 메뉴 단추에서 ← → 로 옆 메뉴로
  const onBtnKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = MENU.length;
    const j = (i + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
    btnRefs.current[j]?.focus();
    if (openIdx !== null) setOpenIdx(j);
  };

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    // 뒤쪽 화면의 inert가 풀린 다음에 초점을 돌려준다
    setTimeout(() => menuBtnRef.current?.focus(), 0);
  }, []);

  return (
    <header className="rc-header">
      {/* PC 왼쪽 고정 막대 */}
      <nav className="rc-leftbar" aria-label="바로가기">
        <Link href="/sitemap" className="rc-leftbar__box" aria-current={isHere(pathname, "/sitemap") ? "page" : undefined}>
          <Icon name="sitemap" size={30} strokeWidth={1.8} />
          <span className="sr-only">사이트맵</span>
        </Link>
        <button type="button" className="rc-leftbar__box" onClick={openSettings}>
          <span className="rc-leftbar__ga" aria-hidden="true">
            가
          </span>
          <span className="rc-leftbar__boxlabel">글자·화면 설정</span>
          <span className="sr-only"> 글자·화면 설정 창 열기</span>
        </button>
        <ul>
          {LEFT_BAR.map((b) => (
            <li key={b.href}>
              <Link href={b.href} className="rc-leftbar__item" aria-current={isHere(pathname, b.href) ? "page" : undefined}>
                <Icon name={b.icon} size={27} strokeWidth={1.5} />
                <span>{b.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="rc-hd" inert={mobileOpen}>
        <div className="rc-hd__inner">
          <p className="rc-logo">
            <Link href="/" className={d3.logo}>
              {/* 표장 = 사이트 아이콘(src/app/icon.svg). 궁능 머리 왼쪽 표장 자리. 뜻은 옆 글자가 전하므로 대체 글 없음 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" className={d3.mark} width={38} height={38} />
              {SITE_NAME}
            </Link>
          </p>

          {/* PC 1차 메뉴 + 펼침판 */}
          <nav className="rc-gnb" aria-label="메인 메뉴" ref={navRef}>
            <ul className="rc-gnb__list">
              {MENU.map((m, i) => {
                const open = openIdx === i;
                const id = `rc-gnb-panel-${i}`;
                const here = current?.href === m.href;
                return (
                  <li key={m.href}>
                    <button
                      type="button"
                      ref={(el) => {
                        btnRefs.current[i] = el;
                      }}
                      className={`rc-gnb__btn${here ? " is-current" : ""}`}
                      aria-expanded={open}
                      aria-controls={id}
                      onClick={() => {
                        setOpenIdx(open ? null : i);
                        setOpenD3(null);
                      }}
                      onKeyDown={(e) => onBtnKey(e, i)}
                    >
                      {m.label}
                      {here && <span className="sr-only"> 현재 선택됨</span>}
                    </button>
                    <div className={`rc-gnb__panel ${d3.panel}`} id={id} hidden={!open}>
                      <div className="rc-gnb__intro">
                        <p className="rc-gnb__intro-tit">{m.label}</p>
                        {m.desc && (
                          <p className="rc-gnb__intro-desc">
                            {m.desc}
                          </p>
                        )}
                      </div>
                      <ul className="rc-gnb__grid">
                        {m.children?.map((c) => {
                          const kids = depth3Of(c.href);
                          if (!kids)
                            return (
                              <li key={c.href}>
                                <Link href={c.href} className="rc-gnb__link" aria-current={isHere(pathname, c.href) ? "page" : undefined}>
                                  {c.label}
                                </Link>
                              </li>
                            );
                          const on = openD3 === c.href;
                          const listId = `${id}-d3-${c.href.replace(/\W+/g, "-")}`;
                          return (
                            <li key={c.href} className={on ? d3.itemOpen : undefined}>
                              <button
                                type="button"
                                className={`rc-gnb__link ${d3.toggle}`}
                                aria-expanded={on}
                                aria-controls={listId}
                                onClick={() => setOpenD3(on ? null : c.href)}
                              >
                                {c.label}
                                <Icon name={on ? "chevron-up" : "chevron-down"} size={16} strokeWidth={2} />
                              </button>
                              <ul className={d3.list} id={listId} hidden={!on}>
                                {kids.map((k) => (
                                  <li key={k.href}>
                                    <Link href={k.href} className={d3.link} aria-current={isHere(pathname, k.href) ? "page" : undefined}>
                                      {k.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 남색 둥근 띠: 권역 5개 */}
          <ul className="rc-areaband" aria-label="권역 지도 바로가기">
            {AREA_LINKS.map((a) => (
              <li key={a.key}>
                <Link href={a.href} aria-current={isHere(pathname, a.href) ? "page" : undefined}>
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>

          <button type="button" className="rc-circle rc-circle--pink" onClick={openSettings} title="글자·화면 설정">
            <span className="rc-circle__ga" aria-hidden="true">
              가
            </span>
            <span className="sr-only">글자·화면 설정</span>
          </button>
          <button
            type="button"
            ref={menuBtnRef}
            className="rc-circle rc-circle--ink rc-only-mobile"
            aria-expanded={mobileOpen}
            aria-controls="rc-mnav"
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="menu" size={26} strokeWidth={1.8} />
            <span className="sr-only">전체메뉴 열기</span>
          </button>
        </div>
      </div>

      {openIdx !== null && <div className="rc-gnb-dim" aria-hidden="true" onClick={() => setOpenIdx(null)} />}

      {mobileOpen &&
        createPortal(
          <MobileNav pathname={pathname} areaCards={areaCards} onClose={closeMobile} />,
          document.body,
        )}
    </header>
  );
}

/** 휴대전화 전체메뉴(궁능 menu_m390): 권역 사진 카드 줄, 왼쪽 1차 / 오른쪽 2차, 아래 바로가기 6칸 */
function MobileNav({
  pathname,
  areaCards,
  onClose,
}: {
  pathname: string;
  areaCards: AreaCard[];
  onClose: () => void;
}) {
  const current = sectionOf(pathname);
  const [active, setActive] = useState(() => Math.max(0, MENU.findIndex((m) => m.href === current?.href)));
  const [openD3, setOpenD3] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // 열리면: 뒤쪽 화면을 막고(inert), 닫기 단추로 초점, 몸 스크롤 잠금, Esc로 닫기
  useEffect(() => {
    const wrap = document.getElementById("wrap");
    wrap?.setAttribute("inert", "");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onResize = () => window.innerWidth >= 1024 && onClose();
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      wrap?.removeAttribute("inert");
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  // 궁능 menu_m390: 오른쪽 칸에는 왼쪽에서 고른 1차 메뉴의 하위만 보인다(처음에는 지금 쪽의 1차 메뉴)
  const jump = (i: number) => {
    setActive(i);
    setOpenD3(null);
  };

  // Tab이 창 밖으로 나가지 않게 가둔다
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const f = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <nav id="rc-mnav" className="rc-mnav" aria-label="전체메뉴" ref={panelRef} onKeyDown={onKeyDown}>
      <button type="button" className="rc-mnav__close" onClick={onClose} ref={closeRef}>
        <Icon name="close" size={30} strokeWidth={1.8} />
        <span className="sr-only">전체메뉴 닫기</span>
      </button>

      <ul className="rc-mnav__areas" aria-label="권역 지도 바로가기">
        {areaCards.map((a) => (
          <li key={a.key}>
            <Link href={a.href} className="rc-mnav__area">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {a.photo && <img src={a.photo} alt="" loading="lazy" decoding="async" />}
              <span>{a.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="rc-mnav__gap" />

      <div className="rc-mnav__menu">
        <ul className="rc-mnav__d1" aria-label="1차 메뉴">
          {MENU.map((m, i) => (
            <li key={m.href}>
              <button
                type="button"
                aria-current={active === i ? "true" : undefined}
                aria-controls={`rc-mnav-sec-${i}`}
                aria-expanded={active === i}
                onClick={() => jump(i)}
              >
                {m.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="rc-mnav__subs">
          {MENU.map((m, i) => (
            <div className="rc-mnav__sec" id={`rc-mnav-sec-${i}`} key={m.href} hidden={active !== i}>
              <h2>{m.label}</h2>
              <ul>
                {m.children?.map((c) => {
                  const kids = depth3Of(c.href);
                  if (!kids)
                    return (
                      <li key={c.href}>
                        <Link href={c.href} aria-current={isHere(pathname, c.href) ? "page" : undefined}>
                          {c.label}
                        </Link>
                      </li>
                    );
                  const on = openD3 === c.href;
                  const listId = `rc-mnav-d3-${c.href.replace(/\W+/g, "-")}`;
                  return (
                    <li key={c.href}>
                      <button
                        type="button"
                        className={`${d3.mToggle}${on ? " " + d3.mToggleOn : ""}`}
                        aria-expanded={on}
                        aria-controls={listId}
                        onClick={() => setOpenD3(on ? null : c.href)}
                      >
                        {c.label}
                        <Icon name={on ? "chevron-up" : "chevron-down"} size={20} strokeWidth={1.8} />
                      </button>
                      <ul className={d3.mList} id={listId} hidden={!on}>
                        {kids.map((k) => (
                          <li key={k.href}>
                            <Link href={k.href} className={d3.mLink} aria-current={isHere(pathname, k.href) ? "page" : undefined}>
                              {k.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="rc-mnav__gap" />

      <ul className="rc-mnav__quick" aria-label="바로가기">
        {LEFT_BAR.map((b) => (
          <li key={b.href}>
            <Link href={b.href}>
              <Icon name={b.icon} size={26} strokeWidth={1.5} />
              {b.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
