import { useState } from 'react';
import {
  ChevronRight,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
} from 'lucide-react';

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
  useSidebar,
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
import { Link, useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Doc, Id } from 'convex/_generated/dataModel';
import { cn } from '~/utils/cn';

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
          <AppSidebarWorkspaceLabel />

          <SidebarMenu>
            {workspaces?.map((wsModel) => (
              <AppSidebarGroup key={wsModel.workspace._id} {...wsModel} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const AppSidebarWorkspaceLabel = () => {
  const [workspaceName, setWorkspaceName] = useState('');

  const { mutate: createWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.createWorkspace),
  });

  return (
    <SidebarGroupLabel className="justify-between text-[22px] mb-3 pb-4 border-b rounded-none">
      Workspaces
      <span>
        <Popover>
          <PopoverTrigger asChild>
            <PlusIcon className="size-4 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="ml-5 space-y-4" align="start" side="right">
            <h2 className="text-lg text-center">Add Workspace</h2>

            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              type="text"
              placeholder="Workspace name"
            />

            <Button onClick={() => createWorkspace({ name: workspaceName })}>
              Create
            </Button>
          </PopoverContent>
        </Popover>
      </span>
    </SidebarGroupLabel>
  );
};

const AppSidebarGroup = ({
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
        <AppSidebarWorkspaceDropdown workspaceId={workspace._id} />
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
                  className="text-foreground/70"
                  to="/boards/$boardId"
                  params={{ boardId: board._id }}
                >
                  {board.name}
                </Link>
              </SidebarMenuSubButton>

              <AppSidebarBoardDropdown boardId={board._id} />
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
};

const AppSidebarWorkspaceDropdown = ({
  workspaceId,
}: {
  workspaceId: Id<'workspaces'>;
}) => {
  const [mode, setMode] = useState<'create' | 'edit' | undefined>(undefined);
  const [name, setName] = useState('');
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const { mutate: createBoard } = useMutation({
    mutationFn: useConvexMutation(api.boards.createBoard),
  });

  const { mutate: updateWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.updateWorkspace),
  });

  const handleSubmit = () => {
    if (!name || !mode) return;
    const payload = { name, workspaceId };

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    mode === 'create' ? createBoard(payload) : updateWorkspace(payload);
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && setMode(undefined)}>
      <DropdownMenuTrigger asChild>
        <MoreVerticalIcon className="ml-auto size-5 cursor-pointer opacity-0 group-hover/ws:opacity-100 data-[state='open']:opacity-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? 'bottom' : 'right'}
        align={isMobile ? 'end' : 'start'}
        className={cn('min-w-44 rounded-lg', mode && 'w-60')}
      >
        {mode ? (
          <div className="space-y-4 p-2">
            <h2 className="text-lg text-center">
              {mode === 'edit' ? 'Edit Workspace' : 'Add Board'}
            </h2>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder={mode === 'create' ? 'Board name' : 'Workspace name'}
            />

            <DropdownMenuItem asChild className="">
              <Button className="px-4" size="lg" onClick={handleSubmit}>
                Save
              </Button>
            </DropdownMenuItem>
          </div>
        ) : (
          <>
            <DropdownMenuItem className="flex-col items-start p-0 text-base">
              <button
                onClick={(e) => {
                  setMode('edit');
                  e.stopPropagation();
                }}
                className="flex w-full items-center gap-x-2 hover:bg-accent py-2 px-3"
              >
                <PencilIcon className="size-4" />
                Rename workspace
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex-col items-start p-0 text-base">
              <button
                onClick={() =>
                  navigate({
                    to: '/workspaces/$workspaceId/settings',
                    params: { workspaceId },
                  })
                }
                className="flex w-full items-center gap-x-2 hover:bg-accent py-2 px-3"
              >
                <SettingsIcon className="size-4" />
                Workspace settings
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex-col items-start p-0 text-base">
              <button
                onClick={(e) => {
                  setMode('create');
                  e.stopPropagation();
                }}
                className="flex w-full items-center gap-x-2 hover:bg-accent py-2 px-3"
              >
                <PlusIcon className="size-5 -mx-0.5" />
                Create board
              </button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AppSidebarBoardDropdown = ({ boardId }: { boardId: Id<'boards'> }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [boardName, setBoardName] = useState('');
  const { isMobile } = useSidebar();

  const { mutate: deleteBoard } = useMutation({
    mutationFn: useConvexMutation(api.boards.deleteBoard),
  });

  const { mutate: updateBoard } = useMutation({
    mutationFn: useConvexMutation(api.boards.updateBoard),
  });

  return (
    <DropdownMenu onOpenChange={(open) => open && setIsEditMode(false)}>
      <DropdownMenuTrigger asChild>
        <MoreVerticalIcon className="size-5 cursor-pointer opacity-0 group-hover/subitem:opacity-100 data-[state='open']:opacity-100" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={isMobile ? 'bottom' : 'right'}
        align={isMobile ? 'end' : 'start'}
        className={cn('min-w-44 rounded-lg', isEditMode && 'w-60')}
      >
        {isEditMode ? (
          <div className="space-y-4 p-2">
            <h2 className="text-lg text-center">Rename board</h2>

            <Input
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              type="text"
              placeholder="Board name"
            />

            <Button onClick={() => updateBoard({ name: boardName, boardId })}>
              Save
            </Button>
          </div>
        ) : (
          <>
            <DropdownMenuItem className="flex-col items-start p-0 text-base">
              <button
                onClick={(e) => {
                  setIsEditMode(true);
                  e.stopPropagation();
                }}
                className="flex w-full items-center gap-x-2 hover:bg-accent py-2 px-3"
              >
                <PencilIcon className="size-4" />
                Rename board
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex-col items-start p-0 text-base">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const confirmed = confirm(
                    'Are you sure you want to delete this board?',
                  );
                  if (confirmed) deleteBoard({ boardId });
                }}
                className="flex w-full items-center gap-x-2 hover:bg-accent py-2 px-3"
              >
                <Trash2Icon className="size-4" />
                Delete board
              </button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
