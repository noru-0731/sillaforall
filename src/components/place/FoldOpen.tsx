"use client";

// 관광지 무장애 정보 쪽의 접는 절(<details data-fold>) 도우미. 화면에는 아무것도 그리지 않는다.
// - 쪽 안 목차나 지도 번호로 주소 뒤 #이름 자리로 옮겨 갈 때, 그 자리를 품은 절이 접혀 있으면 연다.
// - 인쇄할 때는 접힌 절을 모두 열고, 인쇄가 끝나면 접혀 있던 것만 다시 접는다(인쇄물에 내용이 빠지지 않게).
import { useEffect } from "react";

const FOLD = "details[data-fold]";

/** #이름 자리를 품은(또는 그 자리 바로 안의) 접힌 절을 연다. 연 것이 있으면 그 자리로 다시 옮긴다 */
function reveal(hash: string) {
  if (hash.length < 2) return;
  let el: HTMLElement | null = null;
  try {
    el = document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return;
  }
  if (!el) return;
  let opened = false;
  for (const d of [el.querySelector<HTMLDetailsElement>(`:scope > ${FOLD}`), el.closest<HTMLDetailsElement>(FOLD)]) {
    if (d && !d.open) {
      d.open = true;
      opened = true;
    }
  }
  if (opened) el.scrollIntoView();
}

export default function FoldOpen() {
  useEffect(() => {
    const onHash = () => reveal(window.location.hash);
    // 같은 목차 줄을 다시 누르면 hashchange가 오지 않으므로 누를 때도 본다
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']");
      if (a) reveal(a.getAttribute("href") ?? "");
    };
    let reopened: HTMLDetailsElement[] = [];
    const onBeforePrint = () => {
      reopened = [...document.querySelectorAll<HTMLDetailsElement>(FOLD)].filter((d) => !d.open);
      reopened.forEach((d) => (d.open = true));
    };
    const onAfterPrint = () => {
      reopened.forEach((d) => (d.open = false));
      reopened = [];
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);
  return null;
}
