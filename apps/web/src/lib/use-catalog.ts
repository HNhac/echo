"use client";

import { useEffect, useState } from "react";
import { products, type Product } from "@/data/catalog";
import { fetchProducts } from "@/lib/store-api";

export function useCatalog() {
  const [catalog, setCatalog] = useState<Product[]>(products);

  useEffect(() => {
    void fetchProducts().then(setCatalog);
  }, []);

  return catalog;
}
