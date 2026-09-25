/** 임시 문구 표시. 점선 밑줄이 있는 글은 궁능 누리집에 짝이 없어 새로 지은, 사용자 확인 전 문구다. */
export function Ph({ children }: { children: React.ReactNode }) {
  return (
    <span className="ph" title="임시 문구" data-placeholder="">
      {children}
    </span>
  );
}
