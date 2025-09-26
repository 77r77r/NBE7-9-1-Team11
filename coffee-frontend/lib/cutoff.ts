export function getShipCategoryKST(now = new Date()): "TODAY" | "TOMORROW" {
    const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
    const kst = new Date(utc + 9 * 60 * 60 * 1000);
    const cutoff = new Date(kst);
    cutoff.setHours(14, 0, 0, 0);
    return kst.getTime() <= cutoff.getTime() ? "TODAY" : "TOMORROW";
  }
  
  export const shipCopy = (c: "TODAY" | "TOMORROW") =>
    c === "TODAY" ? "오후 2시 이전 결제 — 오늘 발송" : "오후 2시 이후 결제 — 내일 발송";
  