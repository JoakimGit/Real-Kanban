import { useConvexMutation } from '@convex-dev/react-query';
import { CollisionPriority } from '@dnd-kit/abstract';
import { useSortable } from '@dnd-kit/react/sortable';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Doc, Id } from 'convex/_generated/dataModel';
import { User } from 'convex/model/user';
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';

export type TaskWithRelatedData = Omit<Doc<'tasks'>, 'assignedTo'> & {
  assignedTo: User | null;
  labels: Array<Doc<'labels'>>;
  checklistItems: Array<Doc<'checklistItems'>>;
  hasComments: boolean;
};

export type SortableColumn = Doc<'columns'> & {
  id: Id<'columns'>;
};

export type TaskWithRelatedDataAndId = TaskWithRelatedData & {
  id: Id<'tasks'>;
};

type DroppableProps = {
  column: Doc<'columns'>;
  tasks: Array<TaskWithRelatedDataAndId>;
  index: number;
  children?: React.ReactNode;
};

export const Column = ({ column, tasks, index, children }: DroppableProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { ref } = useSortable({
    id: column._id,
    index,
    type: 'column',
    collisionPriority: CollisionPriority.Low,
    accept: ['task', 'column'],
  });

  const { mutate: deleteColumn } = useMutation({
    mutationFn: useConvexMutation(api.columns.deleteColumn),
  });
  const { mutate: createTask } = useMutation({
    mutationFn: useConvexMutation(api.tasks.createTask),
  });

  const { mutate: updateColumn } = useMutation({
    mutationFn: useConvexMutation(
      api.columns.updateColumn,
    ).withOptimisticUpdate((localStore, args) => {
      const { name } = args as { name: string };
      const currentValue = localStore.getQuery(
        api.boards.getBoardWithColumnsAndTasks,
        { boardId: column.boardId },
      );
      if (currentValue !== undefined && currentValue?.columns) {
        const updatedColumns = currentValue.columns.map((col) =>
          col._id === column._id ? { ...col, name } : col,
        );

        const updatedValue = {
          ...currentValue,
          columns: updatedColumns,
        };

        localStore.setQuery(
          api.boards.getBoardWithColumnsAndTasks,
          { boardId: column.boardId },
          updatedValue,
        );
      }
    }),
  });

  const addTask = () => {
    if (newTaskTitle.trim() === '') return;
    const lastTask = tasks.at(-1); // this line needs to get the last task in the column to calc the new position

    createTask({
      columnId: column._id,
      workspaceId: column.workspaceId,
      position: lastTask ? lastTask.position + 1 : 0,
      name: newTaskTitle,
    });
    setIsAddingTask(false);
    setNewTaskTitle('');
  };

  const handleUpdateColName = () => {
    setIsEditingName(false);
    updateColumn({ columnId: column._id, name: columnName });
  };

  return (
    <>
      <Card ref={ref} className="w-80 flex-shrink-0 bg-background">
        <CardHeader className="px-4 py-2 flex flex-row items-center justify-between space-y-0">
          {isEditingName ? (
            <div className="flex w-full space-x-2">
              <Input
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="h-8"
                onBlur={handleUpdateColName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateColName();
                }}
              />
            </div>
          ) : (
            <CardTitle className="text-lg">{column.name}</CardTitle>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">Column actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => setIsEditingName(true)}
                className="cursor-pointer"
              >
                <PencilIcon className="mr-2 size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer text-destructive"
              >
                <Trash2Icon className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="px-3 py-5">
          {children}

          {isAddingTask ? (
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Enter task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask();
                }}
                autoFocus
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={addTask}>
                  Add
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewTaskTitle('');
                    setIsAddingTask(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full mt-2 text-sm text-muted-foreground"
              size="sm"
              onClick={() => setIsAddingTask(true)}
            >
              <PlusIcon className="size-5" /> Add Task
            </Button>
          )}
        </CardContent>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Column</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the column &quot;{column.name}
              &quot;? This will also delete all tasks in this column.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteColumn({ columnId: column._id })}
                variant="destructive"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};
