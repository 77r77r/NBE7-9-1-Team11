"use client";

import { useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/storage";
import type { Order, Product, OrderStatus } from "@/types";
import {
  adminFetchOrders, adminUpdateOrderStatus,
  adminFetchProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminFetchStats
} from "@/lib/api";
import { getShipCategoryKST } from "@/lib/cutoff";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function AdminPage() {
  const router = useRouter();
  const user = storage.getUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<{ revenue:number; byProduct: Array<{ productId:string; name:string; qty:number; amount:number }> } | null>(null);

  async function loadAll() {
    const [o, p, s] = await Promise.all([
      adminFetchOrders(),
      adminFetchProducts(),
      adminFetchStats()
    ]);
    setOrders(o);
    setProducts(p);
    setStats(s);
  }

  useEffect(() => { loadAll(); }, []);

  if (!user || user.role !== "admin") {
    return (
      <main className="container p-4">
        <h2>관리자 페이지</h2>
        <div className="alert alert-danger mt-3">접근 권한이 없습니다. 관리자 계정으로 로그인하세요.</div>
        <Link className="btn btn-outline-secondary mt-2" href="/">메인으로</Link>
      </main>
    );
  }

  // 주문 상태 변경 핸들러
  async function setStatus(id: string, status: OrderStatus) {
    const ok = await adminUpdateOrderStatus(id, status);
    if (ok) setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  }

  // 상품 CRUD 핸들러
  async function createProduct() {
    const np = await adminCreateProduct({
      name: "New Coffee", origin: "Unknown", price: 5000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 10, active: true
    });
    setProducts([np, ...products]);
  }
  async function updateProduct(p: Product) {
    const ok = await adminUpdateProduct(p);
    if (ok) setProducts(products.map(x => x.id === p.id ? p : x));
  }
  async function deleteProduct(id: string) {
    const ok = await adminDeleteProduct(id);
    if (ok) setProducts(products.filter(x => x.id !== id));
  }

  return (
    <main className="container p-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>관리자 페이지</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={loadAll}>새로고침</button>
          <Link className="btn btn-outline-dark btn-sm" href="/">메인</Link>
        </div>
      </div>

      {/* 주문 관리 */}
      <section className="mt-4">
        <h4>주문 관리</h4>
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr><th>주문번호</th><th>결제시각</th><th>이메일</th><th>금액</th><th>발송구분</th><th>상태</th><th>액션</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>{o.email}</td>
                  <td>{o.total.toLocaleString()}원</td>
                  <td>{o.shipCategory}</td>
                  <td><span className="badge bg-secondary">{o.status}</span></td>
                  <td className="d-flex gap-1">
                    <button className="btn btn-outline-dark btn-sm" onClick={() => setStatus(o.id, "PREPARING")}>준비중</button>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setStatus(o.id, "SHIPPING")}>배송중</button>
                    <button className="btn btn-outline-success btn-sm" onClick={() => setStatus(o.id, "DELIVERED")}>완료</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => setStatus(o.id, "CANCELLED")}>취소</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="text-muted">주문이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* 상품 관리 */}
      <section className="mt-5">
        <div className="d-flex justify-content-between align-items-center">
          <h4>상품 관리</h4>
          <button className="btn btn-dark btn-sm" onClick={createProduct}>상품 등록</button>
        </div>
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr><th>ID</th><th>이름</th><th>산지</th><th>가격</th><th>재고</th><th>활성</th><th>액션</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><input className="form-control form-control-sm" defaultValue={p.name} onBlur={e => updateProduct({ ...p, name: e.target.value })} /></td>
                  <td><input className="form-control form-control-sm" defaultValue={p.origin} onBlur={e => updateProduct({ ...p, origin: e.target.value })} /></td>
                  <td><input className="form-control form-control-sm" type="number" defaultValue={p.price} onBlur={e => updateProduct({ ...p, price: Number(e.target.value) })} /></td>
                  <td><input className="form-control form-control-sm" type="number" defaultValue={p.stock ?? 0} onBlur={e => updateProduct({ ...p, stock: Number(e.target.value) })} /></td>
                  <td>
                    <input type="checkbox" className="form-check-input" defaultChecked={p.active ?? true}
                      onChange={e => updateProduct({ ...p, active: e.target.checked })} />
                  </td>
                  <td>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteProduct(p.id)}>삭제</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={7} className="text-muted">상품이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* 통계 */}
      <section className="mt-5">
        <h4>통계</h4>
        {stats ? (
          <>
            <div className="mb-2"><b>총 매출:</b> {stats.revenue.toLocaleString()}원</div>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr><th>상품</th><th>수량</th><th>금액</th></tr>
                </thead>
                <tbody>
                  {stats.byProduct.map(row => (
                    <tr key={row.productId}>
                      <td>{row.name}</td>
                      <td>{row.qty}</td>
                      <td>{row.amount.toLocaleString()}원</td>
                    </tr>
                  ))}
                  {stats.byProduct.length === 0 && <tr><td colSpan={3} className="text-muted">데이터 없음</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-muted">불러오는 중…</div>
        )}
      </section>
              {/* 뒤로가기 버튼 */}

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => router.back()}
        >
          뒤로가기
        </button>
    </main>
  );
}
