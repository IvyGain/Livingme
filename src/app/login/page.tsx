import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-[#9a8070]">読み込み中...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
