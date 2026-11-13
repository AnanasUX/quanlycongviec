import { useMemo, useState, type FormEvent } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Cloud,
  FileClock,
  FileText,
  Folder,
  Grid2X2,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  due: string;
  priority?: "high";
  completed: boolean;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const mainNavigation: NavItem[] = [
  { label: "Tổng quan", icon: LayoutDashboard },
  { label: "Soạn thảo", icon: FileText },
  { label: "Đội ngũ", icon: Users },
  { label: "Trình chiếu", icon: Grid2X2 },
  { label: "Lịch làm việc", icon: CalendarDays },
  { label: "Tin nhắn", icon: MessageSquare, badge: "3" },
  { label: "Kho lưu trữ", icon: Cloud },
];

const workspaceNavigation: NavItem[] = [
  { label: "Công ty", icon: Folder },
  { label: "Dự án Sản phẩm", icon: Folder },
  { label: "Marketing", icon: Folder },
  { label: "Nhân sự", icon: Folder },
];

const quickActions = [
  { label: "Soạn thảo", helper: "Tạo tài liệu", icon: FileText, color: "blue" },
  { label: "Đội ngũ", helper: "Quản lý nhân sự", icon: Users, color: "green" },
  { label: "Trình chiếu", helper: "Tạo bài thuyết trình", icon: Grid2X2, color: "orange" },
  { label: "Lịch làm việc", helper: "Lên lịch & họp", icon: CalendarDays, color: "purple" },
  { label: "Tin nhắn", helper: "Trao đổi nhóm", icon: MessageSquare, color: "sky" },
  { label: "Kho lưu trữ", helper: "Lưu tài liệu", icon: Cloud, color: "cyan" },
];

const schedule = [
  { time: "09:00 - 10:00", title: "Họp triển khai Q1", meta: "Phòng họp A", color: "#6c5ce7" },
  {
    time: "11:00 - 11:30",
    title: "Trao đổi với nhóm Marketing",
    meta: "Trực tuyến",
    color: "#36b37e",
  },
  {
    time: "14:00 - 15:00",
    title: "Review tài liệu sản phẩm",
    meta: "Phòng họp B",
    color: "#f59e0b",
  },
];

const recentFiles = [
  {
    title: "Kế hoạch sản phẩm Q1 2025",
    meta: "Được sửa bởi Hải Nguyễn · 10 phút trước",
    color: "blue",
  },
  {
    title: "Báo cáo hiệu quả marketing",
    meta: "Được sửa bởi Minh Anh · 1 giờ trước",
    color: "green",
  },
  { title: "Slide họp chiến lược", meta: "Được sửa bởi Tuấn Anh · 3 giờ trước", color: "orange" },
  { title: "Quy trình vận hành nội bộ", meta: "Được sửa bởi Hà Linh · Hôm qua", color: "blue" },
];

const workspaces = [
  {
    name: "Dự án Sản phẩm",
    meta: "12 thành viên · 18 tài liệu",
    icon: Target,
    color: "purple",
    members: ["MA", "TN", "HL", "NH"],
  },
  {
    name: "Marketing",
    meta: "8 thành viên · 23 tài liệu",
    icon: Sparkles,
    color: "green",
    members: ["TA", "LN", "MA", "HN"],
  },
  {
    name: "Nhân sự",
    meta: "6 thành viên · 14 tài liệu",
    icon: Users,
    color: "cyan",
    members: ["HL", "NH", "AT", "MA"],
  },
];

const initialTasks: Task[] = [
  { id: 1, title: "Hoàn thiện báo cáo tháng", due: "Hôm nay", priority: "high", completed: false },
  { id: 2, title: "Cập nhật kế hoạch Q1", due: "Ngày mai", completed: false },
  { id: 3, title: "Chuẩn bị slide họp nhóm", due: "27 thg 1", completed: false },
];

const avatarColors = ["#7567e8", "#f7a65a", "#35b78c", "#4c9bea"];

function AvatarStack({ members }: { members: string[] }) {
  return (
    <div className="avatar-stack" aria-label={`${members.length} thành viên`}>
      {members.map((member, index) => (
        <span
          key={member + index}
          style={{ background: avatarColors[index % avatarColors.length] }}
        >
          {member}
        </span>
      ))}
      <b>+5</b>
    </div>
  );
}

function SectionHeader({
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

function App() {
  const [activeNav, setActiveNav] = useState("Tổng quan");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskFilter, setTaskFilter] = useState<"mine" | "assigned" | "completed">("mine");
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [toast, setToast] = useState("");
  const [activityRange, setActivityRange] = useState("7 ngày qua");

  const visibleTasks = useMemo(() => {
    if (taskFilter === "completed") return tasks.filter((task) => task.completed);
    return tasks.filter((task) => !task.completed);
  }, [tasks, taskFilter]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const source = [
      ...recentFiles.map((file) => ({ title: file.title, type: "Tài liệu" })),
      ...workspaces.map((workspace) => ({ title: workspace.name, type: "Không gian" })),
      ...tasks.map((task) => ({ title: task.title, type: "Công việc" })),
    ];
    return source
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, tasks]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const selectNavigation = (label: string) => {
    setActiveNav(label);
    setShowMobileNav(false);
    if (label !== "Tổng quan") notify(`Đã chuyển đến ${label}`);
  };

  const toggleTask = (id: number) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTasks((current) => [
      ...current,
      { id: Date.now(), title: newTask.trim(), due: "Hôm nay", completed: false },
    ]);
    setNewTask("");
    setShowTaskModal(false);
    notify("Đã thêm công việc mới");
  };

  const createWorkspace = (event: FormEvent) => {
    event.preventDefault();
    if (!workspaceName.trim()) return;
    setShowWorkspaceModal(false);
    notify(`Đã tạo không gian “${workspaceName.trim()}”`);
    setWorkspaceName("");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Grid2X2 size={17} />
          </span>
          <strong>Workspace</strong>
          <button
            className="mobile-close"
            onClick={() => setShowMobileNav(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="nav-list" aria-label="Điều hướng chính">
          {mainNavigation.map(({ label, icon: Icon, badge }) => (
            <button
              key={label}
              className={activeNav === label ? "nav-item active" : "nav-item"}
              onClick={() => selectNavigation(label)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {badge && <b className="nav-badge">{badge}</b>}
            </button>
          ))}
        </nav>

        <div className="nav-section-label">Không gian làm việc</div>
        <nav className="nav-list workspace-nav" aria-label="Không gian làm việc">
          {workspaceNavigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={activeNav === label ? "nav-item active" : "nav-item"}
              onClick={() => selectNavigation(label)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
          <button className="nav-item add-space" onClick={() => setShowWorkspaceModal(true)}>
            <Plus size={17} />
            <span>Tạo không gian mới</span>
          </button>
        </nav>

        <div className="storage-card">
          <div className="storage-row">
            <Cloud size={17} />
            <div>
              <span>Dữ liệu đang dùng</span>
              <strong>128.4 GB / 500 GB</strong>
            </div>
            <ChevronRight size={15} />
          </div>
          <div className="storage-track">
            <span />
          </div>
        </div>
      </aside>

      {showMobileNav && (
        <button
          className="nav-scrim"
          aria-label="Đóng menu"
          onClick={() => setShowMobileNav(false)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setShowMobileNav(true)}
            aria-label="Mở menu"
          >
            <Menu size={21} />
          </button>
          <div className="search-wrap">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm tài liệu, tệp, cuộc trò chuyện..."
              aria-label="Tìm kiếm"
            />
            <kbd>Ctrl K</kbd>
            {query && (
              <div className="search-results">
                <span className="popover-label">Kết quả tìm kiếm</span>
                {searchResults.length ? (
                  searchResults.map((item) => (
                    <button
                      key={`${item.type}-${item.title}`}
                      onClick={() => {
                        notify(`Đang mở ${item.title}`);
                        setQuery("");
                      }}
                    >
                      <Search size={15} />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.type}</small>
                      </span>
                    </button>
                  ))
                ) : (
                  <p>Không tìm thấy kết quả phù hợp.</p>
                )}
              </div>
            )}
          </div>
          <div className="top-actions">
            <div className="popover-anchor">
              <button
                className="icon-button notification-button"
                onClick={() => setShowNotifications((open) => !open)}
                aria-label="Thông báo"
              >
                <Bell size={19} />
                <span />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <div className="popover-heading">
                    <strong>Thông báo</strong>
                    <button onClick={() => setShowNotifications(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="notice">
                    <span className="notice-icon purple">
                      <CheckCircle2 size={16} />
                    </span>
                    <p>
                      <strong>Tuấn đã hoàn thành một công việc</strong>
                      <small>Hoàn thiện kế hoạch Q1 · 5 phút trước</small>
                    </p>
                  </div>
                  <div className="notice">
                    <span className="notice-icon blue">
                      <MessageSquare size={16} />
                    </span>
                    <p>
                      <strong>Bạn có 3 tin nhắn mới</strong>
                      <small>Trong nhóm Dự án Sản phẩm</small>
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              className="icon-button"
              aria-label="Trợ giúp"
              onClick={() => notify("Trung tâm trợ giúp")}
            >
              <CircleHelp size={19} />
            </button>
            <button className="profile-button" onClick={() => notify("Hồ sơ Minh Anh")}>
              <span>MA</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="content">
          <section className="welcome-card">
            <div className="welcome-copy">
              <div className="eyebrow">
                <Sparkles size={14} /> Tổng quan hôm nay
              </div>
              <h1>Chào buổi sáng, Minh Anh</h1>
              <p>Cùng làm việc, chia sẻ và hoàn thành mục tiêu với đội ngũ.</p>
            </div>
            <div className="hero-art" aria-hidden="true">
              <span className="art-orbit orbit-one" />
              <span className="art-orbit orbit-two" />
              <div className="art-card card-one">
                <FileText size={24} />
              </div>
              <div className="art-card card-two">
                <Users size={24} />
              </div>
              <div className="art-card card-three">
                <Check size={19} />
              </div>
            </div>
          </section>

          <section className="quick-actions" aria-label="Thao tác nhanh">
            {quickActions.map(({ label, helper, icon: Icon, color }) => (
              <button key={label} onClick={() => notify(`Đang mở ${label}`)}>
                <span className={`quick-icon ${color}`}>
                  <Icon size={20} />
                </span>
                <span>
                  <strong>{label}</strong>
                  <small>{helper}</small>
                </span>
              </button>
            ))}
            <button className="create-space-button" onClick={() => setShowWorkspaceModal(true)}>
              <Plus size={16} /> Tạo không gian mới
            </button>
          </section>

          <div className="dashboard-grid top-grid">
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

            <section className="panel tasks-panel">
              <SectionHeader icon={CheckCircle2} title="Công việc của tôi" />
              <div className="task-tabs">
                <button
                  className={taskFilter === "mine" ? "active" : ""}
                  onClick={() => setTaskFilter("mine")}
                >
                  Đang thực hiện
                </button>
                <button
                  className={taskFilter === "assigned" ? "active" : ""}
                  onClick={() => setTaskFilter("assigned")}
                >
                  Sắp tới (3)
                </button>
                <button
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
                        className={`task-check ${task.completed ? "checked" : ""}`}
                        onClick={() => toggleTask(task.id)}
                        aria-label={
                          task.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"
                        }
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
              <button className="panel-footer-button" onClick={() => setShowTaskModal(true)}>
                <Plus size={15} /> Thêm công việc
              </button>
            </section>

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
                    <circle
                      key={cx}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#fff"
                      stroke="#7766e9"
                      strokeWidth="2"
                    />
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
          </div>

          <div className="dashboard-grid bottom-grid">
            <section className="panel files-panel">
              <SectionHeader
                icon={FileClock}
                title="Tài liệu được chia sẻ gần đây"
                action="Xem tất cả"
                onAction={() => notify("Đang mở tất cả tài liệu")}
              />
              <div className="file-list">
                {recentFiles.map((file) => (
                  <button key={file.title} onClick={() => notify(`Đang mở ${file.title}`)}>
                    <span className={`file-icon ${file.color}`}>
                      <FileText size={17} />
                    </span>
                    <span>
                      <strong>{file.title}</strong>
                      <small>{file.meta}</small>
                    </span>
                    <MoreHorizontal size={16} />
                  </button>
                ))}
              </div>
            </section>

            <section className="panel workspaces-panel">
              <SectionHeader icon={Grid2X2} title="Không gian làm việc của bạn" />
              <div className="workspace-cards">
                {workspaces.map(({ name, meta, icon: Icon, color, members }) => (
                  <article key={name} className="workspace-card">
                    <div className="workspace-card-top">
                      <span className={`workspace-icon ${color}`}>
                        <Icon size={19} />
                      </span>
                      <button aria-label={`Tùy chọn ${name}`}>
                        <MoreHorizontal size={17} />
                      </button>
                    </div>
                    <h3>{name}</h3>
                    <p>{meta}</p>
                    <AvatarStack members={members} />
                  </article>
                ))}
                <button className="workspace-add-card" onClick={() => setShowWorkspaceModal(true)}>
                  <span>
                    <Plus size={18} />
                  </span>
                  <strong>Tạo không gian mới</strong>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showTaskModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setShowTaskModal(false)}
        >
          <form
            className="modal"
            onSubmit={addTask}
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
              <button className="primary-button">Thêm công việc</button>
            </div>
          </form>
        </div>
      )}

      {showWorkspaceModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setShowWorkspaceModal(false)}
        >
          <form
            className="modal"
            onSubmit={createWorkspace}
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
              <button className="primary-button">Tạo không gian</button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
