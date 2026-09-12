import { StudioApp } from "@/components/studio-app";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StudioApp />
      {children}
    </>
  );
}
