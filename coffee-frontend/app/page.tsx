"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, Product, OrderDraft } from "@/types";
import { storage } from "@/lib/storage";
import { fetchProducts, createOrder } from "@/lib/api";
import ProductList from "@/components/ProductList";
import CartSummary from "@/components/CartSummary";
import RefreshButton from "@/components/RefreshButton";

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);

  async function load() {
    const p = await fetchProducts();
    setProducts(p);
  }

  useEffect(() => { load(); setItems(storage.getCart()); }, []);
  useEffect(() => { storage.setCart(items); }, [items]);

  const qtyMap = useMemo(() => new Map(items.map(i => [i.productId, i.qty])), [items]);
  const add = (productId: string) => {
    const qty = qtyMap.get(productId) || 0;
    setItems([...items.filter(i => i.productId !== productId), { productId, qty: qty + 1 }]);
  };

  async function onCheckout(draft: OrderDraft) {
    const res = await createOrder(draft);
    alert(res.ok ? `주문 완료(id=${res.id || "-"})` : "주문 실패");
  }

  return (
    <main className="container-fluid p-4">
      <div className="row justify-content-center m-2">
        <h1 className="text-center col">Grids & Circle</h1>
        <div className="col-auto"><RefreshButton onClick={load} label="상품 새로고침" /></div>
      </div>

      <div className="row card p-3" style={{ borderRadius: "1rem" }}>
        <div className="col-md-8">
          <ProductList products={products} onAdd={add} />
        </div>
        <CartSummary products={products} items={items} setItems={setItems} onCheckout={onCheckout} />
      </div>
    </main>
  );
}
