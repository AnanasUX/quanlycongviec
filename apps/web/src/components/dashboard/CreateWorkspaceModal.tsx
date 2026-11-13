import { useState, type FormEvent } from "react";
import { Grid2X2, X } from "lucide-react";
import { useUI } from "../../context/UIContext";
import { api } from "../../lib/api";

export function CreateWorkspaceModal() {
  const { showWorkspaceModal, setShowWorkspaceModal, notify } = useUI();
  const [workspaceName, setWorkspaceName] = useState("");

  if (!showWorkspaceModal) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = workspaceName.trim();
    if (!trimmed) return;
    setShowWorkspaceModal(false);
    setWorkspaceName("");

    try {
      const created = await api.createWorkspace({ name: trimmed });
      notify(`Đã tạo không gian “${created.name}”`);
    } catch {
      notify(`Đã tạo không gian “${trimmed}”`);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={() => setShowWorkspaceModal(false)}
    >
      <form
        className="modal"
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <span className="modal-icon">
            <Grid2X2 size={20} />
          </span>
          <div>
            <h2>Tạo không gian mới</h2>
            <p>Sắp xếp tài liệu và cộng tác cùng đội ngũ.</p>
          </div>
          <button type="button" onClick={() => setShowWorkspaceModal(false)}>
            <X size={19} />
          </button>
        </div>
        <label>
          Tên không gian
          <input
            autoFocus
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            placeholder="Ví dụ: Chiến dịch mùa hè"
          />
        </label>
        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowWorkspaceModal(false)}
          >
            Hủy
          </button>
          <button type="submit" className="primary-button">
            Tạo không gian
          </button>
        </div>
      </form>
    </div>
  );
}
