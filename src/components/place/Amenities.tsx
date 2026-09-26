// 가까운 편의시설(무장애 시안 bf-draft). 서버 컴포넌트.
// 궁능 관람코스 "편의시설"(레퍼런스/궁능_포맷/course_d1440_full.png, 나무/course_1440.txt) 모양:
// 지도 상자(번호 네모 + 왼쪽 범례) → ⓘ 안내 상자("번호를 클릭하시면 아래 화면에서 …") → 목록(궁능은 이름 격자 + 고른 시설 사진, 우리는 게시판 표).
// 표는 번호 / 구분 / 이름 / 직선거리 / 자료에 적힌 칸 / 자료. 칸 이름과 값은 원본 자료 그대로.
// 좁은 화면(본문 767 이하)에서는 표 줄을 한 칸씩 쌓는다(Amenities.module.css).
import RealMap, { type LegendItem, type MapPoint } from "@/components/map/RealMap";
import { InfoBox } from "@/components/royal";
import { KIND_LABEL, SRC_LABEL, type AmenityItem, type AmenityKind, type RestPoint } from "@/data/bf";
import s from "./Amenities.module.css";

const fmtM = (m: number) => `${m.toLocaleString("ko-KR")}m`;

/** 좌표 넷째 자리가 달라도 이만큼(m) 안이면 같은 자리로 본다(한국대중음악박물관 두 줄 1.8m가 칸 경계에 걸려 두 네모로 나뉘었다) */
const SAME_SPOT_M = 5;

/** 가까운 두 점 사이 거리(m, 평면 셈) */
function metersBetween(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const dy = (a.lat - b.lat) * 111320;
  const dx = (a.lon - b.lon) * 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dx, dy);
}

/** 같은 자리(약 10m 안)의 점은 번호를 이어 한 네모로: "1·2", 셋 넘게 이어지면 "1~4" */
function mergeLabel(nos: number[]) {
  const run = nos.every((n, i) => i === 0 || n === nos[i - 1] + 1);
  return nos.length > 2 && run ? `${nos[0]}~${nos[nos.length - 1]}` : nos.join("·");
}

export function amenityPoints(items: (AmenityItem & { show: number })[], idPrefix: string, rest: RestPoint[] = []): MapPoint[] {
  const groups = new Map<string, (AmenityItem & { show: number })[]>();
  for (const it of items) {
    const k = `${it.lat.toFixed(4)},${it.lon.toFixed(4)}`;
    groups.set(k, [...(groups.get(k) ?? []), it]);
  }
  // 칸 경계에 걸린 같은 자리 묶음을 합친다(번호 차례로)
  const merged: (AmenityItem & { show: number })[][] = [];
  for (const g of groups.values()) {
    const m = merged.find((h) => metersBetween(h[0], g[0]) <= SAME_SPOT_M);
    if (m) m.push(...g);
    else merged.push(g);
  }
  for (const g of merged) g.sort((a, b) => a.show - b.show);
  const pts: MapPoint[] = merged.map((g) => {
    const first = g[0];
    const nos = g.map((i) => i.show);
    return {
      key: `${idPrefix}-${nos.join("-")}`,
      kind: first.kind,
      lat: first.lat,
      lon: first.lon,
      label: mergeLabel(nos),
      title: g.map((i) => `${i.show}. ${i.name ?? KIND_LABEL[i.kind]} (${fmtM(i.distanceM)})`).join("\n"),
      href: `${idPrefix}-${first.show}`,
      near: g.some((i) => !i.far),
    };
  });
  for (const r of rest) pts.push({ key: `${idPrefix}-r-${r.lat},${r.lon}`, kind: r.kind, lat: r.lat, lon: r.lon, near: false });
  return pts;
}

export function legendOf(kinds: Iterable<AmenityKind | "bench" | "shelter">, placeName: string): LegendItem[] {
  const set = new Set(kinds);
  const order: (AmenityKind | "bench" | "shelter")[] = ["toiletA", "toilet", "parking", "charger", "food", "bench", "shelter"];
  return [{ kind: "place", label: placeName }, ...order.filter((k) => set.has(k)).map((k) => ({ kind: k, label: KIND_LABEL[k] }))];
}

/** 지도 + ⓘ 상자 (표는 AmenityTable) */
export function AmenityMap({
  lat,
  lon,
  name,
  points,
  legend,
  tall,
}: {
  lat: number;
  lon: number;
  name: string;
  points: MapPoint[];
  legend: LegendItem[];
  tall?: boolean;
}) {
  return (
    <>
      <RealMap lat={lat} lon={lon} name={name} label={`${name} 둘레 편의시설 지도`} zoom={16} points={points} legend={legend} tall={tall} />
      <InfoBox className={s.info}>번호를 누르시면 아래 목록에서 시설 정보를 볼 수 있습니다.</InfoBox>
    </>
  );
}

/** 목록 표. 줄 id = `${idPrefix}-${번호}`(지도 번호를 누르면 이리로 옮긴다) */
export function AmenityTable({
  items,
  idPrefix,
  caption,
  showKind = true,
}: {
  items: (AmenityItem & { show: number })[];
  idPrefix: string;
  caption: string;
  showKind?: boolean;
}) {
  return (
    <div className={`rc-board-wrap ${s.wrap}`}>
      <table className={`rc-board ${s.table}`}>
        <caption>{caption}</caption>
        <colgroup>
          <col style={{ width: "7%" }} />
          {showKind && <col style={{ width: "13%" }} />}
          <col style={{ width: "19%" }} />
          <col style={{ width: "10%" }} />
          <col />
          <col style={{ width: "14%" }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">번호</th>
            {showKind && <th scope="col">구분</th>}
            <th scope="col">이름</th>
            <th scope="col">직선거리</th>
            <th scope="col">내용</th>
            <th scope="col">자료</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.show} id={`${idPrefix}-${it.show}`} className={s.row}>
              <td className={s.no}>
                <span className={`${s.sw} ${s[`k_${it.kind}`]}`}>{it.show}</span>
              </td>
              {showKind && <td className={s.kind}>{KIND_LABEL[it.kind]}</td>}
              <th scope="row" className={s.name}>
                {it.name ?? (
                  <>
                    <span aria-hidden="true">−</span>
                    <span className="sr-only">이름 없음</span>
                  </>
                )}
                {!showKind ? null : <span className={s.mKind}>{KIND_LABEL[it.kind]}</span>}
              </th>
              <td className={s.dist}>{fmtM(it.distanceM)}</td>
              <td className={`tal ${s.fields}`}>
                {it.fields.length ? (
                  <dl>
                    {it.fields.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <>
                    <span aria-hidden="true">−</span>
                    <span className="sr-only">없음</span>
                  </>
                )}
              </td>
              <td className={s.src}>{SRC_LABEL[it.src]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 출처 줄 */
export function SourceLines({ lines, className }: { lines: string[]; className?: string }) {
  if (!lines.length) return null;
  return (
    <div className={`${s.credit}${className ? " " + className : ""}`}>
      {lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}
