import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  light?: boolean;
};

export function BrandMark({ className, light }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 font-serif italic tracking-[0.22em]",
        light ? "text-white" : "text-[var(--ink)]",
        className,
      )}
    >
      {brand.name}
      <span
        aria-hidden
        className={cn(
          "translate-y-[-2px] text-[0.55em] not-italic tracking-normal",
          light ? "text-[var(--accent-warm)]" : "text-[var(--accent)]",
        )}
      >
        ✦
      </span>
    </span>
  );
}
