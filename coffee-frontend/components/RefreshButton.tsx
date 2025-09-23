"use client";
export default function RefreshButton({ onClick, label = "API 새로고침" }:{
  onClick: () => void; label?: string;
}) {
  return <button className="btn btn-outline-secondary btn-sm" onClick={onClick}>{label}</button>;
}
