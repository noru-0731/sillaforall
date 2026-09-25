"use client";
// 첫 쪽 부품들이 같이 쓰는 작은 것: 움직임 줄이기 설정 읽기, 두 색 + 무늬 "더 보기" 단추.
import { useSyncExternalStore } from "react";
import Link from "next/link";
import s from "./home.module.css";

const QUERY = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
/** 움직임 줄이기 설정이면 true(자동 넘김을 끈다). 서버에서는 false. */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/**
 * 궁능 첫 쪽 오른쪽 위의 큰 + (30×30, 굵기 3: 위·왼쪽 반은 진한 파랑, 아래·오른쪽 반은 연한 파랑).
 * 직접 그린 네모 네 개. 누름 영역도 궁능과 같은 30×30.
 */
export function MoreLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link href={href} className={`${s.more}${className ? " " + className : ""}`} title={label}>
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
        <rect className={s.moreDark} x="14" y="0" width="3" height="16" />
        <rect className={s.moreDark} x="0" y="13" width="17" height="3" />
        <rect className={s.moreLight} x="17" y="13" width="13" height="3" />
        <rect className={s.moreLight} x="14" y="16" width="3" height="14" />
      </svg>
      <span className="sr-only">{label}</span>
    </Link>
  );
}
