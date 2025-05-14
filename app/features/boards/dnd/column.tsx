import { useConvexMutation } from '@convex-dev/react-query';
import { CollisionPriority } from '@dnd-kit/abstract';
import { useSortable } from '@dnd-kit/react/sortable';
import { useMutation } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Doc } from 'convex/_generated/dataModel';
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
import { Task } from './task';
import { User } from 'convex/model/user';

export type TaskWithRelatedData = Omit<Doc<'tasks'>, 'assignedTo'> & {
  assignedTo: User | null;
  labels: Array<Doc<'labels'>>;
  checklistItems: Array<Doc<'checklistItems'>>;
};

type ColumnModel = Doc<'columns'> & {
  tasks: Array<TaskWithRelatedData>;
};

type DroppableProps = {
  column: ColumnModel;
};

export const Column = ({ column }: DroppableProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { mutate: createTask } = useMutation({
    mutationFn: useConvexMutation(api.tasks.createTask),
  });

  const addTask = () => {
    if (newTaskTitle.trim() === '') return;
    const lastColumnPosition = column.tasks.at(-1)?.position || 0;

    createTask({
      columnId: column._id,
      position: lastColumnPosition + 1,
      name: newTaskTitle,
    });
    setIsAddingTask(false);
  };

  const { ref } = useSortable({
    id: column._id,
    index: column.position,
    type: 'column',
    collisionPriority: CollisionPriority.Low,
    accept: ['item', 'column'],
  });

  return (
    <Card ref={ref} className="w-80 flex-shrink-0 bg-background">
      <CardHeader className="px-4 py-2 flex flex-row items-center justify-between space-y-0">
        {isEditingName ? (
          <div className="flex w-full space-x-2">
            <Input
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="h-8"
              onBlur={() => {
                //  handleTitleSave();
                setIsEditingName(false);
              }}
            />
          </div>
        ) : (
          <CardTitle className="text-md font-medium">{column.name}</CardTitle>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Column actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setIsEditingName(true)}
              className="cursor-pointer"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="cursor-pointer text-destructive"
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {column.tasks.map((task) => (
          <div
            key={task._id}
            /*             draggable
            onDragStart={(e) => onDragStart(e, task.id, column.id)} */
          >
            <Task task={task} columnId={column._id} />
          </div>
        ))}

        {isAddingTask ? (
          <div className="mt-2 space-y-2">
            <Input
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                // if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') {
                  setNewTaskTitle('');
                  setIsAddingTask(false);
                }
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
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
