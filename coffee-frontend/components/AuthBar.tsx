"use client";

import Link from "next/link";
import { storage } from "@/lib/storage";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import { logout } from "@/lib/api";

export default function AuthBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setUser(storage.getUser()); }, []);

  function handleLogout() {
    logout();
    setUser(null);
    // 비회원 주문 모드로 전환됨
  }

  return (
    <div className="d-flex gap-2 align-items-center">
      {!user ? (
        <>
          <span className="badge bg-secondary">비회원 주문</span>
          <Link className="btn btn-outline-dark btn-sm" href="/auth/login">로그인</Link>
          <Link className="btn btn-dark btn-sm" href="/auth/signup">회원가입</Link>
        </>
      ) : (
        <>
          {user.role === "admin" && (
            <Link className="btn btn-warning btn-sm me-2" href="/admin">관리자</Link> // ← 관리자만 보임
          )}
          <span className="badge bg-primary">{user.nickname}</span>
          <Link className="btn btn-outline-dark btn-sm" href="/mypage">마이페이지</Link>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>로그아웃</button>
        </>
      )}
    </div>
  );
}
