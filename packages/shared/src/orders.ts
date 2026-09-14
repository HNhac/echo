export type OrderPay = "cod" | "bank";
export type OrderStatus = "new" | "confirmed" | "shipped" | "done";

export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  size: string;
  color: string;
  unitPrice: number;
};

export type Order = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  customerId?: string;
  note?: string;
  pay: OrderPay;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  ship: number;
  discount?: number;
  voucher?: string;
  total: number;
};

export type CreateOrderInput = {
  name: string;
  phone: string;
  address: string;
  note?: string;
  pay: OrderPay;
  voucher?: string;
  items: Array<{
    slug: string;
    qty: number;
    size: string;
    color: string;
  }>;
};
