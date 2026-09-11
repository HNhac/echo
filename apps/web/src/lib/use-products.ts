"use client";

import { useEffect, useState } from "react";
import type { Product } from "@echo/shared";
import { fetchProducts } from "@/lib/store-api";

let cached: Product[] | null = null;

/** Only for cart / checkout — do not use in layout. */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cached ?? []);
  const [loaded, setLoaded] = useState(cached !== null);

  useEffect(() => {
    if (cached) {
      setProducts(cached);
      setLoaded(true);
      return;
    }
    let alive = true;
    void fetchProducts()
      .then((list) => {
        cached = list;
        if (alive) setProducts(list);
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { products, loaded };
}
