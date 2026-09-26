"use client";
// 관광지 쪽 진짜 지도(오시는 길 지도, 무장애 정보 쪽 편의시설 지도)가 쓰는 부품. props 는 RealMap·KakaoMap 과 같다.
// - 카카오 지도 SDK 가 뜨면 카카오 판(KakaoMap), 뜨지 않으면 지금까지의 오픈스트리트맵 판(RealMap)을 그린다.
//   뜨지 않는 경우: 키(NEXT_PUBLIC_KAKAO_MAP_KEY)가 빔, sdk.js 오류(등록하지 않은 도메인의 401 등), 8초 넘김(kakaoSdk.ts).
//   판정은 브라우저 창에서 한 번이고(loadKakao 가 결과를 기억한다), 한 쪽의 지도들은 모두 같은 판을 쓴다.
// - 서버에서 만드는 쪽과 판정 전에는 지도 자리(같은 크기의 빈 상자와 범례)만 그린다. 판정 뒤 같은 틀에 지도가 들어와 쪽이 밀리지 않는다.
import { useEffect, useState } from "react";
import KakaoMap from "./KakaoMap";
import RealMap from "./RealMap";
import { MapFrame, type MapProps } from "./mapParts";
import { loadKakao } from "./kakaoSdk";
import s from "./RealMap.module.css";

export type { LegendItem, MapPoint } from "./mapParts";

export default function PlaceMap(props: MapProps) {
  const [engine, setEngine] = useState<"wait" | "kakao" | "osm">("wait");

  useEffect(() => {
    let off = false;
    loadKakao().then((ok) => {
      if (!off) setEngine(ok ? "kakao" : "osm");
    });
    return () => {
      off = true;
    };
  }, []);

  if (engine === "kakao") return <KakaoMap {...props} />;
  if (engine === "osm") return <RealMap {...props} />;
  return (
    <MapFrame tall={props.tall} legend={props.legend}>
      <div className={s.map} role="region" aria-label={props.label ?? `${props.name} 위치 지도`} aria-busy="true" />
    </MapFrame>
  );
}
