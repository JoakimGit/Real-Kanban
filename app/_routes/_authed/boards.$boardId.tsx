import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { UniqueIdentifier } from '@dnd-kit/abstract';
import { move } from '@dnd-kit/helpers';
import { DragDropEvents, DragDropProvider } from '@dnd-kit/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { FunctionReturnType } from 'convex/server';
import { ArrowLeft, PlusIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogPortal } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { SheetCloseBtn, taskSidebarModalClasses } from '~/components/ui/sheet';
import {
  Column,
  SortableColumn,
  TaskWithRelatedDataAndId,
} from '~/features/boards/column';
import { Task } from '~/features/boards/task';
import TaskDetailSidebar from '~/features/boards/task-detail-modal';
import * as v from 'valibot';

const taskSearchSchema = v.object({
  taskId: v.optional(v.pipe(v.string(), v.length(32))),
});
export type TaskSearch = v.InferInput<typeof taskSearchSchema>;

export const Route = createFileRoute('/_authed/boards/$boardId')({
  validateSearch: taskSearchSchema,
  component: RouteComponent,
});

type SortableItemWithPosition = { id: UniqueIdentifier; position: number };

type BoardQueryResult = NonNullable<
  FunctionReturnType<typeof api.boards.getBoardWithColumnsAndTasks>
>;

function RouteComponent() {
  const { taskId } = Route.useSearch();
  const boardId = Route.useParams().boardId as Id<'boards'>;
  const navigate = useNavigate({ from: Route.fullPath });

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

      // Map Convex data to the dnd-kit format
      data.columns.forEach(({ tasks, ...column }) => {
        newDndItems[column._id] = tasks.map((task) => ({
          id: task._id, // Map _id to id
          ...task, // Include other task properties
        }));
        newColumnOrder.push({ id: column._id, ...column });
      });

      setDndItemsMap(newDndItems);
      setColumnOrder(newColumnOrder);
    }
  }, [data]);

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
      <header className="flex items-center gap-x-3 px-1 mb-2">
        <Button variant="outline" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center gap-x-2">
          <h1 className="text-2xl font-bold tracking-normal">{data.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'- '} {data.description}
          </p>
        </div>
      </header>
      <div className="px-1 mb-4">Here will be filter stuff</div>{' '}
      {/* TODO - implement filter bar */}
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
            {dndColumns.map((column, colIndex) => (
              <Column
                key={column._id}
                index={colIndex}
                column={{ ...column }}
                tasks={dndTasksMap[column._id] || []}
              >
                {dndTasksMap[column._id]?.map((task, index) => (
                  <Task
                    key={task._id}
                    task={task}
                    index={index}
                    columnId={column._id}
                  />
                ))}
              </Column>
            ))}
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
                workspaceId={data.workspaceId}
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
