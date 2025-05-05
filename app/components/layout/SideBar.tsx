import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { PlusIcon } from 'lucide-react';

export const SideBar = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.createWorkspace),
  });

  const { mutate: createBoard } = useMutation({
    mutationFn: useConvexMutation(api.board.createBoard),
  });
  return (
    <div className="w-60 bg-secondary border-r flex flex-col h-full">
      <p className="flex items-center text-3xl p-4 mb-4 border-b h-20">
        Real Kanban
      </p>

      <div className="flex flex-col gap-y-5 px-4">
        <h2 className="flex items-center justify-between text-2xl">
          Workspaces
          <span>
            <PlusIcon
              className={`size-4 cursor-pointer ${isPending && 'animate-spin [animation-duration:1.5s]'}`}
              onClick={() => mutate({ name: 'Development' })}
            />
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
