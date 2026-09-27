/**
 * 새로 지은 글 표시(기록용). <Ph>로 싼 글은 궁능 누리집에 짝이 없어 새로 지은 문구다.
 * 09-27 사용자 결정으로 화면 표시 없음: 점선 밑줄·'임시 문구' 풀이(title) 없이 글만 그린다. 코드의 <Ph>는 누가 지은 글인지 기록으로 남긴다.
 */
export function Ph({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
