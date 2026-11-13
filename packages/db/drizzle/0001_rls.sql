-- Bật Row Level Security (RLS) theo yêu cầu SPEC mục 7.1 và mục 10

ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;

-- Chính sách RLS cho workspace_members: Thành viên chỉ xem được danh sách của workspace mình thuộc về
CREATE POLICY "workspace_members_isolation_policy" ON "workspace_members"
  FOR ALL
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    OR workspace_id IN (
      SELECT wm.workspace_id FROM "workspace_members" wm
      WHERE wm.user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    )
  );

-- Chính sách RLS cho workspaces: Người dùng chỉ thấy workspace mình là thành viên hoặc workspace công khai trong tổ chức
CREATE POLICY "workspaces_isolation_policy" ON "workspaces"
  FOR ALL
  USING (
    created_by = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    OR id IN (
      SELECT wm.workspace_id FROM "workspace_members" wm
      WHERE wm.user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    )
    OR privacy_type = 'organization'
  );

-- Chính sách RLS cho invitations: Chỉ thành viên có quyền trong workspace mới thấy danh sách lời mời
CREATE POLICY "invitations_isolation_policy" ON "invitations"
  FOR ALL
  USING (
    workspace_id IN (
      SELECT wm.workspace_id FROM "workspace_members" wm
      WHERE wm.user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      AND wm.role IN ('owner', 'admin')
    )
  );
