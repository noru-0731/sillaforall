"use client";

// 무장애 목록 두 쪽(정보가 적힌 곳 / 정보가 없는 곳)의 게시판(궁능 공지사항 모양).
// 알약 줄은 SubPage의 tabs 자리(제목과 윗선 사이)에, 표는 본문에 들어가므로 둘이 같은 고름을 보도록 BoardState로 감싼다.
// 무거운 자료(places.json, photos.json)는 부르지 않는다. 쪽(서버)이 계산한 줄만 props로 받는다.
import { createContext, useContext, useId, useMemo, useState } from "react";
import Link from "next/link";
import PillTabs from "@/components/royal/PillTabs";
import { Ph } from "@/components/layout/Ph";
import { Icon } from "@/components/icons";
import type { AreaKey } from "@/data/types";
import s from "../bf.module.css";

export type BoardArea = { key: AreaKey; label: string };
export type BoardRow = {
  id: string;
  name: string;
  dong: string;
  area: AreaKey;
  areaLabel: string;
  /** 정보가 적힌 곳: 세 항목에 글이 있는지 */
  three?: { parking: boolean; walk: boolean; toilet: boolean };
  /** 정보가 없는 곳: 가까운 등록 관광지(없으면 null) */
  nearest?: string | null;
};
type Field = "all" | "name" | "dong";
type State = {
  area: string;
  setArea: (v: string) => void;
  query: { field: Field; text: string };
  setQuery: (q: { field: Field; text: string }) => void;
};

const Ctx = createContext<State | null>(null);
const useBoard = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("BoardState 안에서 써야 합니다");
  return v;
};

/** 알약 줄과 표가 같은 고름(권역, 검색어)을 보도록 감싼다. 화면에 따로 그리는 것은 없다. */
export function BoardState({ children }: { children: React.ReactNode }) {
  const [area, setArea] = useState("all");
  const [query, setQuery] = useState<{ field: Field; text: string }>({ field: "all", text: "" });
  return <Ctx.Provider value={{ area, setArea, query, setQuery }}>{children}</Ctx.Provider>;
}

/** 권역 알약 줄(전체 + 권역 5). 궁능 공지사항의 궁 알약 줄 자리. */
export function BoardPills({ areas }: { areas: BoardArea[] }) {
  const { area, setArea } = useBoard();
  return (
    <PillTabs
      label="권역 고르기"
      current={area}
      onSelect={setArea}
      items={[{ label: "전체", value: "all", grad: true }, ...areas.map((a) => ({ label: a.label, value: a.key, area: a.key }))]}
    />
  );
}

const colorOf = (k: AreaKey) => ({ "--c": `var(--rc-area-${k})` }) as React.CSSProperties;

/** ○ 적힘 / − 안 적힘. 읽기 도구에는 글자로 */
function Mark({ on }: { on: boolean }) {
  return (
    <>
      <span className={`${s.mark}${on ? "" : " " + s.markOff}`} aria-hidden="true">
        {on ? "○" : "−"}
      </span>
      <span className="sr-only">{on ? "적힘" : "적힌 내용 없음"}</span>
    </>
  );
}

/**
 * 곳 수 + 검색 줄 + 표(넓은 화면) / 목록(좁은 화면).
 * kind="listed": 번호 / 권역 / 관광지 / 주차 / 걷는 길 / 화장실(○ −)
 * kind="unlisted": 번호 / 권역 / 관광지 / 읍면동 / 가까운 등록 관광지
 */
export function BoardList({
  kind,
  rows,
  threeText,
  caption,
}: {
  kind: "listed" | "unlisted";
  rows: BoardRow[];
  /** 세 항목 이름(주차, 걷는 길, 화장실) */
  threeText: { parking: string; walk: string; toilet: string };
  caption: string;
}) {
  const { area, query, setQuery } = useBoard();
  const [field, setField] = useState<Field>("all");
  const [draft, setDraft] = useState("");
  const uid = useId();

  const shown = useMemo(() => {
    const q = query.text.replace(/\s+/g, "");
    return rows.filter((r) => {
      if (area !== "all" && r.area !== area) return false;
      if (!q) return true;
      const name = r.name.replace(/\s+/g, "");
      const dong = r.dong.replace(/\s+/g, "");
      if (query.field === "name") return name.includes(q);
      if (query.field === "dong") return dong.includes(q);
      return name.includes(q) || dong.includes(q);
    });
  }, [rows, area, query]);

  const keys = ["parking", "walk", "toilet"] as const;
  const cols = kind === "listed" ? 6 : 5;
  const href = (r: BoardRow) => (kind === "listed" ? `/places/${r.id}/barrier-free` : `/places/${r.id}`);
  const emptyText = <Ph>찾는 관광지가 없습니다.</Ph>;

  return (
    <div>
      <div className={s.cond}>
        <p className={s.count} aria-live="polite">
          전체: <strong>{shown.length}</strong>곳
        </p>
        <form
          className={s.search}
          role="search"
          aria-label="관광지 찾기"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery({ field, text: draft.trim() });
          }}
        >
          <div className={s.searchBox}>
            <div className={s.selectWrap}>
              <label className="sr-only" htmlFor={`${uid}-f`}>
                찾을 곳
              </label>
              <select id={`${uid}-f`} className={s.select} value={field} onChange={(e) => setField(e.target.value as Field)}>
                <option value="all">전체</option>
                <option value="name">관광지</option>
                <option value="dong">읍면동</option>
              </select>
              <Icon name="chevron-down" size={18} strokeWidth={2} />
            </div>
            <label className="sr-only" htmlFor={`${uid}-q`}>
              검색어
            </label>
            <input
              id={`${uid}-q`}
              className={s.input}
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="검색어를 입력해주세요."
              autoComplete="off"
            />
          </div>
          <button type="submit" className={s.submit}>
            검색
          </button>
        </form>
      </div>

      <div className={s.boardWrap}>
        {/* 넓은 화면: 표 */}
        <div className={`rc-board-wrap ${s.boardTable}`}>
          <table className={`rc-board ${s.board}`}>
            <caption>{caption}</caption>
            <colgroup>
              <col style={{ width: "8%" }} />
              <col style={{ width: "15%" }} />
              <col />
              {kind === "listed" ? (
                keys.map((k) => <col key={k} style={{ width: "12%" }} />)
              ) : (
                <>
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "34%" }} />
                </>
              )}
            </colgroup>
            <thead>
              <tr>
                <th scope="col">번호</th>
                <th scope="col">권역</th>
                <th scope="col">관광지</th>
                {kind === "listed" ? (
                  keys.map((k) => (
                    <th scope="col" key={k}>
                      <Ph>{threeText[k]}</Ph>
                    </th>
                  ))
                ) : (
                  <>
                    <th scope="col">읍면동</th>
                    <th scope="col">
                      <Ph>가까운 등록 관광지</Ph>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={cols} className={s.empty}>
                    {emptyText}
                  </td>
                </tr>
              )}
              {shown.map((r, i) => (
                <tr key={r.id}>
                  <td className={s.num}>{i + 1}</td>
                  <td>
                    <span className={s.area} style={colorOf(r.area)}>
                      {r.areaLabel}
                    </span>
                  </td>
                  <th scope="row">
                    <Link href={href(r)}>{r.name}</Link>
                  </th>
                  {kind === "listed" && r.three ? (
                    keys.map((k) => (
                      <td key={k}>
                        <Mark on={r.three![k]} />
                      </td>
                    ))
                  ) : (
                    <>
                      <td>{r.dong}</td>
                      <td className={s.near}>
                        {r.nearest ?? (
                          <>
                            <span aria-hidden="true">−</span>
                            <span className="sr-only">없음</span>
                          </>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 좁은 화면: 목록 */}
        <ul className={s.mList}>
          {shown.length === 0 && <li className={s.mEmpty}>{emptyText}</li>}
          {shown.map((r) => (
            <li key={r.id} className={s.mItem}>
              <span className={s.area} style={colorOf(r.area)}>
                {r.areaLabel}
              </span>
              <Link href={href(r)} className={s.mName}>
                {r.name}
              </Link>
              {kind === "listed" && r.three ? (
                <p className={s.mMeta}>
                  {keys.map((k) => (
                    <span key={k}>
                      <Ph>{threeText[k]}</Ph>
                      <Mark on={r.three![k]} />
                    </span>
                  ))}
                </p>
              ) : (
                <p className={s.mMeta}>
                  <span>{r.dong}</span>
                  {r.nearest && (
                    <span>
                      <Ph>가까운 등록 관광지</Ph>: {r.nearest}
                    </span>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
