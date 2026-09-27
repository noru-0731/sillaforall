"use client";

// '이전 페이지' 링크(없는 주소 쪽 app/not-found.tsx, 궁능유적본부 누리집 없는 주소 쪽의 뒤로 가기 링크 자리).
// 누르면 브라우저 뒤로 가기. 뒤로 갈 쪽이 없으면(새 창·새 탭에서 주소를 바로 연 경우) href 대로 첫 쪽으로 간다.
// Ctrl·Cmd·Shift 누르고 누르기(새 탭·새 창 열기)는 막지 않는다.
import Link from "next/link";

export default function BackLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Link
      href="/"
      className={className}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (window.history.length > 1) {
          e.preventDefault();
          window.history.back();
        }
      }}
    >
      {children}
    </Link>
  );
}
