"use client";

// 이용 안내 쪽에서 "글자·화면 설정" 창을 바로 여는 단추(머리의 분홍 동그라미와 같은 창).
// 모양은 이 쪽의 검정 둥근 단추(about.module.css .btn).
import { useDisplaySettings } from "@/components/layout/DisplaySettings";
import { Icon } from "@/components/icons";
import s from "../about.module.css";

export default function SettingsButton({ children }: { children: React.ReactNode }) {
  const open = useDisplaySettings();
  return (
    <button type="button" className={s.btn} onClick={open} aria-haspopup="dialog">
      <Icon name="settings" size={20} strokeWidth={1.8} />
      {children}
    </button>
  );
}
