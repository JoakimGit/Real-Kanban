import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { UniqueIdentifier } from '@dnd-kit/abstract';
import { move } from '@dnd-kit/helpers';
import { DragDropEvents, DragDropProvider } from '@dnd-kit/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { FunctionReturnType } from 'convex/server';
import {
  ArrowLeft,
  CheckIcon,
  PlusIcon,
  TagIcon,
  UsersRoundIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as v from 'valibot';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Dialog, DialogPortal } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { SheetCloseBtn, taskSidebarModalClasses } from '~/components/ui/sheet';
import {
  Column,
  SortableColumn,
  TaskWithRelatedDataAndId,
} from '~/features/boards/column';
import { Task } from '~/features/boards/task';
import TaskDetailSidebar from '~/features/boards/task-detail-modal';
import { cn } from '~/utils/cn';
import { getUserDisplayName } from '~/utils/user';

const taskSearchSchema = v.object({
  taskId: v.optional(v.pipe(v.string(), v.length(32))),
});
export type TaskSearch = v.InferInput<typeof taskSearchSchema>;

export const Route = createFileRoute('/_authed/boards/$boardId')({
  validateSearch: taskSearchSchema,
  component: RouteComponent,
  beforeLoad: async ({ context: { queryClient }, params: { boardId } }) => {
    const board = await queryClient.ensureQueryData(
      convexQuery(api.boards.getBoardWithColumnsAndTasks, {
        boardId: boardId as Id<'boards'>,
      }),
    );

    if (!board) return redirect({ to: '/' });
  },
});

type SortableItemWithPosition = { id: UniqueIdentifier; position: number };

type BoardQueryResult = NonNullable<
  FunctionReturnType<typeof api.boards.getBoardWithColumnsAndTasks>
>;

function RouteComponent() {
  const { taskId } = Route.useSearch();
  const boardId = Route.useParams().boardId as Id<'boards'>;
  const navigate = useNavigate({ from: Route.fullPath });

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<Id<'users'>>>(
    new Set(),
  );
  const [selectedLabels, setSelectedLabels] = useState<Set<Id<'labels'>>>(
    new Set(),
  );

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const [dndColumns, setColumnOrder] = useState<Array<SortableColumn>>([]);
  const [dndTasksMap, setDndItemsMap] = useState<
    Record<Id<'columns'>, Array<TaskWithRelatedDataAndId>>
  >({});
  const previousTasks = useRef(dndTasksMap);

  const { data, isPending } = useQuery(
    convexQuery(api.boards.getBoardWithColumnsAndTasks, {
      boardId,
    }),
  );

  useEffect(() => {
    if (data) {
      const newDndItems: Record<string, Array<TaskWithRelatedDataAndId>> = {};
      const newColumnOrder: Array<SortableColumn> = [];

      data.columns.forEach(({ tasks, ...column }) => {
        newDndItems[column._id] = tasks.map((task) => ({
          id: task._id,
          ...task,
        }));
        newColumnOrder.push({ id: column._id, ...column });
      });

      setDndItemsMap(newDndItems);
      setColumnOrder(newColumnOrder);
    }
  }, [data]);

  const filteredTasksMap = useMemo(() => {
    const filtered: Record<Id<'columns'>, Array<TaskWithRelatedDataAndId>> = {};

    for (const column of dndColumns) {
      let tasks = dndTasksMap[column._id] || [];
      tasks = filterBySearch(tasks, searchFilter);
      tasks = filterByMembers(tasks, selectedMembers);
      tasks = filterByLabels(tasks, selectedLabels);
      filtered[column._id] = tasks;
    }

    return filtered;
  }, [dndTasksMap, dndColumns, searchFilter, selectedMembers, selectedLabels]);

  const { mutate: updateColumn } = useMutation({
    mutationFn: useConvexMutation(api.columns.updateColumn),
  });

  const { mutate: updateTask } = useMutation({
    mutationFn: useConvexMutation(api.tasks.updateTask),
  });

  const { mutate: createColumn } = useMutation({
    mutationFn: useConvexMutation(api.columns.createColumn),
  });

  if (isPending) return <div>Loading...</div>;
  if (!data) return <div>Board not found</div>;

  const addColumn = () => {
    if (!newColumnTitle) return;
    const lastCol = dndColumns.at(-1);

    createColumn({
      boardId,
      workspaceId: data.workspaceId,
      position: lastCol ? lastCol.position + 1 : 0,
      name: newColumnTitle,
    });
    setIsAddingColumn(false);
    setNewColumnTitle('');
  };

  const goBack = () =>
    navigate({
      to: '/workspaces/$workspaceId',
      params: { workspaceId: data.workspaceId },
    });

  const calcNewPosition = (
    items: Array<SortableItemWithPosition>,
    targetIndex: number,
  ) => {
    if (!items || items.length === 0) {
      return 1; // Empty array, just default to 1
    }

    const beforeItem = items[targetIndex - 1];
    const afterItem = items[targetIndex + 1];

    if (!beforeItem) {
      return (afterItem?.position ?? 0) - 1; // Inserting at the beginning
    } else if (!afterItem) {
      return (beforeItem?.position ?? 0) + 1; // Inserting at the end
    } else {
      return ((beforeItem.position ?? 0) + (afterItem.position ?? 0)) / 2; // Inserting between two items
    }
  };

  const handleDragEnd: DragDropEvents['dragend'] = async (event) => {
    const { source, target } = event.operation;
    if (!source || !target) return;

    if (event.canceled) {
      if (source.type === 'item') {
        setDndItemsMap(previousTasks.current);
      }
      return;
    }

    if (source.type === 'task') {
      const taskId = source.id as Id<'tasks'>;
      const taskIndex = 'index' in source ? (source.index as number) : null;
      const columnId = source.data.columnId as Id<'columns'>;

      const targetTasks = dndTasksMap[columnId];
      const targetIndex = targetTasks?.findIndex((item) => item.id === taskId);

      if (targetIndex !== taskIndex) {
        console.warn('Index mismatch:', { taskIndex, targetIndex, columnId });
      }

      if (!columnId) return;
      if (taskIndex === null) return;

      const position = calcNewPosition(targetTasks, taskIndex);
      updateTask({ taskId, columnId, position });
    } else if (source.type === 'column') {
      const columnId = source.id as Id<'columns'>;
      const columnIndex = 'index' in source ? (source.index as number) : null;

      if (columnIndex === null) return;

      const newColumnOrder = move(dndColumns, event);

      const position = calcNewPosition(newColumnOrder, columnIndex);

      setColumnOrder((columns) => move(columns, event));
      updateColumn({ columnId, position });
    }
  };

  const selectedTask = findTaskById(data.columns, taskId);
  return (
    <div className="">
      <header className="flex items-center gap-x-3 px-1 mb-4">
        <Button variant="outline" size="icon" onClick={goBack}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center gap-x-2">
          <h1 className="text-2xl font-bold tracking-normal">{data.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'- '} {data.description}
          </p>
        </div>
      </header>
      <div className="flex items-center mb-4 px-1">
        {/* Filter bar */}
        <SearchFilterInput
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
        <MemberFilterButton
          workspaceId={data.workspaceId}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
        />
        <LabelFilterButton
          workspaceId={data.workspaceId}
          selectedLabels={selectedLabels}
          setSelectedLabels={setSelectedLabels}
        />
      </div>

      <div className="flex gap-4 items-start">
        <DragDropProvider
          onDragStart={() => {
            previousTasks.current = dndTasksMap;
          }}
          onDragOver={(event) => {
            const { source } = event.operation;

            if (source?.type === 'column') return;

            setDndItemsMap((items) => move(items, event));
          }}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 flex-wrap items-start">
            {dndColumns.map((column, colIndex) => {
              const filteredTasks = filteredTasksMap[column._id];

              return (
                <Column
                  key={column._id}
                  index={colIndex}
                  column={{ ...column }}
                  tasks={dndTasksMap[column._id] || []}
                >
                  {filteredTasks.map((task, index) => (
                    <Task
                      key={task._id}
                      task={task}
                      index={index}
                      columnId={column._id}
                    />
                  ))}
                </Column>
              );
            })}
          </div>
        </DragDropProvider>

        <div className="shrink-0 w-72">
          {isAddingColumn ? (
            <div className="bg-background p-3 rounded-md shadow-sm border">
              <label htmlFor="column-title" className="dark:text-gray-200">
                Column Title
              </label>
              <Input
                id="column-title"
                value={newColumnTitle}
                placeholder="Enter column title"
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addColumn}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="dark:border-gray-600 dark:text-gray-200"
                  onClick={() => setIsAddingColumn(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-dashed border-muted-foreground border-2 w-full h-12 mt-0.5"
              onClick={() => setIsAddingColumn(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Add Column
            </Button>
          )}
        </div>
      </div>
      <Dialog
        open={!!taskId}
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              search: (prev) => ({ ...prev, taskId: undefined }),
            });
          }
        }}
      >
        <DialogPortal>
          <div
            role="dialog"
            data-state={taskId ? 'open' : 'closed'}
            className={taskSidebarModalClasses('p-0 border-border sm:max-w-xl')}
          >
            <SheetCloseBtn className="size-6" />

            {selectedTask && (
              <TaskDetailSidebar
                key={taskId}
                task={selectedTask}
                columns={dndColumns.map((col) => ({
                  id: col._id,
                  name: col.name,
                }))}
              />
            )}
          </div>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

function findTaskById(
  columns: BoardQueryResult['columns'],
  taskId: string | undefined,
) {
  if (!taskId) return null;

  for (const column of columns) {
    const found = column.tasks.find((task) => task._id === taskId);
    if (found) return found;
  }

  return null;
}

const SearchFilterInput = ({
  searchFilter,
  setSearchFilter,
}: {
  searchFilter: string;
  setSearchFilter: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <Input
      className="w-48 rounded-none border-inherit"
      value={searchFilter}
      onChange={(e) => setSearchFilter(e.target.value)}
      placeholder="Filter tasks.."
    />
  );
};

const MemberFilterButton = ({
  workspaceId,
  selectedMembers,
  setSelectedMembers,
}: {
  workspaceId: Id<'workspaces'>;
  selectedMembers: Set<Id<'users'>>;
  setSelectedMembers: React.Dispatch<React.SetStateAction<Set<Id<'users'>>>>;
}) => {
  const [search, setSearch] = useState('');

  const { data: members } = useQuery(
    convexQuery(api.workspaces.getWorkspaceMembers, {
      workspaceId,
    }),
  );

  const toggleMember = (userId: Id<'users'>) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const filteredMembers = search
    ? members?.filter((user) => {
        const name = getUserDisplayName(user.clerkUser)?.toLowerCase() ?? '';
        return name.includes(search.toLowerCase());
      })
    : members;
  return (
    <Popover>
      <PopoverTrigger
        title="Filter by member"
        className="relative flex-center p-1 border border-x-0 w-8 h-9"
      >
        <UsersRoundIcon className="size-4" />
        {selectedMembers.size > 0 && (
          <span className="absolute top-1 right-0.5 size-2 bg-primary rounded-full" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredMembers?.map((user) => (
              <button
                key={user._id}
                className="w-full mb-1 text-sm"
                onClick={() => toggleMember(user._id)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage
                      src={user.clerkUser.image_url}
                      alt={getUserDisplayName(user.clerkUser) ?? ''}
                    />
                    <AvatarFallback>
                      {(getUserDisplayName(user.clerkUser) ?? '')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="capitalize truncate">
                    {getUserDisplayName(user.clerkUser)}
                  </span>
                  {selectedMembers.has(user._id) && (
                    <CheckIcon className="size-4 ml-auto" />
                  )}
                </div>
              </button>
            ))}
            {filteredMembers?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const LabelFilterButton = ({
  workspaceId,
  selectedLabels,
  setSelectedLabels,
}: {
  workspaceId: Id<'workspaces'>;
  selectedLabels: Set<Id<'labels'>>;
  setSelectedLabels: React.Dispatch<React.SetStateAction<Set<Id<'labels'>>>>;
}) => {
  const [search, setSearch] = useState('');

  const { data: labels } = useQuery(
    convexQuery(api.labels.getLabelsByWorkspace, {
      workspaceId,
    }),
  );

  const toggleLabel = (labelId: Id<'labels'>) => {
    setSelectedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(labelId)) {
        next.delete(labelId);
      } else {
        next.add(labelId);
      }
      return next;
    });
  };

  const filteredLabels = useMemo(() => {
    return search === ''
      ? labels
      : labels?.filter((label) => label.name.toLowerCase().includes(search));
  }, [search, labels]);

  return (
    <Popover>
      <PopoverTrigger
        className="relative flex-center p-1 border w-8 h-9"
        title="Filter by label"
      >
        <TagIcon className="size-4" />
        {selectedLabels.size > 0 && (
          <span className="absolute top-1 right-0.5 size-2 bg-primary rounded-full" />
        )}
      </PopoverTrigger>
      <PopoverContent className="max-h-80 overflow-y-auto" align="start">
        <div className="flex items-center gap-x-2">
          <Input
            className="mb-2 w-auto grow rounded-none shrink-0"
            placeholder="Search labels.."
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          {filteredLabels?.map((label) => (
            <div key={label._id} className="flex items-center gap-x-2">
              <button
                className={cn(
                  'flex items-center justify-between text-left grow py-2 px-3',
                  label.color,
                )}
                onClick={() => toggleLabel(label._id)}
              >
                {label.name}
                {selectedLabels.has(label._id) && (
                  <CheckIcon className="size-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

function filterBySearch(
  tasks: Array<TaskWithRelatedDataAndId>,
  searchTerm: string,
) {
  if (!searchTerm) return tasks;
  const loweredSearch = searchTerm.toLowerCase();
  return tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(loweredSearch) ||
      task.description?.toLowerCase().includes(loweredSearch),
  );
}

function filterByMembers(
  tasks: Array<TaskWithRelatedDataAndId>,
  selectedMembers: Set<Id<'users'>>,
) {
  if (selectedMembers.size === 0) return tasks;
  return tasks.filter(
    (task) => task.assignedTo && selectedMembers.has(task.assignedTo._id),
  );
}

function filterByLabels(
  tasks: Array<TaskWithRelatedDataAndId>,
  selectedLabels: Set<Id<'labels'>>,
) {
  if (selectedLabels.size === 0) return tasks;
  return tasks.filter((task) => {
    const taskLabelIds = new Set(task.labels.map((label) => label._id));
    return Array.from(selectedLabels).some((labelId) =>
      taskLabelIds.has(labelId),
    );
  });
}
