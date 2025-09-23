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

  // 제품 조회용 맵
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  // 합계
  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const p = productMap.get(it.productId);
      return sum + (p?.price || 0) * it.qty;
    }, 0);
  }, [items, productMap]);

  // 장바구니 조작기
  const inc = (productId: string) => {
    const next = items.map(it => it.productId === productId ? { ...it, qty: it.qty + 1 } : it);
    setItems(next);
  };
  const dec = (productId: string) => {
    const next = items
      .map(it => it.productId === productId ? { ...it, qty: it.qty - 1 } : it)
      .filter(it => it.qty > 0); // 0 이하면 제거
    setItems(next);
  };
  const remove = (productId: string) => {
    const next = items.filter(it => it.productId !== productId);
    setItems(next);
  };

  // 주문 전송
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

      {/* 장바구니 라인업 */}
      <div className="space-y-1">
        {items.length === 0 && (
          <div className="text-muted small">장바구니가 비어 있어요.</div>
        )}
        {items.map((it) => {
          const p = productMap.get(it.productId);
          const name = p?.name ?? it.productId;
          const price = p?.price ?? 0;
          return (
            <div key={it.productId} className="d-flex align-items-center justify-content-between py-1">
              <div className="me-2">
                <div className="fw-semibold">{name}</div>
                <div className="text-muted small">{(price * it.qty).toLocaleString()}원</div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="btn-group btn-group-sm" role="group" aria-label="수량 조절">
                  <button className="btn btn-outline-secondary" onClick={() => dec(it.productId)}>-</button>
                  <button className="btn btn-light" disabled style={{ minWidth: 40 }}>{it.qty}</button>
                  <button className="btn btn-outline-secondary" onClick={() => inc(it.productId)}>+</button>
                </div>
                <button className="btn btn-outline-danger btn-sm" onClick={() => remove(it.productId)}>
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 폼 */}
      <form className="mt-3">
        <div className="mb-2">
          <label htmlFor="email" className="form-label">이메일</label>
          <input id="email" type="email" className="form-control"
                 value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div className="mb-2">
          <label htmlFor="address" className="form-label">주소</label>
          <input id="address" className="form-control"
                 value={address} onChange={(e)=>setAddress(e.target.value)} />
        </div>
        <div className="mb-2">
          <label htmlFor="postcode" className="form-label">우편번호</label>
          <input id="postcode" className="form-control"
                 value={postcode} onChange={(e)=>setPostcode(e.target.value)} />
        </div>
        <div className="mt-2 small text-muted">{shipCopy(shipCategory)}</div>
      </form>

      {/* 합계 / 결제 */}
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
