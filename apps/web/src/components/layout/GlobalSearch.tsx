import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { recentFiles, workspaces, initialTasks } from "../../data/mock";
import { useUI } from "../../context/UIContext";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const { notify } = useUI();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const source = [
      ...recentFiles.map((file) => ({ title: file.title, type: "Tài liệu" })),
      ...workspaces.map((workspace) => ({ title: workspace.name, type: "Không gian" })),
      ...initialTasks.map((task) => ({ title: task.title, type: "Công việc" })),
    ];
    return source
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query]);

  return (
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
                type="button"
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
  );
}
