import { CheckCircle2 } from "lucide-react";
import { useUI } from "../../context/UIContext";

export function Toast() {
  const { toast } = useUI();

  if (!toast) return null;

  return (
    <div className="toast">
      <CheckCircle2 size={17} />
      {toast}
    </div>
  );
}
