"use client";

// 쪽 제목 오른쪽 동그란 단추 줄(공유·인쇄)의 "소리로 듣기" 단추. SubPageParts.tsx의 PageTools와 관광지 서브메인 관람 도우미 제목 칸이 쓴다.
// 동그라미 아래에 이름("소리로 듣기")을 보인다(페르소나 장점 취합 가11).
// 브라우저에 든 음성(speechSynthesis)으로 이 쪽 본문을 한국어 목소리로 읽는다.
// - 읽는 범위: #contents 안(쪽 제목부터 본문 끝). 빵부스러기, 단추 줄, 메뉴, 알약 줄, 단추, 그림은 뺀다.
// - 긴 글은 문장으로 잘라 차례로 읽힌다(크롬은 한 번에 긴 글을 주면 중간에 끊긴다).
// - 다시 누르면 멈춘다. 다른 쪽으로 가거나 쪽을 떠나도 멈춘다(파이어폭스는 읽던 문장까지 읽고 멈춘다: 아래 cancelBreaks).
// - 한국어 목소리가 없거나 speechSynthesis가 없는 브라우저에서는 단추를 그리지 않는다.
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import styles from "./ReadAloud.module.css";

/** 읽는 속도(1이 보통) */
const RATE = 0.9;
/** 한 번에 넘기는 글의 최대 길이(글자). 넘으면 쉼표나 띄어쓰기에서 더 자른다 */
const MAX_LEN = 100;
/** 읽지 않는 것 */
const SKIP = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "canvas",
  "iframe",
  "video",
  "audio",
  "img",
  "picture",
  "button",
  "input",
  "select",
  "textarea",
  "nav",
  "[hidden]",
  "[aria-hidden='true']",
  ".sr-only",
  ".blind",
  "caption",
  "legend",
  ".rc-bc",
  ".rc-tools",
  ".rc-pills",
  ".rc-seg",
  "[data-read-skip]",
].join(",");

/**
 * 파이어폭스는 읽는 도중 cancel()을 부르면 소리는 멎지만 음성 줄이 멈춘 채로 남는다(speaking이 계속 true).
 * 그 뒤로는 쪽을 새로 열기 전까지 다시 눌러도 소리가 나지 않는다(09-25 맥 파이어폭스 155에서 확인, Mozilla 버그 1522074와 같은 모습).
 * 그래서 파이어폭스에서는 cancel()을 부르지 않는다. 한 문장씩 넘기고, 멈추면 지금 읽는 문장까지만 읽고 멈춘다.
 * 아이폰의 파이어폭스는 사파리 엔진이라 이 이름표(Firefox/)가 없고, 원래 방식대로 읽는다.
 */
function cancelBreaks(): boolean {
  return typeof navigator !== "undefined" && /\bFirefox\//.test(navigator.userAgent);
}

/** 한국어 목소리 고르기: 기본 목소리 → 기기 안 목소리 → 아무 한국어 목소리 */
function pickKoVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const ko = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ko"));
  return ko.find((v) => v.default) ?? ko.find((v) => v.localService) ?? ko[0] ?? null;
}

/** 화면에 보이는지. 읽기 도구용으로 1픽셀에 가둔 글(sr-only 방식)도 보이지 않는 것으로 본다 */
function isShown(el: HTMLElement, cs: CSSStyleDeclaration): boolean {
  const e = el as HTMLElement & { checkVisibility?: (o?: Record<string, boolean>) => boolean };
  if (typeof e.checkVisibility === "function") {
    if (!e.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true })) return false;
  } else if (cs.display === "none" || cs.visibility === "hidden") {
    return false;
  }
  return !(cs.position === "absolute" && cs.overflow === "hidden" && el.offsetWidth <= 1 && el.offsetHeight <= 1);
}

/** 보이는 글을 덩어리(제목, 문단, 목록 한 줄, 표 한 줄 …)로 모은다 */
function collectBlocks(root: HTMLElement): string[] {
  const out: string[] = [];
  let buf = "";
  const flush = () => {
    const t = buf.replace(/\s+/g, " ").trim().replace(/,$/, "");
    if (t) out.push(t);
    buf = "";
  };
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      buf += node.nodeValue ?? "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    if (el.tagName === "BR") {
      flush();
      return;
    }
    if (el.matches(SKIP)) return;
    const cs = getComputedStyle(el);
    if (!isShown(el, cs)) return;
    const display = cs.display;
    // 표는 한 줄(행)을 한 덩어리로, 칸 사이는 쉼표로 읽는다("주소, 경상북도 …")
    if (display === "table-cell") {
      if (buf.trim() && !/,\s*$/.test(buf)) buf += ", ";
      el.childNodes.forEach(walk);
      return;
    }
    const block = !display.startsWith("inline") && display !== "contents";
    const box = display === "inline-block" || display === "inline-flex" || display === "inline-grid";
    if (block) flush();
    else if (box) buf += " ";
    el.childNodes.forEach(walk);
    if (block) flush();
    else if (box) buf += " ";
  };
  walk(root);
  flush();
  return out;
}

/** 덩어리를 문장으로, 긴 문장은 쉼표·띄어쓰기에서 더 자른다 */
function toSentences(blocks: string[]): string[] {
  const out: string[] = [];
  const push = (s: string) => {
    let rest = s.trim();
    if (!/[\p{L}\p{N}]/u.test(rest)) return; // 기호뿐인 조각은 버린다
    while (rest.length > MAX_LEN) {
      const head = rest.slice(0, MAX_LEN);
      let cut = head.lastIndexOf(", ");
      if (cut < MAX_LEN / 2) cut = head.lastIndexOf(" ");
      if (cut < MAX_LEN / 2) cut = MAX_LEN - 1;
      out.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) out.push(rest);
  };
  for (const b of blocks) {
    // 마침표·물음표·느낌표 뒤 띄어쓰기에서 나눈다(1.5km 같은 숫자는 띄어쓰기가 없어 나뉘지 않는다)
    b.replace(/([.!?。…])\s+/g, "$1\n")
      .split("\n")
      .forEach(push);
  }
  return out;
}

export default function ReadAloud({ rootId = "contents" }: { rootId?: string }) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [on, setOn] = useState(false);
  /** 읽기 차례 번호. 멈추면 올려서 앞 차례 utterance의 끝 알림을 무시한다 */
  const run = useRef(0);
  /** 이 단추가 읽는 중인지(멈출 때 남의 소리까지 끊지 않도록) */
  const active = useRef(false);
  /** 크롬이 읽는 도중 utterance를 버리지 않게 붙잡아 둔다 */
  const held = useRef<SpeechSynthesisUtterance[]>([]);
  const pathname = usePathname();

  // 목소리 목록은 늦게 채워지는 브라우저가 있다(크롬): voiceschanged를 기다린다
  useEffect(() => {
    const ss = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!ss || typeof ss.getVoices !== "function" || typeof window.SpeechSynthesisUtterance !== "function") return;
    const update = () => setVoice(pickKoVoice(ss.getVoices()));
    update();
    const late = setTimeout(update, 1500);
    if (typeof ss.addEventListener === "function") ss.addEventListener("voiceschanged", update);
    else ss.onvoiceschanged = update;
    return () => {
      clearTimeout(late);
      if (typeof ss.removeEventListener === "function") ss.removeEventListener("voiceschanged", update);
      else if (ss.onvoiceschanged === update) ss.onvoiceschanged = null;
    };
  }, []);

  const stop = useCallback(() => {
    run.current += 1;
    held.current = [];
    setOn(false);
    if (active.current) {
      active.current = false;
      // 파이어폭스는 cancel()을 부르면 음성 줄이 멈춘다(위 cancelBreaks). 지금 문장이 끝나면 다음 문장을 넘기지 않아 멈춘다.
      if (!cancelBreaks()) window.speechSynthesis?.cancel();
    }
  }, []);

  // 다른 쪽으로 가면(주소가 바뀌거나 단추가 사라지면) 멈춘다. 쪽을 떠날 때도.
  useEffect(() => {
    window.addEventListener("pagehide", stop);
    return () => {
      window.removeEventListener("pagehide", stop);
      stop();
    };
  }, [pathname, stop]);

  const start = () => {
    const ss = window.speechSynthesis;
    const root = document.getElementById(rootId);
    if (!ss || !root || !voice) return;
    const parts = toSentences(collectBlocks(root));
    if (!parts.length) return;

    const oneByOne = cancelBreaks();
    // 파이어폭스는 앞 차례의 마지막 문장이 아직 읽히는 중이면 그 뒤에 이어 읽는다(cancel()을 부르지 않는다)
    if (!oneByOne) ss.cancel();
    const my = ++run.current;
    const finish = () => {
      if (run.current !== my) return;
      active.current = false;
      held.current = [];
      setOn(false);
    };
    held.current = parts.map((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      u.voice = voice;
      u.rate = RATE;
      if (i === parts.length - 1) u.onend = finish;
      // 한 문장씩: 이 문장이 끝나면(그사이 멈추지 않았으면) 다음 문장을 넘긴다
      else if (oneByOne)
        u.onend = () => {
          if (run.current === my) ss.speak(held.current[i + 1]);
        };
      u.onerror = (e) => {
        // 멈춤(cancel)으로 생긴 알림은 무시하고, 그 밖의 오류는 전부 멈춘다
        if (e.error === "interrupted" || e.error === "canceled") return;
        if (run.current !== my) return;
        if (!oneByOne) ss.cancel();
        finish();
      };
      return u;
    });
    active.current = true;
    setOn(true);
    if (oneByOne) ss.speak(held.current[0]);
    else held.current.forEach((u) => ss.speak(u));
    if (ss.paused) ss.resume(); // 크롬에서 앞서 멈춘 채로 남아 있으면 소리가 나지 않는다
  };

  if (!voice) return null;
  return (
    <button
      type="button"
      className={`rc-tool rc-tool--read ${styles.btn}`}
      aria-pressed={on}
      onClick={on ? stop : start}
      title={on ? "소리로 듣기 멈추기" : "소리로 듣기"}
    >
      <span className="rc-tool__circle">
        <Icon name={on ? "stop" : "volume"} size={30} strokeWidth={1.6} />
      </span>
      <span className="rc-tool__label">소리로 듣기</span>
    </button>
  );
}
