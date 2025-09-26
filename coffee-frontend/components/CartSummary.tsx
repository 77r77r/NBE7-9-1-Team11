// components/CartSummary.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, Product, OrderDraft, User } from "@/types";
import { storage } from "@/lib/storage";
import { getInitialShippingStatus, shippingStatusCopy } from "@/lib/cutoff";

export default function CartSummary({
  products, items, setItems, onCheckout,
}:{
  products: Product[];
  items: CartItem[];
  setItems: (v: CartItem[]) => void;
  onCheckout: (draft: OrderDraft) => Promise<void>;
}) {
  // ✅ 하이드레이션 안정화: 초기엔 비워두고, 마운트 후에만 브라우저 상태를 읽는다
  const [mounted, setMounted] = useState(false);
  const [authedUser, setAuthedUser] = useState<User | null>(null);

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");

  const [shippingStatus, setShippingStatus] =
    useState<"배송준비중"|"배송중"|"배송완료">("배송준비중");

  const [editAddr, setEditAddr] = useState(false);
  const [editPost, setEditPost] = useState(false);

  useEffect(() => {
    const u = storage.getUser();
    setAuthedUser(u ?? null);

    if (u) {
      setEmail(u.email || "");
      setAddress(u.address || "");
      setPostcode(u.postal_code || "");
    } else {
      setEmail(storage.getEmail() || "");
    }

    setShippingStatus(getInitialShippingStatus());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authedUser) storage.setEmail(email);
  }, [email, authedUser, mounted]);

  // 합계 계산(단가×수량)
  const productMap = useMemo(() => new Map(products.map(p => [String(p.id), p])), [products]);
  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const p = productMap.get(String(it.productId));
      const price = p?.price ?? 0;
      return sum + price * it.qty;
    }, 0);
  }, [items, productMap]);

  // 수량 조작
  const inc = (pid: string) =>
    setItems(items.map(it => String(it.productId) === String(pid) ? { ...it, qty: it.qty + 1 } : it));
  const dec = (pid: string) =>
    setItems(items
      .map(it => String(it.productId) === String(pid) ? { ...it, qty: it.qty - 1 } : it)
      .filter(it => it.qty > 0));
  const remove = (pid: string) =>
    setItems(items.filter(it => String(it.productId) !== String(pid)));

  function toggleAddr() {
    if (editAddr && authedUser) {
      storage.setUser({ ...authedUser, address });
      setAuthedUser({ ...authedUser, address });
    }
    setEditAddr(!editAddr);
  }
  function togglePost() {
    if (editPost && authedUser) {
      storage.setUser({ ...authedUser, postal_code: postcode });
      setAuthedUser({ ...authedUser, postal_code: postcode });
    }
    setEditPost(!editPost);
  }

  async function handleCheckout() {
    const draft: OrderDraft = { email, address, postcode, items, total, shipCategory: shippingStatus };
    await onCheckout(draft);
    setItems([]); // 결제 후 비우기
  }

  const isLocked = mounted && !!authedUser; // 로그인 시 이메일 고정

  return (
    <div className="col-md-4 summary p-4">
      <h5 className="m-0 p-0"><b>Summary</b></h5>
      <hr />

      {/* 장바구니 라인 */}
      <div className="space-y-1">
        {items.length === 0 && <div className="text-muted small">장바구니가 비어 있어요.</div>}
        {items.map((it) => {
          const p = productMap.get(String(it.productId));
          const name = p?.name ?? String(it.productId);
          const price = p?.price ?? 0;
          return (
            <div key={String(it.productId)} className="d-flex align-items-center justify-content-between py-1">
              <div className="me-2">
                <div className="fw-semibold">{name}</div>
                <div className="text-muted small">{(price * it.qty).toLocaleString()}원</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="btn-group btn-group-sm" role="group" aria-label="수량 조절">
                  <button className="btn btn-outline-secondary" onClick={() => dec(String(it.productId))}>-</button>
                  <button className="btn btn-light" disabled style={{ minWidth: 40 }}>{it.qty}</button>
                  <button className="btn btn-outline-secondary" onClick={() => inc(String(it.productId))}>+</button>
                </div>
                <button className="btn btn-outline-danger btn-sm" onClick={() => remove(String(it.productId))}>삭제</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 주문자 정보 */}
      <form className="mt-3">
        {/* 이메일: 로그인 시 고정 */}
        <div className="mb-2">
          <label htmlFor="email" className="form-label">이메일</label>
          <div className="input-group">
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              readOnly={isLocked}
              disabled={isLocked}
            />
            {isLocked && (
              <button className="btn btn-outline-secondary" type="button" disabled>
                고정
              </button>
            )}
          </div>
        </div>

        {/* 주소 */}
        <div className="mb-2">
          <label htmlFor="address" className="form-label">주소</label>
          <div className="input-group">
            <input
              id="address"
              className="form-control"
              value={address}
              onChange={(e)=>setAddress(e.target.value)}
              readOnly={!!authedUser && !editAddr}
            />
            {!!authedUser && (
              <button className="btn btn-outline-secondary" type="button" onClick={toggleAddr}>
                {editAddr ? "완료" : "수정"}
              </button>
            )}
          </div>
        </div>

        {/* 우편번호 */}
        <div className="mb-2">
          <label htmlFor="postcode" className="form-label">우편번호</label>
          <div className="input-group">
            <input
              id="postcode"
              className="form-control"
              value={postcode}
              onChange={(e)=>setPostcode(e.target.value)}
              readOnly={!!authedUser && !editPost}
            />
            {!!authedUser && (
              <button className="btn btn-outline-secondary" type="button" onClick={togglePost}>
                {editPost ? "완료" : "수정"}
              </button>
            )}
          </div>
        </div>

        {/* 배송 상태 설명(마운트 후 표시) */}
        {mounted && (
          <div className="mt-2 small text-muted">{shippingStatusCopy(shippingStatus)}</div>
        )}
      </form>

      {/* 합계/결제 */}
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
