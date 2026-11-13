import { useState, type FormEvent } from "react";
import { ListTodo, X } from "lucide-react";
import { useUI } from "../../context/UIContext";

export function TaskModal({ onAddTask }: { onAddTask: (title: string) => void }) {
  const { showTaskModal, setShowTaskModal, notify } = useUI();
  const [newTask, setNewTask] = useState("");

  if (!showTaskModal) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!newTask.trim()) return;
    onAddTask(newTask.trim());
    setNewTask("");
    setShowTaskModal(false);
    notify("Đã thêm công việc mới");
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowTaskModal(false)}>
      <form
        className="modal"
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <span className="modal-icon">
            <ListTodo size={20} />
          </span>
          <div>
            <h2>Thêm công việc</h2>
            <p>Tạo một đầu việc mới cho hôm nay.</p>
          </div>
          <button type="button" onClick={() => setShowTaskModal(false)}>
            <X size={19} />
          </button>
        </div>
        <label>
          Tên công việc
          <input
            autoFocus
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="Ví dụ: Chuẩn bị nội dung cuộc họp"
          />
        </label>
        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowTaskModal(false)}
          >
            Hủy
          </button>
          <button type="submit" className="primary-button">
            Thêm công việc
          </button>
        </div>
      </form>
    </div>
  );
}
