// 한국어 조사 붙이기. 끝 글자의 받침으로 "을/를", "이/가" 등을 고른다.
//   josa("불국사", "을/를") → "를"      withJosa("불국사", "을/를") → "불국사를"
//   josa("첨성대", "이/가") → "가"      withJosa("오릉", "으로/로") → "오릉으로"
// 한글이 아닌 끝 글자(영문·숫자)는 읽는 소리로 받침을 짐작한다. 괄호·따옴표·공백 같은 끝 기호는 건너뛴다.

export type JosaPair = "을/를" | "이/가" | "은/는" | "과/와" | "으로/로" | "이다/다" | "아/야" | "이나/나" | "이랑/랑";

// 숫자 끝소리: 0 영, 1 일, 2 이, 3 삼, 4 사, 5 오, 6 육, 7 칠, 8 팔, 9 구
const DIGIT_JONG: Record<string, number> = { "0": 21, "1": 8, "2": 0, "3": 16, "4": 0, "5": 0, "6": 1, "7": 8, "8": 8, "9": 0 };
// 영문 끝 글자를 읽을 때 받침이 생기는 것: L(엘), M(엠), N(엔), R(알)
const EN_JONG: Record<string, number> = { l: 8, m: 16, n: 4, r: 8 };

/** 끝 글자의 받침 번호. 0이면 받침 없음, 8이면 ㄹ받침. 판단할 수 없으면 null */
function finalJong(word: string): number | null {
  const s = word.replace(/[\s)\]}"'’”」』>.,·!?~-]+$/u, "");
  if (!s) return null;
  const ch = s[s.length - 1];
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28;
  if (ch in DIGIT_JONG) return DIGIT_JONG[ch];
  const low = ch.toLowerCase();
  if (/[a-z]/.test(low)) return EN_JONG[low] ?? 0;
  return null;
}

/** 조사만 돌려준다. 받침을 모르면 "을(를)"처럼 둘 다 적는다. */
export function josa(word: string, pair: JosaPair): string {
  const [withB, withoutB] = pair.split("/");
  const jong = finalJong(word);
  if (jong === null) return `${withB}(${withoutB})`;
  // "으로/로": ㄹ받침(8)은 받침이 없는 것처럼 "로"
  if (pair === "으로/로") return jong === 0 || jong === 8 ? withoutB : withB;
  return jong === 0 ? withoutB : withB;
}

/** 단어에 조사를 붙인다. withJosa("경주", "은/는") → "경주는" */
export function withJosa(word: string, pair: JosaPair): string {
  return word + josa(word, pair);
}
