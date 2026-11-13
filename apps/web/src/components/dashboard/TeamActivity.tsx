import { useState } from "react";
import { ListTodo } from "lucide-react";

export function TeamActivity() {
  const [activityRange, setActivityRange] = useState("7 ngày qua");

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
          <option>7 ngày qua</option>
          <option>30 ngày qua</option>
        </select>
      </div>
      <div className="metrics">
        <div>
          <strong>124</strong>
          <span>Tài liệu được tạo</span>
          <small>+8.5%</small>
        </div>
        <div>
          <strong>56</strong>
          <span>Lượt chỉnh sửa</span>
          <small>+12%</small>
        </div>
        <div>
          <strong>28</strong>
          <span>Lượt chia sẻ</span>
          <small>+3.2%</small>
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
          <path
            d="M10 84 L70 68 L130 73 L190 43 L250 34 L310 39 L370 65 L410 56 L410 100 L10 100 Z"
            fill="url(#area)"
          />
          <polyline
            points="10,84 70,68 130,73 190,43 250,34 310,39 370,65 410,56"
            fill="none"
            stroke="#7766e9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[
            ["10", "84"],
            ["70", "68"],
            ["130", "73"],
            ["190", "43"],
            ["250", "34"],
            ["310", "39"],
            ["370", "65"],
            ["410", "56"],
          ].map(([cx, cy]) => (
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
