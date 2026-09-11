import type { Metadata } from "next";
import { ContentShell } from "@/components/layout/content-shell";
import { brandPageTitle } from "@/config/brand";

export const metadata: Metadata = {
  title: brandPageTitle("Hướng dẫn size"),
  description: "Bảng size bé gái 90–140.",
};

export default function SizeGuidePage() {
  return (
    <ContentShell
      title="Hướng dẫn size"
      subtitle="Đo chiều cao bé (cm) và đối chiếu bảng. Form hơi rộng để bé vận động."
      crumbs={[{ label: "Hướng dẫn size" }]}
    >
      <h2>Bảng size (cm)</h2>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--ink)]">
              <th className="px-4 py-3 font-semibold">Size</th>
              <th className="px-4 py-3 font-semibold">Chiều cao</th>
              <th className="px-4 py-3 font-semibold">Tuổi tham khảo</th>
              <th className="px-4 py-3 font-semibold">Ngực</th>
            </tr>
          </thead>
          <tbody className="text-[var(--ink-muted)]">
            {[
              ["90", "80–90", "1–2 tuổi", "52–54"],
              ["100", "90–100", "2–3 tuổi", "54–56"],
              ["110", "100–110", "3–4 tuổi", "56–58"],
              ["120", "110–120", "5–6 tuổi", "58–62"],
              ["130", "120–130", "7–8 tuổi", "62–66"],
              ["140", "130–140", "9–10 tuổi", "66–70"],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--ink)]">{row[0]}</td>
                <td className="px-4 py-3">{row[1]}</td>
                <td className="px-4 py-3">{row[2]}</td>
                <td className="px-4 py-3">{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Nếu bé cao gần mốc trên, chọn size lớn hơn 1 nấc để mặc lâu hơn. Phụ kiện
        (nơ, túi) thường one size.
      </p>
    </ContentShell>
  );
}
