export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  passwordHash?: string;
  googleId?: string;
  key: string;
  createdAt: string;
};

export type CustomerPublic = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  google: boolean;
  createdAt: string;
};

export type CustomerRegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export type CustomerLoginInput = {
  email: string;
  password: string;
};

export type CustomerProfileInput = {
  name?: string;
  phone?: string;
  address?: string;
  password?: string;
};

export type CreateCustomerInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export type UpdateCustomerInput = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function toCustomerPublic(customer: Customer): CustomerPublic {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    google: Boolean(customer.googleId),
    createdAt: customer.createdAt,
  };
}
