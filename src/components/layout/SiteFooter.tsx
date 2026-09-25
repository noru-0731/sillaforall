// 공통 푸터(궁능유적본부 누리집 모양): 위 줄 링크 + 관련사이트 펼침, 아래 회색 판에 사이트 이름·"관광지별 연락처" 펼침·만든 곳·출처.
// 정부 누리집이 아니므로 인증 마크·운영기관 식별자는 넣지 않는다. KRDS 출처 문장은 지우지 않는다.
// 관광지별 연락처(궁능 "관리소별 연락처" 표: 기관 / 주소 / 연락처): 문의 글이 있는 관광지(가나다순), 주소 앞 [우편번호].
import { Fragment } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/site/ia";
import { byName, places, zipOf } from "@/data";
import { phoneOf } from "@/components/place/placeData";
import { Ph } from "./Ph";
import FooterRelated from "./FooterRelated";
import FooterTel from "./FooterTel";
import f from "./Footer.module.css";

/** 전화번호는 붙임표 뒤에서만 줄이 바뀌게 한다(궁능 휴대전화 표처럼 "054-772-" / "9289"). 묶음 안에서는 끊지 않는다.
 *  좁은 칸(휴대전화, 글자 크게)에서 번호가 칸과 화면 밖으로 나가지 않게. */
function TelText({ tel }: { tel: string }) {
  const parts = tel.split("-");
  return (
    <>
      {parts.map((g, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          <span className={f.telPart}>{i < parts.length - 1 ? `${g}-` : g}</span>
        </Fragment>
      ))}
    </>
  );
}

/** 문의 글에서 첫 전화번호만 누르면 걸리게 */
function Contact({ text }: { text: string }) {
  const tel = phoneOf(text);
  if (!tel) return <>{text}</>;
  const at = text.indexOf(tel);
  return (
    <>
      {text.slice(0, at)}
      <a href={`tel:${tel.replace(/-/g, "")}`}>
        <TelText tel={tel} />
      </a>
      {text.slice(at + tel.length)}
    </>
  );
}

function TelTable() {
  const rows = places.filter((p) => p.contact).sort(byName);
  return (
    <table className={f.table}>
      <caption className="sr-only">관광지별 연락처 표 - 관광지, 주소, 연락처로 구성</caption>
      <colgroup>
        <col className={f.c1} />
        <col className={f.c2} />
        <col className={f.c3} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">관광지</th>
          <th scope="col">주소</th>
          <th scope="col">연락처</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => {
          const zip = zipOf(p.id);
          return (
            <tr key={p.id}>
              <th scope="row">{p.name}</th>
              <td>
                {zip && <>[{zip}] </>}
                {p.address ?? "-"}
              </td>
              <td>
                <Contact text={p.contact!} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function SiteFooter() {
  return (
    <footer className="rc-footer">
      <div className="rc-ft-top">
        <div className="rc-ft-inner">
          <ul className="rc-ft-links">
            <li>
              <Link href="/about/sources">자료 출처와 저작권</Link>
            </li>
            <li>
              <Link href="/about/guide">이용 안내</Link>
            </li>
            <li>
              <Link href="/sitemap">사이트맵</Link>
            </li>
          </ul>
          <FooterRelated />
        </div>
      </div>
      <div className="rc-ft-btm">
        <div className="rc-ft-inner">
          <p className="rc-ft-logo">{SITE_NAME}</p>
          <div className="rc-ft-txt">
            <FooterTel label="관광지별 연락처">
              <TelTable />
            </FooterTel>
            <p className="rc-ft-maker">
              만든 곳 <Ph>2026 한국관광 데이터랩 활용 경진대회 출품 팀</Ph>
            </p>
            <ul className="rc-ft-credit">
              <li>
                본 저작물은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 ‘범정부 UI/UX 디자인시스템(KRDS)’을
                이용하였으며, 해당 저작물은 ‘
                <a href="https://www.krds.go.kr" target="_blank" rel="noopener noreferrer" title="새 창 열림">
                  KRDS 디자인시스템 홈페이지(www.krds.go.kr)
                </a>
                ’에서 무료로 다운받으실 수 있습니다.
              </li>
              <li>관광지 사진과 소개글: 한국관광공사 관광정보(TourAPI)</li>
              <li>
                <Ph>관광지 사진 일부: 한국관광공사 관광사진 정보(한국관광콘텐츠랩)</Ph>
              </li>
              <li>읍면동 경계선: 통계청 SGIS 행정구역 경계(2026년 7월), vuski/admdongkor 가공(CC BY 4.0)</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
