import { getArchiveForAdmin } from "@/server/actions/archives";
import { notFound } from "next/navigation";
import { ArchiveForm } from "../../ArchiveForm";

export default async function EditArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const archive = await getArchiveForAdmin(id);

  if (!archive) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">アーカイブを編集</h1>
        <p className="text-sm text-gray-500 mt-1">{archive.title}</p>
      </div>
      <ArchiveForm
        archiveId={archive.id}
        initialData={{
          title: archive.title,
          description: archive.description ?? "",
          date: archive.date.toISOString().split("T")[0],
          category: archive.category,
          videoUrl: archive.videoUrl ?? "",
          thumbnailUrl: archive.thumbnailUrl ?? "",
          minutes: archive.minutes ?? "",
          summary: archive.summary ?? "",
          energyShare: archive.energyShare ?? "",
          journalingTheme: archive.journalingTheme ?? "",
          isPublished: archive.isPublished,
          tags: archive.tags,
        }}
      />
    </div>
  );
}
