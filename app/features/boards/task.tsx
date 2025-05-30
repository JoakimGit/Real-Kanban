import { useConvexMutation } from '@convex-dev/react-query';
import { useSortable } from '@dnd-kit/react/sortable';
import { useMutation } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Doc } from 'convex/_generated/dataModel';
import {
  AlignLeftIcon,
  CalendarIcon,
  CheckSquareIcon,
  CopyIcon,
  LinkIcon,
  MoreHorizontalIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import { TaskLabel } from '~/components/ui/task-label';
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
import { cn } from '~/utils/cn';
import { formatDate } from '~/utils/date';
import { getUserDisplayName } from '~/utils/user';
import { TaskWithRelatedData } from './column';

type TaskProps = {
  columnId: string;
  task: TaskWithRelatedData;
  index: number;
};

const route = getRouteApi('/_authed/boards/$boardId');

export const Task = ({ columnId, task, index }: TaskProps) => {
  const navigate = route.useNavigate();
  const { taskId } = route.useSearch();

  const { ref, isDragging } = useSortable({
    id: task._id,
    index,
    type: 'task',
    accept: 'task',
    group: columnId,
    data: { columnId },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: useConvexMutation(api.tasks.deleteTask),
  });

  const { mutate: duplicateTask } = useMutation({
    mutationFn: useConvexMutation(api.tasks.duplicateTask),
  });

  const handleTaskSelect = () => {
    navigate({
      search: (prev) => ({ ...prev, taskId: task._id }),
    });
  };

  const copyTaskUrl = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('taskId', task._id);
    navigator.clipboard.writeText(url.toString());
  };

  const handleDeleteTask = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    deleteTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          if (taskId === task._id) {
            navigate({
              search: (prev) => ({ ...prev, taskId: undefined }),
            });
          }
        },
      },
    );
  };

  const shouldShowFooter =
    task.checklistItems.length !== 0 ||
    (task.description && task.description.length > 0);

  return (
    <Card
      ref={ref}
      data-dragging={isDragging}
      className="mb-3 hover:border-primary transition-colors overflow-hidden"
      onClick={handleTaskSelect}
    >
      <CardHeader className="p-3 pb-0 space-y-0 flex flex-row gap-x-2 justify-between">
        <h3 className="font-medium self-center text-sm line-clamp-2">
          {task.name}
        </h3>

        <div className="flex items-start gap-x-1 shrink-0">
          <TaskPriorityLabel level={task.priority} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-6">
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateTask({ taskId: task._id });
                }}
              >
                <CopyIcon className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyTaskUrl}>
                <LinkIcon className="mr-2 size-4" />
                Copy url
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteTask}
                className="text-destructive"
              >
                <Trash2Icon className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-3 py-3 space-y-3">
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <TaskLabel key={label._id} className={label.color}>
              {label.name}
            </TaskLabel>
          ))}
        </div>

        <div className="flex justify-between items-center text-xs ">
          <div className="flex items-center gap-x-2">
            {task.dueDate && (
              <div className="flex items-center bg-input p-1 rounded-md">
                <CalendarIcon className="size-4 mr-1" />
                {formatDate(task.dueDate)}
              </div>
            )}
            {task.estimate && (
              <div className="bg-input p-1 rounded-md">{task.estimate}h</div>
            )}
          </div>
          {task.assignedTo && (
            <div className="flex items-center text-muted-foreground">
              <UserIcon className="size-4 mr-1" />
              {getUserDisplayName(task.assignedTo?.clerkUser)}
            </div>
          )}
        </div>
      </CardContent>

      {shouldShowFooter && (
        <CardFooter className="relative gap-3 px-3 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center mb-0.5" title="Has description">
            <AlignLeftIcon className="size-4" />
          </div>

          {/* <div
            className="flex items-center mb-0.5"
            // title={`${task.comments} comment${task.comments !== 1 ? 's' : ''}`}
          >
            <MessageSquareIcon className="size-4 mr-1" />
            {2}
          </div> */}

          {/* <div
            className="flex items-center mb-0.5"
            // title={`${task.attachments} attachment${task.attachments !== 1 ? 's' : ''}`}
          >
            <PaperclipIcon className="size-4 mr-1" />
            {2}
          </div> */}

          <TaskFooterChecklist checklistItems={task.checklistItems} />
        </CardFooter>
      )}
    </Card>
  );
};

const TaskFooterChecklist = ({
  checklistItems,
}: {
  checklistItems: Array<Doc<'checklistItems'>>;
}) => {
  const completedItems = checklistItems.filter((item) => item.isComplete);

  return (
    <>
      <div
        className="flex items-center mb-0.5"
        // title={`${task.subtasks} subtask${task.subtasks !== 1 ? 's' : ''}`}
      >
        <CheckSquareIcon className="size-4 mr-1" />
        {completedItems.length}/{checklistItems.length}
      </div>
      <ChecklistItemProgressBar checklistItems={checklistItems} />
    </>
  );
};

type ProgressBarProps = { checklistItems: Array<Doc<'checklistItems'>> };

const ChecklistItemProgressBar = ({ checklistItems }: ProgressBarProps) => {
  const completionPercentage = Math.round(
    (checklistItems.filter((item) => item.isComplete).length /
      checklistItems.length) *
      100,
  );

  const determineColorClass = (percentage: number) => {
    switch (true) {
      case percentage <= 20:
        return 'bg-red-500';
      case percentage > 20 && percentage < 50:
        return 'bg-orange-500';
      case percentage >= 50 && percentage < 75:
        return 'bg-yellow-500';
      case percentage >= 75 && percentage < 100:
        return 'bg-lime-400';
      case percentage >= 75 && percentage < 100:
        return 'bg-green-500';
      case percentage === 100:
        return 'bg-green-500';
      default:
        return 'bg-transparent';
    }
  };
  return (
    <div className="absolute bottom-0 left-0 w-full h-1">
      <div
        className={`h-full ${determineColorClass(completionPercentage)}`}
        style={{ width: `${completionPercentage}%` }}
      ></div>
    </div>
  );
};

const TaskPriorityLabel = ({ level }: { level: Doc<'tasks'>['priority'] }) => {
  const priorityClasses = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    critical:
      'bg-neutral-300 text-neutral-800 dark:bg-black dark:text-neutral-400',
  } satisfies Record<Exclude<Doc<'tasks'>['priority'], undefined>, string>;

  return (
    <div
      className={cn(
        'inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium border-transparent rounded-md text-xs px-1.5 py-[1px] shrink-0',
        priorityClasses[level as keyof typeof priorityClasses],
      )}
    >
      <div className="flex items-center gap-1">
        <span className="capitalize">{level}</span>
      </div>
    </div>
  );
};
