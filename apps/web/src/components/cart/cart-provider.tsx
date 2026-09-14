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
  CHECKOUT_STORAGE_KEY,
  VOUCHER_STORAGE_KEY,
  lineKey,
  parseCart,
  parseCheckoutKeys,
  type CartLine,
} from "@/lib/cart";

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  voucher: string;
  pickedKeys: string[];
  add: (line: CartLine) => void;
  setQty: (line: CartLine, qty: number) => void;
  remove: (line: CartLine) => void;
  clear: () => void;
  removePicked: () => void;
  setVoucher: (code: string, slug?: string) => void;
  togglePicked: (line: CartLine) => void;
  setPickedAll: (on: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [voucher, setVoucherState] = useState("");
  const [pickedKeys, setPickedKeys] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = parseCart(localStorage.getItem(CART_STORAGE_KEY));
    setLines(next);
    const tagged = next.find((line) => line.voucher)?.voucher ?? "";
    setVoucherState(tagged);
    setPickedKeys(parseCheckoutKeys(localStorage.getItem(CHECKOUT_STORAGE_KEY), next));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  useEffect(() => {
    if (!ready) return;
    if (voucher) localStorage.setItem(VOUCHER_STORAGE_KEY, voucher);
    else localStorage.removeItem(VOUCHER_STORAGE_KEY);
  }, [voucher, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(pickedKeys));
  }, [pickedKeys, ready]);

  useEffect(() => {
    if (!ready) return;
    const valid = new Set(lines.map(lineKey));
    setPickedKeys((prev) => {
      const next = prev.filter((key) => valid.has(key));
      return next.length === prev.length ? prev : next;
    });
  }, [lines, ready]);

  const add = useCallback((incoming: CartLine) => {
    const key = lineKey(incoming);
    const code = String(incoming.voucher ?? "").trim().toUpperCase();
    setLines((prev) => {
      const i = prev.findIndex((l) => lineKey(l) === key);
      const line = { ...incoming, voucher: code || undefined };
      if (i === -1) return [...prev, line];
      const next = [...prev];
      next[i] = {
        ...next[i],
        qty: next[i].qty + incoming.qty,
        voucher: code || next[i].voucher,
      };
      return next;
    });
    if (code) setVoucherState(code);
    setPickedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
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

  const clear = useCallback(() => {
    setLines([]);
    setPickedKeys([]);
  }, []);

  const removePicked = useCallback(() => {
    setLines((prev) => {
      const drop = new Set(pickedKeys);
      return prev.filter((l) => !drop.has(lineKey(l)));
    });
    setPickedKeys([]);
  }, [pickedKeys]);

  const setVoucher = useCallback((code: string, slug?: string) => {
    const next = code.trim().toUpperCase();
    setVoucherState(next);
    if (!slug) return;
    setLines((prev) =>
      prev.map((line) => (line.slug === slug ? { ...line, voucher: next || undefined } : line)),
    );
  }, []);

  const togglePicked = useCallback((line: CartLine) => {
    const key = lineKey(line);
    setPickedKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }, []);

  const setPickedAll = useCallback((on: boolean) => {
    setPickedKeys(on ? lines.map(lineKey) : []);
  }, [lines]);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const value = useMemo(
    () => ({
      lines,
      ready,
      count,
      voucher,
      pickedKeys,
      add,
      setQty,
      remove,
      clear,
      removePicked,
      setVoucher,
      togglePicked,
      setPickedAll,
    }),
    [lines, ready, count, voucher, pickedKeys, add, setQty, remove, clear, removePicked, setVoucher, togglePicked, setPickedAll],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
