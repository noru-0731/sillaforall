"use client";
// 지도 쪽 본문(궁능유적본부 누리집 관람코스 쪽 모양, 나무 파일 course_1440):
// 거점 단추 줄 + 오른쪽 전체/정보가 적힌 곳/정보가 없는 곳 → 지도 상자 → ⓘ 안내 → 이름 격자(5칸)
// → 고른 관광지(이름 제목, 사진, 개요, "관광지 자세히 보기", 공공누리 글자 상자).
// 사진 곁 출처(짧은 꼴 "ⓒ한국관광공사" 등): 제1유형은 사진 오른쪽 아래에 얹고, 제3유형은 사진 아래 한 줄. 공공누리 글자 상자는 궁능 모양 그대로 둔다.
// ?place=id 가 있으면 그 곳을 고른 채로 연다(정적 쪽이라 브라우저에서 읽는다).
// (무장애 시안 bf-draft: 무장애 조건 거르기 줄과 ?조건= 읽기를 뺐다. 전체/정보가 적힌 곳/정보가 없는 곳 나눔은 그대로.)
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { placeById } from "@/data";
import type { AreaKey, Place } from "@/data";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";
import { Ph } from "@/components/layout/Ph";
import Photo from "@/components/royal/Photo";
import { photoCreditOf } from "@/data/credit";
import { SegTabs } from "@/components/royal/PillTabs";
import { InfoBox } from "@/components/royal/Bits";
import MapView from "./MapView";
import type { ExplorerPhoto } from "./explorerData";
import s from "./MapExplorer.module.css";

type Seg = "all" | "listed" | "unlisted";

const noSubscribe = () => () => {};
const readPlaceParam = () => new URLSearchParams(window.location.search).get("place");

/** 개요 첫 문단을 첫 문장(진하게)과 나머지로 */
function splitOverview(ov: string | null) {
  if (!ov) return null;
  const para = ov.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  if (!para) return null;
  const m = para.match(/^(.+?[.!?])\s+(.+)$/);
  return m ? { first: m[1], rest: m[2] } : { first: para, rest: "" };
}

export default function MapExplorer({
  view,
  ids,
  hubs,
  photos,
  kogl,
}: {
  view: "full" | AreaKey;
  /** 보일 관광지(가나다순) */
  ids: string[];
  /** 이 범위에 걸친 거점 이름 */
  hubs: string[];
  /** 관광지마다 큰 사진 한 장(서버에서 고름) */
  photos: Record<string, ExplorerPhoto>;
  /** 공공누리 글자 상자(서버에서 유형별로 그려 넘김). 관광사진 정보 사진은 "by:촬영자" 칸(촬영자 출처 줄이 붙은 상자) */
  kogl: Record<string, React.ReactNode>;
}) {
  const uid = useId();
  const hubLabelId = `${uid}-hub`;
  const detailId = `${uid}-detail`;
  const detailTitleId = `${uid}-detail-title`;

  const all = useMemo(() => ids.map((id) => placeById(id)).filter((p): p is Place => !!p), [ids]);
  const [seg, setSeg] = useState<Seg>("all");
  const [hub, setHub] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  // 주소의 ?place= (서버에서 그릴 때는 없음 → 브라우저에서 한 번 더 그린다)
  const placeParam = useSyncExternalStore(noSubscribe, readPlaceParam, () => null);

  const list = all.filter((p) => seg === "all" || (seg === "listed" ? p.registered : !p.registered));
  const wanted = selId ?? placeParam;
  const sel = list.find((p) => p.id === wanted) ?? list[0];
  const emph = hub ? list.filter((p) => p.cluster === hub).map((p) => p.id) : [];
  const photo = sel ? photos[sel.id] : null;
  const ov = sel ? splitOverview(sel.overview) : null;

  const choose = (id: string) => {
    setSelId(id);
    // 공유 단추가 고른 곳을 담아 보내도록 주소만 바꾼다(쪽은 그대로)
    const url = new URL(window.location.href);
    url.searchParams.set("place", id);
    window.history.replaceState(null, "", url);
  };

  return (
    <div className={s.wrap}>
      <div className={s.tabRow}>
        {hubs.length > 0 && (
          <div className={s.hubWrap} role="group" aria-labelledby={hubLabelId}>
            <span className={s.hubTit} id={hubLabelId}>
              <Icon name="pin" size={20} strokeWidth={2} />
              거점안내
            </span>
            <ul className={s.hubList}>
              {hubs.map((h) => (
                <li key={h}>
                  <button type="button" className={cn(s.hubBtn, hub === h && s.hubOn)} aria-pressed={hub === h} onClick={() => setHub(hub === h ? null : h)}>
                    <Icon name="hub" size={18} strokeWidth={1.8} />
                    {h}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <SegTabs
          className={s.seg}
          label="무장애 정보로 거르기"
          current={seg}
          onSelect={(v) => setSeg(v as Seg)}
          items={[
            { label: "전체", value: "all" },
            { label: "정보가 적힌 곳", value: "listed" },
            { label: "정보가 없는 곳", value: "unlisted" },
          ]}
        />
      </div>

      <div className={s.map}>
        <MapView
          view={view}
          // 빈 배열은 "전부"로 읽히므로 거른 결과가 0곳이면 없는 id 하나를 넘긴다
          placeIds={list.length ? list.map((p) => p.id) : ["-"]}
          highlightId={sel?.id}
          emphasisIds={emph}
          onSelectPlace={choose}
        />
      </div>

      <InfoBox className={s.info}>관광지 이름을 누르시면 아래 화면에서 사진을 볼 수 있습니다.</InfoBox>

      {list.length > 0 ? (
        <ul className={s.names} aria-label="관광지 이름">
          {list.map((p) => {
            const on = sel?.id === p.id;
            return (
              <li key={p.id}>
                <button type="button" className={cn(s.name, on && s.nameOn)} aria-pressed={on} aria-controls={detailId} onClick={() => choose(p.id)}>
                  {p.name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={s.empty}>
          등록된 관광지가 없습니다.
        </p>
      )}

      {sel && (
        <section id={detailId} className={s.detail} aria-labelledby={detailTitleId}>
          <h2 id={detailTitleId} className={s.detailTit}>
            {sel.name}
          </h2>
          <Photo
            key={sel.id}
            photo={photo}
            alt={sel.name}
            ratio="1030/551"
            bg="light"
            loading="eager"
            className={s.photo}
            credit={photo ? photoCreditOf(photo) : null}
          />
          <div className={s.txt}>
            {ov ? (
              <p>
                <span className={s.first}>{ov.first}</span>
                {ov.rest && <> {ov.rest}</>}
              </p>
            ) : (
              <p>
                <Ph>소개 글이 없습니다.</Ph>
              </p>
            )}
          </div>
          <div className={s.btnWrap}>
            <Link href={`/places/${sel.id}`} className={s.btnInk}>
              자세히 보기
              <Icon name="arrow-right" size={18} strokeWidth={2} />
            </Link>
          </div>
          {photo && <div className={s.kogl}>{kogl[photo.from === "gallery" ? `by:${photo.by ?? ""}` : photo.type] ?? kogl[photo.type]}</div>}
        </section>
      )}
    </div>
  );
}
