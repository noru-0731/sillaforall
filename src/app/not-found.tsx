// 없는 주소 쪽(404). 궁능유적본부 누리집 없는 주소 쪽의 말 그대로: 쪽 제목 '페이지를 찾을 수 없습니다.',
// 본문 한 줄 '웹 페이지를 찾을 수 없습니다.', 링크 하나 '이전 페이지'(뒤로 가기, 뒤로 갈 쪽이 없으면 첫 쪽, components/layout/BackLink.tsx).
// 머리·바닥은 app/layout.tsx 가 준다. 제목은 서브 쪽 제목 모양(.rc-titlewrap h1), 링크는 KRDS 단추(krds-btn medium primary,
// 글자·화면 설정 창의 단추와 같은 크기). 문서 제목은 다른 쪽과 같은 틀("%s | 경주 관광지 안내"). 응답 코드는 404.
import type { Metadata } from "next";
import BackLink from "@/components/layout/BackLink";
import s from "./not-found.module.css";

const TITLE = "페이지를 찾을 수 없습니다.";

export const metadata: Metadata = { title: TITLE };

export default function NotFound() {
  return (
    <div className="rc-sub-inner">
      <div className="rc-contents" id="contents">
        <div className="rc-titlewrap">
          <h1>{TITLE}</h1>
        </div>
        <div className="rc-subcon">
          <p>웹 페이지를 찾을 수 없습니다.</p>
          <div className={s.act}>
            <BackLink className="krds-btn medium primary">이전 페이지</BackLink>
          </div>
        </div>
      </div>
    </div>
  );
}
