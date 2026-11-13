import { ChevronRight, type LucideIcon } from "lucide-react";

export function SectionHeader({
  icon: Icon,
  title,
  action,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-header">
      <div className="section-title">
        <Icon size={17} />
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
