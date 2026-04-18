import { ArchiveForm } from "../ArchiveForm";

export default function NewArchivePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">アーカイブを作成</h1>
        <p className="text-sm text-gray-500 mt-1">新しいアーカイブを追加します</p>
      </div>
      <ArchiveForm />
    </div>
  );
}
