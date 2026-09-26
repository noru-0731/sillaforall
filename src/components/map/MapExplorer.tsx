"use client";
// 지도 쪽 본문(궁능유적본부 누리집 관람코스 쪽 모양, 나무 파일 course_1440):
// 거점 단추 줄 + 오른쪽 전체/무장애 정보가 있는 곳/무장애 정보가 없는 곳 → 지도 상자 → ⓘ 안내 → 이름 격자(5칸)
// → 고른 관광지(이름 제목, 사진, 개요, "관광지 자세히 보기", 공공누리 글자 상자).
// 사진 곁 출처(짧은 꼴 "ⓒ한국관광공사" 등): 제1유형은 사진 오른쪽 아래에 얹고, 제3유형은 사진 아래 한 줄. 공공누리 글자 상자는 궁능 모양 그대로 둔다.
// ?place=id 가 있으면 그 곳을 고른 채로 연다(정적 쪽이라 브라우저에서 읽는다).
// (무장애 시안 bf-draft: 무장애 조건 거르기 줄과 ?조건= 읽기를 뺐다. 전체/무장애 정보가 있는 곳/없는 곳 나눔은 그대로.)
// 가 62번: 보이는 곳이 0곳이면 ⓘ 안내 상자와 거점 단추를 숨긴다(새 글은 넣지 않는다).
// 가 22번: 개요가 없는 곳은 소개 쪽과 같은 글 "등록된 소개 글이 없습니다."(레퍼런스 글이라 점선 없음).
// 09-27 map2: 권역 쪽(/map/[권역])은 카카오 SDK 가 뜨면 도식 지도 대신 카카오 세부 지도(AreaKakaoMap)를 그린다(판정은 여기서 한 번,
// kakaoSdk.loadKakao). 뜨지 않으면(키 없음·오류·8초) 지금까지의 도식 지도(MapView) 그대로. 경주 전체(/map)는 늘 도식 지도.
// 세부 지도일 때는 이름 격자 이름 앞에 지도 번호 네모와 같은 번호(차례 + 1)를 둔다. 계단 없는 길 표시는 두 지도 모두(stepFree).
import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { placeById } from "@/data";
import type { AreaKey, Place } from "@/data";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";
import Photo from "@/components/royal/Photo";
import { photoCreditOf } from "@/data/credit";
import { SegTabs } from "@/components/royal/PillTabs";
import { InfoBox } from "@/components/royal/Bits";
import MapView from "./MapView";
import AreaKakaoMap from "./AreaKakaoMap";
import { loadKakao } from "./kakaoSdk";
import type { ExplorerPhoto } from "./explorerData";
import s from "./MapExplorer.module.css";

type Seg = "all" | "listed" | "unlisted";
/** 권역 쪽 지도 판: 판정 전 · 카카오 세부 지도 · 도식 지도(돌아가기) */
type Engine = "wait" | "kakao" | "plan";

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
  stepFree,
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
  /** 계단 없는 길 곳과 그 쪽 주소(지도 표시와 범례 한 줄) */
  stepFree?: { ids: string[]; href: string };
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
  // 권역 쪽 지도 판(경주 전체는 늘 도식 지도라 묻지 않는다)
  const [engine, setEngine] = useState<Engine>("wait");
  useEffect(() => {
    if (view === "full") return;
    let off = false;
    loadKakao().then((ok) => {
      if (!off) setEngine(ok ? "kakao" : "plan");
    });
    return () => {
      off = true;
    };
  }, [view]);
  const numbered = view !== "full" && engine === "kakao";

  const list = all.filter((p) => seg === "all" || (seg === "listed" ? p.registered : !p.registered));
  const wanted = selId ?? placeParam;
  const sel = list.find((p) => p.id === wanted) ?? list[0];
  const emph = hub ? list.filter((p) => p.cluster === hub).map((p) => p.id) : [];
  // 이 범위(거르기 전)에 계단 없는 길 곳이 없으면(불국사권) 표시도 범례 줄도 넘기지 않는다. 세부 지도의 sfHere 와 같은 셈이라
  // 카카오가 안 떠서 도식 지도로 돌아가도 범례가 같다(09-27 점검 고침).
  const sfScope = stepFree && all.some((p) => stepFree.ids.includes(p.id)) ? stepFree : undefined;
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
        {/* 보이는 곳이 0곳이면 거점 단추를 숨긴다(누를 관광지가 없다) */}
        {hubs.length > 0 && list.length > 0 && (
          <div className={s.hubWrap} role="group" aria-labelledby={hubLabelId}>
            <span className={s.hubTit} id={hubLabelId}>
              <Icon name="pin" size={20} strokeWidth={2} />
              덩어리안내
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
            { label: "무장애 정보가 있는 곳", value: "listed" },
            { label: "무장애 정보가 없는 곳", value: "unlisted" },
          ]}
        />
      </div>

      <div className={s.map}>
        {view !== "full" && engine !== "plan" ? (
          <AreaKakaoMap
            area={view}
            live={engine === "kakao"}
            fitPlaces={all}
            places={list}
            highlightId={sel?.id}
            emphasisIds={emph}
            onSelectPlace={choose}
            stepFree={sfScope}
            hubLegend={hubs.length > 0}
          />
        ) : (
          <MapView
            view={view}
            // 빈 배열은 "전부"로 읽히므로 거른 결과가 0곳이면 없는 id 하나를 넘긴다
            placeIds={list.length ? list.map((p) => p.id) : ["-"]}
            highlightId={sel?.id}
            emphasisIds={emph}
            onSelectPlace={choose}
            stepFree={sfScope}
          />
        )}
      </div>

      {/* 보이는 곳이 0곳이면 안내 상자를 숨긴다 */}
      {list.length > 0 && <InfoBox className={s.info}>관광지 이름을 누르시면 아래 화면에서 사진을 볼 수 있습니다.</InfoBox>}

      {list.length > 0 ? (
        <ul className={s.names} aria-label="관광지 이름">
          {list.map((p, i) => {
            const on = sel?.id === p.id;
            return (
              <li key={p.id}>
                <button type="button" className={cn(s.name, on && s.nameOn, numbered && s.nameNum)} aria-pressed={on} aria-controls={detailId} onClick={() => choose(p.id)}>
                  {/* 세부 지도의 번호 네모와 같은 번호·색(무장애 정보가 있는 곳은 채움, 없는 곳은 테두리) */}
                  {numbered && <span className={cn(s.num, p.registered ? s.numOn : s.numOff)}>{i + 1}</span>}
                  {numbered ? <span className={s.nameTxt}>{p.name}</span> : p.name}
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
              <p>등록된 소개 글이 없습니다.</p>
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
