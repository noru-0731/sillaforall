"use client";

// 지금 운영 상태 한 줄(페르소나 장점 취합 가4). 서브메인 관람 도우미 "이용시간" 칸에서 이름 아래, 자료 글 위에 둔다.
// 쪽은 미리 만들어 둔 정적 쪽이라 서버에서는 아무것도 그리지 않고, 브라우저에서 한국 시각으로 셈해 그린다(분마다 다시 셈).
// 셈할 수 없는 곳(규칙은 lib/openNow.ts)은 아무것도 그리지 않는다.
import { useSyncExternalStore } from "react";
import { evaluateOpen, OPEN_LABEL, type OpenRule } from "@/lib/openNow";

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 30_000);
  return () => clearInterval(t);
};
/** 지금 몇 번째 분인지(같은 분 안에서는 같은 값이라 다시 그리지 않는다) */
const minuteNow = () => Math.floor(Date.now() / 60_000);
const onServer = () => null;

export default function OpenNow({ rule, className }: { rule: OpenRule; className?: string }) {
  const minute = useSyncExternalStore<number | null>(subscribe, minuteNow, onServer);
  if (minute === null) return null;
  const st = evaluateOpen(rule, new Date(minute * 60_000));
  if (!st) return null;
  return (
    <span className={className} data-open={st.state}>
      {OPEN_LABEL[st.state]}
      {st.range && ` · ${st.range}`}
    </span>
  );
}
