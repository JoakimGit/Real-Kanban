import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { PlusIcon } from 'lucide-react';
import { BoardWorkspaceForm } from '~/components/layout/sidebar/BoardWorkspaceForm';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

export const CreateWorkspacePopover = () => {
  const { mutate: createWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.createWorkspace),
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <PlusIcon className="size-4 cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="ml-5 space-y-4" align="start" side="right">
        <h2 className="text-lg text-center">Add Workspace</h2>

        <BoardWorkspaceForm onSubmit={(formData) => createWorkspace(formData)}>
          <PopoverClose asChild>
            <Button type="submit">Create</Button>
          </PopoverClose>
        </BoardWorkspaceForm>
      </PopoverContent>
    </Popover>
  );
};
