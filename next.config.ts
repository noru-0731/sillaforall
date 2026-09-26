import type { NextConfig } from "next";
import areas6 from "./src/data/areas6.json";

// 권역을 경주문화관광 여섯으로 바꾸며(2026-09-26) 옛 지도 주소를 새 주소로 잇는다.
// 이름이 또 바뀔 수 있어 브라우저가 오래 기억하지 않는 307(permanent: false)로 둔다. ?place= 같은 뒤 글은 그대로 넘어간다.
const AREA_KEYS = areas6.areas.map((a) => a.key);
/** 없어진 옛 권역 키: 서쪽·남쪽 읍면(southwest), 북쪽 읍면(north) */
const OLD_KEYS = ["southwest", "north"];

/**
 * 옛 주소의 ?place= 곳이 그 권역에 없으면(권역이 바뀌며 곳이 다른 권역으로 옮김) 그 곳의 권역 주소로 잇는다.
 * 그대로 두면 지도 쪽이 그 권역 첫 곳을 고른 채 열린다(예: /map/city?place=p03 보리사 → 경주읍성).
 * 곳 → 권역은 areas6.json 그대로.
 */
function movedPlaceRedirects() {
  const out = [];
  for (const from of [...AREA_KEYS, ...OLD_KEYS]) {
    for (const to of AREA_KEYS) {
      if (from === to) continue;
      const ids = areas6.places.filter((p) => p.area === to).map((p) => p.id);
      if (!ids.length) continue;
      out.push({
        source: `/map/${from}`,
        has: [{ type: "query" as const, key: "place", value: `(?:${ids.join("|")})` }],
        destination: `/map/${to}`,
        permanent: false,
      });
    }
  }
  return out;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "tong.visitkorea.or.kr", pathname: "/cms/**" }],
  },
  async redirects() {
    return [
      ...movedPlaceRedirects(),
      // ?place= 가 없거나 위에 걸리지 않으면: 옛 서쪽·남쪽 읍면과 북쪽 읍면의 곳은 대부분 서악·북부권(seoak)에 들었다.
      { source: "/map/southwest", destination: "/map/seoak", permanent: false },
      { source: "/map/north", destination: "/map/seoak", permanent: false },
    ];
  },
};

export default nextConfig;
