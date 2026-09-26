// 메뉴 쪽 끝 이어 읽기(deck 갈래). PageSteps(관광지 한 곳의 쪽 차례)와 같은 gov.uk 'Previous : …' / 'Next : …' 꼴을
// 1차 메뉴 하나의 2차 쪽 차례(메뉴 정의 site/ia.ts 차례)에 쓴다. 쪽 이름은 메뉴 이름 그대로. 첫 쪽은 '다음'만, 끝 쪽은 '이전'만.
// 무장애 정보 메뉴 네 쪽(보는 법, 있는 곳, 없는 곳, 계단 없는 길) 끝에 둔다(처음에는 계단 없는 길 쪽에만 두었다가 한 방향으로만 이어져 넷 모두로).
// 누르는 칸 치수·쌓임은 PageSteps.module.css 그대로. 새 창으로 열지 않는다.
import Link from "next/link";
import type { NavItem } from "@/site/ia";
import { Icon } from "@/components/icons";
import { titleLand } from "./landing";
import s from "./PageSteps.module.css";

export default function MenuSteps({ section, current }: { section: NavItem; current: string }) {
  const items = section.children ?? [];
  const at = items.findIndex((c) => c.href === current);
  if (at < 0) return null;
  const prev = at > 0 ? items[at - 1] : null;
  const next = at < items.length - 1 ? items[at + 1] : null;
  if (!prev && !next) return null;

  return (
    <nav className={s.steps} aria-label={`${section.label} 이어 읽기`}>
      <ul className={s.list}>
        {prev && (
          <li className={s.prev}>
            <Link href={titleLand(prev.href)} className={s.link}>
              <Icon name="chevron-left" size={22} strokeWidth={2} className={s.arrow} />
              <span className={s.txt}>
                <span className={s.dir}>이전</span>
                <span className="sr-only">: </span>
                <span className={s.name}>{prev.label}</span>
              </span>
            </Link>
          </li>
        )}
        {next && (
          <li className={s.next}>
            <Link href={titleLand(next.href)} className={s.link}>
              <span className={s.txt}>
                <span className={s.dir}>다음</span>
                <span className="sr-only">: </span>
                <span className={s.name}>{next.label}</span>
              </span>
              <Icon name="chevron-right" size={22} strokeWidth={2} className={s.arrow} />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
