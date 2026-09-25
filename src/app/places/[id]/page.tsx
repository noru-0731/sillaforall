// 관광지 서브메인(61곳). 궁능 누리집 "경복궁" 서브메인(gbg_submain) 모양: 왼쪽 메뉴·빵부스러기·제목 없이
// 맨 위 큰 사진 → 관람 도우미(아이콘 6) → 사진 띠 4개 → 주변 관광지 상자 + 넘기기 판.
// 사진 띠: 제1유형은 칸에 맞춰 자르고, 제1유형이 모자란 띠는 제3유형 사진 여러 장을 자르지 않고 나란히(필름 줄), 사진이 없으면 옅은 단색 판.
// 문구는 궁능 문장의 명사만 바꾼 것이라 점선 밑줄(Ph)이 없다.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areaOf, placeById, places } from "@/data";
import { photoCredit } from "@/data/photos";
import { placePages } from "@/site/ia";
import { withJosa } from "@/lib/josa";
import { Icon, type IconName } from "@/components/icons";
import { CircleButton, Photo } from "@/components/royal";
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

  // 관람 도우미 6칸(문의 전화는 번호가 있을 때만)
  const tel = phoneOf(p.contact);
  const quick: { label: string; href: string; icon: IconName; tel?: boolean }[] = [
    { label: "이용시간", href: `${intro.href}#basic`, icon: "clock" },
    { label: bf.label, href: bf.href, icon: "wheelchair" },
    { label: "지도에서 보기", href: `/map/${key}?place=${p.id}`, icon: "map" },
    { label: dir.label, href: dir.href, icon: "pin" },
    { label: "사진 보기", href: photos.href, icon: "camera" },
  ];
  if (tel) quick.push({ label: "문의 전화", href: `tel:${tel.replace(/-/g, "")}`, icon: "phone", tel: true });

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
          <img src={cover.url} alt={`${p.name} 사진`} decoding="async" fetchPriority="high" />
        ) : (
          <Photo photo={hero} alt={`${p.name} 사진`} height="100%" bg="dark" loading="eager" />
        )}
      </div>
      {hero && (
        <p className={`${s.inner} ${s.credit}`}>
          {p.name} · {photoCredit(hero.type)}
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
          <ul className={s.quickList}>
            {quick.map((q) => (
              <li key={q.label}>
                {q.tel ? (
                  <a href={q.href}>
                    <span className={s.quickIco}>
                      <Icon name={q.icon} size={34} strokeWidth={1.4} />
                    </span>
                    <span>
                      {q.label}
                      <span className="sr-only"> {tel}</span>
                    </span>
                  </a>
                ) : (
                  <Link href={q.href}>
                    <span className={s.quickIco}>
                      <Icon name={q.icon} size={34} strokeWidth={1.4} />
                    </span>
                    <span>{q.label}</span>
                  </Link>
                )}
              </li>
            ))}
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
                <NearbySlider slides={slides} label={`${areaLabel} 관광지 사진`} />
                <p className={s.credit}>{photoCredit("Type1")}</p>
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
