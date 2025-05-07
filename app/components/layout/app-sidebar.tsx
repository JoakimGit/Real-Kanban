import { useState } from 'react';
import { ChevronRight, PlusIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '~/components/ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useMutation, useQuery } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { Link } from '@tanstack/react-router';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [workspaceName, setWorkspaceName] = useState('');
  const [boardName, setBoardName] = useState('');

  const wsMutation = useConvexMutation(api.workspaces.createWorkspace);
  const { mutate: createWorkspace } = useMutation({ mutationFn: wsMutation });

  const boardMutation = useConvexMutation(api.board.createBoard);
  const { mutate: createBoard } = useMutation({ mutationFn: boardMutation });

  const convexQ = convexQuery(api.workspaces.getUserWorkspaces, {});
  const { data: workspaces } = useQuery(convexQ);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="mb-6">
        <p className="text-3xl p-2">Real Kanban</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="justify-between text-[22px] mb-3">
            Workspaces
            <span>
              <Popover>
                <PopoverTrigger asChild>
                  <PlusIcon className="size-4 cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent
                  className="ml-5 space-y-4"
                  align="start"
                  side="right"
                >
                  <h2 className="text-lg text-center">Add Workspace</h2>

                  <Input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    type="text"
                    placeholder="Workspace name"
                  />

                  <Button
                    onClick={() => createWorkspace({ name: workspaceName })}
                  >
                    Create
                  </Button>
                </PopoverContent>
              </Popover>
            </span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {workspaces?.map(({ workspace, boards }) => (
              <Collapsible key={workspace._id} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />{' '}
                      {workspace.name}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {boards.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {boards.map((board) => (
                          <SidebarMenuSubItem key={board._id}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                to="/boards/$boardId"
                                params={{ boardId: board._id }}
                              >
                                {board.name}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Popover>
                              <PopoverTrigger>+ Add board</PopoverTrigger>
                              <PopoverContent
                                className="ml-5 space-y-4"
                                align="start"
                                side="right"
                              >
                                <h2 className="text-lg text-center">
                                  Add Board
                                </h2>

                                <Input
                                  value={boardName}
                                  onChange={(e) => setBoardName(e.target.value)}
                                  type="text"
                                  placeholder="Board name"
                                />

                                <Button
                                  onClick={() =>
                                    createBoard({
                                      name: boardName,
                                      workspaceId: workspace._id,
                                    })
                                  }
                                >
                                  Create
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
