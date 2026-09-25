import Link from "next/link";

const variants = [
  { href: "/a", title: "시안 A — 한지와 먹", note: "따뜻한 종이색 바탕, 점 격자, 차분한 먹색" },
  { href: "/b", title: "시안 B — 밤 지도", note: "어두운 바탕, 은은하게 빛나는 점, 큰 흰 글씨" },
  { href: "/c", title: "시안 C — 밝은 카드", note: "흰 바탕, 사진 카드, 넉넉한 여백" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">경주 관광지 지도 — 시안 셋</h1>
      <p className="mt-3 text-lg text-neutral-600">얼개는 같고(전체 지도 + 시내 크게 보기), 모양만 다릅니다.</p>
      <ul className="mt-8 space-y-4">
        {variants.map((v) => (
          <li key={v.href}>
            <Link href={v.href} className="block rounded-2xl border border-neutral-200 p-6 text-xl hover:border-neutral-400">
              <span className="font-semibold">{v.title}</span>
              <span className="mt-1 block text-base text-neutral-600">{v.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
