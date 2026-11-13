import { Grid2X2, MoreHorizontal, Plus } from "lucide-react";
import { workspaces } from "../../data/mock";
import { useUI } from "../../context/UIContext";
import { AvatarStack } from "../shared/AvatarStack";
import { SectionHeader } from "../shared/SectionHeader";

export function WorkspaceCards() {
  const { setShowWorkspaceModal } = useUI();

  return (
    <section className="panel workspaces-panel">
      <SectionHeader icon={Grid2X2} title="Không gian làm việc của bạn" />
      <div className="workspace-cards">
        {workspaces.map(({ name, meta, icon: Icon, color, members }) => (
          <article key={name} className="workspace-card">
            <div className="workspace-card-top">
              <span className={`workspace-icon ${color}`}>
                <Icon size={19} />
              </span>
              <button type="button" aria-label={`Tùy chọn ${name}`}>
                <MoreHorizontal size={17} />
              </button>
            </div>
            <h3>{name}</h3>
            <p>{meta}</p>
            <AvatarStack members={members} />
          </article>
        ))}
        <button
          type="button"
          className="workspace-add-card"
          onClick={() => setShowWorkspaceModal(true)}
        >
          <span>
            <Plus size={18} />
          </span>
          <strong>Tạo không gian mới</strong>
        </button>
      </div>
    </section>
  );
}
