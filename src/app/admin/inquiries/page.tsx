import { getInquiries } from "@/server/actions/inquiries";
import { InquiryList } from "./InquiryList";
import { MessageSquare } from "lucide-react";

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  const openCount = inquiries.filter((i) => i.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">問い合わせ管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            全{inquiries.length}件
            {openCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                未対応 {openCount}件
              </span>
            )}
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">問い合わせはまだありません</p>
        </div>
      ) : (
        <InquiryList inquiries={inquiries} />
      )}
    </div>
  );
}
