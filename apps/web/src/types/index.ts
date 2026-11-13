import type { LucideIcon } from "lucide-react";

export type Task = {
  id: number;
  title: string;
  due: string;
  priority?: "high";
  completed: boolean;
};

export type NavItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string;
};
