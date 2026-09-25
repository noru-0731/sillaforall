// 사이트 소개 > 이용 안내(궁능 소통마당 > 자주 묻는 질문 모양).
// "Q&A" 제목 → 윗선 남색 → 묻고 답하기 줄(Q 동그라미 + 물음 + ∨). 누르면 아래에 답이 펼쳐진다.
// 펼침은 <details>/<summary>라 자바스크립트 없이도 되고, 키보드(Tab으로 옮기고 Enter·Space로 여닫기)로 쓸 수 있다.
// 물음과 답은 예전 이용 안내 글(모두 임시 문구)을 그대로 옮겼다.
import type { Metadata } from "next";
import Link from "next/link";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { Icon } from "@/components/icons";
import { MENU } from "@/site/ia";
import SettingsButton from "../_parts/SettingsButton";
import s from "../about.module.css";

const SECTION = MENU[3];
const PAGE = SECTION.children![2];
const MAP = MENU[0];
const LIST = MENU[1];

export const metadata: Metadata = { title: PAGE.label };

type QA = { id: string; q: React.ReactNode; a: React.ReactNode };

export default function GuidePage() {
  const items: QA[] = [
    {
      id: "text-size",
      q: <Ph>글자를 크게 보려면</Ph>,
      a: (
        <>
          <p>
            <Ph>화면 오른쪽 위의 ‘글자·화면 설정’ 단추를 누르면 글자 크기와 화면 밝기를 바꿀 수 있습니다.</Ph>
          </p>
          <div className={s.actions}>
            <SettingsButton>
              <Ph>글자·화면 설정</Ph>
            </SettingsButton>
          </div>
        </>
      ),
    },
    {
      id: "map",
      q: <Ph>지도 쓰는 법</Ph>,
      a: (
        <>
          <ul>
            <li>
              <Ph>경주 전체 지도에서 지역을 누르면 그 지역 지도로 갑니다.</Ph>
            </li>
            <li>
              <Ph>지도 위 점을 누르면 관광지 이름과 안내가 나옵니다.</Ph>
            </li>
            <li>
              <Ph>지도 단추로 크게, 작게 볼 수 있습니다.</Ph>
            </li>
          </ul>
          <div className={s.actions}>
            <Link href={MAP.href} className={s.btn}>
              {MAP.label}
              <Icon name="arrow-right" size={20} strokeWidth={2} />
            </Link>
          </div>
        </>
      ),
    },
    {
      id: "list",
      q: <Ph>목록에서 관광지 찾는 법</Ph>,
      a: (
        <>
          <p>
            <Ph>관광지를 지역별, 가나다순, 거점별로 나눠 볼 수 있습니다.</Ph>
          </p>
          <div className={s.actions}>
            {LIST.children?.map((c) => (
              <Link key={c.href} href={c.href} className={`${s.btn} ${s.btnLine}`}>
                {c.label}
              </Link>
            ))}
          </div>
        </>
      ),
    },
  ];

  return (
    <SubPage
      crumbs={[
        { label: SECTION.label, href: SECTION.href },
        { label: PAGE.label, href: PAGE.href },
      ]}
      title={PAGE.label}
      side={SECTION}
      current={PAGE.href}
    >
      <Section id="qa" title="Q&A">
        <div className={s.qa}>
          {items.map((it) => (
            <details key={it.id} id={it.id} className={s.qaItem}>
              <summary className={s.qaQ}>
                <span className={s.qaBadge} aria-hidden="true">
                  Q
                </span>
                <span className={s.qaText}>{it.q}</span>
                <Icon name="chevron-down" size={22} strokeWidth={1.8} className={s.qaChev} />
              </summary>
              <div className={s.qaA}>
                <span className={`${s.qaBadge} ${s.qaBadgeA}`} aria-hidden="true">
                  A
                </span>
                <div className={s.qaABody}>{it.a}</div>
              </div>
            </details>
          ))}
        </div>
      </Section>
    </SubPage>
  );
}
