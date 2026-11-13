import { avatarColors } from "../../data/mock";

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
      <b>+5</b>
    </div>
  );
}
