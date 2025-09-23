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
  const authedUser = storage.getUser(); // 로그인 유저 존재 여부

  // 기본값: 로그인 유저 있으면 그 값, 없으면 guest 저장값
  const [email, setEmail] = useState(authedUser?.email ?? storage.getEmail());
  const [address, setAddress] = useState(authedUser?.address ?? "");
  const [postcode, setPostcode] = useState(authedUser?.postal_code ?? "");

  // 편집 가능 여부(주소/우편번호만)
  const [editAddr, setEditAddr] = useState(false);
  const [editPost, setEditPost] = useState(false);

  // 비회원만 guest email 저장
  useEffect(() => {
    if (!authedUser) storage.setEmail(email);
  }, [email, authedUser]);

  // 합계 계산
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const p = productMap.get(it.productId);
      return sum + (p?.price || 0) * it.qty;
    }, 0);
  }, [items, productMap]);

  // 장바구니 수량 조작(이전 기능 유지)
  const inc = (pid: string) => setItems(items.map(it => it.productId === pid ? { ...it, qty: it.qty + 1 } : it));
  const dec = (pid: string) => setItems(items.map(it => it.productId === pid ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0));
  const remove = (pid: string) => setItems(items.filter(it => it.productId !== pid));

  // 주소/우편번호 편집 토글 시, 로그인 상태라면 저장까지 반영(완료 시)
  function toggleAddr() {
    if (editAddr && authedUser) {
      // 완료로 전환되는 시점 → 스토리지 유저도 업데이트
      storage.setUser({ ...authedUser, address });
    }
    setEditAddr(!editAddr);
  }
  function togglePost() {
    if (editPost && authedUser) {
      storage.setUser({ ...authedUser, postal_code: postcode });
    }
    setEditPost(!editPost);
  }

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

      {/* 장바구니 라인 */}
      <div className="space-y-1">
        {items.length === 0 && <div className="text-muted small">장바구니가 비어 있어요.</div>}
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
                <button className="btn btn-outline-danger btn-sm" onClick={() => remove(it.productId)}>삭제</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 주문자 정보 */}
      <form className="mt-3">
        {/* 이메일: 로그인 시 항상 고정 */}
        <div className="mb-2">
          <label htmlFor="email" className="form-label">이메일</label>
          <div className="input-group">
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              readOnly={!!authedUser}
              disabled={!!authedUser}
            />
            {authedUser && (
              <button className="btn btn-outline-secondary" type="button" disabled>
                고정
              </button>
            )}
          </div>
        </div>

        {/* 주소: 수정 버튼으로 토글 */}
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
            {authedUser && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={toggleAddr}
                title={editAddr ? "입력 잠금" : "입력 해제"}
              >
                {editAddr ? "완료" : "수정"}
              </button>
            )}
          </div>
        </div>

        {/* 우편번호: 수정 버튼으로 토글 */}
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
            {authedUser && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={togglePost}
                title={editPost ? "입력 잠금" : "입력 해제"}
              >
                {editPost ? "완료" : "수정"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 small text-muted">{shipCopy(shipCategory)}</div>
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
