import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Doc } from 'convex/_generated/dataModel';
import {
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/utils/cn';
import { BoardWorkspaceForm, FormInput } from './board-workspace-form';

interface DropdownProps {
  workspace: Doc<'workspaces'>;
}
export const AppSidebarWorkspaceDropdown = ({ workspace }: DropdownProps) => {
  const [mode, setMode] = useState<'create' | 'edit' | undefined>(undefined);
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const { mutate: createBoard } = useMutation({
    mutationFn: useConvexMutation(api.boards.createBoard),
  });

  const { mutate: updateWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.updateWorkspace),
  });

  const handleSubmit = (formData: FormInput) => {
    if (!mode) return;
    const payload = { workspaceId: workspace._id, ...formData };

    if (mode === 'create') {
      createBoard(payload, { onSuccess: () => setMode(undefined) });
    } else {
      updateWorkspace(payload, { onSuccess: () => setMode(undefined) });
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && setMode(undefined)}>
      <DropdownMenuTrigger asChild>
        <MoreVerticalIcon className="ml-auto size-5 cursor-pointer opacity-0 group-hover/ws:opacity-100 data-[state='open']:opacity-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? 'bottom' : 'right'}
        align={isMobile ? 'end' : 'start'}
        className={cn('min-w-44 rounded-lg', mode && 'w-72')}
      >
        {mode ? (
          <div className="space-y-4 p-2">
            <h2 className="text-lg text-center">
              {mode === 'edit' ? 'Edit Workspace' : 'Add Board'}
            </h2>

            <BoardWorkspaceForm
              {...(mode === 'edit'
                ? {
                    initialName: workspace.name,
                    initialDescription: workspace.description,
                    initialColor: workspace.color,
                  }
                : {})}
              onSubmit={(formData) => handleSubmit(formData)}
            />
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
                Update workspace
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex-col items-start p-0 text-base">
              <button
                onClick={() =>
                  navigate({
                    to: '/workspaces/$workspaceId/settings',
                    params: { workspaceId: workspace._id },
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
