"use client";

import { useState } from "react";
import { fetchOrdersByEmail } from "@/lib/api";
import type { Order } from "@/types";
import RefreshButton from "@/components/RefreshButton";

export default function OrderDetailsPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    if (!email) return;
    setLoading(true); setErr("");
    try {
      const list = await fetchOrdersByEmail(email);
      const sorted = (Array.isArray(list) ? list : [])
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrders(sorted);
    } catch (e: any) {
      setErr(e?.message || "조회 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container p-4">
      <h2>주문 내역 확인 (비회원)</h2>
      <div className="d-flex gap-2 my-2">
        <input
          className="form-control"
          placeholder="이메일 입력"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <button className="btn btn-primary" onClick={load}>조회</button>
        <RefreshButton onClick={load} label="새로고침" />
      </div>

      {err && <div className="alert alert-danger my-2">{err}</div>}
      {loading && <div className="text-muted my-2">불러오는 중…</div>}

      <div className="table-responsive mt-3">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th style={{width:100}}>주문번호</th>
              <th style={{width:160}}>주문일시</th>
              <th>상품 / 수량</th>
              <th style={{width:120, textAlign:"right"}}>총액</th>
              <th style={{width:120}}>상태</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={5} className="text-muted">조회 결과가 없습니다.</td></tr>
            )}
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {o.items.map((it, i) => (
                      <li key={i} className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">{it.name}</span>
                        <span className="badge bg-light border !text-black">x{it.qty}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td style={{textAlign:"right"}}>{(o.total ?? 0).toLocaleString()}원</td>
                <td>{o.status ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
