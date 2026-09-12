type Props = {
  className?: string;
  size?: number;
};

export function BrandLogo({ className = "brand__mark", size = 36 }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src="/brand/logo.webp"
      alt="ECHO"
      width={size}
      height={Math.round(size * 1.07)}
      decoding="async"
    />
  );
}
