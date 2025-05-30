import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { WorkspaceRole } from 'convex/workspaces';

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 2,
  member: 1,
} as const;

export const useWorkspacePermission = (
  workspaceId: string,
  requiredRole: WorkspaceRole,
) => {
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.workspaces.getWorkspacesWithRole, {}),
  );

  const userRole = permissions[workspaceId];
  if (!userRole) return false;

  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
