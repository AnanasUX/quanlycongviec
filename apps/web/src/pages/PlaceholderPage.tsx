import { useParams, useLocation } from "react-router-dom";

export function PlaceholderPage({ title }: { title?: string }) {
  const { pathname } = useLocation();
  const params = useParams();

  const displayTitle = title || params.slug || pathname.replace("/", "");

  return (
    <div className="content" style={{ padding: "40px" }}>
      <div className="panel" style={{ padding: "30px", textAlign: "center" }}>
        <h2>{displayTitle}</h2>
        <p style={{ color: "var(--muted)", marginTop: "10px" }}>
          Phân hệ đang được triển khai theo kế hoạch từng giai đoạn trong SPEC.md.
        </p>
      </div>
    </div>
  );
}
