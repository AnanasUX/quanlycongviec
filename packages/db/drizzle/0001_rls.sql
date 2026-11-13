-- Bật Row Level Security (RLS) theo yêu cầu SPEC mục 7.1 và mục 10

ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspaces" FORCE ROW LEVEL SECURITY;
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_members" FORCE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" FORCE ROW LEVEL SECURITY;

-- Hàm helper SECURITY DEFINER để lấy danh sách workspace của user hiện tại, tránh lỗi infinite recursion
CREATE OR REPLACE FUNCTION get_current_user_workspace_ids()
RETURNS TABLE (workspace_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT workspace_id FROM workspace_members
  WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;

-- Chính sách RLS cho workspace_members: Thành viên chỉ xem được danh sách của workspace mình thuộc về
CREATE POLICY "workspace_members_isolation_policy" ON "workspace_members"
  FOR ALL
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    OR workspace_id IN (SELECT get_current_user_workspace_ids())
  );

-- Chính sách RLS cho workspaces: Người dùng chỉ thấy workspace mình là thành viên hoặc workspace công khai trong tổ chức
CREATE POLICY "workspaces_isolation_policy" ON "workspaces"
  FOR ALL
  USING (
    created_by = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    OR id IN (SELECT get_current_user_workspace_ids())
    OR privacy_type = 'organization'
  );

-- Chính sách RLS cho invitations: Chỉ thành viên có quyền trong workspace mới thấy danh sách lời mời
CREATE POLICY "invitations_isolation_policy" ON "invitations"
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM get_current_user_workspace_ids()
    )
  );
