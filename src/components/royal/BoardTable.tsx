// 게시판 표(궁능 공지사항·역사 표): 윗선 2px 검정, 머리 바탕 #f8f8f8, 칸 높이 55, 칸 사이 세로선 #eaeaea.
// 컴포넌트로 쓰거나, 직접 <table className="rc-board"> 를 써도 된다(globals.css).
export default function BoardTable({
  caption,
  head,
  rows,
  cols,
  align,
  rowHeader = false,
  className,
}: {
  /** 표 설명(화면에는 안 보이고 읽기 도구가 읽는다) */
  caption: string;
  /** 머리 칸 글자 */
  head: React.ReactNode[];
  /** 몸 줄들. 줄마다 칸 배열 */
  rows: React.ReactNode[][];
  /** 칸 너비(예: ["25%", "auto"]) */
  cols?: string[];
  /** 칸별 정렬: "c" 가운데(기본), "l" 왼쪽 */
  align?: ("c" | "l")[];
  /** 첫 칸을 줄 머리(th scope=row)로 */
  rowHeader?: boolean;
  className?: string;
}) {
  return (
    <div className="rc-board-wrap">
      <table className={`rc-board${className ? " " + className : ""}`}>
        <caption>{caption}</caption>
        {cols && (
          <colgroup>
            {cols.map((w, i) => (
              <col key={i} style={w === "auto" ? undefined : { width: w }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr>
            {head.map((h, i) => (
              <th scope="col" key={i}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => {
                const cls = align?.[ci] === "l" ? "tal" : undefined;
                return rowHeader && ci === 0 ? (
                  <th scope="row" key={ci} className={cls}>
                    {c}
                  </th>
                ) : (
                  <td key={ci} className={cls}>
                    {c}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
