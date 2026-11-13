import { useState } from "react";
import { ListTodo } from "lucide-react";
import { teamActivityMetricsFixture } from "../../data/fixtures";

export function TeamActivity() {
  const [activityRange, setActivityRange] = useState(teamActivityMetricsFixture.defaultRange);

  return (
    <section className="panel activity-panel">
      <div className="section-header">
        <div className="section-title">
          <ListTodo size={17} />
          <h2>Hoạt động của nhóm</h2>
        </div>
        <select
          value={activityRange}
          onChange={(event) => setActivityRange(event.target.value)}
          aria-label="Khoảng thời gian"
        >
          <option>{teamActivityMetricsFixture.ranges[0]}</option>
          <option>{teamActivityMetricsFixture.ranges[1]}</option>
        </select>
      </div>
      <div className="metrics">
        <div>
          <strong>{teamActivityMetricsFixture.docsCreated}</strong>
          <span>Tài liệu được tạo</span>
          <small>{teamActivityMetricsFixture.docsCreatedGrowth}</small>
        </div>
        <div>
          <strong>{teamActivityMetricsFixture.editsCount}</strong>
          <span>Lượt chỉnh sửa</span>
          <small>{teamActivityMetricsFixture.editsGrowth}</small>
        </div>
        <div>
          <strong>{teamActivityMetricsFixture.sharesCount}</strong>
          <span>Lượt chia sẻ</span>
          <small>{teamActivityMetricsFixture.sharesGrowth}</small>
        </div>
      </div>
      <div className="chart" aria-label="Biểu đồ hoạt động nhóm">
        <div className="chart-lines">
          <i />
          <i />
          <i />
        </div>
        <svg viewBox="0 0 420 108" role="img">
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7766e9" stopOpacity=".22" />
              <stop offset="100%" stopColor="#7766e9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={teamActivityMetricsFixture.chartSvg.pathD} fill="url(#area)" />
          <polyline
            points={teamActivityMetricsFixture.chartSvg.polylinePoints}
            fill="none"
            stroke="#7766e9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {teamActivityMetricsFixture.chartSvg.circles.map(([cx, cy]) => (
            <circle key={cx} cx={cx} cy={cy} r="4" fill="#fff" stroke="#7766e9" strokeWidth="2" />
          ))}
        </svg>
        <div className="chart-labels">
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
          <span>CN</span>
        </div>
      </div>
    </section>
  );
}
