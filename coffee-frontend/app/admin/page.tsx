"use client";

import {useEffect, useState} from "react";
import type {Product, Order} from "@/types";
import {fetchProducts, adminDeleteProduct, adminFetchOrders, adminFetchProducts, adminCreateProduct} from "@/lib/api";
import RefreshButton from "@/components/RefreshButton";

export default function AdminPage() {
    // --- 상품 관리 ---
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    async function loadProducts() {
        setLoading(true);
        setErr("");
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
        if (!confirm("정말 삭제 하시겠어요?")) return;
        const ok = await adminDeleteProduct(String(id));
        if (!ok) {
            alert("삭제 실패");
            return;
        }
        setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
        // await loadProducts();
    }

    // -- 상품 등록 --
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: "",
        price: 0,
        origin: "",
        stock: 0,
        imageUrl: "",
        active: true
    });
    const [creating, setCreating] = useState(false);

// 폼 초기화 함수
    function resetCreateForm() {
        setCreateForm({
            name: "",
            price: 0,
            origin: "",
            stock: 0,
            imageUrl: "",
            active: true
        });
    }

// 상품 등록 함수
    async function handleCreate() {
        if (!createForm.name.trim()) {
            alert("상품명을 입력해주세요.");
            return;
        }

        setCreating(true);
        try {
            await adminCreateProduct(createForm);
            setShowCreateModal(false);
            resetCreateForm();
            alert("상품이 등록되었습니다.");
            await loadProducts(); // 성공 시에만 새로고침
        } catch (e: any) {
            alert(e?.message || "상품 등록 실패");
        } finally {
            setCreating(false);
        }
    }

    // --- 주문 목록(전체) ---
    const [adminOrders, setAdminOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersErr, setOrdersErr] = useState("");

    async function loadOrders() {
        setOrdersLoading(true);
        setOrdersErr("");
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

    useEffect(() => {
        loadProducts();
        loadOrders();
    }, []);

    return (
        <main className="container p-4">
            {/* ===== 상품 관리 ===== */}
            <div className="d-flex justify-content-between align-items-center">
                <h2>상품 관리</h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={loadProducts}>
                        새로고침
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={() => setShowCreateModal(true)}>
                        상품등록
                    </button>
                </div>
            </div>

            {/* 상품 등록 모달 */}
            {showCreateModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">상품 등록</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowCreateModal(false);
                                    resetCreateForm();
                                }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">상품명 *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm(prev => ({...prev, name: e.target.value}))}
                                        placeholder="상품명을 입력하세요"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">원산지</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={createForm.origin}
                                        onChange={(e) => setCreateForm(prev => ({...prev, origin: e.target.value}))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">가격</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={createForm.price}
                                        onChange={(e) => setCreateForm(prev => ({
                                            ...prev,
                                            price: Number(e.target.value)
                                        }))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">재고</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={createForm.stock}
                                        onChange={(e) => setCreateForm(prev => ({
                                            ...prev,
                                            stock: Number(e.target.value)
                                        }))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">이미지 URL</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={createForm.imageUrl}
                                        onChange={(e) => setCreateForm(prev => ({...prev, imgUrl: e.target.value}))}
                                    />
                                </div>
                                <div className="mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="activeCheck"
                                        checked={createForm.active}
                                        onChange={(e) => setCreateForm(prev => ({...prev, active: e.target.checked}))}
                                    />
                                    <label className="form-check-label" htmlFor="activeCheck">
                                        활성화
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetCreateForm();
                                    }}
                                    disabled={creating}
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreate}
                                    disabled={creating}
                                >
                                    {creating ? "등록 중..." : "등록"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {err && <div className="alert alert-danger my-2">{err}</div>}
            {loading && <div className="text-muted my-2">불러오는 중…</div>}

            <div className="table-responsive mt-3">
                <table className="table table-sm align-middle">
                    <thead>
                    <tr>
                        <th style={{width: 90}}>ID</th>
                        <th>상품명</th>
                        <th style={{width: 160}}>원산지</th>
                        <th style={{width: 120}}>가격</th>
                        <th style={{width: 120}}>재고</th>
                        <th style={{width: 100}}>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-muted">상품이 없습니다.</td>
                        </tr>
                    )}
                    {products.map(p => (
                        <tr key={String(p.id)}>
                            <td>#{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.origin}</td>
                            <td>{(p.price ?? 0).toLocaleString()}원</td>
                            <td>{p.stock ?? 0}</td>
                            <td className="text-end">
                                <button className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(p.id as any)}>
                                    삭제
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
                    <RefreshButton onClick={loadOrders} label="새로고침"/>
                </div>

                {ordersErr && <div className="alert alert-danger my-2">{ordersErr}</div>}
                {ordersLoading && <div className="text-muted my-2">불러오는 중…</div>}

                <div className="table-responsive mt-2">
                    <table className="table table-sm align-middle">
                        <thead>
                        <tr>
                            <th style={{width: 220}}>이메일</th>
                            <th style={{width: 160}}>주문일시</th>
                            <th style={{width: 120}}>상태</th>
                            <th>상품 / 수량</th>
                            <th style={{width: 120, textAlign: "right"}}>총액</th>
                        </tr>
                        </thead>
                        <tbody>
                        {adminOrders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-muted">주문이 없습니다.</td>
                            </tr>
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
                                <td style={{textAlign: "right"}}>{(o.total ?? 0).toLocaleString()}원</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
