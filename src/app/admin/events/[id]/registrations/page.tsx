import { getEventForAdmin } from "@/server/actions/events";
import { getEventRegistrationsForAdmin } from "@/server/actions/registrations";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { RegistrationField } from "@/lib/content-types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventRegistrationsPage({ params }: Props) {
  const { id } = await params;
  const [event, registrations] = await Promise.all([
    getEventForAdmin(id),
    getEventRegistrationsForAdmin(id),
  ]);

  if (!event) notFound();

  const fields = (event.registrationFields ?? []) as RegistrationField[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/events"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← イベント管理
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {format(event.startsAt, "yyyy年M月d日(E) HH:mm", { locale: ja })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">申込総数</p>
          <p className="text-3xl font-bold text-[#C07052]">
            {registrations.length}
          </p>
          {event.maxAttendees && (
            <p className="text-xs text-gray-400 mt-1">
              定員 {event.maxAttendees}名
            </p>
          )}
        </div>
        {event.maxAttendees && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">残席</p>
            <p className="text-3xl font-bold text-[#7A9E7E]">
              {Math.max(0, event.maxAttendees - registrations.length)}
            </p>
          </div>
        )}
      </div>

      {/* Registrations table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">申込者一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">名前</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">メール</th>
                {fields.map((f) => (
                  <th key={f.id} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">申込日時</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={3 + fields.length}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    まだ申込はありません
                  </td>
                </tr>
              ) : (
                registrations.map((reg, index) => {
                  const answers = reg.answers as Record<string, string>;
                  return (
                    <tr
                      key={reg.id}
                      className={`${
                        index !== registrations.length - 1 ? "border-b border-gray-100" : ""
                      } hover:bg-gray-50`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {reg.user.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {reg.user.email}
                      </td>
                      {fields.map((f) => (
                        <td key={f.id} className="px-4 py-3 text-gray-600">
                          {answers[f.id] ?? "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {format(reg.createdAt, "M/d HH:mm", { locale: ja })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
