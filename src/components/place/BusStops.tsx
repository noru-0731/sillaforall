// 오시는 길 대중교통의 정류장 줄(가까운 정류장 셋). 오시는 길 쪽과 한 곳 모아 인쇄 쪽이 같이 쓴다. 서버 컴포넌트.
// 궁능 버스 칸 "경복궁 하차 / 간선 …" 모양: 굵은 제목에 정류장 이름과 번호, 아래 줄에 직선거리와 노선 번호.
// - 오시는 길 쪽(BusStopUnits): 노선 줄을 누르면(<details>, 무장애 정보 쪽 접는 절의 '열기'·'닫기'와 ∨) 궁능 표(BoardTable)가 펼쳐진다.
//   표 한 줄이 노선 하나: 줄 머리 노선번호, 내용 칸에 기점·종점·첫차시간·막차시간·배차간격(값 있는 것). 칸 이름은 TAGO 명세의 국문 이름 그대로.
//   (휴대전화 390·글자 가장 크게에서 칸 여섯 짜리 표는 넘쳐, 이용안내 표와 같은 두 칸 표로 했다.)
// - 인쇄 쪽(BusStopUnitsPrint): 펼침 없이 노선번호·첫차시간·막차시간 세 칸 표.
// - 노선이 오픈스트리트맵으로 남은 정류장(src osm)은 그 줄 아래에 오픈스트리트맵 출처 줄.
// 자료: data/bus.json(도구/12_버스_문단_사이트.py → 도구/20_버스_TAGO.py).
import { DASH } from "@/components/layout/Dash";
import { Icon } from "@/components/icons";
import { BoardTable } from "@/components/royal";
import { SourceLines } from "@/components/place/Amenities";
import { type BusLine, type BusStop, OSM_SOURCE_LINE, intervalKeysOf, linesOf } from "@/data/bus";
import s from "./Place.module.css";

const fmtM = (m: number) => `${m.toLocaleString("ko-KR")}m`;
export const stopTitle = (name: string, no: string | null) => `${name} 정류장${no ? `(${no})` : ""}`;
const val = (v: string | null) => v ?? DASH;
const mins = (v: number | null) => (v === null ? DASH : `${v}분`);

/** 이 정류장들 가운데 화면에 "-"가 나오는 것이 있는지(노선 없음, 노선 줄의 빈 칸). print 면 인쇄 쪽 표의 칸(첫차시간·막차시간)만 본다 */
export function busHasDash(stops: BusStop[], print = false): boolean {
  return stops.some((b) => {
    if (!b.routes.length) return true;
    const ls = linesOf(b);
    if (print) return ls.some((l) => !l.first || !l.last);
    const iv = intervalKeysOf(ls);
    return ls.some((l) => !l.start || !l.end || !l.first || !l.last || iv.some((k) => l[k.key] === null));
  });
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

/** 오시는 길 쪽: 정류장 줄 셋. 노선 줄을 누르면 노선별 표가 펼쳐진다 */
export function BusStopUnits({ stops }: { stops: BusStop[] }) {
  return (
    <>
      {stops.map((b) => {
        const tit = stopTitle(b.name, b.stopNo);
        const ls = linesOf(b);
        const iv = intervalKeysOf(ls);
        const routeTxt = `노선 ${b.routes.length ? b.routes.join(", ") : DASH}`;
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
                  rows={ls.map((l) => [l.no, <LineCell key={l.no} l={l} iv={iv} />])}
                />
              </details>
            ) : (
              <p className={`${s.transUnitTxt} ${b.distM !== null ? s.busNoGap : ""}`}>{routeTxt}</p>
            )}
            {b.src === "osm" && <SourceLines lines={[OSM_SOURCE_LINE]} />}
          </div>
        );
      })}
    </>
  );
}

/** 인쇄 쪽: 펼침 없이 노선번호·첫차시간·막차시간 표(보이는 값이 같은 줄은 한 번) */
export function BusStopUnitsPrint({ stops, keepClass }: { stops: BusStop[]; keepClass?: string }) {
  return (
    <>
      {stops.map((b) => {
        const tit = stopTitle(b.name, b.stopNo);
        const rows: [string, string, string][] = [];
        for (const l of linesOf(b)) {
          const r: [string, string, string] = [l.no, val(l.first), val(l.last)];
          if (!rows.some((x) => x.join("\u0000") === r.join("\u0000"))) rows.push(r);
        }
        return (
          <div key={b.stopNo ?? b.name} className={`${s.transUnit}${keepClass ? " " + keepClass : ""}`}>
            <p className={s.transUnitTit}>{tit}</p>
            {rows.length > 0 ? (
              <>
                {b.distM !== null && <p className={s.transUnitTxt}>직선거리 {fmtM(b.distM)}</p>}
                <BoardTable
                  className={s.busTable}
                  caption={`${tit} 노선: 노선번호, 첫차시간, 막차시간`}
                  head={["노선번호", "첫차시간", "막차시간"]}
                  cols={["34%", "33%", "33%"]}
                  rows={rows}
                />
              </>
            ) : (
              <p className={s.transUnitTxt}>
                {b.distM !== null && `직선거리 ${fmtM(b.distM)}\n`}
                노선 {b.routes.length ? b.routes.join(", ") : DASH}
              </p>
            )}
            {b.src === "osm" && <SourceLines lines={[OSM_SOURCE_LINE]} />}
          </div>
        );
      })}
    </>
  );
}
