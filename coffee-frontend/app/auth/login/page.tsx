"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("member1@example.com"); // 더미 프리필
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/"); // 로그인 성공 → 메인
    } catch (err: any) {
      setError(err.message || "로그인 실패");
    }
  }

  return (
    <main className="container p-4">
      <h2>로그인</h2>
      <form onSubmit={submit} className="mt-3" style={{ maxWidth: 420 }}>
        <div className="mb-2">
          <label className="form-label">이메일</label>
          <input
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">비밀번호</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button className="btn btn-dark">로그인</button>
      </form>

      <div className="mt-3 d-flex justify-content-between">
        <a href="/auth/signup">회원가입 하러가기</a>
        {/* 뒤로가기 버튼 */}
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => router.back()}
        >
          뒤로가기
        </button>
      </div>
    </main>
  );
}
