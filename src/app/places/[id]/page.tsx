// 관광지 서브메인(61곳). 궁능 누리집 "경복궁" 서브메인(gbg_submain) 모양: 왼쪽 메뉴·빵부스러기·제목 없이
// 맨 위 큰 사진 → 관람 도우미(아이콘 6) → 사진 띠 4개 → 주변 관광지 상자 + 넘기기 판.
// 사진 띠: 제1유형은 칸에 맞춰 자르고, 제1유형이 모자란 띠는 제3유형 사진 여러 장을 자르지 않고 나란히(필름 줄), 사진이 없으면 옅은 단색 판.
// 문구는 궁능 문장의 명사만 바꾼 것이라 점선 밑줄(Ph)이 없다.
//
// 무장애 시안(bf-draft): 관람 도우미 칸에 바로가기 이름만이 아니라 이 곳의 자료 값을 함께 보인다(궁능은 아이콘 + 이름 바로가기 줄).
// 칸: 이용시간, 쉬는 날, 주차, 접근로(값은 접근로 글, 비면 출입통로 글), 화장실, 가까운 장애인 화장실(점선, 11_안건_점선_문구.md 다11), 문의 전화, 지도에서 보기. 값은 관광공사 관광정보·무장애 여행 정보 글 그대로,
// 가까운 장애인 화장실은 도구/10_편의시설_지도.py 의 가장 가까운 한 곳(이름과 직선거리).
// 빈 칸(09-27 사용자 "채울 수 있는 대로 채우고 나머지는 그냥 비워요"): 주차·접근로·화장실은 무장애 여행 정보 글이 없으면
// 경주시 무장애 여행정보·관광정보 주차 글·가까운 편의시설로 채우고 자료 꼬리를 붙인다(data/fill.ts, components/place/FillText.tsx). 그래도 없는 칸은 값 없이 둔다.
// 칸을 누르면 그 값이 자세히 있는 쪽으로 간다. 긴 값은 세 줄까지 보이고 나머지는 줄임표(읽기 도구는 끝까지 읽는다).
// 채운 값의 자료 꼬리는 세 줄 자르기에 걸리지 않게 값 아래 줄에 따로 둔다.
// 이용시간·쉬는 날·무장애 글은 붙은 줄을 나눠 보인다(lib/breaks.ts, 글자는 그대로).
//
// 페르소나 장점 취합(가5): 주변 관광지 줄의 날짜 자리(동네) 뒤에 두 곳 사이 직선거리(경주문화관광 코스의 곳 사이 거리 자리).
// 좌표를 빌린 곳(서악서원)이 끼면 거리를 뺀다. 걷는 분은 자료가 없어 싣지 않는다.
//
// 페르소나 장점 묶음4(morning)에서 더한 것:
// - 가4 관람 도우미 "이용시간" 칸 이름 아래에 지금 운영 상태 한 줄(카카오맵 장소 이름 아래 "운영 전 · 10:00 오픈" 자리).
//   이용시간·쉬는 날 글을 규칙으로 읽고(lib/openNow.ts) 브라우저에서 한국 시각으로 셈한다(OpenNow.tsx). 셈할 수 없는 곳은 아무것도 없다.
// - 가11 관람 도우미 제목 아래 소리로 듣기 단추(서브 쪽 제목 오른쪽 단추와 같은 모양, 보이는 이름 포함)와
// - 가14 한 곳 모아 인쇄 쪽(/places/아이디/print)으로 가는 인쇄 단추(서브 쪽 인쇄 단추 모양).
// - 가15 맨 위 큰 사진 아래에 작은 사진 석 장과 나머지 장수("+ 18", 사진 보기)(대한민국 구석구석 상세의 작은 사진 줄).
//   작은 사진은 큰 사진과 아래 사진 띠에 쓰지 않은 사진 가운데 앞 차례의 석 장이고, 누르면 사진 쪽에서 그 사진이 먼저 보인다(#photo-번호).
//   제1유형은 칸에 맞춰 자르고, 제3유형은 자르지 않는다(Photo). 사진 위에 장수를 얹지 않는다(장수는 따로 한 칸).
//
// 사진 출처(사용자 09-26 출처 표기 줄이기): 사진마다 곁에 짧은 꼴("ⓒ한국관광공사", "ⓒ한국관광콘텐츠랩-촬영자").
// 제1유형은 사진 구석에 작은 딱지로 얹고(큰 사진·작은 사진은 오른쪽 아래, 띠는 PC 오른쪽 아래·휴대전화는 띠 이름이 사진 위에 얹혀 오른쪽 위,
// 넘기기 판은 이름 판·조작 상자가 아래를 차지해 오른쪽 위),
// 제3유형은 사진 위에 얹지 않고 사진 틀 바로 아래 오른쪽 한 줄. 여러 사진 출처를 한곳에 모아 적지 않는다.
//
// 사진 파일(09-27 "제1유형만 줄여 둠"): 관광정보 제1유형은 줄여 둔 판(data/photos.ts localPhoto "big", 여러 폭)이 있으면 그것.
// 맨 위 큰 사진(SIZES.top)·주변 관광지 넘기기 판(SIZES.nearby)은 대표 사진이라 줄여 둔 판이 있고, 사진 띠(SIZES.strip)는 대표 사진이 들 때만 있다
// (나머지 띠 사진은 원 주소 940 안팎: 휴대전화 화면 밀도 2~3이면 그 폭이 알맞다). 작은 사진 석 장은 원 주소 그대로.
import type { Metadata } from "next";
import { placeMetadata } from "@/site/og";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areaOf, placeById, places } from "@/data";
import { largeUrl, localPhoto, photoCreditOf, photosOf } from "@/data/photos";
import { placePages } from "@/site/ia";
import { withJosa } from "@/lib/josa";
import { bfLines, hoursLines, hoursNoteLines } from "@/lib/breaks";
import { Icon, type IconName } from "@/components/icons";
import { CircleButton, CreditBelow, CreditTag, Photo, SIZES } from "@/components/royal";
import { parkingFill, toiletFill, walkFill, type Fill } from "@/data/fill";
import { FillTail } from "@/components/place/FillText";
import { Ph } from "@/components/layout/Ph";
import ReadAloud from "@/components/layout/ReadAloud";
import { nearestAccessibleToilet } from "@/data/bf";
import { parseOpenRule, ruleShowsAnything } from "@/lib/openNow";
import OpenNow from "@/components/place/OpenNow";
import { anyPhoto, areaLabelOf, coverPhoto, fmtDist, nearby, nearbySlides, phoneOf, stripCredit, stripSlots } from "@/components/place/placeData";
import NearbySlider from "@/components/place/NearbySlider";
import PageSteps from "@/components/place/PageSteps";
import { placeLand, SUBMAIN_TITLE_ID } from "@/components/place/landing";
import s from "@/components/place/Submain.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = placeById(id);
  return p ? placeMetadata(p.id, p.name, `/places/${p.id}`) : { title: "관광지" };
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
  // 맨 위 큰 사진의 파일: 줄여 둔 판이 있으면 여러 폭(srcset), 없으면 지금처럼 큰 판 한 장
  const coverBig = cover && localPhoto(cover, "big");

  // 사진 띠 4개에 쓸 사진(아래 사진 띠)
  const slots = stripSlots(p.id, hero?.url ?? null);

  // 가15 작은 사진 석 장과 나머지 장수. 큰 사진은 빼고, 아래 사진 띠에 쓰지 않은 사진부터(차례 유지), 모자라면 띠 사진도.
  const allPhotos = photosOf(p.id);
  const heroIdx = hero ? allPhotos.findIndex((x) => x.url === hero.url) : -1;
  const inStrips = new Set(slots.flatMap((x) => (x.kind === "type1" ? [x.photo.url] : x.kind === "film" ? x.photos.map((f) => f.url) : [])));
  const rest = allPhotos.map((ph, i) => ({ ph, i })).filter((x) => x.i !== heroIdx);
  const thumbs = [...rest.filter((x) => !inStrips.has(x.ph.url)), ...rest.filter((x) => inStrips.has(x.ph.url))].slice(0, 3);
  const moreCount = allPhotos.length - (heroIdx >= 0 ? 1 : 0) - thumbs.length;

  // 가4 지금 운영 상태: 셈 규칙은 서버에서 만들어 넘긴다
  const openRule = parseOpenRule(p.hours, p.closed);

  // 관람 도우미 칸(값을 함께). 값이 없으면 null → 값 없이 이름만
  const tel = phoneOf(p.contact);
  const clean = (v: string | null | undefined) => (v ? v.replace(/\s*\n\s*/g, "\n").replace(/[ \t]{2,}/g, " ").trim() || null : null);
  // 무장애 여행 정보 글(그대로), 없으면 채운 값 + 자료 꼬리(data/fill.ts).
  // 꼬리는 세 줄 자르기(quickVal) 밖 다음 줄에 따로 둔다: 값이 길어 잘려도 꼬리는 늘 보여 관광공사 글과 구별된다(09-27 점검, 휴대전화 글자 가장 크게)
  const bfOr = (v: string | null, fill: Fill | null): { value: React.ReactNode | null; tail?: React.ReactNode } => {
    const own = clean(bfLines(v));
    if (own) return { value: own };
    const text = fill && clean(bfLines(fill.text));
    return fill && text ? { value: text, tail: <FillTail src={fill.src} /> } : { value: null };
  };
  const toiletA = nearestAccessibleToilet(p.id);
  const quick: {
    label: React.ReactNode;
    key: string;
    value: React.ReactNode | null;
    tail?: React.ReactNode;
    href: string;
    icon: IconName;
    tel?: boolean;
    now?: boolean;
  }[] = [
    { key: "hours", label: "이용시간", value: clean(hoursNoteLines(p.hours)), href: `${intro.href}#basic`, icon: "clock", now: ruleShowsAnything(openRule) },
    { key: "closed", label: "쉬는 날", value: clean(hoursLines(p.closed)), href: `${intro.href}#basic`, icon: "calendar" },
    { key: "parking", label: "주차", ...bfOr(p.three.parking, parkingFill(p)), href: `${dir.href}#parking`, icon: "parking" },
    { key: "walk", label: "접근로", ...bfOr(p.three.walk, walkFill(p)), href: bf.href, icon: "walk" },
    { key: "toilet", label: "화장실", ...bfOr(p.three.toilet, toiletFill(p)), href: bf.href, icon: "toilet" },
  ];
  if (!p.approx)
    quick.push({
      key: "toiletA",
      // 09-27 점선 1차 정리에서 '가까운'을 떼고 점선을 뗐다가, 점검(그 관광지 자신의 장애인 화장실처럼 읽힘, 값은 1km 밖일 수 있음)으로
      // 전 글(점선)로 되돌렸다. 정할 것: 05_사이트/11_안건_점선_문구.md 다11
      label: <Ph>가까운 장애인 화장실</Ph>,
      value: toiletA ? `${toiletA.name ? `${toiletA.name} · ` : ""}직선거리 ${toiletA.distanceM.toLocaleString("ko-KR")}m` : null,
      href: `${bf.href}#near`,
      icon: "wheelchair",
    });
  quick.push({ key: "tel", label: "문의 전화", value: tel, href: tel ? `tel:${tel.replace(/-/g, "")}` : `${dir.href}`, icon: "phone", tel: !!tel });
  quick.push({ key: "map", label: "지도에서 보기", value: `${areaLabel}`, href: `/map/${key}?place=${p.id}`, icon: "map" });

  // 사진 띠 4개(궁능: 소개·역사 / 이야기 / 통합예약 / 관람코스)
  const strips = [
    { small: `${withJosa(p.name, "을/를")} 소개합니다.`, big: intro.label, href: intro.href },
    { small: "", big: photos.label, href: photos.href },
    { small: "", big: bf.label, href: bf.href },
    { small: "", big: dir.label, href: dir.href },
  ];
  const near = nearby(p, 9);
  const slides = nearbySlides(p);

  return (
    <div id="contents">
      <h1 className="sr-only">{home.label}</h1>

      {/* 맨 위 큰 사진 */}
      <div className={`${s.visual}${cover ? " " + s.fade : hero ? " " + s.visualContain : ""}`}>
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={largeUrl(coverBig ?? cover)}
              srcSet={coverBig?.srcset}
              sizes={coverBig?.srcset ? SIZES.top : undefined}
              alt={`${p.name} 사진`}
              decoding="async"
              fetchPriority="high"
            />
            <CreditTag text={photoCreditOf(cover)} />
          </>
        ) : (
          <Photo photo={hero} alt={`${p.name} 사진`} height="100%" bg="dark" loading="eager" />
        )}
      </div>
      {/* 제3유형뿐인 곳: 출처를 사진 위에 얹지 않고 큰 사진 틀 바로 아래 오른쪽 한 줄 */}
      {!cover && hero && (
        <div className={s.inner}>
          <CreditBelow text={photoCreditOf(hero)} />
        </div>
      )}
      {/* 가15 작은 사진 석 장 + 나머지 장수. 소리로 듣기는 건너뛴다(사진 쪽으로 가는 링크 줄) */}
      {thumbs.length > 0 && (
        <ul className={`${s.inner} ${s.thumbs}`} aria-label={`${p.name} 사진`} data-read-skip="">
          {thumbs.map(({ ph, i }) => (
            <li key={ph.url}>
              <Link href={`${photos.href}#photo-${i + 1}`} className={s.thumb}>
                <Photo
                  photo={{ url: ph.small ?? ph.url, type: ph.type }}
                  alt=""
                  height="100%"
                  bg="light"
                  credit={ph.type === "Type1" ? photoCreditOf(ph) : null}
                />
                <span className="sr-only">
                  {i + 1}번째 사진 보기
                </span>
              </Link>
              {/* 사진 아래 한 줄 출처: 제3유형은 늘, 제1유형은 휴대전화(칸 가로 85 안팎이라 딱지가 사진을 덮음)에서만. PC 제1유형은 사진 위 딱지 */}
              <CreditBelow text={photoCreditOf(ph)} className={ph.type === "Type1" ? s.thumbCreditM : undefined} />
            </li>
          ))}
          <li>
            <Link href={photos.href} className={`${s.thumb} ${s.thumbMore}`}>
              {moreCount > 0 && <b>+ {moreCount}</b>}
              <span>사진 보기</span>
            </Link>
          </li>
        </ul>
      )}

      {/* 관람 도우미 */}
      <section className={s.quick} aria-labelledby={SUBMAIN_TITLE_ID}>
        <div className={`${s.inner} ${s.quickInner}`}>
          <div className={s.quickTit}>
            {/* 이어 읽기·주변 관광지 링크가 여는 자리(landing.ts placeLand) */}
            <h2 id={SUBMAIN_TITLE_ID}>{p.name} 관람 도우미</h2>
            {/* 가11 소리로 듣기(한국어 목소리가 있는 브라우저에서만 보임), 가14 한 곳 모아 인쇄 쪽 */}
            <div className={`rc-tools ${s.quickTools}`}>
              <ReadAloud />
              <Link href={`/places/${p.id}/print`} className="rc-tool rc-tool--print rc-tool--always" title={`${p.name} 인쇄`}>
                <span className="rc-tool__circle">
                  <Icon name="print" size={30} strokeWidth={1.6} />
                </span>
                <span className="rc-tool__label">인쇄</span>
              </Link>
            </div>
          </div>
          <div className={s.quickBody}>
            <ul className={s.quickGrid}>
              {quick.map((q) => {
                const inner = (
                  <>
                    <span className={s.quickIco}>
                      <Icon name={q.icon} size={34} strokeWidth={1.4} />
                    </span>
                    <span className={s.quickLabel}>{q.label}</span>
                    {q.now && <OpenNow rule={openRule} className={s.quickNow} />}
                    {q.value != null && <span className={s.quickVal}>{q.value}</span>}
                    {q.tail != null && <span className={s.quickTail}>{q.tail}</span>}
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
        </div>
      </section>

      {/* 사진 띠 4개 */}
      <section className={s.menu} aria-label={`${p.name} 안내`}>
        <div className={s.inner}>
          <ul className={s.stripList}>
            {strips.map((st, i) => {
              const slot = slots[i];
              // 제1유형 한 장: 줄여 둔 판이 있으면(대표 사진이 띠에 들 때) 여러 폭, 없으면 원 주소
              const one = slot.kind === "type1" ? localPhoto(slot.photo, "big") : null;
              const cls = [s.strip, i % 2 ? s.stripEven : "", slot.kind === "film" ? s.stripFilm : "", slot.kind === "empty" ? s.stripPlain : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <li key={st.href}>
                  <Link href={st.href} className={cls}>
                    <span className={s.stripImg}>
                      {slot.kind === "type1" && one ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={one.url}
                            srcSet={one.srcset}
                            sizes={one.srcset ? SIZES.strip : undefined}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            data-kogl="Type1"
                          />
                          <CreditTag text={photoCreditOf(slot.photo)} />
                        </>
                      ) : slot.kind === "film" ? (
                        <>
                          <span className={s.film}>
                            {slot.photos.map((ph) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={ph.url} src={ph.url} alt="" loading="lazy" decoding="async" data-kogl="Type3" />
                            ))}
                          </span>
                          {/* 제3유형 필름 줄: 사진 위에 얹지 않고 줄 바로 아래 오른쪽 한 줄(같은 출처는 한 번) */}
                          <CreditBelow text={stripCredit(slot)} />
                        </>
                      ) : (
                        <span className={s.plate} />
                      )}
                    </span>
                    <span className={s.stripTxt}>
                      {st.small && <span className={s.stripSmall}>{st.small}</span>}
                      <span className={s.stripBig}>{st.big}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
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
              {near.map(({ place: q, distM }) => (
                <li key={q.id}>
                  <Link href={placeLand(q.id)}>
                    <span className={s.nearName}>{q.name}</span>
                    <span className={s.nearDong}>
                      {q.dong}
                      {distM !== null && <> · 직선거리 {fmtDist(distM)}</>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={s.right}>
            {slides.length ? (
              <>
                <NearbySlider slides={slides} label={`${areaLabel} 관광지 사진`} />
              </>
            ) : (
              <Photo photo={null} alt="" height="100%" />
            )}
          </div>
        </div>
      </section>

      {/* deck 갈래: 쪽 끝 이어 읽기(다음: 소개) */}
      <PageSteps place={p} at={0} className={s.inner} />
    </div>
  );
}
