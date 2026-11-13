import { useState } from "react";
import type { Task } from "../types";
import { initialTasks } from "../data/mock";
import { WelcomeBanner } from "../components/dashboard/WelcomeBanner";
import { QuickActions } from "../components/dashboard/QuickActions";
import { TodaySchedule } from "../components/dashboard/TodaySchedule";
import { MyTasks } from "../components/dashboard/MyTasks";
import { TeamActivity } from "../components/dashboard/TeamActivity";
import { RecentShared } from "../components/dashboard/RecentShared";
import { WorkspaceCards } from "../components/dashboard/WorkspaceCards";
import { TaskModal } from "../components/dashboard/TaskModal";
import { CreateWorkspaceModal } from "../components/dashboard/CreateWorkspaceModal";

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const addTask = (title: string) => {
    setTasks((current) => [
      ...current,
      { id: Date.now(), title, due: "Hôm nay", completed: false },
    ]);
  };

  return (
    <>
      <div className="content">
        <WelcomeBanner />
        <QuickActions />

        <div className="dashboard-grid top-grid">
          <TodaySchedule />
          <MyTasks tasks={tasks} onToggleTask={toggleTask} />
          <TeamActivity />
        </div>

        <div className="dashboard-grid bottom-grid">
          <RecentShared />
          <WorkspaceCards />
        </div>
      </div>

      <TaskModal onAddTask={addTask} />
      <CreateWorkspaceModal />
    </>
  );
}
