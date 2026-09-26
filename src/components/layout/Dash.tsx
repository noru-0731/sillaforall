// 빈 칸 표시(09-26 저녁 사용자 결정): 자료의 그 칸에 글이 없으면 "-"(궁능·경주장애인관광도우미센터·Euan's Guide가 쓰는 모양).
// 뜻풀이 한 줄은 "-"가 하나라도 있는 표·칸 묶음 바로 아래에 쪽마다 한 번 둔다. 새로 지은 문장이라 점선(Ph).
// 글은 무장애 정보 보는 법 쪽 '‘-’ 표시' 절의 두 문장을 한 문장으로 모은 것이다.
import { TipList } from "@/components/royal/Bits";
import { Ph } from "./Ph";

/** 빈 칸 표시 */
export const DASH = "-";

/** "-" 뜻풀이 글(점선으로 감싸 쓴다). 시설 칸(주차·접근로·화장실 등)이 있는 표에는 뒷말까지 */
export const DASH_NOTE_TEXT = "‘-’ 표시는 자료의 그 칸에 글이 없다는 뜻이며, 시설이 없다는 뜻은 아닙니다.";
/** 시설 칸이 없는 표(목록 카드의 주소·이용시간·쉬는 날·분류, 소개·오시는 길 표)의 뜻풀이: 뒷말을 뺀 앞 절 */
export const DASH_NOTE_SHORT = "‘-’ 표시는 자료의 그 칸에 글이 없다는 뜻입니다.";

/** "-" 뜻풀이 한 줄(※ 줄). className 은 앞 표와의 간격. facility: 시설 칸이 있는 표면 "시설이 없다는 뜻은 아닙니다"까지 */
export function DashNote({ className, facility = false }: { className?: string; facility?: boolean }) {
  return <TipList className={className} items={[<Ph key="a">{facility ? DASH_NOTE_TEXT : DASH_NOTE_SHORT}</Ph>]} />;
}
