"use client";

import { useEffect, useState } from "react";
import type { Product, Order } from "@/types";
import {fetchProducts, adminDeleteProduct, adminFetchOrders, adminFetchProducts} from "@/lib/api";
import RefreshButton from "@/components/RefreshButton";

export default function AdminPage() {
  // --- 상품 관리 ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function loadProducts() {
    setLoading(true); setErr("");
    try {
      const list = await adminFetchProducts();
      setProducts(list);
    } catch (e: any) {
      setErr(e?.message || "조회 실패");
    } finally {
      setLoading(false);
    }
  }
  async function handleDelete(id: string | number) {
    if (!confirm("정말 전환 하시겠어요?")) return;
    const ok = await adminDeleteProduct(String(id));
    if (!ok) { alert("전환 실패"); return; }
    // setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
    await loadProducts();
  }

  // --- 주문 목록(전체) ---
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersErr, setOrdersErr] = useState("");

  async function loadOrders() {
    setOrdersLoading(true); setOrdersErr("");
    try {
      const list = await adminFetchOrders(); // /all
      list.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setAdminOrders(list);
    } catch (e: any) {
      setOrdersErr(e?.message || "주문 조회 실패");
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => { loadProducts(); loadOrders(); }, []);

  return (
    <main className="container p-4">
      {/* ===== 상품 관리 ===== */}
      <div className="d-flex justify-content-between align-items-center">
        <h2>상품 관리</h2>
        <RefreshButton onClick={loadProducts} label="새로고침" />
      </div>

      {err && <div className="alert alert-danger my-2">{err}</div>}
      {loading && <div className="text-muted my-2">불러오는 중…</div>}

      <div className="table-responsive mt-3">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th style={{width:90}}>ID</th>
              <th>상품명</th>
              <th style={{width:160}}>원산지</th>
              <th style={{width:120}}>가격</th>
              <th style={{width:120}}>재고</th>
              <th style={{width:120}}>전시</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={6} className="text-muted">상품이 없습니다.</td></tr>
            )}
            {products.map(p => (
              <tr key={String(p.id)}>
                <td>#{p.id}</td>
                <td>{p.name}</td>
                <td>{p.origin}</td>
                <td>{(p.price ?? 0).toLocaleString()}원</td>
                <td>{p.stock ?? 0}</td>
                <td>{p.active ? "노출" : "숨김"}</td>
                <td className="text-end">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p.id as any)}>
                    전환
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== 전체 주문 목록 ===== */}
      <section className="mt-5">
        <div className="d-flex justify-content-between align-items-center">
          <h3>전체 주문 목록</h3>
          <RefreshButton onClick={loadOrders} label="새로고침" />
        </div>

        {ordersErr && <div className="alert alert-danger my-2">{ordersErr}</div>}
        {ordersLoading && <div className="text-muted my-2">불러오는 중…</div>}

        <div className="table-responsive mt-2">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th style={{width:220}}>이메일</th>
                <th style={{width:160}}>주문일시</th>
                <th style={{width:120}}>상태</th>
                <th>상품 / 수량</th>
                <th style={{width:120, textAlign:"right"}}>총액</th>
              </tr>
            </thead>
            <tbody>
              {adminOrders.length === 0 && (
                <tr><td colSpan={5} className="text-muted">주문이 없습니다.</td></tr>
              )}
              {adminOrders.map((o, row) => (
                <tr key={`${o.id}-${row}`}>
                  <td>{o.email || "-"}</td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
                  <td>{o.status ?? "-"}</td>
                  <td>
                    <ul className="list-unstyled mb-0">
                      {o.items.map((it, i) => (
                        <li key={i} className="d-flex align-items-center gap-2">
                          <span className="fw-semibold">{it.name}</span>
                          <span className="badge bg-secondary">x{it.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{textAlign:"right"}}>{(o.total ?? 0).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
