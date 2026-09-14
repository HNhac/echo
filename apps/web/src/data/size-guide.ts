export const KIDS_SIZES = [
  { size: "90", height: "80–90 cm", age: "1–2 tuổi", weight: "10–13 kg" },
  { size: "100", height: "90–100 cm", age: "2–3 tuổi", weight: "13–15 kg" },
  { size: "110", height: "100–110 cm", age: "3–4 tuổi", weight: "15–18 kg" },
  { size: "120", height: "110–120 cm", age: "5–6 tuổi", weight: "18–22 kg" },
  { size: "130", height: "120–130 cm", age: "7–8 tuổi", weight: "22–28 kg" },
  { size: "140", height: "130–140 cm", age: "9–10 tuổi", weight: "28–35 kg" },
] as const;

export function sizeKey(value: string) {
  return value.replace(/[^\d]/g, "");
}
