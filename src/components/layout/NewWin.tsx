// 새 창 표시(deck 갈래): KRDS 새 창 아이콘(ico_go, KRDS output.css 의 .svg-icon.ico-go 가림판 그림) + 화면 읽기용 "(새 창)".
// 글자색을 따르고(검정 단추 위에서는 흰색) 크기는 곁 글자 크기(1em). 이미 화면 읽기용 새 창 글이 있는 링크는 sr={false}.
// 09-27: 사이트의 새 창 표시는 이것 하나로 맞췄다(전에 따로 그리던 바깥 그림 external 을 쓰던 바닥 관련사이트, 사진 '원본 보기', 자료 출처 쪽 바깥 링크도 이것).
import s from "./NewWin.module.css";

export function NewWinIcon({ sr = true }: { sr?: boolean }) {
  return (
    <>
      <i className={`svg-icon ico-go ${s.icon}`} aria-hidden="true" />
      {sr && <span className="sr-only">(새 창)</span>}
    </>
  );
}
