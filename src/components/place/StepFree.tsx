// '계단 없는 길' 곳 덩어리(deck 갈래). 서버 컴포넌트.
// 무장애 정보 > 계단 없는 길 쪽(/barrier-free/step-free)과, 실린 곳의 무장애 정보 쪽 끝 절이 같은 덩어리를 쓴다.
// 곳 이름(그 곳 무장애 정보 쪽 링크) → 길 이름(자료에 나온 이름, 있을 때만) → 구분/내용 표. 칸마다 내용 아래에 출처 한 줄.
// 칸 이름·값은 자료 그대로(data/stepfree.json, 도구/19_계단없는길.py). 새로 지은 칸 이름만 점선.
import Link from "next/link";
import { Ph } from "@/components/layout/Ph";
import { BoardTable } from "@/components/royal";
import { isPhLabel, sourceName, stepFreeGroupOf, stepFreeSourceLines, STEPFREE_HREF, STEPFREE_PLACES, type StepFreePlace } from "@/data/stepfree";
import { Icon } from "@/components/icons";
import { SourceLines } from "./Amenities";
import pl from "./Place.module.css";
import s from "./StepFree.module.css";

/** 곳 덩어리 하나. self = 그 곳 자신의 무장애 정보 쪽(이름을 링크로 두지 않고, 묶음 이름을 길 이름 줄에 함께 적는다) */
export function StepFreeBlock({ place, self = false }: { place: StepFreePlace; self?: boolean }) {
  const group = stepFreeGroupOf(place);
  const groupLabel = group.ph ? <Ph>{group.label}</Ph> : group.label;
  const meta: React.ReactNode[] = [];
  if (self) meta.push(<span key="g">{groupLabel}</span>);
  if (place.course) meta.push(<span key="c">{place.course}</span>);
  return (
    <div className={pl.bfGroup}>
      <h3 className={pl.bfGroupTit}>
        {self ? (
          place.name
        ) : (
          <Link href={`/places/${place.id}/barrier-free`} className={pl.cellLink}>
            {place.name}
          </Link>
        )}
      </h3>
      {meta.length > 0 && (
        <p className={pl.bfMeta}>
          {meta.map((m, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {m}
            </span>
          ))}
        </p>
      )}
      <BoardTable
        caption={`${place.name} 계단 없는 길: 구분, 내용과 자료`}
        className={s.table}
        head={["구분", "내용"]}
        cols={["25%", "auto"]}
        align={["c", "l"]}
        rowHeader
        rows={place.rows.map((r) => [
          isPhLabel(r.k) ? <Ph key="k">{r.k}</Ph> : r.k,
          <span key="v">
            <span className={pl.pre}>{r.v}</span>
            <span className={s.src}>자료: {sourceName(r)}</span>
          </span>,
        ])}
      />
    </div>
  );
}

/** 곳의 무장애 정보 쪽 끝 절 안: 덩어리 + 그 덩어리의 출처 줄 + 테마 쪽으로 가는 단추(무장애 정보 보는 법 제4장 단추 모양) */
export function StepFreeOnPlace({ place, title }: { place: StepFreePlace; title: string }) {
  return (
    <>
      <StepFreeBlock place={place} self />
      <SourceLines lines={stepFreeSourceLines(place.rows.map((r) => r.src))} />
      <div className={s.moreLinks}>
        <Link href={STEPFREE_HREF} className={s.moreLink}>
          {title} {STEPFREE_PLACES.length}곳
          <Icon name="arrow-right" size={20} strokeWidth={2} />
        </Link>
      </div>
    </>
  );
}
