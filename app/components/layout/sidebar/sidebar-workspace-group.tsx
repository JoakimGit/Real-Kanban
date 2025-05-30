import { Link, useLocation } from '@tanstack/react-router';
import { Doc } from 'convex/_generated/dataModel';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar';
import { useWorkspacePermission } from '~/utils/auth';
import { cn } from '~/utils/cn';
import { AppSidebarBoardDropdown } from './sidebar-board-dropdown';
import { AppSidebarWorkspaceDropdown } from './sidebar-workspace-dropdown';

export const AppSidebarWorkspaceGroup = ({
  workspace,
  boards,
}: {
  workspace: Doc<'workspaces'>;
  boards: Array<Doc<'boards'>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  useEffect(() => {
    if (isOpen) return;

    const isWorkspacePath = pathname.includes(workspace._id);
    const isBoardPath = boards.some((board) => pathname.includes(board._id));

    if (isWorkspacePath || isBoardPath) {
      setIsOpen(true);
    }
  }, [pathname]);

  const isOwner = useWorkspacePermission(workspace._id, 'owner');
  return (
    <SidebarMenuItem>
      <div className="flex items-center group/ws">
        <SidebarMenuButton onClick={() => setIsOpen(!isOpen)}>
          <ChevronRight className={cn('size-5', isOpen && 'rotate-90')} />{' '}
          <span className="text-lg">{workspace.name}</span>
        </SidebarMenuButton>
        {isOwner && <AppSidebarWorkspaceDropdown workspace={workspace} />}
      </div>

      {isOpen && boards.length ? (
        <SidebarMenuSub>
          {boards.map((board) => (
            <SidebarMenuSubItem
              key={board._id}
              className="flex items-center justify-between group/subitem"
            >
              <SidebarMenuSubButton asChild>
                <Link
                  className="w-full opacity-80"
                  to="/boards/$boardId"
                  params={{ boardId: board._id }}
                >
                  {board.name}
                </Link>
              </SidebarMenuSubButton>

              {isOwner && <AppSidebarBoardDropdown board={board} />}
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
};
