# NBE7-9-1-Team11입니다


---

# Coffee Shop

커피 판매 홈페이지의 프론트엔드 코드베이스입니다.
**회원가입 없이 이메일로 사용자 구분**, **오후 2시(KST) 마감(당일/익일 발송)**, **더미 데이터 → API 폴백**, **새로고침 버튼으로 수동 갱신**을 지원합니다.

## Tech Stack

* **Next.js (App Router, TypeScript)**
* **Bootstrap 5** (CDN, 간단한 UI)
* 상태 저장: `localStorage` (장바구니, 이메일)
* 시간대 처리: 표준 JS로 KST(UTC+9) 변환

## 프로젝트 구조

```
project-root/
├─ app/
│  ├─ page.tsx                # 메인(상품 목록 + 장바구니 요약 + 새로고침)
│  ├─ order/
│  │  ├─ order/page.tsx       # 주문 생성(이메일/주소/상품)
│  │  └─ details/page.tsx     # 주문 내역 조회(이메일 기반)
│  └─ customer/page.tsx       # 고객/마이페이지 자리(백엔드 연결 예정)
│
├─ components/
│  ├─ ProductList.tsx         # 상품 리스트
│  ├─ CartSummary.tsx         # 장바구니 요약(14시 마감 안내 포함)
│  └─ RefreshButton.tsx       # API 수동 새로고침 버튼
│
├─ lib/
│  ├─ api.ts                  # API 호출 + 더미 폴백
│  ├─ cutoff.ts               # 14:00 KST 마감 로직
│  └─ storage.ts              # localStorage 유틸(장바구니/이메일)
│
└─ types/
   └─ index.ts                # Product, Order, OrderDraft 등 타입
```

## 실행 방법

### 1) 설치 & 개발 서버

```bash
npm i
npm run dev
# http://localhost:3000
```

### 2) 환경 변수

`.env.local`에 백엔드 API 베이스 URL을 설정합니다. (없으면 **더미 데이터로 동작**)

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

* 값이 **없음** → `lib/api.ts`가 **더미 데이터**를 사용
* 값이 **있음** → `/product/list`, `/order/order`, `/order/details` 등 **실제 API 호출**

## 라우트 소개

| Path             | 설명                       |
| ---------------- | ------------------------ |
| `/`              | 상품 목록 + 장바구니 요약 + 새로고침   |
| `/order/order`   | 주문 생성(이메일/주소/우편번호/상품/총액) |
| `/order/details` | 주문 내역 조회(이메일 입력→목록 표시)   |
| `/customer`      | 고객/마이페이지 자리(백엔드 연결 예정)   |

## 데이터 흐름

* **상품**: 최초 렌더 시 `fetchProducts()` 호출 →

  * `NEXT_PUBLIC_API_BASE`가 없거나 API 실패 시 **더미 데이터** 채운다.
  * 새로고침 버튼 클릭 시 다시 `fetchProducts()` 호출.
* **장바구니**: `localStorage`에 (`coffee.cart`) 저장/복원.
* **이메일**: `localStorage`에 (`coffee.email`) 저장/복원.
* **주문 생성**: `OrderDraft`를 `POST /order/order`로 전송(더미 모드에서는 성공 토스트/alert만).
* **주문 내역**: 이메일로 `GET /order/details?email=...` 호출(더미 모드에서는 mock 결과).

## API 사양(기대 계약; 백엔드 연동 용)

### 1) 상품 목록

* **GET** `${API_BASE}/product/list`
* **Response (200)**

```json
[
  { "id": "col-narino", "name": "Columbia Nariñó", "origin": "콜롬비아", "price": 5000, "imageUrl": "https://..." },
  { "id": "bra-serra", "name": "Brazil Serra Do Caparaó", "origin": "브라질", "price": 6000, "imageUrl": "https://..." }
]
```

### 2) 주문 생성

* **POST** `${API_BASE}/order/order`
* **Request (JSON)**

```json
{
  "email": "user@example.com",
  "address": "서울시 어딘가 1-2-3",
  "postcode": "01234",
  "items": [
    { "productId": "col-narino", "qty": 2 },
    { "productId": "eth-yirg", "qty": 1 }
  ],
  "total": 17000,
  "shipCategory": "TODAY"  // or "TOMORROW"
}
```

* **Response (200)**

```json
{ "ok": true, "id": "ord_20250923_0001" }
```

### 3) 주문 내역 조회

* **GET** `${API_BASE}/order/details?email={email}`
* **Response (200)**

```json
[
  {
    "id": "ord_20250923_0001",
    "email": "user@example.com",
    "address": "서울시 어딘가 1-2-3",
    "postcode": "01234",
    "items": [
      { "productId": "col-narino", "name": "Columbia Nariñó", "qty": 2, "price": 5000 },
      { "productId": "eth-yirg", "name": "Ethiopia Yirgacheffe", "qty": 1, "price": 7000 }
    ],
    "total": 17000,
    "shipCategory": "TODAY",
    "createdAt": "2025-09-23T05:00:00.000Z"
  }
]
```

## 14시(KST) 마감 로직

* `lib/cutoff.ts`에서 **현재 시간을 KST로 변환** 후, **14:00**과 비교해 `TODAY` / `TOMORROW` 결정
* 화면에는 “오후 2시 이전 결제 — 오늘 발송 / 오후 2시 이후 결제 — 내일 발송” 안내문을 보여줌
* 이 값은 주문 생성 시 `shipCategory`로 함께 전송

## 새로고침 버튼(수동 리페치)

* `components/RefreshButton.tsx` 제공
* 상품 목록 페이지(`/`)와 주문 생성 페이지(`/order/order`)에서 **상품 새로고침** 버튼으로 API 재호출
* 주문 내역 페이지(`/order/details`)에는 **조회 + 새로고침** 버튼 제공

## 더미 → API 폴백 전략

* `lib/api.ts`의 각 함수(`fetchProducts`, `createOrder`, `fetchOrdersByEmail`)는

  * `.env.local`에 `NEXT_PUBLIC_API_BASE`가 없거나 호출 에러 시 **더미 데이터**로 대체
  * 운영 전환 시 `.env.local`만 세팅하면 자동으로 **실 API** 사용

## 타입(요약)

* `Product`: `{ id, name, origin, price, imageUrl }`
* `CartItem`: `{ productId, qty }`
* `OrderDraft`: `{ email, address, postcode, items, total, shipCategory }`
* `Order`: `{ id, email, address, postcode, items[{productId,name,qty,price}], total, shipCategory, createdAt }`

## 스타일

* 간단히 **Bootstrap 5 CDN**을 `app/layout.tsx`의 `<head>`에 추가
* 필요 시 Tailwind로 전환 가능(별도 설치 필요)
