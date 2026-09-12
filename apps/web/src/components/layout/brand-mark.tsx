import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  light?: boolean;
};

export function BrandMark({ className, light }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.webp"
        alt=""
        width={36}
        height={38}
        className="h-8 w-auto rounded-md"
        decoding="async"
      />
      <span
        className={cn(
          "inline-flex items-baseline font-serif italic tracking-[0.18em]",
          light ? "text-white" : "text-[var(--ink)]",
        )}
      >
        {brand.name}
      </span>
    </span>
  );
}
