// 사이트 소개 > 이용 안내(궁능 소통마당 > 자주 묻는 질문 모양).
// "Q&A" 제목 → 윗선 남색 → 묻고 답하기 줄(Q 동그라미 + 물음 + ∨). 누르면 아래에 답이 펼쳐진다.
// 펼침은 <details>/<summary>라 자바스크립트 없이도 되고, 키보드(Tab으로 옮기고 Enter·Space로 여닫기)로 쓸 수 있다.
// 물음과 답은 예전 이용 안내 글(모두 임시 문구)을 그대로 옮겼다.
// 09-27 점선 1차 정리(05_사이트/11_안건_점선_문구.md): 답은 궁능 관람코스 "번호를 클릭하시면 아래 화면에서 시설사진을 볼 수 있습니다."와
// 자주 묻는 질문 "따라서 관람 종류도 전각관람과 후원관람이 있습니다." 틀로 바꿔 점선을 뗐다. 단추 이름 '글자·화면 설정'은 머리 단추 이름 그대로.
// 첫 답은 점검(틀 글 '설정을 볼 수 있습니다'에는 바꿀 수 있다는 말이 없음)으로 전 글(점선)로 되돌렸다. 정할 것: 11_안건_점선_문구.md 다9
import type { Metadata } from "next";
import { pageMetadata } from "@/site/og";
import Link from "next/link";
import { Ph, Section, SubPage } from "@/components/layout/PageParts";
import { Icon } from "@/components/icons";
import { MENU } from "@/site/ia";
import { withJosa } from "@/lib/josa";
import SettingsButton from "../_parts/SettingsButton";
import s from "../about.module.css";

const SECTION = MENU[3];
const PAGE = SECTION.children![2];
const MAP = MENU[0];
const LIST = MENU[1];

export const metadata: Metadata = pageMetadata(PAGE.label, PAGE.href);

type QA = { id: string; q: React.ReactNode; a: React.ReactNode };

export default function GuidePage() {
  const items: QA[] = [
    {
      id: "text-size",
      q: "글자·화면 설정 이용 방법",
      a: (
        <>
          <p>
            <Ph>화면 오른쪽 위의 ‘글자·화면 설정’ 단추를 누르면 글자 크기와 화면 밝기를 바꿀 수 있습니다.</Ph>
          </p>
          <div className={s.actions}>
            <SettingsButton>
              글자·화면 설정
            </SettingsButton>
          </div>
        </>
      ),
    },
    {
      id: "map",
      q: "관광지 지도 이용 방법",
      a: (
        <>
          <ul>
            <li>
              경주 전체 지도에서 색칠한 권역을 누르시면 그 권역 지도를 볼 수 있습니다.
            </li>
            <li>
              지도 위 점을 누르시면 관광지 이름과 안내를 볼 수 있습니다.
            </li>
            <li>
              확대·축소 단추를 누르시면 지도를 크게, 작게 볼 수 있습니다.
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
      q: "관광지 목록 이용 방법",
      a: (
        <>
          <p>
            관광지 목록 종류는 {withJosa((LIST.children ?? []).map((c) => c.label).join(", "), "이/가")} 있습니다.
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
