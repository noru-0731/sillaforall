// 첫 쪽. 궁능유적본부 누리집 첫 쪽(main_s0~s2)의 세 칸을 그대로 따른다. SubPage 틀은 쓰지 않는다.
// 칸 1: 큰 넘기기 배너 + 산호색 가운데 띠 + 바로가기 줄 5칸
// 칸 2: "경주 관광지" 카드 넘기기(노년 쪽 18곳)
// 칸 3: "무장애 정보" 알약 탭 3개 + 목록 10줄 + 경주 전체 지도 판
// 사진 고르기·목록 만들기는 여기(서버)에서 하고, 결과만 부품으로 넘긴다(photos.json을 브라우저로 보내지 않으려고).
import { areaOf, areas, byName, HUBS, places } from "@/data";
import type { Place } from "@/data";
import { anyPhoto, coverPhoto } from "@/data/photos";
import { MENU, SITE_NAME } from "@/site/ia";
import { withJosa } from "@/lib/josa";
import HomeHero, { type HeroSlide, type QuickItem } from "@/components/home/HomeHero";
import HomeCards, { type CardItem } from "@/components/home/HomeCards";
import HomeBoard, { type BoardList } from "@/components/home/HomeBoard";
import s from "@/components/home/home.module.css";

const areaLabel = (p: Place) => areas.find((a) => a.key === areaOf(p))!.label;
/** 카드의 "주소 :" 줄. 경주 안내 사이트라 앞의 "경상북도 경주시"는 뺀다. */
const shortAddress = (p: Place) => (p.address ?? "").replace(/^경상북도\s*경주시\s*/, "") || p.dong;

// ── 칸 1: 넘기기 배너. 이름난 관광지 다섯 곳의 제1유형 사진(잘라 써도 되는 사진)만 쓴다. 차례는 사용자가 바꿀 수 있다.
const HERO_IDS = ["p34", "p39", "p47", "p51", "p28"]; // 불국사, 첨성대, 동궁과 월지, 대릉원, 석굴암

function heroSlides(): HeroSlide[] {
  const out: HeroSlide[] = [];
  for (const id of HERO_IDS) {
    const p = places.find((q) => q.id === id);
    const ph = coverPhoto(id);
    if (!p || !ph || ph.type !== "Type1") continue;
    out.push({ id, name: p.name, kicker: p.category, meta: `${areaLabel(p)} · ${p.dong}`, photo: { url: ph.url, type: "Type1" } });
  }
  return out;
}

// 가운데 띠(궁능: 8곳으로 떠나는 조선왕릉 여행 | 능침특별관람 | 다양한 체험여행)
const BAND = [
  { label: `${places.length}곳으로 떠나는 경주 여행`, href: "/map" },
  { label: "무장애 정보", href: "/barrier-free" },
  { label: "거점 관광지", href: "/list/hub" },
];

// 바로가기 줄(궁능: 궁궐안내▲ 왕릉안내 해설안내▲ 관람시간 오시는길). ▲는 눌러서 펼친다.
const QUICK: QuickItem[] = [
  { label: MENU[0].label, href: MENU[0].href, icon: "map", children: MENU[0].children?.map((c) => ({ label: c.label, href: c.href })) },
  { label: MENU[1].label, href: MENU[1].href, icon: "list" },
  { label: MENU[2].label, href: MENU[2].href, icon: "wheelchair", children: MENU[2].children?.map((c) => ({ label: c.label, href: c.href })) },
  { label: "거점별 관광지", href: "/list/hub", icon: "hub" },
  { label: "이용 안내", href: "/about/guide", icon: "guide" },
];

// ── 칸 2: 노년 쪽 관광지 카드. 제1유형 사진이 있는 곳 먼저, 그다음 제3유형(자르지 않음), 사진 없는 곳은 끝에.
function cardItems(): CardItem[] {
  const rank = (p: Place) => (coverPhoto(p.id) ? 0 : anyPhoto(p.id) ? 1 : 2);
  return places
    .filter((p) => p.side === "old")
    .sort((a, b) => rank(a) - rank(b) || b.share60 - a.share60)
    .map((p) => {
      const ph = coverPhoto(p.id) ?? anyPhoto(p.id);
      return {
        id: p.id,
        name: p.name,
        area: areaOf(p),
        areaLabel: areaLabel(p),
        registered: p.registered,
        address: shortAddress(p),
        photo: ph ? { url: ph.url, type: ph.type } : null,
      };
    });
}

// ── 칸 3: 목록 10줄씩. 정보가 적힌 곳 / 정보가 없는 곳은 가나다순, 거점별은 거점 차례 → 가나다순.
function boardLists(): BoardList[] {
  const row = (p: Place, badge?: string) => ({ id: p.id, name: p.name, dong: p.dong, area: areaOf(p), badge: badge ?? areaLabel(p) });
  const listed = places.filter((p) => p.registered).sort(byName);
  const unlisted = places.filter((p) => !p.registered).sort(byName);
  const hub = HUBS.flatMap((h) => places.filter((p) => p.cluster === h).sort(byName).map((p) => row(p, h)));
  return [
    { key: "listed", label: "정보가 적힌 곳", href: "/barrier-free/listed", rows: listed.slice(0, 10).map((p) => row(p)) },
    { key: "unlisted", label: "정보가 없는 곳", href: "/barrier-free/unlisted", rows: unlisted.slice(0, 10).map((p) => row(p)) },
    { key: "hub", label: "거점별", href: "/list/hub", rows: hub.slice(0, 10), hub: true },
  ];
}

export default function Home() {
  return (
    <div className={s.home} id="contents">
      <HomeHero siteName={SITE_NAME} slides={heroSlides()} band={BAND} quick={QUICK} />
      <HomeCards
        title="경주 관광지"
        desc={
          <>
            {withJosa(SITE_NAME, "은/는")} 경주의 관광지를 누구나 즐길 수 있도록 힘쓰고{" "}
            <br />
            한눈에 볼 수 있는 경주 관광지 {places.length}곳의 위치와 무장애 정보를 제공합니다.
          </>
        }
        moreHref="/list"
        items={cardItems()}
      />
      <HomeBoard title="무장애 정보" lists={boardLists()} />
    </div>
  );
}
