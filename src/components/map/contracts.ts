// 지도 부품의 약속. 쪽들은 이 모양대로만 지도를 부른다.
// 다른 쪽(첫 쪽, 관광지 쪽)도 쓰므로 있던 항목은 빼거나 뜻을 바꾸지 않는다. 새 항목은 모두 없어도 된다.
import type { AreaKey } from "@/data";

export type MapViewProps = {
  /** 어느 범위를 그릴지: 경주 전체 또는 권역 하나 */
  view: "full" | AreaKey;
  /** 보여 줄 관광지 id. 비우면 범위 안의 61곳 전부 */
  placeIds?: string[];
  /** 강조할 관광지 하나(관광지 쪽의 위치 지도, 지도 쪽의 고른 관광지) */
  highlightId?: string;
  /** 끌기·확대·점 누르기. 기본 true. 관광지 쪽의 작은 지도는 false */
  interactive?: boolean;
  /** 경주 전체에서 권역 칠하기와 권역 누르면 /map/[권역]으로 가기. 기본: view가 full이면 true */
  showAreas?: boolean;
  /** 지도 위 이름 글자. 기본 true */
  labels?: boolean;
  /** 지도 높이(CSS 값). 기본은 폭에 맞춘 비율(넓은 칸에서 interactive면 궁능 관람코스처럼 69.3rem) */
  height?: string;
  /** 스크린리더용 지도 설명 */
  ariaLabel?: string;

  // ── 아래는 궁능 관람코스 모양으로 바꾸며 더한 것 ──

  /** 여러 곳을 함께 강조(거점 단추). 주면 나머지 점은 흐려진다. 빈 배열이면 강조 없음(범례 칸은 남는다) */
  emphasisIds?: string[];
  /** 점(또는 묶음 목록의 이름)을 누르면 부른다. 정보 창도 그대로 열린다 */
  onSelectPlace?: (id: string) => void;
  /** 경주 전체에서 권역을 누르면 쪽을 옮기지 않고 이것을 부른다(목록 쪽 권역 거르기) */
  onAreaSelect?: (key: AreaKey) => void;
  /** 고른 권역(onAreaSelect와 함께). 나머지 권역은 흐려진다 */
  selectedArea?: AreaKey | null;
  /** 범례를 보일지. 기본 true */
  legend?: boolean;
  /** 강조한 곳(highlightId)의 범례 글. 주면 highlightId가 없어도 범례 칸을 늘 둔다 */
  highlightLabel?: string;
  /** 둥근 테두리 없이(다른 틀 안에 넣는 작은 지도) */
  plain?: boolean;
};
