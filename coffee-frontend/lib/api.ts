// lib/api.ts
import type { Product, Order, OrderDraft, User, OrderStatus } from "@/types";
import { storage } from "./storage";

// 0) BASE 설정 — .env.local 에는 꼭 이처럼 둬요:
// NEXT_PUBLIC_API_BASE=http://localhost:8080
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // 비어있으면 더미 모드

// ✅ 네가 준 명세서에 맞춘 경로
const PATHS = {
  // 상품 (일반 + 관리자)
  productsList: "/product/list",
  adminProducts: "/admin/product",
  adminProductOne: (id: string) => `/admin/product/${id}`,

  // 주문
  orderCreate: "/order",                 // POST
  orderList: "/order/order",             // GET (관리자: 전체 목록)
  orderOne: (id: string) => `/order/order/${id}`, // GET/PUT/DELETE
  orderDetailsByEmail: "/order/details", // GET ?email=

  // 회원
  signup: "/members/join",               // POST
  login: "/members/login",               // POST
  logout: "/members/logout",             // DELETE
  mypage: "/members/mypage",             // GET/PATCH
};

// 공통 유틸
function join(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
async function unwrapJson<T>(r: Response): Promise<T> {
  const body = await r.json().catch(() => ({}));
  // RsData 포맷이면 data만 반환, 아니면 body 전체
  return (body && typeof body === "object" && "data" in body ? (body as any).data : body) as T;
}
function j(o: any) { return JSON.stringify(o); }
function isDummy() { return !API_BASE; }

// ⬇︎ 추가: Authorization 헤더 주입 (apiKey가 있으면 붙임)
function authHeaders(): HeadersInit {
  const u = storage.getUser();
  if (u?.apiKey) return { Authorization: `Bearer ${u.apiKey}` };
  return {};
}

// ---------------- 더미들(생략 가능, 기존 그대로 사용) ----------------
let DUMMY_PRODUCTS: Product[] = [
  { id: "col-narino", name: "Columbia Nariñó", origin: "콜롬비아", price: 5000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 100, active: true },
  { id: "bra-serra",  name: "Brazil Serra Do Caparaó", origin: "브라질",   price: 6000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 80,  active: true },
  { id: "eth-yirg",   name: "Ethiopia Yirgacheffe",    origin: "에티오피아", price: 7000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 60,  active: true },
];
let DUMMY_ORDERS: Order[] = [];
export const DUMMY_USERS: Array<User & { password: string }> = [
  { email: "member1@example.com", password: "1234", nickname: "성현", address: "서울시 중구 어딘가 1-2-3", postal_code: "04524", role: "user" },
  { email: "admin@example.com",   password: "admin", nickname: "관리자", address: "서울시 종로구 관철동 1-1", postal_code: "03154", role: "admin" },
];

// ★ 백엔드 payload → 프론트 User로 변환
function toUserFromLoginPayload(body: any): User {
  // body 예시: { memberDto:{...}, apiKey:"..." }  ← unwrapJson 후
  const dto = body?.memberDto ?? {};
  const role = (dto?.authority || "").toUpperCase() === "ADMIN" ? "admin" : "user";
  return {
    email: dto?.email ?? "",
    nickname: dto?.name ?? dto?.nickname ?? "",
    address: dto?.address ?? "",
    postal_code: dto?.postalCode ?? dto?.zipcode ?? "",
    role,
    apiKey: body?.apiKey, // ⬅︎ 수정: data.apiKey가 아니라 body(api)의 최상위
  };
}

// 1) 로그인 / 로그아웃 / 회원가입
// 2-1) 로그인
export async function login(email: string, password: string): Promise<User> {
  if (isDummy()) {
    // ... (더미 로직은 기존과 동일) ...
    throw new Error("더미 모드에서는 기존 더미 로그인 코드를 유지하세요.");
  }
  const r = await fetch(join(API_BASE, PATHS.login), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: j({ email, password }),
    credentials: "include", // ⬅︎ 쿠키 수신
  });
  if (!r.ok) throw new Error("로그인 실패");
  const data = await unwrapJson<any>(r);     // RsData.data → { memberDto, apiKey }
  const user = toUserFromLoginPayload(data); // 매핑
  storage.setUser(user);                     // 저장 (apiKey 포함)
  return user;
}

// 2-2) 로그아웃
export async function logout() {
  if (!isDummy()) {
    try {
      await fetch(join(API_BASE, PATHS.logout), {
        method: "DELETE",
        credentials: "include",       // ⬅︎ 쿠키 기반 로그아웃
        headers: { ...authHeaders() },// (Authorization 기반도 지원)
      });
    } catch {}
  }
  storage.clearUser();
}

// 2-3) 회원가입
export async function signup(data: {
  email: string; password: string; nickname: string; address: string; postal_code: string;
}): Promise<User> {
  if (isDummy()) {
    throw new Error("더미 모드에서는 기존 더미 회원가입 코드를 유지하세요.");
  }
  const body = {
    email: data.email,
    password: data.password,
    nickname: data.nickname,
    address: data.address,
    postalCode: data.postal_code,
  };
  const r = await fetch(join(API_BASE, PATHS.signup), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: j(body),
    credentials: "include", // ⬅︎ 가입 시 쿠키 내려줄 수 있으므로 포함
  });
  if (!r.ok) throw new Error("회원가입 실패");
  const resp = await unwrapJson<any>(r);
  const user = toUserFromLoginPayload(resp);
  storage.setUser(user);
  return user;
}

// 2-4) 마이페이지 조회
export async function fetchMyPage(): Promise<User> {
  if (isDummy()) {
    const u = storage.getUser(); if (!u) throw new Error("로그인 필요");
    return u;
  }
  const r = await fetch(join(API_BASE, PATHS.mypage), {
    cache: "no-store",
    credentials: "include",        // ⬅︎ 쿠키 전송
    headers: { ...authHeaders() }, // ⬅︎ 헤더 인증 폴백
  });
  if (!r.ok) throw new Error("마이페이지 조회 실패");
  const data = await unwrapJson<any>(r);
  const user = toUserFromLoginPayload(data);
  storage.setUser(user); // 최신 서버 값 동기화
  return user;
}

// 2-5) 마이페이지 수정 (주소/우편번호/닉네임)
export async function updateMyPage(patch: { nickname?: string; address?: string; postal_code?: string; }): Promise<User> {
  if (isDummy()) {
    const u = storage.getUser(); if (!u) throw new Error("로그인 필요");
    const merged = { ...u, ...patch };
    storage.setUser(merged);
    return merged;
  }
  const body = {
    nickname: patch.nickname,
    address: patch.address,
    postalCode: patch.postal_code,
  };
  const r = await fetch(join(API_BASE, PATHS.mypage), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
    credentials: "include", // ⬅︎ 쿠키 전송
  });
  if (!r.ok) throw new Error("마이페이지 수정 실패");
  const data = await unwrapJson<any>(r);
  const user = toUserFromLoginPayload(data);
  storage.setUser(user);
  return user;
}

// 2) 상품 목록
export async function fetchProducts(): Promise<Product[]> {
  if (isDummy()) return [...DUMMY_PRODUCTS];
  const r = await fetch(join(API_BASE, PATHS.productsList), { cache: "no-store" });
  if (!r.ok) throw new Error("상품 조회 실패");
  return await unwrapJson<Product[]>(r);
}

// 3) 주문: 생성
export async function createOrder(draft: OrderDraft): Promise<{ ok: boolean; id?: string }> {
  if (isDummy()) {
    const id = `dummy-${Date.now()}`;
    const itemsDetailed = draft.items.map(it => {
      const p = DUMMY_PRODUCTS.find(x => x.id === it.productId);
      return { productId: it.productId, name: p?.name || it.productId, qty: it.qty, price: p?.price || 0 };
    });
    DUMMY_ORDERS.unshift({
      id, email: draft.email, address: draft.address, postcode: draft.postcode,
      items: itemsDetailed, total: draft.total, shipCategory: draft.shipCategory,
      createdAt: new Date().toISOString(), status: "PAID",
    } as Order);
    return { ok: true, id };
  }
  const body = {
    email: draft.email,
    address: draft.address,
    zipcode: draft.postcode,
    postalCode: draft.postcode,
    totalPrice: draft.total,
    items: draft.items.map(it => ({
      productId: it.productId,
      qty: it.qty,
    })),
    shipCategory: draft.shipCategory,
  };

  const r = await fetch(join(API_BASE, PATHS.orderCreate), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() }, // ⬅︎ 헤더 인증 폴백
    body: JSON.stringify(body),
    credentials: "include", // ⬅︎ 쿠키 인증
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(text || "주문 실패");
  }
  return await r.json(); // RsData면 data 까서 써도 됨
}

// 2) 비회원 이메일 주문 목록 조회
export async function fetchOrdersByEmail(email: string): Promise<Order[]> {
  if (!email) return [];
  if (isDummy()) return DUMMY_ORDERS.filter(o => o.email === email);
  const url = `${join(API_BASE, PATHS.orderDetailsByEmail)}`; // ⬅︎ 쿼리 추가
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("주문 조회 실패");
  return await unwrapJson<Order[]>(r);
}

// 3) 관리자 통계 — 프론트 계산
export async function adminFetchStats(): Promise<{
  revenue: number; byProduct: Array<{ productId: string; name: string; qty: number; amount: number }>;
}> {
  const orders = await adminFetchOrders(); // 전체 주문 가져와서
  let revenue = 0;
  const map = new Map<string, { name: string; qty: number; amount: number }>();
  for (const o of orders) {
    revenue += o.total || 0;
    for (const it of o.items) {
      const v = map.get(it.productId) || { name: it.name, qty: 0, amount: 0 };
      v.qty += it.qty;
      v.amount += it.qty * it.price;
      map.set(it.productId, v);
    }
  }
  return { revenue, byProduct: [...map].map(([productId, v]) => ({ productId, ...v })) };
}

// 관리자: 주문 목록/단건/상태변경(업데이트)
export async function adminFetchOrders(): Promise<Order[]> {
  if (isDummy()) return [...DUMMY_ORDERS];
  const r = await fetch(join(API_BASE, PATHS.orderList), {
    cache: "no-store",
    credentials: "include",
    headers: { ...authHeaders() },
  });
  if (!r.ok) throw new Error("관리자 주문 목록 조회 실패");
  return await unwrapJson<Order[]>(r);
}
export async function adminFetchOrder(id: string): Promise<Order> {
  if (isDummy()) {
    const o = DUMMY_ORDERS.find(x => x.id === id); if (!o) throw new Error("주문 없음"); return o;
  }
  const r = await fetch(join(API_BASE, PATHS.orderOne(id)), {
    cache: "no-store",
    credentials: "include",
    headers: { ...authHeaders() },
  });
  if (!r.ok) throw new Error("주문 단건 조회 실패");
  return await unwrapJson<Order>(r);
}
// 명세엔 '상태 변경' 전용 엔드포인트는 없고 PUT /order/order/{id} 이므로 그걸로 업데이트
export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (isDummy()) {
    const i = DUMMY_ORDERS.findIndex(o => o.id === orderId);
    if (i >= 0) DUMMY_ORDERS[i].status = status;
    return true;
  }
  const r = await fetch(join(API_BASE, PATHS.orderOne(orderId)), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: j({ status }),
    credentials: "include",
  });
  return r.ok;
}

// 4) 관리자: 상품 등록/수정/삭제 (DB 반영)
// payload 필드명: productname, productPrice, origin, stock, imgUrl
type AdminCreatePayload = { productname: string; productPrice: number; origin: string; stock: number; imgUrl: string; active?: boolean; };

export async function adminFetchProducts(): Promise<Product[]> {
  if (isDummy()) return [...DUMMY_PRODUCTS];
  const r = await fetch(join(API_BASE, PATHS.adminProducts), {
    cache: "no-store",
    credentials: "include",
    headers: { ...authHeaders() },
  });
  if (!r.ok) throw new Error("관리자 상품 조회 실패");
  return await unwrapJson<Product[]>(r);
}
export async function adminCreateProduct(payload: AdminCreatePayload): Promise<Product> {
  if (isDummy()) {
    const id = `p_${Date.now()}`;
    const np: Product = {
      id, name: payload.productname, price: payload.productPrice, origin: payload.origin,
      stock: payload.stock, imageUrl: payload.imgUrl, active: payload.active ?? true,
    };
    DUMMY_PRODUCTS.unshift(np);
    return np;
  }
  const r = await fetch(join(API_BASE, PATHS.adminProducts), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: j(payload),
    credentials: "include",
  });
  if (!r.ok) throw new Error("상품 등록 실패");
  return await unwrapJson<Product>(r);
}
export async function adminUpdateProduct(p: Product): Promise<boolean> {
  if (isDummy()) {
    const i = DUMMY_PRODUCTS.findIndex(x => x.id === p.id);
    if (i >= 0) DUMMY_PRODUCTS[i] = { ...p };
    return true;
  }
  const r = await fetch(join(API_BASE, PATHS.adminProductOne(p.id)), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: j(p),
    credentials: "include",
  });
  return r.ok;
}
export async function adminDeleteProduct(id: string): Promise<boolean> {
  if (isDummy()) {
    DUMMY_PRODUCTS = DUMMY_PRODUCTS.filter(x => x.id !== id);
    return true;
  }
  const r = await fetch(join(API_BASE, PATHS.adminProductOne(id)), {
    method: "DELETE",
    headers: { ...authHeaders() },
    credentials: "include",
  });
  return r.ok;
}
