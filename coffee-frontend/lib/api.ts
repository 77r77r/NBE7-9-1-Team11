// lib/api.ts
import type {Product, Order, OrderDraft, User, OrderStatus} from "@/types";
import {storage} from "./storage";

// 환경변수에 prefix까지 포함 (예: http://localhost:8080/api/v1)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // 비어있으면 더미 모드

// 리소스 경로만 정의 (prefix는 API_BASE에 포함됨)
const PATHS = {
    // 상품 (일반 + 관리자)
    productsList: "/product/list",
    adminProducts: "/admin/product",
    adminProductOne: (id: string) => `/admin/product/${id}`,

    // 주문
    orderCreate: "/order",                         // POST (게스트/회원 공용 생성)
    orderGuestDetails: "/order/details",           // GET ?email=  (비회원 조회)
    orderMemberDetails: "/order/member/details",   // GET        (회원 조회)
    orderAll: "/order/all",                              // GET        (관리자 전체 조회)

    // 회원
    signup: "/members/join",    // POST
    login: "/members/login",    // POST
    logout: "/members/logout",  // DELETE
    mypage: "/members/mypage",  // GET/PATCH
};

// --- 백엔드 → 프론트 표준 Order[] 정규화 ---
// 표준 아이템: name, qty, price(=단가). 합계는 Σ(price * qty)
function normalizeOrdersFrom(raw: any): Order[] {
    // 다양한 래핑 필드 해제
    const arr =
        Array.isArray(raw) ? raw :
            Array.isArray(raw?.orderDto) ? raw.orderDto :     // member/guest
                Array.isArray(raw?.orders) ? raw.orders :         // admin(all)
                    Array.isArray(raw?.orderList) ? raw.orderList :
                        Array.isArray(raw?.content) ? raw.content :
                            [];

    return arr.map((o: any, idx: number) => {
        const items: Array<{ productId: string; name: string; qty: number; price: number }> =
            (o.items ?? []).map((it: any) => {
                const qty = Number(it.quantity ?? it.qty ?? 0);
                const rawPrice = Number(it.price ?? 0);
                // price가 라인합계면 단가로 환산
                const unitPrice =
                    qty > 0 && rawPrice > 0 && rawPrice % qty === 0
                        ? Math.round(rawPrice / qty)
                        : rawPrice;
                return {
                    productId: String(it.productId ?? it.id ?? it.productName ?? ""),
                    name: it.productName ?? it.name ?? (it.productId ?? "상품"),
                    qty,
                    price: unitPrice,
                };
            });

        const createdAt = o.orderTime ?? o.createdAt ?? null;
        const computedTotal = items.reduce((s, it) => s + it.qty * it.price, 0);
        // id가 없을 수 있음(admin 응답) → 시간/인덱스로 안정적 문자열 생성
        const safeId =
            o.orderId ?? o.id ??
            (createdAt ? `t:${createdAt}` : `idx:${idx}`);

        return {
            id: String(safeId),
            email: o.email ?? "",
            address: o.address ?? "",
            postcode: o.postalCode ?? o.postcode ?? o.zipcode ?? "",
            createdAt,
            items,
            total: Number(o.total ?? o.totalPrice ?? computedTotal),
            shipCategory: o.shipCategory ?? o.shippingStatus ?? o.status ?? "배송준비중",
            status: o.status ?? o.shippingStatus ?? o.shipCategory ?? "배송준비중",
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
    try {
        body = JSON.parse(bodyText);
    } catch {
        body = {};
    }
    // RsData 포맷이면 data만 반환, 아니면 body 전체
    return (body && typeof body === "object" && "data" in body ? (body as any).data : body) as T;
}

function j(o: any) {
    return JSON.stringify(o);
}

function isDummy() {
    return !API_BASE;
}

// 인증 헤더(서버 변주 대응)
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
    {id: "col-narino", name: "Colombia Nariño", origin: "콜롬비아", price: 5100, imageUrl: "", stock: 100, active: true},
    {id: "col-quindio", name: "Colombia Quindío", origin: "콜롬비아", price: 5600, imageUrl: "", stock: 80, active: true},
    {
        id: "bra-serra",
        name: "Brazil Serra Do Caparaó",
        origin: "브라질",
        price: 6300,
        imageUrl: "",
        stock: 60,
        active: true
    },
];
let DUMMY_ORDERS: Order[] = [];
export const DUMMY_USERS: Array<User & { password: string }> = [
    {
        email: "member1@example.com",
        password: "1234",
        nickname: "성현",
        address: "서울시 중구 어딘가 1-2-3",
        postal_code: "04524",
        role: "user"
    },
    {
        email: "admin@example.com",
        password: "admin",
        nickname: "관리자",
        address: "서울시 종로구 관철동 1-1",
        postal_code: "03154",
        role: "admin"
    },
];

// payload → User
function toUserFromLoginPayload(body: any): User {
    const dto = body?.memberDto ?? body ?? {};
    const roleRaw = dto?.authority ?? dto?.role ?? "";
    const role = (String(roleRaw).toUpperCase() === "ADMIN") ? "admin" : "user";
    return {
        email: dto?.email ?? "",
        nickname: dto?.name ?? dto?.nickname ?? "",
        address: dto?.address ?? "",
        postal_code: dto?.postalCode ?? dto?.zipcode ?? "",
        role,
        apiKey: body?.apiKey ?? body?.token ?? undefined,
    };
}

// 1) 로그인 / 로그아웃 / 회원가입
export async function login(email: string, password: string): Promise<User> {
    if (isDummy()) {
        const u = DUMMY_USERS.find(x => x.email === email && x.password === password);
        if (!u) throw new Error("로그인 실패");
        const user: User = {
            email: u.email,
            nickname: u.nickname,
            address: u.address,
            postal_code: u.postal_code,
            role: u.role
        };
        storage.setUser(user);
        return user;
    }
    const r = await fetch(join(API_BASE, PATHS.login), {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: j({email, password}),
        credentials: "include",
    });
    if (!r.ok) throw new Error((await r.text().catch(() => "")) || "로그인 실패");
    const data = await unwrapJson<any>(r);
    const user = toUserFromLoginPayload(data);
    storage.setUser(user);
    return user;
}

export async function logout() {
    if (!isDummy()) {
        try {
            await fetch(join(API_BASE, PATHS.logout), {
                method: "DELETE",
                credentials: "include",
                headers: {...authHeaders()},
            });
        } catch {
        }
    }
    storage.clearUser();
}

export async function signup(data: {
    email: string; password: string; nickname: string; address: string; postal_code: string;
}): Promise<User> {
    if (isDummy()) {
        if (DUMMY_USERS.some(x => x.email === data.email)) throw new Error("이미 존재하는 이메일");
        const nu: User & { password: string } = {
            email: data.email, password: data.password, nickname: data.nickname,
            address: data.address, postal_code: data.postal_code, role: "user",
        };
        DUMMY_USERS.push(nu);
        const user: User = {
            email: nu.email,
            nickname: nu.nickname,
            address: nu.address,
            postal_code: nu.postal_code,
            role: "user"
        };
        storage.setUser(user);
        return user;
    }
    const body = {
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        address: data.address,
        postalCode: data.postal_code
    };
    const r = await fetch(join(API_BASE, PATHS.signup), {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: j(body),
        credentials: "include",
    });
    if (!r.ok) throw new Error((await r.text().catch(() => "")) || "회원가입 실패");
    const resp = await unwrapJson<any>(r);
    const user = toUserFromLoginPayload(resp);
    storage.setUser(user);
    return user;
}

// 2) 마이페이지 조회/수정
export async function fetchMyPage(): Promise<User> {
    if (isDummy()) {
        const u = storage.getUser();
        if (!u) throw new Error("로그인 필요");
        return u;
    }
    const r = await fetch(join(API_BASE, PATHS.mypage), {
        cache: "no-store",
        credentials: "include",
        headers: {...authHeaders()},
    });
    if (!r.ok) throw new Error("마이페이지 조회 실패");
    const data = await unwrapJson<any>(r);
    const user = toUserFromLoginPayload(data);
    storage.setUser(user);
    return user;
}

export async function updateMyPage(patch: {
    nickname?: string;
    address?: string;
    postal_code?: string;
}): Promise<User> {
    if (isDummy()) {
        const u = storage.getUser();
        if (!u) throw new Error("로그인 필요");
        const merged = {...u, ...patch};
        storage.setUser(merged);
        return merged;
    }
    const body = {nickname: patch.nickname, address: patch.address, postalCode: patch.postal_code};
    const r = await fetch(join(API_BASE, PATHS.mypage), {
        method: "PATCH",
        headers: {"Content-Type": "application/json", ...authHeaders()},
        body: j(body),
        credentials: "include",
    });
    if (!r.ok) throw new Error((await r.text().catch(() => "")) || "마이페이지 수정 실패");
    const data = await unwrapJson<any>(r);
    const user = toUserFromLoginPayload(data);
    storage.setUser(user);
    return user;
}

// 3) 상품 목록
export async function fetchProducts(): Promise<Product[]> {
    if (isDummy()) return [...DUMMY_PRODUCTS];
    const r = await fetch(join(API_BASE, PATHS.productsList), {cache: "no-store"});
    if (!r.ok) throw new Error("상품 조회 실패");
    return await unwrapJson<Product[]>(r);
}

// 4) 주문 생성
export async function createOrder(draft: OrderDraft): Promise<{ ok: boolean; id?: string }> {
    if (isDummy()) {
        const id = `dummy-${Date.now()}`;
        const itemsDetailed = draft.items.map(it => {
            const p = DUMMY_PRODUCTS.find(x => String(x.id) === String(it.productId));
            return {
                productId: String(it.productId),
                name: p?.name || String(it.productId),
                qty: it.qty,
                price: p?.price || 0
            };
        });
        const computedTotal = itemsDetailed.reduce((s, it) => s + it.qty * it.price, 0);
        DUMMY_ORDERS.unshift({
            id, email: draft.email, address: draft.address, postcode: draft.postcode,
            items: itemsDetailed, total: computedTotal,
            status: draft.shipCategory, shipCategory: draft.shipCategory,
            createdAt: new Date().toISOString(),
        } as unknown as Order);
        return {ok: true, id};
    }
    const body = {
        email: draft.email,
        address: draft.address,
        zipcode: draft.postcode,
        postalCode: draft.postcode,
        totalPrice: draft.total,
        items: draft.items.map(it => {
            const pid = (typeof it.productId === "string" && /^\d+$/.test(it.productId)) ? Number(it.productId) : it.productId;
            return {productId: pid, quantity: it.qty};
        }),
        shipCategory: draft.shipCategory,
        shippingStatus: draft.shipCategory,
    };
    const r = await fetch(join(API_BASE, PATHS.orderCreate), {
        method: "POST",
        headers: {"Content-Type": "application/json", ...authHeaders()},
        body: j(body),
        credentials: "include",
    });
    const raw = await r.text().catch(() => "");
    if (!r.ok) throw new Error(raw || "주문 실패");
    let parsed: any = {};
    try {
        parsed = raw ? JSON.parse(raw) : {};
    } catch {
    }
    const data = parsed && typeof parsed === "object" && "data" in parsed ? parsed.data : parsed;
    const id = data?.id ?? data?.orderId ?? data?.orderID ?? data?.result?.id;
    return {ok: true, id};
}

// 5) 주문 조회: 비회원(email) / 회원(세션) / 관리자(전체)
export async function fetchOrdersByEmail(email: string): Promise<Order[]> {
    if (!email) return [];
    if (isDummy()) return DUMMY_ORDERS.filter(o => o.email === email);
    const url = `${join(API_BASE, PATHS.orderGuestDetails)}?email=${encodeURIComponent(email)}`;
    const r = await fetch(url, {cache: "no-store", credentials: "include", headers: {...authHeaders()}});
    if (!r.ok) throw new Error("주문 조회 실패");
    return normalizeOrdersFrom(await unwrapJson<any>(r));
}

// 회원(세션 기반) 주문 조회
export async function fetchOrdersForMember(): Promise<Order[]> {
    if (isDummy()) {
        const u = storage.getUser();
        if (!u) return [];
        return DUMMY_ORDERS.filter(o => o.email === u.email);
    }
    const r = await fetch(join(API_BASE, PATHS.orderMemberDetails), {
        cache: "no-store",
        credentials: "include",
        headers: {...authHeaders()},
    });
    if (!r.ok) throw new Error("회원 주문 조회 실패");
    return normalizeOrdersFrom(await unwrapJson<any>(r));
}

// 관리자: 전체 주문
export async function adminFetchOrders(): Promise<Order[]> {
    if (isDummy()) return [...DUMMY_ORDERS];
    const r = await fetch(join(API_BASE, PATHS.orderAll), {
        cache: "no-store",
        credentials: "include",
        headers: {...authHeaders()},
    });
    if (!r.ok) throw new Error("관리자 주문 목록 조회 실패");
    return normalizeOrdersFrom(await unwrapJson<any>(r));
}

// (선택) 단건/상태변경 — 서버 구현시 맞춰 사용
export async function adminFetchOrder(id: string): Promise<Order> {
    const list = await adminFetchOrders();
    const found = list.find(o => String(o.id) === String(id) || String(o.createdAt) === String(id));
    if (!found) throw new Error("주문 없음");
    return found;
}

export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    // 실제 엔드포인트가 준비되면 여기서 호출하도록 변경
    console.warn("PUT /order/{id} 준비되면 이 함수 연결하세요");
    return true;
}

// 6) 관리자: 상품 등록/수정/삭제
type AdminCreatePayload = {
    name: string;
    price: number;
    origin: string;
    stock: number;
    imageUrl: string;
    active?: boolean;
};

export async function adminFetchProducts(): Promise<Product[]> {
    if (isDummy()) return [...DUMMY_PRODUCTS];
    const r = await fetch(join(API_BASE, PATHS.productsList), {
        cache: "no-store",
        credentials: "include",
        headers: {...authHeaders()},
    });
    if (!r.ok) throw new Error("관리자 상품 조회 실패");
    return await unwrapJson<Product[]>(r);
}

export async function adminCreateProduct(payload: AdminCreatePayload): Promise<Product> {
    if (isDummy()) {
        const id = `p_${Date.now()}`;
        const np: Product = {
            id, name: payload.name, price: payload.price, origin: payload.origin,
            stock: payload.stock, imageUrl: payload.imageUrl, active: payload.active ?? true,
        };
        DUMMY_PRODUCTS.unshift(np);
        return np;
    }
    const r = await fetch(join(API_BASE, PATHS.adminProducts), {
        method: "POST",
        headers: {"Content-Type": "application/json", ...authHeaders()},
        body: j(payload),
        credentials: "include",
    });
    if (!r.ok) throw new Error((await r.text().catch(() => "")) || "상품 등록 실패");
    return await unwrapJson<Product>(r);
}

export async function adminUpdateProduct(p: Product): Promise<boolean> {
    if (isDummy()) {
        const i = DUMMY_PRODUCTS.findIndex(x => String(x.id) === String(p.id));
        if (i >= 0) DUMMY_PRODUCTS[i] = {...p};
        return true;
    }
    const r = await fetch(join(API_BASE, PATHS.adminProductOne(String(p.id))), {
        method: "PUT",
        headers: {"Content-Type": "application/json", ...authHeaders()},
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
        headers: {...authHeaders()},
        credentials: "include",
    });
    return r.ok;
}
