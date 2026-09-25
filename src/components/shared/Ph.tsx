import { cn } from "@/lib/cn";

/**
 * 임시 문구 자리표시. 문구는 사용자가 질문으로 정한다.
 * 화면에서는 점선 밑줄로 보이고, 나중에 `<Ph` 를 찾아 바꾼다.
 */
export function Ph({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      title="임시 문구"
      data-placeholder=""
      className={cn("underline decoration-dashed decoration-1 underline-offset-4 decoration-current/40", className)}
    >
      {children}
    </span>
  );
}
