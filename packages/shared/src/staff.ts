export type Permission = "orders" | "products" | "users";
export type StaffRole = "owner" | "manager" | "ops" | "catalog";

export const PERMISSIONS: Permission[] = ["orders", "products", "users"];

export const ROLE_PRESETS: Record<StaffRole, Permission[]> = {
  owner: ["orders", "products", "users"],
  manager: ["orders", "products"],
  ops: ["orders"],
  catalog: ["products"],
};

export const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Chủ studio",
  manager: "Quản lý",
  ops: "Vận hành",
  catalog: "Catalog",
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  orders: "Đơn hàng",
  products: "Sản phẩm",
  users: "Tài khoản",
};

export const STAFF_ROLES = Object.keys(ROLE_PRESETS) as StaffRole[];

export type StaffUser = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: StaffRole;
  permissions: Permission[];
  key: string;
  createdAt: string;
};

export type StaffPublic = Omit<StaffUser, "passwordHash" | "key">;

export type StaffLoginInput = {
  username?: string;
  password: string;
};

export type CreateStaffInput = {
  name: string;
  username: string;
  password: string;
  role: StaffRole;
  permissions?: Permission[];
};

export type UpdateStaffInput = {
  name?: string;
  password?: string;
  role?: StaffRole;
  permissions?: Permission[];
};

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function permissionsFor(role: StaffRole, extra?: Permission[]): Permission[] {
  if (role === "owner") return [...ROLE_PRESETS.owner];
  const base = extra?.length ? extra : ROLE_PRESETS[role];
  return PERMISSIONS.filter((perm) => base.includes(perm));
}

export function hasPermission(
  user: Pick<StaffUser, "role" | "permissions">,
  perm: Permission,
) {
  if (user.role === "owner") return true;
  return user.permissions.includes(perm);
}

export function toStaffPublic(user: StaffUser): StaffPublic {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    permissions: user.role === "owner" ? [...ROLE_PRESETS.owner] : user.permissions,
    createdAt: user.createdAt,
  };
}
