import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from '~/components/ui/sidebar';
import { CreateWorkspacePopover } from '~/features/workspaces/create-workspace-popover';
import { AppSidebarWorkspaceGroup } from './sidebar-workspace-group';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: workspaces } = useQuery(
    convexQuery(api.workspaces.getUserWorkspaces, {}),
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader className="mb-6">
        <Link to="/" className="text-3xl p-2">
          Real Kanban
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="justify-between text-[22px] mb-3 pb-4 border-b rounded-none">
            <span>Workspaces</span>
            <CreateWorkspacePopover />
          </SidebarGroupLabel>

          <SidebarMenu>
            {workspaces?.map((wsModel) => (
              <AppSidebarWorkspaceGroup
                key={wsModel.workspace._id}
                {...wsModel}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
