"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMyPage, updateMyPage } from "@/lib/api";
import { storage } from "@/lib/storage";
import type { User } from "@/types";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(storage.getUser());
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchMyPage().then(setUser).catch(() => setUser(storage.getUser()));
  }, []);

  if (!user) {
    return (
      <main className="container p-4">
        <h2>마이페이지</h2>
        <div className="alert alert-warning mt-3">로그인 후 이용 가능합니다.</div>
      </main>
    );
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value } as User);
  }

  async function save() {
    if (!user) return;
    const saved = await updateMyPage({
      nickname: user.nickname,
      address: user.address,
      postal_code: user.postal_code,
    });
    setUser(saved);
    setMsg("저장되었습니다.");
    setTimeout(() => {
      setMsg("");
      router.push("/");                // ✅ 저장 성공 후 메인 전환
    }, 800);
  }

  return (
    <main className="container p-4" style={{maxWidth: 560}}>
      <h2>마이페이지</h2>
      <div className="mb-2">
        <label className="form-label">이메일</label>
        <input className="form-control" value={user.email} readOnly disabled />
      </div>
      <div className="mb-2">
        <label className="form-label">닉네임</label>
        <input className="form-control" name="nickname" value={user.nickname} onChange={onChange} />
      </div>
      <div className="mb-2">
        <label className="form-label">주소</label>
        <input className="form-control" name="address" value={user.address} onChange={onChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">우편번호</label>
        <input className="form-control" name="postal_code" value={user.postal_code} onChange={onChange} />
      </div>
      <button className="btn btn-dark" onClick={save}>저장</button>
      {msg && <div className="text-success mt-2">{msg}</div>}
    </main>
  );
}
