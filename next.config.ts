import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "tong.visitkorea.or.kr", pathname: "/cms/**" }],
  },
  // 권역을 경주문화관광 여섯으로 바꾸며(2026-09-26) 없어진 권역 주소를 새 주소로 잇는다.
  // 옛 서쪽·남쪽 읍면(southwest)과 북쪽 읍면(north)의 곳은 대부분 서악·북부권(seoak)에 들었다.
  // 이름이 또 바뀔 수 있어 브라우저가 오래 기억하지 않는 307(permanent: false)로 둔다. ?place= 같은 뒤 글은 그대로 넘어간다.
  async redirects() {
    return [
      { source: "/map/southwest", destination: "/map/seoak", permanent: false },
      { source: "/map/north", destination: "/map/seoak", permanent: false },
    ];
  },
};

export default nextConfig;
