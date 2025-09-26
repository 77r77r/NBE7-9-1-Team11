// lib/api.ts
import type { Product, Order, OrderDraft, User, OrderStatus } from "@/types";
import { storage } from "./storage";

// 환경변수에 prefix까지 포함 (예: http://localhost:8080/api/v1)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // 비어있으면 더미 모드

// 리소스 경로만 정의 (prefix는 API_BASE에 포함됨)
const PATHS = {
  // 상품 (일반 + 관리자)
  productsList: "/product/list",
  adminProducts: "/admin/products",
  adminProductOne: (id: string) => `/admin/products/${id}`,

  // 주문
  orderCreate: "/order",                    // POST
  orderList: "/order",                      // GET (관리자/권한 필요) — 가정
  orderOne: (id: string) => `/order/${id}`, // GET/PUT/DELETE — 가정
  orderDetailsByEmail: "/order/details",    // GET ?email=

  // 회원
  signup: "/members/join",    // POST
  login: "/members/login",    // POST
  logout: "/members/logout",  // DELETE
  mypage: "/members/mypage",  // GET/PATCH
};

// --- [추가] 백엔드 → 프론트 표준 Order[] 정규화 유틸 ---
// 표준 아이템: name, qty, price(=단가). 합계는 Σ(price * qty)
function normalizeOrdersFrom(raw: any): Order[] {
  // 다양한 감싸기 형태 해제
  const arr =
    Array.isArray(raw) ? raw :
    Array.isArray(raw?.orderDto) ? raw.orderDto :
    Array.isArray(raw?.orders) ? raw.orders :
    Array.isArray(raw?.orderList) ? raw.orderList :
    Array.isArray(raw?.content) ? raw.content :
    [];

  return arr.map((o: any) => {
    const items: Array<{ productId: string; name: string; qty: number; price: number }> =
      (o.items ?? []).map((it: any) => {
        const qty = Number(it.quantity ?? it.qty ?? 0);
        const rawPrice = Number(it.price ?? 0);

        // ✅ price가 라인합계로 오는 경우를 단가로 환산 (qty>0이고 price%qty==0 이면 라인합계 가능성 큼)
        const unitPrice =
          qty > 0 && rawPrice > 0 && rawPrice % qty === 0
            ? Math.round(rawPrice / qty)
            : rawPrice;

        return {
          productId: String(it.productId ?? it.id ?? it.productName ?? ""),
          name: it.productName ?? it.name ?? (it.productId ?? "상품"),
          qty,
          price: unitPrice, // 표준: 단가
        };
      });

    const computedTotal = items.reduce((s, it) => s + it.qty * it.price, 0);

    return {
      id: String(o.orderId ?? o.id ?? ""),
      email: o.email ?? "",
      address: o.address ?? "",
      postcode: o.postcode ?? o.zipcode ?? o.postalCode ?? "",
      createdAt: o.orderTime ?? o.createdAt ?? null,
      items,
      total: Number(o.total ?? o.totalPrice ?? computedTotal),
      shipCategory: o.shipCategory ?? o.shippingStatus ?? "배송준비중",
      status: o.status ?? "배송준비중",
    } as Order;
  });
}

// 공통 유틸
function join(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
async function unwrapJson<T>(r: Response): Promise<T> {
  const bodyText = await r.text();
  if (!bodyText) return {} as T;
  let body: any = {};
  try { body = JSON.parse(bodyText); } catch { body = {}; }
  // RsData 포맷이면 data만 반환, 아니면 body 전체
  return (body && typeof body === "object" && "data" in body ? (body as any).data : body) as T;
}
function j(o: any) { return JSON.stringify(o); }
function isDummy() { return !API_BASE; }

// ⬇︎ 인증 헤더 보강: 서버 구현 변주 대응 (Bearer, X-API-KEY, Api-Key 동시 세팅)
function authHeaders(): HeadersInit {
  const u = storage.getUser();
  if (!u?.apiKey) return {};
  return {
    Authorization: `Bearer ${u.apiKey}`,
    "X-API-KEY": u.apiKey,
    "Api-Key": u.apiKey,
  };
}

// ---------------- 더미 데이터 ----------------
let DUMMY_PRODUCTS: Product[] = [
  { id: "col-narino", name: "Columbia Nariñó", origin: "콜롬비아", price: 5000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 100, active: true },
  { id: "bra-serra",  name: "Brazil Serra Do Caparaó", origin: "브라질",   price: 6300, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 80,  active: true },
  { id: "eth-yirg",   name: "Ethiopia Yirgacheffe",    origin: "에티오피아", price: 6800, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 60,  active: true },
];
let DUMMY_ORDERS: Order[] = [];
export const DUMMY_USERS: Array<User & { password: string }> = [
  { email: "member1@example.com", password: "1234", nickname: "성현", address: "서울시 중구 어딘가 1-2-3", postal_code: "04524", role: "user" },
  { email: "admin@example.com",   password: "admin", nickname: "관리자", address: "서울시 종로구 관철동 1-1", postal_code: "03154", role: "admin" },
];

// ★ 백엔드 payload → 프론트 User로 변환 (두 가지 스키마 모두 지원)
function toUserFromLoginPayload(body: any): User {
  // A) { memberDto:{...}, apiKey:"..." }
  // B) { email, name|nickname, address, postalCode|zipcode, authority|role, ... }
  const dto = body?.memberDto ?? body ?? {};
  const roleRaw = dto?.authority ?? dto?.role ?? "";
  const role = (String(roleRaw).toUpperCase() === "ADMIN") ? "admin" : "user";

  return {
    email: dto?.email ?? "",
    nickname: dto?.name ?? dto?.nickname ?? "",
    address: dto?.address ?? "",
    postal_code: dto?.postalCode ?? dto?.zipcode ?? "",
    role,
    apiKey: body?.apiKey ?? body?.token ?? undefined, // 토큰 키명 변주 대비
  };
}

// 1) 로그인 / 로그아웃 / 회원가입
// 1-1) 로그인
export async function login(email: string, password: string): Promise<User> {
  if (isDummy()) {
    // 더미 로그인
    const u = DUMMY_USERS.find(x => x.email === email && x.password === password);
    if (!u) throw new Error("로그인 실패");
    const user: User = { email: u.email, nickname: u.nickname, address: u.address, postal_code: u.postal_code, role: u.role };
    storage.setUser(user);
    return user;
  }
  const r = await fetch(join(API_BASE, PATHS.login), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: j({ email, password }),
    credentials: "include", // 쿠키 수신
  });
  if (!r.ok) {
    const t = await r.text().catch(()=> "");
    throw new Error(t || "로그인 실패");
  }
  const data = await unwrapJson<any>(r);     // RsData.data
  const user = toUserFromLoginPayload(data); // 매핑
  storage.setUser(user);                     // 저장 (apiKey 포함 가능)
  return user;
}

// 1-2) 로그아웃
export async function logout() {
  if (!isDummy()) {
    try {
      await fetch(join(API_BASE, PATHS.logout), {
        method: "DELETE",
        credentials: "include",       // 쿠키 기반 로그아웃
        headers: { ...authHeaders() },// 헤더 인증도 병행 지원
      });
    } catch {}
  }
  storage.clearUser();
}

// 1-3) 회원가입
export async function signup(data: {
  email: string; password: string; nickname: string; address: string; postal_code: string;
}): Promise<User> {
  if (isDummy()) {
    // 더미 가입 → 즉시 로그인 처리
    if (DUMMY_USERS.some(x => x.email === data.email)) throw new Error("이미 존재하는 이메일");
    const nu: User & { password: string } = {
      email: data.email, password: data.password, nickname: data.nickname,
      address: data.address, postal_code: data.postal_code, role: "user",
    };
    DUMMY_USERS.push(nu);
    const user: User = { email: nu.email, nickname: nu.nickname, address: nu.address, postal_code: nu.postal_code, role: "user" };
    storage.setUser(user);
    return user;
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
    credentials: "include", // 가입 시 쿠키 내려줄 수 있음
  });
  if (!r.ok) {
    const t = await r.text().catch(()=> "");
    throw new Error(t || "회원가입 실패");
  }
  const resp = await unwrapJson<any>(r);
  const user = toUserFromLoginPayload(resp);
  storage.setUser(user);
  return user;
}

// 1-4) 마이페이지 조회
export async function fetchMyPage(): Promise<User> {
  if (isDummy()) {
    const u = storage.getUser(); if (!u) throw new Error("로그인 필요");
    return u;
  }
  const r = await fetch(join(API_BASE, PATHS.mypage), {
    cache: "no-store",
    credentials: "include",        // 쿠키 전송
    headers: { ...authHeaders() }, // 헤더 인증 폴백
  });
  if (!r.ok) throw new Error("마이페이지 조회 실패");
  const data = await unwrapJson<any>(r);
  const user = toUserFromLoginPayload(data);
  storage.setUser(user); // 최신 서버 값 동기화
  return user;
}

// 1-5) 마이페이지 수정 (주소/우편번호/닉네임)
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
    credentials: "include", // 쿠키 전송
  });
  if (!r.ok) {
    const t = await r.text().catch(()=> "");
    throw new Error(t || "마이페이지 수정 실패");
  }
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

// 3) 주문: 생성 → { ok, id }로 통일
export async function createOrder(draft: OrderDraft): Promise<{ ok: boolean; id?: string }> {
  if (isDummy()) {
    const id = `dummy-${Date.now()}`;
    const itemsDetailed = draft.items.map(it => {
      const p = DUMMY_PRODUCTS.find(x => x.id === it.productId);
      return { productId: String(it.productId), name: p?.name || String(it.productId), qty: it.qty, price: p?.price || 0 };
    });
    const computedTotal = itemsDetailed.reduce((s, it) => s + it.qty * it.price, 0);
    DUMMY_ORDERS.unshift({
      id,
      email: draft.email,
      address: draft.address,
      postcode: draft.postcode,
      items: itemsDetailed,
      total: computedTotal,
      shipCategory: draft.shipCategory,     // "배송준비중" 등
      status: draft.shipCategory,           // 동일 체계로 통일
      createdAt: new Date().toISOString(),
    } as unknown as Order);
    return { ok: true, id };
  }

  const body = {
    email: draft.email,
    address: draft.address,
    zipcode: draft.postcode,       // 서버가 zipcode만 받을 수도 있어서 둘 다 전송
    postalCode: draft.postcode,    // 서버가 postalCode만 받을 수도 있어서 둘 다 전송
    totalPrice: draft.total,
    items: draft.items.map(it => {
      // 백엔드가 숫자 productId를 기대한다면 안전 변환
      const pid = (typeof it.productId === "string" && /^\d+$/.test(it.productId))
        ? Number(it.productId)
        : it.productId;
      return {
        productId: pid,
        quantity: it.qty, // ✅ 백엔드가 읽는 필드명으로 전송
      };
    }),
    shipCategory: draft.shipCategory,     // "배송준비중|배송중|배송완료"
    shippingStatus: draft.shipCategory,   // (선택) 백엔드가 새 키명을 도입했어도 대응
  };

  const r = await fetch(join(API_BASE, PATHS.orderCreate), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
    credentials: "include", // 쿠키 인증
  });

  const raw = await r.text().catch(() => "");
  if (!r.ok) throw new Error(raw || "주문 실패");

  let parsed: any = {};
  try { parsed = raw ? JSON.parse(raw) : {}; } catch {}
  const data = parsed && typeof parsed === "object" && "data" in parsed ? parsed.data : parsed;

  // 다양한 키 케이스 흡수
  const id = data?.id ?? data?.orderId ?? data?.orderID ?? data?.result?.id;
  return { ok: true, id };
}

// 4) 비회원 이메일 주문 목록 조회 (인증 헤더/쿠키 동시 지원)
export async function fetchOrdersByEmail(email: string): Promise<Order[]> {
  if (!email) return [];
  if (isDummy()) return DUMMY_ORDERS.filter(o => o.email === email);

  const url = `${join(API_BASE, PATHS.orderDetailsByEmail)}?email=${encodeURIComponent(email)}`;
  const r = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    headers: { ...authHeaders() },
  });
  if (!r.ok) throw new Error("주문 조회 실패");

  // RsData의 data만 파싱 → 표준화
  const raw = await unwrapJson<any>(r);
  return normalizeOrdersFrom(raw);
}

// 5) 관리자 통계 — 프론트 계산
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

// 6) 관리자: 주문 목록/단건/상태변경(업데이트)
// ※ 백엔드 미구현 상태 가정 — 응답 형식 불명확시 normalizeOrdersFrom로 정규화
export async function adminFetchOrders(): Promise<Order[]> {
  if (isDummy()) return [...DUMMY_ORDERS];
  const r = await fetch(join(API_BASE, PATHS.orderList), {
    cache: "no-store",
    credentials: "include",
    headers: { ...authHeaders() },
  });
  if (!r.ok) throw new Error("관리자 주문 목록 조회 실패");
  const raw = await unwrapJson<any>(r);
  return normalizeOrdersFrom(raw);
}
export async function adminFetchOrder(id: string): Promise<Order> {
  if (isDummy()) {
    const o = DUMMY_ORDERS.find(x => String(x.id) === String(id));
    if (!o) throw new Error("주문 없음");
    return o;
  }
  const r = await fetch(join(API_BASE, PATHS.orderOne(id)), {
    cache: "no-store",
    credentials: "include",
    headers: { ...authHeaders() },
  });
  if (!r.ok) throw new Error("주문 단건 조회 실패");
  const raw = await unwrapJson<any>(r);
  const list = normalizeOrdersFrom(raw);
  if (!list.length) throw new Error("주문 없음");
  return list[0];
}
// 명세엔 '상태 변경' 전용 엔드포인트가 없으면 PUT /order/{id}로 업데이트
export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (isDummy()) {
    const i = DUMMY_ORDERS.findIndex(o => String(o.id) === String(orderId));
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

// 7) 관리자: 상품 등록/수정/삭제
type AdminCreatePayload = { productname: string; productPrice: number; origin: string; stock: number; imgUrl: string; active?: boolean; };

export async function adminFetchProducts(): Promise<Product[]> {
  if (isDummy()) return [...DUMMY_PRODUCTS];
  const r = await fetch(join(API_BASE, PATHS.productsList), {
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
  if (!r.ok) {
    const t = await r.text().catch(()=> "");
    throw new Error(t || "상품 등록 실패");
  }
  return await unwrapJson<Product>(r);
}
export async function adminUpdateProduct(p: Product): Promise<boolean> {
  if (isDummy()) {
    const i = DUMMY_PRODUCTS.findIndex(x => String(x.id) === String(p.id));
    if (i >= 0) DUMMY_PRODUCTS[i] = { ...p };
    return true;
  }
  const r = await fetch(join(API_BASE, PATHS.adminProductOne(String(p.id))), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: j(p),
    credentials: "include",
  });
  return r.ok;
}
export async function adminDeleteProduct(id: string): Promise<boolean> {
  if (isDummy()) {
    DUMMY_PRODUCTS = DUMMY_PRODUCTS.filter(x => String(x.id) !== String(id));
    return true;
  }
  const r = await fetch(join(API_BASE, PATHS.adminProductOne(String(id))), {
    method: "DELETE",
    headers: { ...authHeaders() },
    credentials: "include",
  });
  return r.ok;
}
