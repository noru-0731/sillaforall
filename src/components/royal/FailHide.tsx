"use client";

// 안 뜬 사진 숨김(09-27). 한국관광공사·한국관광콘텐츠랩 사진은 이용 조건상 사이트에 저장하지 않고 tong.visitkorea.or.kr 원 주소로
// 부르므로, 그 서버가 막히거나 느려 그림이 오지 않으면(오류) 브라우저가 깨진 그림 표시를 남긴다. 그 대신 숨긴다.
// <FailHide as="…">는 요소 하나(img 자신이거나 사진을 담은 틀)를 그대로 그리고, 그 안의 그림이 하나라도 오류가 나면
// fallback 을 대신 그린다(기본은 아무것도 없음 = 숨김). 서버 컴포넌트는 이것으로 감싸고, 안쪽은 서버가 그린 그대로 둔다.
// - after: 요소 바로 뒤 형제(사진 틀 아래 출처 한 줄 등). 오류가 나면 같이 숨긴다.
// - onFail: 오류를 부모에게 알린다(클라이언트 컴포넌트에서만. 사진 곁 출처처럼 틀 밖에 있는 것을 부모가 숨길 때).
// - 서버가 그린 쪽은 React 가 붙기(하이드레이션) 전에 이미 오류가 났을 수 있어 onError 만으로는 놓친다. 그래서 붙은 뒤 한 번
//   안의 그림을 살피고(받기가 끝났는데 그림 크기가 0 이면 깨진 것), 그 뒤로는 틀에 오류 받는 귀를 단다
//   (그림 오류는 위로 퍼지지 않아 capture 단계로 받는다). 아직 부르지 않은 늦게 부르기(loading="lazy") 그림은
//   currentSrc 가 비어 있어 깨진 것으로 보지 않는다.
// - img 속성(loading, fetchPriority, srcSet, sizes 등)은 받은 그대로 넘긴다.
import { createElement, useEffect, useRef, useState } from "react";

type Tag = "img" | "span" | "div" | "li" | "figure";

function isBroken(img: HTMLImageElement) {
  return img.complete && img.naturalWidth === 0 && img.currentSrc !== "";
}

export default function FailHide({
  as = "div",
  fallback = null,
  after,
  onFail,
  children,
  ...rest
}: {
  as?: Tag;
  fallback?: React.ReactNode;
  after?: React.ReactNode;
  onFail?: () => void;
  children?: React.ReactNode;
} & React.ImgHTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);
  const onFailRef = useRef(onFail);
  useEffect(() => {
    onFailRef.current = onFail;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fail = () => {
      setFailed(true);
      onFailRef.current?.();
    };
    const imgs = el instanceof HTMLImageElement ? [el] : Array.from(el.getElementsByTagName("img"));
    if (imgs.some(isBroken)) {
      fail(); // 붙기 전에 이미 난 오류
      return;
    }
    const onError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) fail();
    };
    el.addEventListener("error", onError, true);
    return () => el.removeEventListener("error", onError, true);
  }, []);

  if (failed) return <>{fallback}</>;
  return (
    <>
      {createElement(as, { ...rest, ref }, children)}
      {after}
    </>
  );
}
