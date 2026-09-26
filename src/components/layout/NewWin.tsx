// 새 창 표시(deck 갈래): KRDS 새 창 아이콘(ico_go, KRDS output.css 의 .svg-icon.ico-go 가림판 그림) + 화면 읽기용 "(새 창)".
// 글자색을 따르고(검정 단추 위에서는 흰색) 크기는 곁 글자 크기(1em). 이미 화면 읽기용 새 창 글이 있는 링크는 sr={false}.
import s from "./NewWin.module.css";

export function NewWinIcon({ sr = true }: { sr?: boolean }) {
  return (
    <>
      <i className={`svg-icon ico-go ${s.icon}`} aria-hidden="true" />
      {sr && <span className="sr-only">(새 창)</span>}
    </>
  );
}
