import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Doc } from 'convex/_generated/dataModel';
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/utils/cn';
import { BoardWorkspaceForm } from './board-workspace-form';
import { FormInput } from '~/utils/validation';

interface BoardDropdownProps {
  board: Doc<'boards'>;
}
export const AppSidebarBoardDropdown = ({ board }: BoardDropdownProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isMobile } = useSidebar();

  const { mutate: deleteBoard } = useMutation({
    mutationFn: useConvexMutation(api.boards.deleteBoard),
  });

  const { mutate: updateBoard } = useMutation({
    mutationFn: useConvexMutation(api.boards.updateBoard),
  });

  const handleUpdateBoard = (formData: FormInput) => {
    updateBoard(
      { boardId: board._id, ...formData },
      { onSuccess: () => setIsEditMode(false) },
    );
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && setIsEditMode(false)}>
      <DropdownMenuTrigger asChild>
        <MoreVerticalIcon className="size-5 cursor-pointer opacity-0 group-hover/subitem:opacity-100 data-[state='open']:opacity-100" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={isMobile ? 'bottom' : 'right'}
        align={isMobile ? 'end' : 'start'}
        className={cn('min-w-44 rounded-lg', isEditMode && 'w-72')}
      >
        {isEditMode ? (
          <div className="space-y-4 p-2">
            <h2 className="text-lg text-center">Edit board</h2>

            <BoardWorkspaceForm
              initialName={board.name}
              initialDescription={board.description}
              initialColor={board.color}
              onSubmit={(formData) => handleUpdateBoard(formData)}
            />
          </div>
        ) : (
          <>
            <DropdownMenuItem className="flex-col items-start p-0 text-base">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditMode(true);
                }}
                className="flex w-full items-center gap-x-2 hover:bg-accent py-2 px-3"
              >
                <PencilIcon className="size-4" />
                Update board
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex-col items-start p-0 text-base">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const confirmed = confirm(
                    'Are you sure you want to delete this board? This action will delete all items inside the board.',
                  );
                  if (confirmed) deleteBoard({ boardId: board._id });
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
