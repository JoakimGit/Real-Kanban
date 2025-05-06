import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const SideBar = () => {
  const [workspaceName, setWorkspaceName] = useState('');
  const { mutate } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.createWorkspace),
  });

  const { mutate: createBoard } = useMutation({
    mutationFn: useConvexMutation(api.board.createBoard),
  });

  return (
    <div className="w-72 bg-white flex flex-col h-full rounded-tr-md rounded-br-md">
      <p className="flex items-center text-3xl p-4 mb-4 h-20">Real Kanban</p>

      <div className="flex flex-col gap-y-5 pl-4 pr-2">
        <h2 className="flex items-center justify-between text-2xl leading-none">
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

                <Button onClick={() => mutate({ name: workspaceName })}>
                  Create
                </Button>
              </PopoverContent>
            </Popover>
          </span>
        </h2>

        <div className="pt-2">
          <p className="text-lg">Development</p>
          <div className="pl-3 mb-2 space-y-1">
            <p>Project Alpha</p>
            <p>Bug Tracking</p>
          </div>
          <button
            className="pl-3 text-sm opacity-60"
            onClick={() =>
              createBoard({
                name: 'Website redesign',
                workspaceId:
                  'kh71vcd9c2dznkavacdgt28dn17fbyhq' as Id<'workspaces'>,
                color: 'Blue',
              })
            }
          >
            + Add board
          </button>
        </div>

        <div>
          <p className="text-lg">Marketing</p>
          <div className="pl-3 mb-2 space-y-1">
            <p>Google Ads</p>
          </div>
          <button className="pl-3 text-sm opacity-60">+ Add board</button>
        </div>

        <div>
          <p className="text-lg">Design</p>
          <div className="pl-3 mb-2 space-y-1">
            <p>Website redesign</p>
          </div>
          <button className="pl-3 text-sm opacity-60">+ Add board</button>
        </div>
      </div>
    </div>
  );
};
