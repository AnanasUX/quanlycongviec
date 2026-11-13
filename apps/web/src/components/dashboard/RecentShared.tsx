import { FileClock, FileText, MoreHorizontal } from "lucide-react";
import { recentFiles } from "../../data/mock";
import { useUI } from "../../context/UIContext";
import { SectionHeader } from "../shared/SectionHeader";

export function RecentShared() {
  const { notify } = useUI();

  return (
    <section className="panel files-panel">
      <SectionHeader
        icon={FileClock}
        title="Tài liệu được chia sẻ gần đây"
        action="Xem tất cả"
        onAction={() => notify("Đang mở tất cả tài liệu")}
      />
      <div className="file-list">
        {recentFiles.map((file) => (
          <button type="button" key={file.title} onClick={() => notify(`Đang mở ${file.title}`)}>
            <span className={`file-icon ${file.color}`}>
              <FileText size={17} />
            </span>
            <span>
              <strong>{file.title}</strong>
              <small>{file.meta}</small>
            </span>
            <MoreHorizontal size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}
