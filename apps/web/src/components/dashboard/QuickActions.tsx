import { Plus } from "lucide-react";
import { quickActions } from "../../data/mock";
import { useUI } from "../../context/UIContext";

export function QuickActions() {
  const { notify, setShowWorkspaceModal } = useUI();

  return (
    <section className="quick-actions" aria-label="Thao tác nhanh">
      {quickActions.map(({ label, helper, icon: Icon, color }) => (
        <button type="button" key={label} onClick={() => notify(`Đang mở ${label}`)}>
          <span className={`quick-icon ${color}`}>
            <Icon size={20} />
          </span>
          <span>
            <strong>{label}</strong>
            <small>{helper}</small>
          </span>
        </button>
      ))}
      <button
        type="button"
        className="create-space-button"
        onClick={() => setShowWorkspaceModal(true)}
      >
        <Plus size={16} /> Tạo không gian mới
      </button>
    </section>
  );
}
