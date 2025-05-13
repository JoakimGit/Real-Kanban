import { Doc } from 'convex/_generated/dataModel';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '~/components/ui/sidebar';
import { cn } from '~/utils/cn';
import { AppSidebarBoardDropdown } from './sidebar-board-dropdown';
import { AppSidebarWorkspaceDropdown } from './sidebar-workspace-dropdown';
import { Link } from '@tanstack/react-router';

export const AppSidebarWorkspaceGroup = ({
  workspace,
  boards,
}: {
  workspace: Doc<'workspaces'>;
  boards: Array<Doc<'boards'>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarMenuItem>
      <div className="flex items-center group/ws">
        <SidebarMenuButton onClick={() => setIsOpen(!isOpen)}>
          <ChevronRight className={cn('size-5', isOpen && 'rotate-90')} />{' '}
          <span className="text-lg">{workspace.name}</span>
        </SidebarMenuButton>
        <AppSidebarWorkspaceDropdown workspace={workspace} />
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
                  className="w-full text-foreground/70"
                  to="/boards/$boardId"
                  params={{ boardId: board._id }}
                >
                  {board.name}
                </Link>
              </SidebarMenuSubButton>

              <AppSidebarBoardDropdown board={board} />
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
};
