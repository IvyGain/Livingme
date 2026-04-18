import { Badge } from "@/components/ui/badge";

type UserRole = "ADMIN" | "MEMBER";

const MOCK_MEMBERS = [
  { id: "u1", name: "田中さくら",  email: "sakura@example.com", isActive: true,  role: "MEMBER" as UserRole, joinedAt: new Date("2026-02-15"), lastLoginAt: new Date("2026-03-20") },
  { id: "u2", name: "鈴木はな",    email: "hana@example.com",   isActive: true,  role: "MEMBER" as UserRole, joinedAt: new Date("2026-01-10"), lastLoginAt: new Date("2026-03-19") },
  { id: "u3", name: "山本ゆき",    email: "yuki@example.com",   isActive: true,  role: "MEMBER" as UserRole, joinedAt: new Date("2025-12-01"), lastLoginAt: new Date("2026-03-18") },
  { id: "u4", name: "佐藤あやか",  email: "ayaka@example.com",  isActive: true,  role: "ADMIN"  as UserRole, joinedAt: new Date("2025-10-01"), lastLoginAt: new Date("2026-03-20") },
  { id: "u5", name: "伊藤みずき",  email: "mizuki@example.com", isActive: true,  role: "MEMBER" as UserRole, joinedAt: new Date("2026-03-10"), lastLoginAt: new Date("2026-03-17") },
  { id: "u6", name: "高橋ことね",  email: "kotone@example.com", isActive: true,  role: "MEMBER" as UserRole, joinedAt: new Date("2026-03-15"), lastLoginAt: new Date("2026-03-15") },
  { id: "u7", name: "渡辺りか",    email: "rika@example.com",   isActive: false, role: "MEMBER" as UserRole, joinedAt: new Date("2025-09-20"), lastLoginAt: new Date("2026-01-05") },
  { id: "u8", name: "中村まい",    email: "mai@example.com",    isActive: true,  role: "MEMBER" as UserRole, joinedAt: new Date("2025-11-08"), lastLoginAt: new Date("2026-03-16") },
];

export default function DemoAdminMembersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">会員管理</h1>
        <p className="text-sm text-gray-500 mt-1">全{MOCK_MEMBERS.length}名</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">名前 / メール</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">ロール</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">参加日</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">最終ログイン</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MEMBERS.map((member, index) => (
                <tr
                  key={member.id}
                  className={`${index !== MOCK_MEMBERS.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {member.isActive ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge
                      variant={member.role === "ADMIN" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {member.role === "ADMIN" ? "管理者" : "会員"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                    {member.joinedAt.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                    {member.lastLoginAt.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white cursor-pointer"
                        defaultValue={member.isActive ? "active" : "inactive"}
                      >
                        <option value="active">有効</option>
                        <option value="inactive">無効</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
