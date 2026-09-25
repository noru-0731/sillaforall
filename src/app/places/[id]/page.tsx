// 관광지 서브메인(61곳). 궁능 누리집 "경복궁" 서브메인(gbg_submain) 모양: 왼쪽 메뉴·빵부스러기·제목 없이
// 맨 위 큰 사진 → 관람 도우미(아이콘 6) → 사진 띠 4개 → 주변 관광지 상자 + 넘기기 판.
// 사진 띠: 제1유형은 칸에 맞춰 자르고, 제1유형이 모자란 띠는 제3유형 사진 여러 장을 자르지 않고 나란히(필름 줄), 사진이 없으면 옅은 단색 판.
// 문구는 궁능 문장의 명사만 바꾼 것이라 점선 밑줄(Ph)이 없다.
//
// 무장애 시안(bf-draft): 관람 도우미 칸에 바로가기 이름만이 아니라 이 곳의 자료 값을 함께 보인다(궁능은 아이콘 + 이름 바로가기 줄).
// 칸: 이용시간, 쉬는 날, 주차, 걷는 길, 화장실, 가까운 장애인 화장실, 문의 전화, 지도에서 보기. 값은 관광공사 관광정보·무장애 여행 정보 글 그대로,
// 가까운 장애인 화장실은 도구/10_편의시설_지도.py 의 가장 가까운 한 곳(이름과 직선거리). 글이 없는 칸은 "적힌 내용 없음".
// 칸을 누르면 그 값이 자세히 있는 쪽으로 간다. 긴 값은 세 줄까지 보이고 나머지는 줄임표(읽기 도구는 끝까지 읽는다).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areaOf, placeById, places } from "@/data";
import { largeUrl, photoCreditOf } from "@/data/photos";
import { placePages } from "@/site/ia";
import { withJosa } from "@/lib/josa";
import { Icon, type IconName } from "@/components/icons";
import { CircleButton, Photo } from "@/components/royal";
import { Ph } from "@/components/layout/Ph";
import { nearestAccessibleToilet } from "@/data/bf";
import { anyPhoto, areaLabelOf, categoryWord, coverPhoto, nearby, nearbySlides, phoneOf, stripCredit, stripSlots } from "@/components/place/placeData";
import NearbySlider from "@/components/place/NearbySlider";
import s from "@/components/place/Submain.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: placeById(id)?.name ?? "관광지" };
}

export default async function PlaceSubmain({ params }: Props) {
  const { id } = await params;
  const p = placeById(id);
  if (!p) notFound();

  const key = areaOf(p);
  const areaLabel = areaLabelOf(p);
  const [home, intro, photos, bf, dir] = placePages(p);

  // 맨 위 큰 사진: 제1유형이면 잘라 채우고 아래로 흐리게. 제3유형뿐이면 자르지 않고 단색 바탕(겹 없음).
  const cover = coverPhoto(p.id);
  const hero = cover ?? anyPhoto(p.id);

  // 관람 도우미 칸(값을 함께). 값이 없으면 null → "적힌 내용 없음"
  const tel = phoneOf(p.contact);
  const clean = (v: string | null | undefined) => (v ? v.replace(/\s*\n\s*/g, "\n").replace(/[ \t]{2,}/g, " ").trim() || null : null);
  const toiletA = nearestAccessibleToilet(p.id);
  const quick: { label: React.ReactNode; key: string; value: React.ReactNode | null; href: string; icon: IconName; tel?: boolean }[] = [
    { key: "hours", label: "이용시간", value: clean(p.hours), href: `${intro.href}#basic`, icon: "clock" },
    { key: "closed", label: "쉬는 날", value: clean(p.closed), href: `${intro.href}#basic`, icon: "calendar" },
    { key: "parking", label: "주차", value: clean((p.registered && p.move["주차"]) || p.parkingInfo), href: `${dir.href}#parking`, icon: "parking" },
    { key: "walk", label: "걷는 길", value: clean(p.three.walk), href: bf.href, icon: "walk" },
    { key: "toilet", label: "화장실", value: clean(p.three.toilet), href: bf.href, icon: "toilet" },
  ];
  if (!p.approx)
    quick.push({
      key: "toiletA",
      label: <Ph>가까운 장애인 화장실</Ph>,
      value: toiletA ? `${toiletA.name ?? "−"} · 직선거리 ${toiletA.distanceM.toLocaleString("ko-KR")}m` : null,
      href: `${bf.href}#near`,
      icon: "wheelchair",
    });
  quick.push({ key: "tel", label: "문의 전화", value: tel, href: tel ? `tel:${tel.replace(/-/g, "")}` : `${dir.href}`, icon: "phone", tel: !!tel });
  quick.push({ key: "map", label: "지도에서 보기", value: `${areaLabel}`, href: `/map/${key}?place=${p.id}`, icon: "map" });

  // 사진 띠 4개(궁능: 소개·역사 / 이야기 / 통합예약 / 관람코스)
  const word = categoryWord(p);
  const strips = [
    { small: `경주의 ${word ? word + " " : ""}${withJosa(p.name, "을/를")} 소개합니다.`, big: intro.label, href: intro.href },
    { small: `${withJosa(p.name, "이/가")} 품고 있는 다양한 모습을 살펴보세요.`, big: photos.label, href: photos.href },
    { small: "무장애 정보 서비스를 이용해보세요.", big: bf.label, href: bf.href },
    { small: `${p.name} 가는 길을 안내해드립니다.`, big: dir.label, href: dir.href },
  ];
  const slots = stripSlots(p.id, hero?.url ?? null);
  const slotCredit = stripCredit(slots);

  const near = nearby(p, 9);
  const slides = nearbySlides(p);

  return (
    <div id="contents">
      <h1 className="sr-only">{home.label}</h1>

      {/* 맨 위 큰 사진 */}
      <div className={`${s.visual}${cover ? " " + s.fade : hero ? " " + s.visualContain : ""}`}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={largeUrl(cover)} alt={`${p.name} 사진`} decoding="async" fetchPriority="high" />
        ) : (
          <Photo photo={hero} alt={`${p.name} 사진`} height="100%" bg="dark" loading="eager" />
        )}
      </div>
      {hero && (
        <p className={`${s.inner} ${s.credit}`}>
          {p.name} · {photoCreditOf(hero)}
        </p>
      )}

      {/* 관람 도우미 */}
      <section className={s.quick} aria-labelledby="quick-tit">
        <div className={`${s.inner} ${s.quickInner}`}>
          <div className={s.quickTit}>
            <h2 id="quick-tit">{p.name} 관람 도우미</h2>
            <p>
              {p.name} 관람에 도움이 되는
              <br /> 바로가기를 안내합니다.
            </p>
          </div>
          <ul className={s.quickGrid}>
            {quick.map((q) => {
              const inner = (
                <>
                  <span className={s.quickIco}>
                    <Icon name={q.icon} size={34} strokeWidth={1.4} />
                  </span>
                  <span className={s.quickLabel}>{q.label}</span>
                  <span className={s.quickVal}>{q.value ?? <Ph>적힌 내용 없음</Ph>}</span>
                </>
              );
              return (
                <li key={q.key}>
                  {q.tel || q.href.startsWith("tel:") ? <a href={q.href}>{inner}</a> : <Link href={q.href}>{inner}</Link>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 사진 띠 4개 */}
      <section className={s.menu} aria-label={`${p.name} 안내`}>
        <div className={s.inner}>
          <ul className={s.stripList}>
            {strips.map((st, i) => {
              const slot = slots[i];
              const cls = [s.strip, i % 2 ? s.stripEven : "", slot.kind === "film" ? s.stripFilm : "", slot.kind === "empty" ? s.stripPlain : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <li key={st.href}>
                  <Link href={st.href} className={cls}>
                    <span className={s.stripImg}>
                      {slot.kind === "type1" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slot.photo.url} alt="" loading="lazy" decoding="async" data-kogl="Type1" />
                      ) : slot.kind === "film" ? (
                        <span className={s.film}>
                          {slot.photos.map((ph) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={ph.url} src={ph.url} alt="" loading="lazy" decoding="async" data-kogl="Type3" />
                          ))}
                        </span>
                      ) : (
                        <span className={s.plate} />
                      )}
                    </span>
                    <span className={s.stripTxt}>
                      <span className={s.stripSmall}>{st.small}</span>
                      <span className={s.stripBig}>{st.big}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {slotCredit && <p className={s.menuCredit}>{slotCredit}</p>}
        </div>
      </section>

      {/* 주변 관광지 + 넘기기 판 */}
      <section className={s.bd} aria-labelledby="near-tit">
        <div className={`${s.inner} ${s.bdInner}`}>
          <div className={s.left}>
            <div className={s.leftHead}>
              <h2 id="near-tit">주변 관광지</h2>
              <CircleButton href={`/map/${key}`} label={`${areaLabel} 관광지 지도`} />
            </div>
            <ul className={s.nearList}>
              {near.map((q) => (
                <li key={q.id}>
                  <Link href={`/places/${q.id}`}>
                    <span className={s.nearName}>{q.name}</span>
                    <span className={s.nearDong}>{q.dong}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={s.right}>
            {slides.length ? (
              <>
                <NearbySlider slides={slides} label={`${areaLabel} 관광지 사진`} creditClassName={s.credit} />
              </>
            ) : (
              <Photo photo={null} alt="" height="100%" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
