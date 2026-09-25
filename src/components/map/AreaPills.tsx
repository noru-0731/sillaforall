// 지도 쪽 알약 줄(궁능 관람코스의 궁 선택 줄 자리): 경주 전체 + 권역 다섯, 권역 색.
// 쪽을 옮기는 링크라 지금 쪽은 aria-current="page"(PillTabs 링크 모드).
import { areas } from "@/data";
import PillTabs from "@/components/royal/PillTabs";

export default function AreaPills({ current }: { current: string }) {
  return (
    <PillTabs
      label="권역 고르기"
      current={current}
      items={[
        { label: "경주 전체", href: "/map", grad: true },
        ...areas.map((a) => ({ label: a.label, href: `/map/${a.key}`, area: a.key })),
      ]}
    />
  );
}
