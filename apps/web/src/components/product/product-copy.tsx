import { descriptionToHtml } from "@echo/shared";

type Props = {
  value?: string;
  className?: string;
};

export function ProductCopy({ value, className }: Props) {
  const html = descriptionToHtml(value);
  if (!html) return null;
  return <div className={className ? `product-copy ${className}` : "product-copy"} dangerouslySetInnerHTML={{ __html: html }} />;
}
