// 공공누리 글자 상자. 궁능 누리집의 "OPEN 공공누리" 그림 상자 자리에 공식 표시 그림 대신 글자로 만든 상자를 둔다.
// 문장은 궁능 문장을 바꿔 쓴 것(명세 5절)이라 <Ph> 없이 쓴다.
// by(촬영자)를 주면 관광사진 정보(한국관광콘텐츠랩) 사진으로 보고, 한국관광콘텐츠랩이 정한 출처 꼴("출처 : ⓒ한국관광콘텐츠랩-촬영자")을 한 줄 더 적는다.
// 이 줄은 한국관광콘텐츠랩 출처표기 방법을 따른 글이라 <Ph> 없이 쓴다.
// lic(09-27 사진 채우기)을 주면 국가유산청 사진으로 보고, 문장의 기관 이름을 lic.org(국가유산청)로 바꾸고, 출처 줄을
// 국가유산청 저작권정책의 출처 표시(기관 이름, 저작물 이름, 누리집 주소 www.khs.go.kr) 꼴로 적는다. 저작물 이름은 원 자료의 사진 이름 그대로.
// 경주시정뉴스 사진(경주시청 최신기사, 공공누리 제1유형)도 같은 꼴: 기관 이름은 기사 쪽 공공누리 상자의 '경주시청', 저작물 이름은 기사 제목,
// 누리집 주소는 lic.site(www.gyeongju.go.kr), 링크는 그 기사 쪽.
// 위키미디어 공용 사진(CC 이용허락)은 공공누리가 아니라 이 상자를 쓰지 않고 CcBox(아래)를 쓴다.
import type { KoglType, PhotoLicense } from "@/data/credit";
import { galleryCredit, koglCondition, koglNo } from "@/data/credit";
import { withJosa } from "@/lib/josa";

export default function KoglBox({ type, by, lic, className }: { type: KoglType; by?: string; lic?: PhotoLicense; className?: string }) {
  const n = koglNo(type);
  const org = lic?.org ?? "한국관광공사";
  return (
    <div className={`rc-kogl${className ? " " + className : ""}`}>
      <p className="rc-kogl__mark" aria-hidden="true">
        <span>공공누리</span>
        <b>제{n}유형</b>
      </p>
      <p className="rc-kogl__txt">
        {withJosa(org, "이/가")} 보유한 이 사진은 &quot;공공누리&quot; 제{n}유형({koglCondition(type)}) 조건에 따라 이용할 수 있습니다.
        {by && (
          <>
            <br />
            출처 : {galleryCredit(by)}
          </>
        )}
        {lic?.org && (
          <>
            <br />
            출처 : {lic.org}
            {lic.title ? `, ${lic.title}` : ""},{" "}
            {lic.page ? (
              <a href={lic.page} target="_blank" rel="noopener noreferrer" title="새 창 열림">
                {lic.site ?? "www.khs.go.kr"}
              </a>
            ) : (
              (lic.site ?? "www.khs.go.kr")
            )}
          </>
        )}
      </p>
    </div>
  );
}

/**
 * 위키미디어 공용 사진(CC 이용허락)의 저작자·이용허락·파일 쪽 상자. 공공누리 상자와 같은 자리·모양에 둔다.
 * 표시 칸 이름(저작자, 이용허락, 파일)과 값은 위키미디어 공용 파일 쪽의 칸 그대로다(저작자 = Artist, 이용허락 = LicenseShortName).
 */
export function CcBox({ lic, className }: { lic: PhotoLicense; className?: string }) {
  const short = (lic.license ?? "").replace(/^CC\s*/, "");
  return (
    <div className={`rc-kogl${className ? " " + className : ""}`}>
      <p className="rc-kogl__mark" aria-hidden="true">
        <span>CC</span>
        <b>{short}</b>
      </p>
      <p className="rc-kogl__txt">
        저작자 : {lic.author}
        <br />
        이용허락 :{" "}
        {lic.licenseUrl ? (
          <a href={lic.licenseUrl} target="_blank" rel="noopener noreferrer" title="새 창 열림">
            {lic.license}
          </a>
        ) : (
          lic.license
        )}
        {lic.page && (
          <>
            <br />
            파일 :{" "}
            <a href={lic.page} target="_blank" rel="noopener noreferrer" title="새 창 열림">
              위키미디어 공용
            </a>
          </>
        )}
      </p>
    </div>
  );
}

/** 사진 한 장의 이용허락 상자: 위키미디어 사진은 CcBox, 나머지는 공공누리 상자(국가유산청·경주시정뉴스 사진은 lic 으로 기관·출처 줄) */
export function PhotoLicenseBox({
  photo,
  className,
}: {
  photo: { type: KoglType; from?: string; by?: string; lic?: PhotoLicense };
  className?: string;
}) {
  if (photo.from === "wikimedia" && photo.lic) return <CcBox lic={photo.lic} className={className} />;
  return (
    <KoglBox
      type={photo.type}
      by={photo.from === "gallery" ? photo.by : undefined}
      lic={photo.from === "heritage" || photo.from === "gyeongju" ? photo.lic : undefined}
      className={className}
    />
  );
}
