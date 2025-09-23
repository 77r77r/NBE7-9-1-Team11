"use client";

import { useEffect, useState } from "react";
import type { CartItem, Product, OrderDraft } from "@/types";
import { fetchProducts, createOrder } from "@/lib/api";
import { storage } from "@/lib/storage";
import { getShipCategoryKST, shipCopy } from "@/lib/cutoff";

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<CartItem[]>(storage.getCart());
  const [email, setEmail] = useState(storage.getEmail());
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");

  useEffect(() => { fetchProducts().then(setProducts); }, []);
  useEffect(() => { storage.setEmail(email); storage.setCart(items); }, [email, items]);

  const total = items.reduce((sum, it) => {
    const p = products.find(x => x.id === it.productId);
    return sum + (p?.price || 0) * it.qty;
  }, 0);

  async function submit() {
    const draft: OrderDraft = { email, address, postcode, items, total, shipCategory: getShipCategoryKST() };
    const res = await createOrder(draft);
    alert(res.ok ? `주문 완료(id=${res.id || "-"})` : "주문 실패");
    if (res.ok) setItems([]);
  }

  return (
    <main className="container p-4">
      <h2>주문 생성</h2>
      <p className="text-muted">{shipCopy(getShipCategoryKST())}</p>
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
      <div className="mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={()=>fetchProducts().then(setProducts)}>상품 새로고침</button>
      </div>
      <div className="mb-3">
        <button className="btn btn-dark" disabled={!email || items.length===0} onClick={submit}>주문하기</button>
      </div>
      <div>총액: <b>{total.toLocaleString()}원</b></div>
    </main>
  );
}
