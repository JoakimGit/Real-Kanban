import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Doc, Id } from 'convex/_generated/dataModel';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  CheckSquareIcon,
  PencilIcon,
  PlusIcon,
  SquareIcon,
  Trash2Icon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { TaskLabel } from '~/components/ui/task-label';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/utils/cn';
import { formatDate } from '~/utils/date';
import { TaskWithRelatedData } from './column';
import { Calendar } from '~/components/ui/calendar';
import { CreateLabelForm } from '~/_routes/_authed/workspaces_.$workspaceId.settings';
import { colorSelections } from '~/utils/constants';
import { LabelInput } from '~/utils/validation';
import { getUserDisplayName } from '~/utils/user';
import { CommentsList } from './comments-list';

interface TaskDetailSidebarProps {
  task: TaskWithRelatedData;
  columns: Array<{ id: string; name: string }>;
}

export const BlurSubmitInput = <T extends string | number>({
  type = 'text',
  value,
  placeholder,
  onBlur,
  className,
  getDisplayText,
}: {
  type?: 'text' | 'block' | 'number';
  value: T | undefined;
  placeholder?: string;
  onBlur: (inputValue: T) => void;
  className?: string;
  getDisplayText?: (val: T | undefined) => React.ReactNode;
}) => {
  const [inputValue, setInputValue] = useState<T | undefined>(value);
  const [editMode, setEditMode] = useState(false);

  const handleBlur = async () => {
    setEditMode(false);
    if (inputValue == undefined) return;

    if (value !== inputValue) {
      onBlur(inputValue);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const val = e.target.value;
    setInputValue((type === 'number' ? Number(val) : val) as T);
  };

  const inputProps = {
    className,
    value: inputValue ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    autoFocus: true,
  };

  if (editMode) {
    const InputComponent = type === 'block' ? Textarea : Input;
    return (
      <InputComponent
        type={type === 'number' ? 'number' : 'text'}
        {...inputProps}
      />
    );
  }

  return (
    <p
      className={cn('cursor-pointer', className)}
      onClick={() => setEditMode(true)}
    >
      {(getDisplayText ? getDisplayText(inputValue) : inputValue) ??
        placeholder}
    </p>
  );
};

export default function TaskDetailSidebar({
  task,
  columns,
}: TaskDetailSidebarProps) {
  const [newSubtaskName, setNewSubtaskTitle] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { mutate: updateTask } = useMutation({
    mutationFn: useConvexMutation(api.tasks.updateTask),
  });

  const { mutate: createChecklistItem } = useMutation({
    mutationFn: useConvexMutation(api.tasks.createChecklistItem),
  });

  const { mutate: updateChecklistItem } = useMutation({
    mutationFn: useConvexMutation(api.tasks.updateChecklistItem),
  });

  const { mutate: deleteChecklistItem } = useMutation({
    mutationFn: useConvexMutation(api.tasks.deleteChecklistItem),
  });

  const { data: labels } = useQuery(
    convexQuery(api.labels.getLabelsByWorkspace, {
      workspaceId: task.workspaceId,
    }),
  );

  const { data: members } = useQuery(
    convexQuery(api.workspaces.getWorkspaceMembers, {
      workspaceId: task.workspaceId,
    }),
  );

  const handlePriorityChange = (priority: string) => {
    updateTask({
      taskId: task._id,
      priority: priority as Doc<'tasks'>['priority'],
    });
  };

  const addChecklistItem = () => {
    if (newSubtaskName.trim() === '') return;

    const lastChecklistItemPosition = task.checklistItems.at(-1)?.position || 0;
    createChecklistItem({
      taskId: task._id,
      workspaceId: task.workspaceId,
      name: newSubtaskName,
      position: lastChecklistItemPosition + 1,
    });
  };

  return (
    <div className="h-full w-full bg-background flex flex-col text-muted-foreground">
      <div className="p-6 text-foreground text-lg font-semibold border-b">
        <BlurSubmitInput
          type="block"
          className="min-h-14 text-lg mr-10"
          value={task.name}
          onBlur={(name) => updateTask({ taskId: task._id, name })}
        />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-6 space-y-6">
        {/* Labels */}
        <DetailGroup
          label={
            <span className="flex items-center gap-x-2">
              Labels
              <Popover>
                <PopoverTrigger asChild>
                  <PlusIcon className="size-5 cursor-pointer text-primary" />
                </PopoverTrigger>
                <PopoverContent
                  className="max-h-80 overflow-y-auto"
                  align="start"
                >
                  <LabelsList
                    labels={labels ?? []}
                    workspaceId={task.workspaceId}
                    taskId={task._id}
                    taskLabels={task.labels}
                  />
                </PopoverContent>
              </Popover>
            </span>
          }
        >
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <TaskLabel key={label._id} className={label.color}>
                {label.name}
              </TaskLabel>
            ))}
          </div>
        </DetailGroup>

        {/* Description */}
        <DetailGroup label="Description">
          <BlurSubmitInput
            className="text-sm"
            type="block"
            value={task.description}
            placeholder="Add description"
            onBlur={(description) =>
              updateTask({ taskId: task._id, description })
            }
          />
        </DetailGroup>

        {/* Estimate */}
        <DetailGroup label="Estimate">
          <BlurSubmitInput
            type="number"
            className="text-sm shadow-none"
            value={task.estimate}
            placeholder="Estimate in hours"
            onBlur={(estimate) => updateTask({ taskId: task._id, estimate })}
            getDisplayText={(val) => (val ? `${val}h` : null)}
          />
        </DetailGroup>

        {/* Assigned To */}
        <div className="grid grid-cols-2 items-center gap-x-6">
          <DetailGroup label="Assigned To">
            <Select
              value={task.assignedTo?._id}
              onValueChange={(val) => {
                console.log({ val });
                updateTask({
                  taskId: task._id,
                  assignedTo: val === 'UNASSIGN' ? null : (val as Id<'users'>),
                });
              }}
            >
              <SelectTrigger className="capitalize [&>span]:pr-1">
                <SelectValue placeholder="Assign user.." />
              </SelectTrigger>
              <SelectContent>
                {members ? (
                  <>
                    {task.assignedTo && (
                      <SelectItem
                        value="UNASSIGN"
                        className="capitalize cursor-pointer text-muted-foreground"
                      >
                        Unassign user
                      </SelectItem>
                    )}
                    {members.map((member) => (
                      <SelectItem
                        key={member._id}
                        value={member._id}
                        className="capitalize cursor-pointer"
                      >
                        {getUserDisplayName(member.clerkUser)}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <div className="text-sm">Loading..</div>
                )}
              </SelectContent>
            </Select>
          </DetailGroup>

          {/* Column */}
          <DetailGroup label="Column">
            <Select
              value={task.columnId}
              onValueChange={(val) =>
                updateTask({
                  taskId: task._id,
                  columnId: val as Id<'columns'>,
                })
              }
            >
              <SelectTrigger className="capitalize [&>span]:pr-1">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DetailGroup>
        </div>

        {/* Priority */}
        <div className="grid grid-cols-2 items-center gap-x-6">
          <DetailGroup label="Priority">
            <Select
              value={task.priority}
              onValueChange={(val) => handlePriorityChange(val)}
            >
              <SelectTrigger className="capitalize [&>span]:pr-1">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {['low', 'medium', 'high', 'critical'].map((prio) => (
                  <SelectItem key={prio} value={prio} className="capitalize">
                    {prio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DetailGroup>

          {/* Due Date */}
          <DetailGroup label="Due Date">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline-nohover"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {task.dueDate ? (
                    formatDate(task.dueDate)
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={task.dueDate ? new Date(task.dueDate) : undefined}
                  onSelect={(day) => {
                    updateTask({ taskId: task._id, dueDate: day?.getTime() });
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </DetailGroup>
        </div>

        <Separator className="dark:bg-gray-700" />

        {/* Subtasks */}
        <div>
          <h4 className="text-foreground font-semibold mb-2">Subtasks</h4>

          <div className="space-y-2">
            {task.checklistItems.length === 0 ? (
              <p className="text-sm ">No subtasks yet.</p>
            ) : (
              task.checklistItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-md"
                >
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mr-2"
                      onClick={() =>
                        updateChecklistItem({
                          checklistItemId: item._id,
                          isComplete: !item.isComplete,
                        })
                      }
                    >
                      {item.isComplete ? (
                        <CheckSquareIcon className="size-5 text-primary" />
                      ) : (
                        <SquareIcon className="size-5" />
                      )}
                    </Button>

                    <BlurSubmitInput
                      className={`h-auto text-sm ${item.isComplete ? 'line-through opacity-50' : ''}`}
                      value={item.name}
                      onBlur={(name) =>
                        updateChecklistItem({
                          checklistItemId: item._id,
                          name,
                        })
                      }
                    />
                  </div>
                  <Trash2Icon
                    className="size-5 text-destructive cursor-pointer"
                    onClick={() =>
                      deleteChecklistItem({
                        checklistItemId: item._id,
                      })
                    }
                  />
                </div>
              ))
            )}
          </div>

          <Input
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Add subtask.."
            className="mt-2"
            onBlur={() => addChecklistItem()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addChecklistItem();
            }}
          />
        </div>

        {/* Comments */}
        <Separator className="dark:bg-gray-700" />

        <div>
          <div className="flex items-center gap-x-2 mb-2">
            <h4 className="text-foreground font-semibold">Comments</h4>
          </div>
          <CommentsList taskId={task._id} workspaceId={task.workspaceId} />
        </div>

        {/* Attachments */}
        <Separator className="dark:bg-gray-700" />

        <div>
          <div className="flex items-center gap-x-2 mb-2">
            <h4 className="text-foreground font-semibold">
              Attachments (under construction)
            </h4>
          </div>
        </div>

        {/* Activity log */}
        <Separator className="dark:bg-gray-700" />

        <div>
          <div className="flex items-center gap-x-2 mb-2">
            <h4 className="text-foreground font-semibold">
              Activity log (under construction)
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LabelsListProps {
  labels: Array<Doc<'labels'>>;
  workspaceId: Id<'workspaces'>;
  taskId: Id<'tasks'>;
  taskLabels: Array<Doc<'labels'>>;
}
const LabelsList = ({
  labels,
  workspaceId,
  taskId,
  taskLabels,
}: LabelsListProps) => {
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedLabel, setSelectedLabel] = useState<Doc<'labels'> | null>(
    null,
  );

  const taskLabelIds = useMemo(
    () => new Set(taskLabels.map((l) => l._id)),
    [taskLabels],
  );

  const { mutate: createLabel } = useMutation({
    mutationFn: useConvexMutation(api.labels.createLabel),
  });

  const { mutate: updateLabel } = useMutation({
    mutationFn: useConvexMutation(api.labels.updateLabel),
  });

  const { mutate: setLabelToTask } = useMutation({
    mutationFn: useConvexMutation(api.labels.setLabelToTask),
  });

  const handleLabelSubmit = (label: LabelInput) => {
    if (mode === 'create') {
      createLabel({ workspaceId, ...label });
    } else if (mode === 'edit' && selectedLabel) {
      updateLabel({ labelId: selectedLabel?._id, ...label });
    }

    setMode('view');
  };

  const filteredLabels = useMemo(() => {
    return search === ''
      ? labels
      : labels.filter((label) => label.name.toLowerCase().includes(search));
  }, [search, labels]);

  if (mode !== 'view') {
    const labelColor = colorSelections.find(
      (color) => color.value === selectedLabel?.color,
    );
    return (
      <>
        <div className="absolute top-4 right-4">
          <Button variant="outline" size="icon" onClick={() => setMode('view')}>
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </div>
        <CreateLabelForm
          className="flex-col items-start m-auto pt-2"
          defaultColor={mode === 'edit' ? labelColor : undefined}
          defaultName={mode === 'edit' ? selectedLabel?.name : undefined}
          onAddLabel={handleLabelSubmit}
        />
      </>
    );
  }

  return (
    <>
      <label className="block text-sm mb-1">Filter or create labels</label>

      <div className="flex items-center gap-x-2">
        <Input
          className="mb-2 w-auto grow rounded-none shrink-0"
          placeholder="Search labels.."
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
        <button onClick={() => setMode('create')}>
          <PlusIcon className="size-5 -mr-1" />
        </button>
      </div>

      <div className="flex flex-col gap-y-2">
        {filteredLabels.map((label) => (
          <div key={label._id} className="flex items-center gap-x-2">
            <button
              className={cn(
                'flex items-center justify-between text-left grow py-2 px-3',
                label.color,
              )}
              onClick={() => setLabelToTask({ labelId: label._id, taskId })}
            >
              {label.name}
              {taskLabelIds.has(label._id) && <CheckIcon className="size-5" />}
            </button>

            <button
              onClick={() => {
                setMode('edit');
                setSelectedLabel(label);
              }}
            >
              <PencilIcon className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

const DetailGroup = ({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={className}>
      <label className="text-foreground font-semibold block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
};
