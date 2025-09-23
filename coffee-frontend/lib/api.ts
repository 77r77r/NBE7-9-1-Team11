import type { Product, Order, OrderDraft } from "@/types";
import type { User } from "@/types";
import { storage } from "./storage";

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

// ✅ 공유 가능한 더미 유저
export const DUMMY_USERS: Array<User & { password: string }> = [
  {
    email: "member1@example.com",
    password: "1234",
    nickname: "일론 머스크",
    address: "서울시 중구 어딘가 1-2-3",
    postal_code: "04524",
  },
  {
    email: "member2@example.com",
    password: "abcd",
    nickname: "CoffeeDev",
    address: "부산시 해운대구 바다로 77",
    postal_code: "48076",
  },
];

// 로그인
export async function login(email: string, password: string): Promise<User> {
  if (!API) {
    const found = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    const { password: _pw, ...user } = found;
    storage.setUser(user);
    return user;
  }
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("로그인 실패");
  const user = await r.json() as User;
  storage.setUser(user);
  return user;
}

// 회원가입
export async function signup(data: {
  email: string; password: string; nickname: string; address: string; postal_code: string;
}): Promise<User> {
  if (!API) {
    // 더미: 같은 이메일 있으면 실패
    if (DUMMY_USERS.some(u => u.email === data.email)) throw new Error("이미 존재하는 이메일입니다.");
    const user: User = { email: data.email, nickname: data.nickname, address: data.address, postal_code: data.postal_code };
    // 더미 DB에 추가하진 않지만, 로그인된 상태로 전환
    storage.setUser(user);
    return user;
  }
  const r = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("회원가입 실패");
  const user = await r.json() as User;
  storage.setUser(user);
  return user;
}

// 로그아웃
export function logout() {
  storage.clearUser();
}
