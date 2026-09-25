"use client";

// KRDS "화면 크기 조정"과 "선명한 화면 모드". KRDS 누리집의 글자·화면 설정 창을 그대로 옮겼다.
// 크기는 body의 zoom을 KRDS 값(--krds-zoom-*)으로 바꾸고, 모드는 html의 data-krds-mode를 바꾼다.
// 고른 값은 이 브라우저에만 저장한다.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const SCALES = [
  { value: "small", label: "작게", zoom: 0.9 },
  { value: "medium", label: "보통", zoom: 1 },
  { value: "large", label: "조금 크게", zoom: 1.1 },
  { value: "xlarge", label: "크게", zoom: 1.3 },
  { value: "xxlarge", label: "가장 크게", zoom: 1.5 },
] as const;
const MODES = [
  { value: "light", label: "기본 (밝은 배경)" },
  { value: "high-contrast", label: "선명하게 (어두운 배경)" },
  { value: "theme", label: "시스템 설정" },
] as const;
type Scale = (typeof SCALES)[number]["value"];
type Mode = (typeof MODES)[number]["value"];
const KEY = "display-settings";

const Ctx = createContext<() => void>(() => {});
export const useDisplaySettings = () => useContext(Ctx);

function apply(scale: Scale, mode: Mode) {
  const z = SCALES.find((s) => s.value === scale)?.zoom ?? 1;
  document.body.style.zoom = z === 1 ? "" : String(z);
  // zoom 안에서는 화면 높이 단위(dvh)도 z배가 된다. 화면 높이에 맞출 곳(1차 메뉴 펼침판 등)이 나눠 쓰도록 값을 둔다.
  if (z === 1) document.body.style.removeProperty("--rc-zoom");
  else document.body.style.setProperty("--rc-zoom", String(z));
  document.documentElement.setAttribute("data-krds-mode", mode);
}

export function DisplaySettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [scale, setScale] = useState<Scale>("medium");
  const [mode, setMode] = useState<Mode>("light");
  // 저장해 둔 값을 읽기 전에는 저장하지 않는다(기본값이 저장값을 덮어쓰지 않게).
  const [ready, setReady] = useState(false);

  // 저장해 둔 값 불러오기
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 저장값은 화면을 그린 뒤에만 읽을 수 있다
      if (SCALES.some((x) => x.value === saved?.scale)) setScale(saved.scale);
      if (MODES.some((x) => x.value === saved?.mode)) setMode(saved.mode);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    apply(scale, mode);
    try {
      localStorage.setItem(KEY, JSON.stringify({ scale, mode }));
    } catch {}
  }, [scale, mode, ready]);

  // 창을 연 단추(닫으면 초점을 여기로 돌려준다)와 창
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLElement>(null);

  // KRDS 모달: shown → in 순서로 클래스를 붙이고, 뒤쪽 화면은 inert
  useEffect(() => {
    const wrap = document.getElementById("wrap");
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- KRDS 모달은 열림(shown) 뒤 한 박자 늦게 in을 붙인다
      setShown(true);
      document.body.classList.add("scroll-no");
      wrap?.setAttribute("inert", "");
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("keyup", onKey);
      return () => document.removeEventListener("keyup", onKey);
    }
    document.body.classList.remove("scroll-no");
    wrap?.removeAttribute("inert");
    // 키보드로 쓰는 사람을 위해 닫으면 연 단추로 초점을 돌려준다
    if (openerRef.current) {
      openerRef.current.focus();
      openerRef.current = null;
    }
    const t = setTimeout(() => setShown(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  // 열리면 초점을 창 안(지금 고른 크기)으로 옮긴다
  useEffect(() => {
    if (!open || !shown) return;
    // querySelector('a, b')는 선택자 차례가 아니라 문서 차례로 첫 요소를 주므로(늘 첫 라디오 '작게'), 고른 칸을 먼저 따로 찾는다
    const box = dialogRef.current;
    const el = box?.querySelector<HTMLElement>("input:checked") ?? box?.querySelector<HTMLElement>("input, button");
    el?.focus();
  }, [open, shown]);

  const openModal = useCallback(() => {
    const a = document.activeElement;
    openerRef.current = a instanceof HTMLElement && a !== document.body ? a : null;
    setOpen(true);
  }, []);

  return (
    <Ctx.Provider value={openModal}>
      {children}
      <section
        id="modal_adjust_display"
        ref={dialogRef}
        className={`krds-modal fade${shown ? " shown" : ""}${open && shown ? " in" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tit_modal_adjust_display"
        hidden={!shown}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="tit_modal_adjust_display" className="modal-title">
                글자·화면 표시 설정
              </h2>
            </div>
            <div className="modal-conts">
              <div className="conts-area">
                <div className="adjust_display">
                  <div className="fieldset adjust_scale">
                    <div className="form-group scale-options">
                      <h3>글자·화면 크기</h3>
                      <div className="form-conts">
                        <div className="krds-check-area chk-column">
                          {SCALES.map((s) => (
                            <div className="krds-form-check" key={s.value}>
                              <input
                                type="radio"
                                name="scale_level"
                                id={`scale_level_${s.value}`}
                                value={s.value}
                                checked={scale === s.value}
                                onChange={() => setScale(s.value)}
                              />
                              <label htmlFor={`scale_level_${s.value}`}>{s.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fieldset">
                    <div className="form-group view-mode-options">
                      <h3>화면 표시 모드</h3>
                      <div className="form-conts">
                        <div className="krds-check-area chk-column">
                          {MODES.map((m) => (
                            <div className="krds-form-check" key={m.value}>
                              <input
                                type="radio"
                                name="view_mode"
                                id={`view_mode_${m.value}`}
                                value={m.value}
                                checked={mode === m.value}
                                onChange={() => setMode(m.value)}
                              />
                              <label htmlFor={`view_mode_${m.value}`}>{m.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-btn btn-wrap">
              <button
                type="button"
                className="krds-btn medium tertiary"
                onClick={() => {
                  setScale("medium");
                  setMode("light");
                }}
              >
                초기화
              </button>
              <button type="button" className="krds-btn medium primary" onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
            <button type="button" className="krds-btn medium icon btn-close" onClick={() => setOpen(false)}>
              <span className="sr-only">닫기</span>
              <i className="svg-icon ico-popup-close"></i>
            </button>
          </div>
        </div>
        <div className={`modal-back${open && shown ? " in" : ""}`} onClick={() => setOpen(false)} />
      </section>
    </Ctx.Provider>
  );
}
