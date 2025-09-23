import type { Product, Order, OrderDraft } from "@/types";

const API = process.env.NEXT_PUBLIC_API_BASE;

// 더미 데이터
const DUMMY_PRODUCTS: Product[] = [
  { id: "col-narino", name: "Columbia Nariñó", origin: "콜롬비아", price: 5000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg" },
  { id: "bra-serra", name: "Brazil Serra Do Caparaó", origin: "브라질", price: 6000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg" },
  { id: "eth-yirg", name: "Ethiopia Yirgacheffe", origin: "에티오피아", price: 7000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg" },
];

export async function fetchProducts(): Promise<Product[]> {
  if (!API) return DUMMY_PRODUCTS;
  try {
    const r = await fetch(`${API}/product/list`, { cache: "no-store" });
    if (!r.ok) throw 0;
    return await r.json();
  } catch {
    return DUMMY_PRODUCTS;
  }
}

export async function createOrder(draft: OrderDraft): Promise<{ ok: boolean; id?: string }> {
  if (!API) {
    // 더미 응답
    return { ok: true, id: `dummy-${Date.now()}` };
  }
  const r = await fetch(`${API}/order/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
  if (!r.ok) throw new Error("주문 실패");
  return r.json();
}

export async function fetchOrdersByEmail(email: string): Promise<Order[]> {
  if (!email) return [];
  if (!API) {
    // 더미 주문 내역
    return [{
      id: "dummy-1",
      email,
      address: "서울시 어딘가 1-2-3",
      postcode: "01234",
      items: [
        { productId: "col-narino", name: "Columbia Nariñó", qty: 2, price: 5000 },
        { productId: "eth-yirg", name: "Ethiopia Yirgacheffe", qty: 1, price: 7000 },
      ],
      total: 17000,
      shipCategory: "TODAY",
      createdAt: new Date().toISOString(),
    }];
  }
  const r = await fetch(`${API}/order/details?email=${encodeURIComponent(email)}`, { cache: "no-store" });
  if (!r.ok) throw new Error("조회 실패");
  return r.json();
}
