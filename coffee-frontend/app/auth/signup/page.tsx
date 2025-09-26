"use client";

import { useState } from "react";
import { signup } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    address: "",
    postal_code: "",
  });
  const [error, setError] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await signup(form);
      router.push("/"); // 가입 성공 후 메인
    } catch (err: any) {
      setError(err.message || "회원가입 실패");
    }
  }

  return (
    <main className="container p-4">
      <h2>회원가입</h2>
      <form onSubmit={submit} className="mt-3" style={{ maxWidth: 520 }}>
        <div className="mb-2">
          <label className="form-label">이메일</label>
          <input
            className="form-control"
            name="email"
            value={form.email}
            onChange={onChange}
          />
        </div>
        <div className="mb-2">
          <label className="form-label">비밀번호</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={onChange}
          />
        </div>
        <div className="mb-2">
          <label className="form-label">닉네임</label>
          <input
            className="form-control"
            name="nickname"
            value={form.nickname}
            onChange={onChange}
          />
        </div>
        <div className="mb-2">
          <label className="form-label">주소</label>
          <input
            className="form-control"
            name="address"
            value={form.address}
            onChange={onChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">우편번호</label>
          <input
            className="form-control"
            name="postal_code"
            value={form.postal_code}
            onChange={onChange}
          />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button className="btn btn-dark">가입하기</button>
      </form>

      <div className="mt-3 d-flex justify-content-end">
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
