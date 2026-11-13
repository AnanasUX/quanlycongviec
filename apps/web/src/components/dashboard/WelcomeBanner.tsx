import { Check, FileText, Sparkles, Users } from "lucide-react";

export function WelcomeBanner() {
  return (
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
  );
}
