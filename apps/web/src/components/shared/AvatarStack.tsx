import { avatarColors } from "../../data/mock";
import { avatarStackFixture } from "../../data/fixtures";

export function AvatarStack({ members }: { members: string[] }) {
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
      <b>{avatarStackFixture.overflowLabel}</b>
    </div>
  );
}
