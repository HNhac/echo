"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CART_STORAGE_KEY,
  lineKey,
  parseCart,
  type CartLine,
} from "@/lib/cart";

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  add: (line: CartLine) => void;
  setQty: (line: CartLine, qty: number) => void;
  remove: (line: CartLine) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(parseCart(localStorage.getItem(CART_STORAGE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback((incoming: CartLine) => {
    setLines((prev) => {
      const key = lineKey(incoming);
      const i = prev.findIndex((l) => lineKey(l) === key);
      if (i === -1) return [...prev, incoming];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + incoming.qty };
      return next;
    });
  }, []);

  const setQty = useCallback((target: CartLine, qty: number) => {
    setLines((prev) => {
      const key = lineKey(target);
      if (qty <= 0) return prev.filter((l) => lineKey(l) !== key);
      return prev.map((l) => (lineKey(l) === key ? { ...l, qty } : l));
    });
  }, []);

  const remove = useCallback((target: CartLine) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== lineKey(target)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const value = useMemo(
    () => ({ lines, ready, count, add, setQty, remove, clear }),
    [lines, ready, count, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
