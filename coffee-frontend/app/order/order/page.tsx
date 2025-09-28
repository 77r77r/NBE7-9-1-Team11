// app/order/order/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, Product, OrderDraft } from "@/types";
import { fetchProducts, createOrder } from "@/lib/api";
import { storage } from "@/lib/storage";
import { getInitialShippingStatus, shippingStatusCopy } from "@/lib/cutoff";

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<CartItem[]>(storage.getCart());
  const [email, setEmail] = useState(storage.getEmail());
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");

  // 배송상태(신규 주문 기본값)
  const [shippingStatus] = useState<"배송준비중"|"배송중"|"배송완료">(getInitialShippingStatus());

  useEffect(() => { fetchProducts().then(setProducts); }, []);
  useEffect(() => { storage.setEmail(email); storage.setCart(items); }, [email, items]);

  const productMap = useMemo(() => new Map(products.map(p => [String(p.id), p])), [products]);
  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const p = productMap.get(String(it.productId));
      return sum + (p?.price || 0) * it.qty;
    }, 0);
  }, [items, productMap]);

  async function submit() {
    const draft: OrderDraft = { email, address, postcode, items, total, shipCategory: shippingStatus };
    const res = await createOrder(draft);
    alert(res.ok ? `주문 완료(id=${res.id || "-"})` : "주문 실패");
    if (res.ok) setItems([]);
  }

  return (
    <main className="container p-4">
      <h2>주문 생성</h2>
      <p className="text-muted">{shippingStatusCopy(shippingStatus)}</p>

      <div className="mb-2">
        <label className="form-label">이메일</label>
        <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="form-label">주소</label>
        <input className="form-control" value={address} onChange={e=>setAddress(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="form-label">우편번호</label>
        <input className="form-control" value={postcode} onChange={e=>setPostcode(e.target.value)} />
      </div>

      <div className="mb-3 d-flex gap-2">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={()=>fetchProducts().then(setProducts)}
        >
          상품 새로고침
        </button>
        <button
          className="btn btn-dark"
          disabled={!email || items.length===0}
          onClick={submit}
        >
          주문하기
        </button>
      </div>

      <div><b>총액:</b> {total.toLocaleString()}원</div>
    </main>
  );
}
