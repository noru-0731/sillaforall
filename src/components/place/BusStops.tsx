// 오시는 길 대중교통의 정류장 줄(가까운 정류장 셋). 오시는 길 쪽과 한 곳 모아 인쇄 쪽이 같이 쓴다. 서버 컴포넌트.
// 궁능 버스 칸 "경복궁 하차 / 간선 …" 모양: 굵은 제목에 정류장 이름과 번호, 아래 줄에 직선거리와 노선 번호.
// - 오시는 길 쪽(BusStopUnits): 노선 줄을 누르면(<details>, 무장애 정보 쪽 접는 절의 '열기'·'닫기'와 ∨) 궁능 표(BoardTable)가 펼쳐진다.
//   표 한 줄이 노선 하나: 줄 머리 노선번호, 내용 칸에 기점·종점·첫차시간·막차시간·배차간격(값 있는 것). 칸 이름은 TAGO 명세의 국문 이름 그대로.
//   (휴대전화 390·글자 가장 크게에서 칸 여섯 짜리 표는 넘쳐, 이용안내 표와 같은 두 칸 표로 했다.)
//   표는 주 노선만(09-27 사용자 "메인 노선만 빼고 깔끔하게 알아서", data/bus.ts linesOf): 번호마다 한 줄, 최대 10줄. 노선 줄(펼치는 줄)은 표에 든 번호.
//   표에 들지 않은 번호는 펼침 아래 '경유노선' 줄에 번호만(이름표는 TAGO 작업 이름 '정류소별경유노선'의 자료 말).
// - 인쇄 쪽(BusStopUnitsPrint): 펼침 없이 같은 줄의 노선번호·첫차시간·막차시간 세 칸 표와 '경유노선' 줄.
//   번호마다 한 줄이라 같은 번호·다른 시간 줄을 가르던 '기점' 칸(finish2)은 뺐다.
// - 노선이 오픈스트리트맵으로 남은 정류장(src osm)은 그 줄 아래에 오픈스트리트맵 출처 줄.
// 자료: data/bus.json(도구/12_버스_문단_사이트.py → 도구/20_버스_TAGO.py).
import { Fragment } from "react";
import { Icon } from "@/components/icons";
import { BoardTable } from "@/components/royal";
import { SourceLines } from "@/components/place/Amenities";
import { type BusLine, type BusStop, OSM_SOURCE_LINE, intervalKeysOf, linesOf, moreRoutesOf } from "@/data/bus";
import s from "./Place.module.css";

const fmtM = (m: number) => `${m.toLocaleString("ko-KR")}m`;
export const stopTitle = (name: string, no: string | null) => `${name} 정류장${no ? `(${no})` : ""}`;
// 빈 값은 표시 없이 비운다(09-27 사용자). 노선이 없는 정류장은 '노선' 줄을 두지 않는다
const val = (v: string | null) => v ?? "";
const mins = (v: number | null) => (v === null ? "" : `${v}분`);

/**
 * 노선번호 칸 글. 글자는 그대로 두고 줄바꿈 자리만 정한다(09-27 점검: 390·가장 크게에서 '800( / 기본-', '100- / 1'처럼 끊겼다).
 * 빈칸으로 나뉜 낱말('포항', '800', '100-1')은 끊지 않고, 괄호 앞과 괄호 안 빈칸·줄표 뒤에서만 줄을 바꾼다(.busNo, .busNoWord).
 */
function RouteNo({ no }: { no: string }) {
  const i = no.indexOf("(");
  const head = i > 0 ? no.slice(0, i) : no;
  const paren = i > 0 ? no.slice(i) : "";
  return (
    <span className={s.busNo}>
      {head.split(" ").map((w, k) => (
        <Fragment key={k}>
          {k > 0 && " "}
          <span className={s.busNoWord}>{w}</span>
        </Fragment>
      ))}
      {paren && (
        <>
          <wbr />
          {paren}
        </>
      )}
    </span>
  );
}

function LineCell({ l, iv }: { l: BusLine; iv: ReturnType<typeof intervalKeysOf> }) {
  const kv: [string, string][] = [
    ["기점", val(l.start)],
    ["종점", val(l.end)],
    ["첫차시간", val(l.first)],
    ["막차시간", val(l.last)],
    ...iv.map((k) => [k.label, mins(l[k.key])] as [string, string]),
  ];
  return (
    <ul className={s.busKv}>
      {kv.map(([k, v]) => (
        <li key={k}>
          <span className={s.busK}>{k}</span> {v}
        </li>
      ))}
    </ul>
  );
}

/** 표에 들지 않은 노선 번호 줄(오시는 길·인쇄 같이) */
function MoreLine({ nos }: { nos: string[] }) {
  return nos.length ? <p className={`${s.transUnitTxt} ${s.busMore}`}>경유노선 {nos.join(", ")}</p> : null;
}

/** 오시는 길 쪽: 정류장 줄 셋. 노선 줄을 누르면 노선별 표(주 노선, 최대 10줄)가 펼쳐지고, 나머지 번호는 '경유노선' 줄 */
export function BusStopUnits({ stops }: { stops: BusStop[] }) {
  return (
    <>
      {stops.map((b) => {
        const tit = stopTitle(b.name, b.stopNo);
        const ls = linesOf(b);
        const iv = intervalKeysOf(ls);
        const more = moreRoutesOf(b);
        const routeTxt = `노선 ${(ls.length ? ls.map((l) => l.no) : b.routes).join(", ")}`;
        return (
          <div key={b.stopNo ?? b.name} className={s.transUnit}>
            <p className={s.transUnitTit}>{tit}</p>
            {b.distM !== null && <p className={s.transUnitTxt}>직선거리 {fmtM(b.distM)}</p>}
            {ls.length > 0 ? (
              <details className={s.busFold}>
                <summary className={s.busSum}>
                  <span className={s.busSumTxt}>{routeTxt}</span>
                  <span className={s.busCtl} aria-hidden="true">
                    <span className={s.busOn}>닫기</span>
                    <span className={s.busOff}>열기</span>
                    <Icon name="chevron-down" size={20} strokeWidth={1.8} className={s.busChev} />
                  </span>
                </summary>
                <BoardTable
                  className={s.busTable}
                  caption={`${tit} 노선: 노선번호, 기점, 종점, 첫차시간, 막차시간${iv.map((k) => ", " + k.label).join("")}`}
                  head={["노선번호", "내용"]}
                  cols={["25%", "auto"]}
                  align={["c", "l"]}
                  rowHeader
                  rows={ls.map((l) => [<RouteNo key="n" no={l.no} />, <LineCell key={l.no} l={l} iv={iv} />])}
                />
              </details>
            ) : b.routes.length ? (
              <p className={`${s.transUnitTxt} ${b.distM !== null ? s.busNoGap : ""}`}>{routeTxt}</p>
            ) : null}
            {ls.length > 0 && <MoreLine nos={more} />}
            {b.src === "osm" && <SourceLines lines={[OSM_SOURCE_LINE]} />}
          </div>
        );
      })}
    </>
  );
}

/** 인쇄 쪽: 펼침 없이 오시는 길 표와 같은 줄(주 노선, 번호마다 한 줄, 최대 10줄)의 노선번호·첫차시간·막차시간 표와 '경유노선' 줄 */
export function BusStopUnitsPrint({ stops, keepClass }: { stops: BusStop[]; keepClass?: string }) {
  return (
    <>
      {stops.map((b) => {
        const tit = stopTitle(b.name, b.stopNo);
        const ls = linesOf(b);
        return (
          <div key={b.stopNo ?? b.name} className={`${s.transUnit}${keepClass ? " " + keepClass : ""}`}>
            <p className={s.transUnitTit}>{tit}</p>
            {ls.length > 0 ? (
              <>
                {b.distM !== null && <p className={s.transUnitTxt}>직선거리 {fmtM(b.distM)}</p>}
                <BoardTable
                  className={s.busTable}
                  caption={`${tit} 노선: 노선번호, 첫차시간, 막차시간`}
                  head={["노선번호", "첫차시간", "막차시간"]}
                  cols={["34%", "33%", "33%"]}
                  rows={ls.map((l) => [<RouteNo key="n" no={l.no} />, val(l.first), val(l.last)])}
                />
                <MoreLine nos={moreRoutesOf(b)} />
              </>
            ) : (
              (b.distM !== null || b.routes.length > 0) && (
                <p className={s.transUnitTxt}>
                  {[b.distM !== null ? `직선거리 ${fmtM(b.distM)}` : null, b.routes.length ? `노선 ${b.routes.join(", ")}` : null]
                    .filter(Boolean)
                    .join("\n")}
                </p>
              )
            )}
            {b.src === "osm" && <SourceLines lines={[OSM_SOURCE_LINE]} />}
          </div>
        );
      })}
    </>
  );
}
