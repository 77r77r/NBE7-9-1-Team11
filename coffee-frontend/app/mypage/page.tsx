"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMyPage, updateMyPage, fetchOrdersByEmail } from "@/lib/api";
import { storage } from "@/lib/storage";
import type { User, Order } from "@/types";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(storage.getUser());
  const [msg, setMsg] = useState("");

  // 주문 목록 상태 추가
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string>("");

  useEffect(() => {
    // 1) 내 정보 동기화
    fetchMyPage()
      .then((u) => {
        setUser(u);
        return u;
      })
      .catch(() => {
        const u = storage.getUser();
        setUser(u ?? null);
        return u ?? null;
      })
      // 2) 내 정보가 있으면 주문 목록 조회
      .then(async (u) => {
        if (!u?.email) return;
        try {
          setOrdersLoading(true);
          setOrdersError("");
          // NOTE: 백엔드가 인증을 요구한다면,
          // lib/api.ts의 fetchOrdersByEmail에 credentials:'include' 추가 권장
          const list = await fetchOrdersByEmail(u.email);
          setOrders(list ?? []);
        } catch (e: any) {
          setOrdersError(e?.message || "주문 목록을 불러오지 못했습니다.");
        } finally {
          setOrdersLoading(false);
        }
      });
  }, []);

  if (!user) {
    return (
      <main className="container p-4">
        <h2>마이페이지</h2>
        <div className="alert alert-warning mt-3">로그인 후 이용 가능합니다.</div>
      </main>
    );
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value } as User);
  }

  async function save() {
    if (!user) return;
    const saved = await updateMyPage({
      nickname: user.nickname,
      address: user.address,
      postal_code: user.postal_code,
    });
    setUser(saved);
    setMsg("저장되었습니다.");
    setTimeout(() => {
      setMsg("");
      router.push("/"); // ✅ 저장 성공 후 메인 전환
    }, 800);
  }

  return (
    <main className="container p-4" style={{ maxWidth: 560 }}>
      <h2>마이페이지</h2>

      <div className="mb-2">
        <label className="form-label">이메일</label>
        <input className="form-control" value={user.email} readOnly disabled />
      </div>
      <div className="mb-2">
        <label className="form-label">닉네임</label>
        <input className="form-control" name="nickname" value={user.nickname} onChange={onChange} />
      </div>
      <div className="mb-2">
        <label className="form-label">주소</label>
        <input className="form-control" name="address" value={user.address} onChange={onChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">우편번호</label>
        <input className="form-control" name="postal_code" value={user.postal_code} onChange={onChange} />
      </div>

      <button className="btn btn-dark" onClick={save}>저장</button>
      {msg && <div className="text-success mt-2">{msg}</div>}

      {/* --- 주문 내역 섹션 추가 --- */}
      <section className="mt-5">
        <h3>주문 내역</h3>

        {ordersLoading && <div className="mt-2">불러오는 중…</div>}
        {ordersError && <div className="text-danger mt-2">{ordersError}</div>}

        {!ordersLoading && !ordersError && (
          <>
            {(!orders || orders.length === 0) ? (
              <div className="text-muted mt-2">주문 내역이 없습니다.</div>
            ) : (
              <div className="table-responsive mt-3">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: 100 }}>주문번호</th>
                      <th style={{ width: 140 }}>주문일시</th>
                      <th style={{ width: 120 }}>상태</th>
                      <th>상품 / 수량</th>
                      <th style={{ width: 100, textAlign: "right" }}>총액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const created = o.createdAt ? new Date(o.createdAt) : null;
                      const when = created ? created.toLocaleString() : "-";
                      const itemsText = (o.items || [])
                        .map((it) => {
                          // 이름 필드가 없을 수 있어 productId로 폴백
                          const name = (it as any).name || (it as any).productName || it.productId || "상품";
                          return `${name} x${it.qty ?? it.name ?? 0}`;
                        })
                        .join(", ");
                      const total =
                        (o as any).total ??
                        (o as any).totalPrice ??
                        (o.items || []).reduce((acc, it: any) => acc + (it.price ?? 0) * (it.qty ?? it.quantity ?? 0), 0);

                      return (
                        <tr key={String(o.id)}>
                          <td>#{o.id}</td>
                          <td>{when}</td>
                          <td>{o.status || "-"}</td>
                          <td>{itemsText || "-"}</td>
                          <td style={{ textAlign: "right" }}>{total?.toLocaleString?.() ?? "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
