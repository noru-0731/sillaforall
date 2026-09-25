"use client";
// 관광지 목록 > 가나다순(궁능유적본부 누리집 공지사항 쪽 모양, 나무 파일 notice_1440).
// 알약 줄(전체 + 권역)은 SubPage의 tabs 자리(제목과 윗선 사이)에, 표는 본문에 있어 둘이 떨어져 있다.
// 그래서 AbcProvider로 SubPage 전체를 감싸 고른 권역을 함께 쓴다.
// 본문: "전체: 61곳" + 이름 검색(화면 안에서 거르기) + 표(번호/권역/관광지/읍면동/무장애 정보/사진). 쪽 나누기 없음.
import { createContext, useContext, useId, useState } from "react";
import Link from "next/link";
import type { AreaKey } from "@/data/types";
import { Icon } from "@/components/icons";
import { Ph } from "@/components/layout/Ph";
import PillTabs from "@/components/royal/PillTabs";
import type { AreaOption, BoardRow } from "./types";
import s from "./Abc.module.css";

type Pick = "all" | AreaKey;
const Ctx = createContext<{ cur: Pick; setCur: (v: Pick) => void } | null>(null);

export function AbcProvider({ children }: { children: React.ReactNode }) {
  const [cur, setCur] = useState<Pick>("all");
  return <Ctx.Provider value={{ cur, setCur }}>{children}</Ctx.Provider>;
}

function usePick() {
  const v = useContext(Ctx);
  if (!v) throw new Error("AbcProvider 안에서 써야 합니다");
  return v;
}

/** 제목 아래 알약 줄: 전체(분홍→파랑) + 권역 색 */
export function AbcPills({ options }: { options: AreaOption[] }) {
  const { cur, setCur } = usePick();
  return (
    <PillTabs
      label="권역 고르기"
      current={cur}
      onSelect={(v) => setCur(v as Pick)}
      items={[{ label: "전체", value: "all", grad: true }, ...options.map((o) => ({ label: o.label, value: o.key, area: o.key }))]}
    />
  );
}

export function AbcBoard({ rows, options }: { rows: BoardRow[]; options: AreaOption[] }) {
  const { cur } = usePick();
  const uid = useId();
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  const q = query.replace(/\s+/g, "");
  const shown = rows.filter((r) => (cur === "all" || r.area === cur) && (!q || r.name.replace(/\s+/g, "").includes(q)));
  const curLabel = cur === "all" ? "전체" : (options.find((o) => o.key === cur)?.label ?? "");

  return (
    <div className={s.wrap}>
      <div className={s.condition}>
        <p className={s.count} aria-live="polite">
          {curLabel}: {shown.length}곳
        </p>
        <form
          className={s.search}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(draft.trim());
          }}
        >
          <label htmlFor={`${uid}-q`} className="sr-only">
            관광지 이름
          </label>
          <input
            id={`${uid}-q`}
            type="search"
            className={s.input}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (!e.target.value) setQuery("");
            }}
            placeholder="관광지 이름을 입력해주세요."
            autoComplete="off"
          />
          <button type="submit" className={s.submit}>
            검색
          </button>
        </form>
      </div>

      <div className={s.tableWrap}>
        <table className={`rc-board ${s.board}`}>
          <caption className="sr-only">관광지 {shown.length}곳 가나다순 목록: 번호, 권역, 관광지, 읍면동, 무장애 정보, 사진</caption>
          <colgroup>
            <col className={s.cNum} />
            <col className={s.cArea} />
            <col />
            <col className={s.cDong} />
            <col className={s.cFlag} />
            <col className={s.cFlag} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={s.mNone}>
                번호
              </th>
              <th scope="col">권역</th>
              <th scope="col">관광지</th>
              <th scope="col">읍면동</th>
              <th scope="col">무장애 정보</th>
              <th scope="col" className={s.mNone}>
                사진
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={r.id}>
                <td className={s.mNone}>{i + 1}</td>
                <td className={s.area}>
                  <span style={{ color: `var(--rc-area-${r.area})` }}>{r.areaLabel}</span>
                </td>
                <td className={s.tit}>
                  <Link href={`/places/${r.id}`}>{r.name}</Link>
                </td>
                <td className={s.dong}>{r.dong}</td>
                <td className={s.flag}>
                  {r.registered ? (
                    <>
                      <Icon name="wheelchair" size={22} strokeWidth={1.8} />
                      <span className={s.mOnly}>무장애 정보</span>
                      <span className="sr-only">있음</span>
                    </>
                  ) : (
                    <span className="sr-only">없음</span>
                  )}
                </td>
                <td className={`${s.flag} ${s.mNone}`}>
                  {r.hasPhoto ? (
                    <>
                      <Icon name="camera" size={22} strokeWidth={1.8} />
                      <span className="sr-only">있음</span>
                    </>
                  ) : (
                    <span className="sr-only">없음</span>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className={s.empty}>
                  <Ph>찾는 관광지가 없습니다.</Ph>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
