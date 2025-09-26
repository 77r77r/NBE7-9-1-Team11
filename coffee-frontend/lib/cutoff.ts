// lib/cutoff.ts
export type ShippingStatus = "배송준비중" | "배송중" | "배송완료";

export function getInitialShippingStatus(): ShippingStatus {
  return "배송준비중"; // 새 주문 기본값
}

export function shippingStatusCopy(s: ShippingStatus) {
  switch (s) {
    case "배송준비중": return "주문이 접수되어 배송을 준비 중입니다.";
    case "배송중":   return "상품이 발송되어 배송 중입니다.";
    case "배송완료": return "상품 배송이 완료되었습니다.";
    default:         return "";
  }
}
