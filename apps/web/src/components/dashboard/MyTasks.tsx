import { useMemo, useState } from "react";
import { Check, CheckCircle2, Plus } from "lucide-react";
import type { Task } from "../../types";
import { tasksTabsFixture } from "../../data/fixtures";
import { useUI } from "../../context/UIContext";
import { SectionHeader } from "../shared/SectionHeader";

export function MyTasks({
  tasks,
  onToggleTask,
}: {
  tasks: Task[];
  onToggleTask: (id: number) => void;
}) {
  const [taskFilter, setTaskFilter] = useState<"mine" | "assigned" | "completed">("mine");
  const { setShowTaskModal } = useUI();

  const visibleTasks = useMemo(() => {
    if (taskFilter === "completed") return tasks.filter((task) => task.completed);
    return tasks.filter((task) => !task.completed);
  }, [tasks, taskFilter]);

  return (
    <section className="panel tasks-panel">
      <SectionHeader icon={CheckCircle2} title="Công việc của tôi" />
      <div className="task-tabs">
        <button
          type="button"
          className={taskFilter === "mine" ? "active" : ""}
          onClick={() => setTaskFilter("mine")}
        >
          Đang thực hiện
        </button>
        <button
          type="button"
          className={taskFilter === "assigned" ? "active" : ""}
          onClick={() => setTaskFilter("assigned")}
        >
          {tasksTabsFixture.upcomingTabLabel}
        </button>
        <button
          type="button"
          className={taskFilter === "completed" ? "active" : ""}
          onClick={() => setTaskFilter("completed")}
        >
          Đã hoàn thành
        </button>
      </div>
      <div className="task-list">
        {visibleTasks.length ? (
          visibleTasks.map((task) => (
            <div className="task-row" key={task.id}>
              <button
                type="button"
                className={`task-check ${task.completed ? "checked" : ""}`}
                onClick={() => onToggleTask(task.id)}
                aria-label={task.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
              >
                {task.completed && <Check size={13} />}
              </button>
              <span className={task.completed ? "task-completed" : ""}>{task.title}</span>
              {task.priority && <em>Mức cao</em>}
              <time>{task.due}</time>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <CheckCircle2 size={26} />
            <span>Chưa có công việc trong mục này</span>
          </div>
        )}
      </div>
      <button type="button" className="panel-footer-button" onClick={() => setShowTaskModal(true)}>
        <Plus size={15} /> Thêm công việc
      </button>
    </section>
  );
}
