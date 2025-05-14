import { useSortable } from '@dnd-kit/react/sortable';
import {
  CalendarIcon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  Trash2,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import { format } from 'path';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { TaskWithRelatedData } from './column';
import { TaskLabel } from '~/components/ui/badge';
import { availableColorClasses } from '~/utils/constants';
import { Doc } from 'convex/_generated/dataModel';
import { cn } from '~/utils/cn';

type TaskProps = { columnId: string; task: TaskWithRelatedData };

// example task

const mocktask = {
  _id: 'task1',
  name: 'Implement CI/CD Pipeline',
  description:
    'Documentation for the CI/CD pipeline setup, as well as usage guidelines for the team and stakeholders.',
  estimatedTime: 2,
  priority: 'high',
  dueDate: '2023-10-01',
  assignedTo: { _id: 'user1', clerkUser: { username: 'John Doe' } },
  labels: [
    { _id: 'label1', name: 'Feature request', color: availableColorClasses[2] },
    { _id: 'label2', name: 'Bug', color: availableColorClasses[6] },
  ],
  position: 1,
};

export const Task = ({ columnId, task }: TaskProps) => {
  const { ref, isDragging } = useSortable({
    id: task._id,
    index: task.position,
    type: 'item',
    accept: 'item',
    group: columnId,
  });

  // task = mocktask;

  return (
    <Card ref={ref} className="mb-3 hover:border-primary transition-colors">
      <CardHeader className="p-3 pb-0 space-y-0 flex flex-row justify-between items-start">
        <h3 className="font-medium text-sm">{task.name}</h3>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="size-6">
              <MoreVerticalIcon className="size-4" />

              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              // onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2Icon className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-3 py-1">
        <div className="flex justify-between items-start">
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <TaskPriorityLabel level={task.priority} />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.map((label) => (
            <TaskLabel key={label._id} className={label.color}>
              {label.name}
            </TaskLabel>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        {task.assignedTo && (
          <div
            key={task.assignedTo._id}
            className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-1"
          >
            {task.assignedTo.clerkUser.username?.charAt(0)}
          </div>
        )}

        <div className={`text-xs flex items-center`}>
          {task.dueDate ? (
            <>
              <CalendarIcon className="mr-1 h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <button
      className="bg-white text-primary-foreground px-5 py-3 rounded cursor-grab data-[dragging='true']:scale-105"
      ref={ref}
      data-dragging={isDragging}
    ></button>
  );
};

const TaskPriorityLabel = ({ level }: { level: Doc<'tasks'>['priority'] }) => {
  const priorityClasses = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <div
      className={cn(
        'inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium border-transparent rounded-md text-xs px-1.5 py-0.5 shrink-0',
        priorityClasses[level as keyof typeof priorityClasses],
      )}
    >
      <div className="flex items-center gap-1">
        <span className="capitalize">{level}</span>
      </div>
    </div>
  );
};
