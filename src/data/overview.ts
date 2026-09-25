// 관광지 소개 글(관광공사 개요) 문단. 서버 컴포넌트에서만 부른다.
// overview.json 만드는 곳: 05_사이트/도구/12_버스_문단_사이트.py (09_개요_문단.py 결과를 places.json overview 와 글자까지 대조한 뒤 옮김).
// 글자는 places.json overview 그대로이고 바꾼 것은 줄바꿈 자리와 겹친 빈칸뿐이다.
// 나누는 규칙(09_개요_문단_읽는법.md 4절): 원문 줄바꿈은 문단 경계, 한 줄에 문장이 넷 이상이면 두세 문장씩 나눔.
import raw from "./overview.json";

const OV = raw as unknown as { places: Record<string, string[]> };

/** 이 곳의 소개 글 문단. 소개 글이 없으면 빈 목록 */
export function overviewParas(id: string): string[] {
  return OV.places[id] ?? [];
}
