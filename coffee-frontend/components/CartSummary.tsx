"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, Product, OrderDraft } from "@/types";
import { storage } from "@/lib/storage";
import { getShipCategoryKST, shipCopy } from "@/lib/cutoff";

export default function CartSummary({
  products, items, setItems, onCheckout,
}:{
  products: Product[];
  items: CartItem[];
  setItems: (v: CartItem[]) => void;
  onCheckout: (draft: OrderDraft) => Promise<void>;
}) {
  const [email, setEmail] = useState(storage.getEmail());
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");

  useEffect(() => { storage.setEmail(email); }, [email]);

  const total = useMemo(() => {
    const map = new Map(products.map(p => [p.id, p]));
    return items.reduce((sum, it) => sum + (map.get(it.productId)?.price || 0) * it.qty, 0);
  }, [items, products]);

  const lines = useMemo(() => {
    const map = new Map(products.map(p => [p.id, p]));
    return items.map(it => ({ name: map.get(it.productId)?.name || it.productId, qty: it.qty }));
  }, [items, products]);

  const shipCategory = getShipCategoryKST();

  async function handleCheckout() {
    const draft: OrderDraft = { email, address, postcode, items, total, shipCategory };
    await onCheckout(draft);
    setItems([]); // 결제 후 비우기
  }

  return (
    <div className="col-md-4 summary p-4">
      <h5 className="m-0 p-0"><b>Summary</b></h5>
      <hr />
      <div className="space-y-1">
        {lines.map((l, i) => (
          <div className="row" key={i}>
            <h6 className="p-0">{l.name} <span className="badge bg-dark">{l.qty}개</span></h6>
          </div>
        ))}
      </div>

      <form className="mt-2">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">이메일</label>
          <input id="email" type="email" className="form-control mb-1"
            value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">주소</label>
          <input id="address" className="form-control mb-1"
            value={address} onChange={(e)=>setAddress(e.target.value)} />
        </div>
        <div className="mb-1">
          <label htmlFor="postcode" className="form-label">우편번호</label>
          <input id="postcode" className="form-control"
            value={postcode} onChange={(e)=>setPostcode(e.target.value)} />
        </div>
        <div className="mt-2 small text-muted">{shipCopy(shipCategory)}</div>
      </form>

      <div className="row pt-2 pb-2 border-top mt-3">
        <h5 className="col">총금액</h5>
        <h5 className="col text-end">{total.toLocaleString()}원</h5>
      </div>
      <button className="btn btn-dark col-12" disabled={!email || items.length===0} onClick={handleCheckout}>
        결제하기
      </button>
    </div>
  );
}
