import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-widest text-[#6B4F3A] mb-2">Living Me</h1>
          <p className="text-sm text-[#9a8070]">パスワードをお忘れの方</p>
        </div>
        <div className="bg-[#FEFCF8] border border-[#e8ddd5] rounded-xl shadow-sm p-6">
          <Suspense>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
