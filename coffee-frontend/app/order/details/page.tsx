"use client";

import { useState } from "react";
import { fetchOrdersByEmail } from "@/lib/api";
import type { Order } from "@/types";
import RefreshButton from "@/components/RefreshButton";

export default function OrderDetailsPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  async function load() { if (!email) return; setOrders(await fetchOrdersByEmail(email)); }

  return (
    <main className="container p-4">
      <h2>주문 내역 확인</h2>
      <div className="d-flex gap-2 my-2">
        <input className="form-control" placeholder="이메일 입력" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="btn btn-primary" onClick={load}>조회</button>
        <RefreshButton onClick={load} label="새로고침" />
      </div>
      {orders.length === 0 && <div className="text-muted">조회 결과가 없습니다.</div>}
      {orders.map(o => (
        <div key={o.id} className="card my-2 p-3">
          <div className="d-flex justify-content-between">
            <div><b>주문번호</b> {o.id}</div>
            <div className="text-muted">{new Date(o.createdAt).toLocaleString()}</div>
          </div>
          <div className="small text-muted">발송: {o.shipCategory}</div>
          <ul className="mt-2">
            {o.items.map((it, i) => (
              <li key={i}>{it.name} x {it.qty} — {(it.price*it.qty).toLocaleString()}원</li>
            ))}
          </ul>
          <div className="text-end"><b>총액</b> {o.total.toLocaleString()}원</div>
        </div>
      ))}
    </main>
  );
}
