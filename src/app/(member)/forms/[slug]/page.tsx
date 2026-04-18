import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFormDef } from "@/lib/form-defs";
import { FormRenderer } from "@/components/member/FormRenderer";

export default async function FormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { slug } = await params;
  const form = getFormDef(slug);
  if (!form) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/forms"
          className="inline-flex items-center gap-1 text-sm text-[#9a8070] hover:text-[#6B4F3A] transition-colors mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          わたしに戻る
        </Link>
        <h1 className="text-xl font-light text-[#6B4F3A]">{form.title}</h1>
        <p className="text-sm text-[#9a8070] mt-1 leading-relaxed">{form.description}</p>
      </div>

      <FormRenderer form={form} />
    </div>
  );
}
