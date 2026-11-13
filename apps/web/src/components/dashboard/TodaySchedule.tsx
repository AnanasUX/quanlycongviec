import { CalendarDays, MoreHorizontal } from "lucide-react";
import { schedule } from "../../data/mock";
import { useUI } from "../../context/UIContext";
import { SectionHeader } from "../shared/SectionHeader";

export function TodaySchedule() {
  const { notify } = useUI();

  return (
    <section className="panel schedule-panel">
      <SectionHeader
        icon={CalendarDays}
        title="Lịch làm việc hôm nay"
        action="Xem lịch"
        onAction={() => notify("Đang mở lịch làm việc")}
      />
      <div className="date-note">Thứ Hai, 20 tháng 1, 2025</div>
      <div className="schedule-list">
        {schedule.map((event) => (
          <button
            type="button"
            className="schedule-item"
            key={event.time}
            onClick={() => notify(event.title)}
          >
            <time>{event.time}</time>
            <span className="event-line" style={{ background: event.color }} />
            <span className="event-info">
              <strong>{event.title}</strong>
              <small>{event.meta}</small>
            </span>
            <MoreHorizontal size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}
