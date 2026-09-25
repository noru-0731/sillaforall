"use client";
// 이용 안내 쪽에서 "글자·화면 설정" 창을 바로 여는 단추. 헤더의 같은 단추와 같은 창을 연다.
import { useDisplaySettings } from "@/components/layout/DisplaySettings";

export default function OpenSettingsButton({ children }: { children: React.ReactNode }) {
  const open = useDisplaySettings();
  return (
    <button type="button" className="krds-btn secondary large" onClick={open}>
      <i className="svg-icon ico-view-mode" aria-hidden="true"></i>
      {children}
    </button>
  );
}
