import localities from "@/data/vn-localities.json";

export type VnProvince = {
  name: string;
  wards: string[];
};

export type VnAddressParts = {
  province: string;
  ward: string;
  street: string;
};

const PIN = [
  "Thành phố Hồ Chí Minh",
  "Thành phố Hà Nội",
  "Thành phố Đà Nẵng",
  "Thành phố Hải Phòng",
  "Thành phố Cần Thơ",
  "Thành phố Huế",
];

const ALL = localities as VnProvince[];

export const VN_PROVINCES: VnProvince[] = [
  ...PIN.map((name) => ALL.find((p) => p.name === name)).filter((p): p is VnProvince => Boolean(p)),
  ...ALL.filter((p) => !PIN.includes(p.name)),
];

export function foldVn(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/^(thanh pho|tinh|phuong|xa|dac khu)\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function namesMatch(a: string, b: string) {
  const left = foldVn(a);
  const right = foldVn(b);
  return left === right || left.includes(right) || right.includes(left);
}

export function wardsOf(provinceName: string) {
  return VN_PROVINCES.find((p) => p.name === provinceName)?.wards ?? [];
}

export function formatVnAddress(parts: VnAddressParts) {
  return [parts.street, parts.ward, parts.province].map((s) => s.trim()).filter(Boolean).join(", ");
}

export function parseVnAddress(raw: string): VnAddressParts {
  const text = raw.trim();
  if (!text) return { province: "", ward: "", street: "" };

  const chunks = text.split(",").map((s) => s.trim()).filter(Boolean);
  const last = chunks.at(-1) || "";
  const province = VN_PROVINCES.find((p) => namesMatch(p.name, last));
  if (!province) return { province: "", ward: "", street: text };

  const maybeWard = chunks.at(-2) || "";
  const ward = province.wards.find((name) => namesMatch(name, maybeWard)) || "";
  const street = (ward ? chunks.slice(0, -2) : chunks.slice(0, -1)).join(", ");
  return { province: province.name, ward, street };
}
