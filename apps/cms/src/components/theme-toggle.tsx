"use client";

import { IconMoon, IconSun } from "./icons";
import { useTheme } from "@/lib/theme";

type Props = {
  className?: string;
  label?: boolean;
};

export function ThemeToggle({ className = "theme-toggle", label = false }: Props) {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "dark" ? "sáng" : "tối";

  return (
    <button
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
      {label ? <span>Giao diện {next}</span> : null}
    </button>
  );
}
