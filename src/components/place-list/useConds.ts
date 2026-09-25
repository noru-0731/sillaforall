"use client";
// 무장애 조건 고름을 주소 뒤 ?조건= 에 남기고 읽는다. 그 주소를 보내면 같은 결과가 보인다.
// 쪽은 미리 만든 정적 쪽이라 서버에서 그릴 때는 조건이 없다(전부 보임) → 브라우저에서 주소를 읽어 한 번 더 그린다
// (지도 쪽의 ?place= 와 같은 방법. useSearchParams를 쓰면 Suspense 경계 밖 내용이 서버 HTML에서 빠진다).
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { COND_KEYS, COND_PARAM, condsParam, parseConds, type CondKey } from "./barrierConds";

const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};
const readParam = () => new URLSearchParams(window.location.search).get(COND_PARAM) ?? "";
const serverParam = () => "";

/** 주소만 바꾼다(쪽은 그대로, 방문 기록은 늘리지 않음). 쉼표는 그대로 둔다(?조건=주차,화장실). */
function writeParam(keys: readonly CondKey[]) {
  const url = new URL(window.location.href);
  if (keys.length) url.searchParams.set(COND_PARAM, condsParam(keys));
  else url.searchParams.delete(COND_PARAM);
  const search = url.searchParams.toString().replace(/%2C/gi, ",");
  window.history.replaceState(null, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
}

/** [고른 조건(COND_KEYS 차례), 바꾸기] */
export function useConds(): [CondKey[], (next: readonly CondKey[]) => void] {
  const raw = useSyncExternalStore(subscribe, readParam, serverParam);
  const [picked, setPicked] = useState<CondKey[] | null>(null);
  const conds = useMemo(() => picked ?? parseConds(raw), [picked, raw]);
  const set = useCallback((next: readonly CondKey[]) => {
    const sorted = COND_KEYS.filter((k) => next.includes(k));
    setPicked(sorted);
    writeParam(sorted);
  }, []);
  return [conds, set];
}
