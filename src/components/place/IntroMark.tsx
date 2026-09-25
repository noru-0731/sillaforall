// 소개 쪽 큰 사진과 굵은 첫 문장 사이 가운데의 작은 그림(궁능 gbg_intro ic_wrap: 110×69 건물 그림 자리).
// 궁능 그림은 쓰지 않고 기와 지붕 건물을 선으로 직접 그렸다. 꾸밈 그림이라 읽기 도구에는 숨긴다.
export default function IntroMark({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 110 69" width="110" height="69" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" focusable="false">
        {/* 위 지붕: 용마루, 처마(끝이 들림), 둘을 잇는 내림마루 */}
        <path d="M34 12c7-2 35-2 42 0" />
        <path d="M24 22c10-4 52-4 62 0" />
        <path d="M24 22l-5-3.5M86 22l5-3.5" />
        <path d="M34 12l-6 9M76 12l6 9" />
        {/* 위층 몸 */}
        <path d="M38 22v8M72 22v8M38 26h34" />
        {/* 아래 지붕 */}
        <path d="M26 30h58" />
        <path d="M14 39c14-5 68-5 82 0" />
        <path d="M14 39l-5-3.5M96 39l5-3.5" />
        <path d="M26 30l-8 8M84 30l8 8" />
        {/* 아래층 몸: 기둥과 문 셋 */}
        <path d="M24 39v16M86 39v16" />
        <path d="M36 55v-8a4 4 0 0 1 8 0v8M51 55v-8a4 4 0 0 1 8 0v8M66 55v-8a4 4 0 0 1 8 0v8" />
        {/* 기단과 계단 */}
        <path d="M16 55h78M10 62h90M16 55l-6 7M94 55l6 7M49 55v7M61 55v7" />
      </svg>
    </div>
  );
}
