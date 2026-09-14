import { cn } from "@/lib/utils";
import { initials } from "@/components/account/account-helpers";

export function AccountAvatar({
  name,
  google,
  size = "md",
}: {
  name: string;
  google?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br from-[#f48bb3] to-[var(--accent-hover)] font-bold tracking-wide text-white shadow-[var(--shadow-glow)]",
          size === "lg" && "h-20 w-20 text-xl",
          size === "md" && "h-14 w-14 text-base",
          size === "sm" && "h-9 w-9 text-[11px]",
        )}
      >
        {initials(name || "ECHO")}
      </span>
      {google ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white shadow-sm">
          <svg width="11" height="11" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7 12.9 19.6C14.7 15.2 18.9 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.7 7.5l.1.1 6.3 5.3C36.9 41.9 44 36 44 24c0-1.2-.1-2.3-.4-3.5z" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}
