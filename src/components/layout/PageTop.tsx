"use client";
// 쪽 맨 위와 관련된 두 가지(09-26 평가 04 고침). 루트 layout 에 한 번씩 둔다.
//
// 1) RouteTop: 링크로 새 쪽을 열면 맨 위에서 열리게.
//    Next.js 16 은 html 의 scroll-behavior: smooth(KRDS reset)를 쪽 옮길 때 끄지 않는다. 그래서 맨 위로 부드럽게 가는 도중에
//    Next 가 "첫 요소가 화면 밖"이라 보고 그 요소(머리 아래 100px 자리)로 다시 옮겨 쪽이 위 100px(휴대전화 가장 크게는 120~860px) 자리에서 열렸다.
//    layout 의 <html data-scroll-behavior="smooth"> 로 Next 가 옮길 때만 부드럽게 가기를 끄고,
//    그래도 남는 경우(떠날 때 쪽이 머리 높이보다 덜 내려가 있으면 Next 가 그 자리를 그대로 둔다)를 여기서 맨 위로 맞춘다.
//    뒤로·앞으로 가기(popstate)는 브라우저가 떠날 때 자리로 돌려놓으므로 건드리지 않는다. 주소에 #이 있으면 Next 가 그 자리로 옮기므로 건드리지 않는다.
//
// 2) ToTop: 한 화면 넘게 내렸을 때만 오른쪽 아래에 고정 '맨 위로' 단추.
//    모양은 경주문화관광 누리집의 고정 단추(흰 동그라미 약 38px, 옅은 테두리·그림자, 윗줄 있는 위 화살표 = KRDS ico_go_top)를,
//    이름은 같은 단추의 이름 '상단으로 가기'를 따른다(평가_09-26/05_레퍼런스_대비.md 5번, 캡처 G_내린뒤_맨위로단추_w1440.png).
//    누르면 맨 위로 가고 초점은 건너뛰기 링크가 가리키는 본문 시작(#contents)으로 옮긴다. 인쇄 때는 숨긴다(PageTop.module.css).
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import s from "./PageTop.module.css";

export function RouteTop() {
  const pathname = usePathname();
  const popped = useRef<string | null>(null); // 뒤로·앞으로 가기로 온 주소(그때의 location.pathname)
  const prev = useRef(pathname);

  useEffect(() => {
    const onPop = () => {
      popped.current = window.location.pathname;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    // 처음 불러올 때(개발 모드에서 효과가 두 번 돌 때 포함)와 주소 뒤 ?만 바뀐 때는 건드리지 않는다
    if (prev.current === pathname) return;
    prev.current = pathname;
    const wasPop = popped.current !== null && decodeURI(popped.current) === decodeURI(pathname);
    popped.current = null;
    if (wasPop) return;
    if (window.location.hash) return;
    if (window.scrollY !== 0) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export function ToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setShown(window.scrollY > window.innerHeight);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const go = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduce ? "instant" : "smooth" });
    const main = document.getElementById("contents");
    if (main) {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
  };

  if (!shown) return null;
  return (
    <button type="button" className={s.top} onClick={go} aria-label="상단으로 가기" title="상단으로 가기">
      <i className="svg-icon ico-go-top" aria-hidden="true"></i>
    </button>
  );
}
