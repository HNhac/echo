"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CustomerProfileInput, CustomerPublic, Order } from "@echo/shared";
import {
  customerHeaders,
  fetchCustomerMe,
  fetchCustomerOrders,
  loginCustomer,
  loginCustomerGoogle,
  registerCustomer,
  saveCustomerProfile,
} from "@/lib/store-api";

const KEY_STORAGE = "echo-customer-key";

type CustomerContextValue = {
  ready: boolean;
  key: string;
  customer: CustomerPublic | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  loginGoogle: (payload: { idToken?: string; accessToken?: string }) => Promise<void>;
  logout: () => void;
  saveProfile: (input: CustomerProfileInput) => Promise<void>;
  orders: Order[];
  loadOrders: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [key, setKey] = useState("");
  const [customer, setCustomer] = useState<CustomerPublic | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const applySession = useCallback((nextKey: string, user: CustomerPublic) => {
    localStorage.setItem(KEY_STORAGE, nextKey);
    setKey(nextKey);
    setCustomer(user);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(KEY_STORAGE);
    if (!saved) {
      setReady(true);
      return;
    }
    void fetchCustomerMe(saved)
      .then((user) => {
        if (user) {
          setKey(saved);
          setCustomer(user);
        } else {
          localStorage.removeItem(KEY_STORAGE);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const loadOrders = useCallback(async () => {
    if (!key) {
      setOrders([]);
      return;
    }
    setOrders(await fetchCustomerOrders(key));
  }, [key]);

  const value = useMemo<CustomerContextValue>(
    () => ({
      ready,
      key,
      customer,
      login: async (email, password) => {
        const data = await loginCustomer(email, password);
        applySession(data.key, data.user);
      },
      register: async (input) => {
        const data = await registerCustomer(input);
        applySession(data.key, data.user);
      },
      loginGoogle: async (payload) => {
        const data = await loginCustomerGoogle(payload);
        applySession(data.key, data.user);
      },
      logout: () => {
        localStorage.removeItem(KEY_STORAGE);
        setKey("");
        setCustomer(null);
        setOrders([]);
      },
      saveProfile: async (input) => {
        if (!key) throw new Error("Chưa đăng nhập");
        const next = await saveCustomerProfile(key, input);
        setCustomer(next);
      },
      orders,
      loadOrders,
    }),
    [applySession, customer, key, loadOrders, orders, ready],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}

export { customerHeaders };
