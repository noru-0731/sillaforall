// 카카오 지도 두 판(관광지 쪽 KakaoMap, 권역 세부 지도 AreaKakaoMap)이 같이 쓰는 것. 브라우저에서만 부른다.
// - 확대 단계 짝(오픈스트리트맵 zoom → 카카오 레벨), 지도 틀 기준 자리 재기, 카카오 로고·축척 줄 찾기(KakaoMap.tsx 에서 옮김, 셈은 그대로)
// - 휴대전화 한 손가락 손길을 카카오에 넘기지 않기(KakaoMap.tsx 에서 옮김, 셈은 그대로)
// - 카카오 로고 링크 옆 새 창 표시(09-27 map2)
import type { Rect } from "./mapParts";
import k from "./KakaoMap.module.css";

/** 오픈스트리트맵 zoom → 카카오 레벨(1이 가장 가까움, 한 단계마다 두 배) */
export const levelOf = (zoom: number) => Math.min(13, Math.max(1, 20 - zoom));
export const MIN_LEVEL = levelOf(19);
export const MAX_LEVEL = levelOf(7);

/** 지도 틀(root) 기준 자리(px). 글자·화면 설정의 몸 zoom 이 있어도 offsetLeft 와 같은 단위로 */
export function relRect(el: HTMLElement, root: HTMLElement, pad: number): Rect | null {
  const rr = root.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  if (!r.width || !rr.width) return null;
  const z = root.offsetWidth / rr.width;
  return { l: (r.left - rr.left) * z - pad, t: (r.top - rr.top) * z - pad, r: (r.right - rr.left) * z + pad, b: (r.bottom - rr.top) * z + pad };
}

/** 로고·축척 줄로 볼 상자의 가장 큰 높이(px). 카카오 줄은 한 줄(약 20px)이다 */
const FOOT_MAX_H = 48;

/** 카카오가 지도 안에 넣는 로고 링크(map.kakao.com, 새 창) */
const logoOf = (root: HTMLElement) => root.querySelector<HTMLAnchorElement>('a[href*="map.kakao.com"]');

/**
 * 카카오가 왼쪽 아래에 그리는 로고·축척 줄. 이름표가 없어 로고 링크(map.kakao.com)에서 위로 올라가며
 * 한 줄 크기(높이 48px 이하, 지도 폭의 80% 이하)인 가장 바깥 상자를 고른다.
 * - 로고와 축척이 따로 싸여 있어도(카카오 setCopyrightPosition 의 좌우 바꾸기) 둘을 함께 싼 상자까지 올라가 축척도 장애물에 넣는다.
 *   로고 상자만 잡으면 비킨 번호 네모가 축척 위로 옮겨질 수 있다(흉내 SDK, 경주읍성 무장애 휴대전화 20번).
 * - 지도 전체 크기의 겹이나 폭 전체의 띠까지는 올라가지 않는다(한 줄이 아닌 것).
 */
export function kakaoFoot(root: HTMLElement) {
  let cur: HTMLElement | null = logoOf(root);
  if (!cur) return null;
  const maxW = root.clientWidth * 0.8;
  for (let p = cur.parentElement; p && p !== root; p = p.parentElement) {
    if (p.offsetHeight > FOOT_MAX_H || p.offsetWidth > maxW) break;
    cur = p;
  }
  return cur;
}

/**
 * 카카오 로고 링크 바로 뒤에 사이트의 새 창 표시(NewWinIcon 과 같은 KRDS ico-go 그림)를 붙인다(09-27).
 * - 로고 링크와 로고 그림은 건드리지 않는다(가리지도, 크기·주소를 바꾸지도 않음. 카카오 이용 조건).
 *   표시는 링크 밖 옆자리(같은 줄 상자 안)에 놓고, 화면 읽기에서는 숨긴다(로고 그림 대체 글에 이미 "새창열림"이 있다).
 * - 로고가 아직 없으면 false. 이미 붙였으면 다시 붙이지 않는다.
 */
export function markKakaoLogo(root: HTMLElement): boolean {
  const a = logoOf(root);
  if (!a) return false;
  if (a.nextElementSibling?.classList.contains(k.logoNewWin)) return true;
  const i = document.createElement("i");
  i.className = `svg-icon ico-go ${k.logoNewWin}`;
  i.setAttribute("aria-hidden", "true");
  a.after(i);
  return true;
}

/** 휴대전화·태블릿(굵은 포인터)인지. 한 손가락 끌기를 끈다 */
export const isCoarse = () => window.matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

/**
 * 휴대전화: 끌기를 꺼도 카카오가 touchmove 를 막아, 지도 위를 한 손가락으로 쓸면 쪽이 내려가지 않았다(오시는 길 쪽).
 * 한 손가락 손길은 카카오에 넘기지 않는다(두 손가락은 넘김). 카카오가 건 touch-action: none 은 CSS(.kmap, coarse)에서 푼다.
 * 되돌리는 함수를 준다.
 */
export function guardTouch(el: HTMLElement): () => void {
  let multi = false;
  const onTouch = (e: TouchEvent) => {
    if (e.type === "touchstart" && e.touches.length > 1) multi = true;
    if (!multi) e.stopPropagation();
    if (e.type !== "touchmove" && e.type !== "touchstart" && e.touches.length === 0) multi = false;
  };
  const TOUCH = ["touchstart", "touchmove", "touchend", "touchcancel"] as const;
  for (const t of TOUCH) el.addEventListener(t, onTouch, { capture: true, passive: true });
  return () => {
    for (const t of TOUCH) el.removeEventListener(t, onTouch, { capture: true });
  };
}
