"use client";

import { useState } from "react";
import { fetchOrdersByEmail } from "@/lib/api";
import type { Order } from "@/types";

export default function GuestOrderLookup() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function lookup() {
    setErr(""); setLoading(true);
    try {
      const data = await fetchOrdersByEmail(email.trim());
      setOrders(data);
    } catch (e: any) {
      setErr(e.message || "조회 실패");
      setOrders(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-3 mt-3">
      <h5 className="mb-2">비회원 주문 조회</h5>
      <div className="input-group mb-2">
        <input className="form-control" placeholder="이메일 주소" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="btn btn-outline-dark" onClick={lookup} disabled={!email || loading}>
          {loading ? "조회중..." : "조회"}
        </button>
      </div>
      {err && <div className="text-danger small mb-2">{err}</div>}

      {orders && (
        <div className="table-responsive">
          <table className="table table-sm">
            <thead><tr><th>주문번호</th><th>결제시각</th><th>금액</th><th>발송구분</th><th>상태</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={5} className="text-muted">주문 내역이 없습니다.</td></tr>}
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>{o.total.toLocaleString()}원</td>
                  <td>{o.shipCategory}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
