import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Doc, Id } from 'convex/_generated/dataModel';
import { Check, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import * as v from 'valibot';
import { BoardWorkspaceForm } from '~/components/layout/sidebar/board-workspace-form';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Spinner } from '~/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { WorkspaceMembersManager } from '~/features/workspaces/workspace-settings-members-manager';
import { cn } from '~/utils/cn';
import { Color, colorSelections } from '~/utils/constants';
import { FormInput, LabelSchema } from '~/utils/validation';

export const Route = createFileRoute(
  '/_authed/workspaces_/$workspaceId/settings',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const workspaceId = Route.useParams().workspaceId as Id<'workspaces'>;

  const { data: workspace, error } = useQuery(
    convexQuery(api.workspaces.getWorkspace, { workspaceId }),
  );

  const { data: labels } = useQuery(
    convexQuery(api.labels.getLabelsByWorkspace, { workspaceId }),
  );

  const { mutate: updateWorkspace, isPending } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.updateWorkspace),
  });

  const { mutate: createLabel } = useMutation({
    mutationFn: useConvexMutation(api.labels.createLabel),
  });

  const { mutate: deleteLabel } = useMutation({
    mutationFn: useConvexMutation(api.labels.deleteLabel),
  });

  const handleworkspaceUpdate = (formData: FormInput) => {
    if (!workspace) return;

    if (
      workspace.name === formData.name &&
      workspace.description === formData.description &&
      workspace.color === formData.color
    )
      return;

    updateWorkspace({ workspaceId: workspace?._id, ...formData });
  };

  const handleAddLabel = (newLabel: { name: string; color: string }) => {
    if (!workspace) return;
    createLabel({ workspaceId: workspace?._id, ...newLabel });
  };

  if (workspace) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold tracking-normal">
          Workspace Settings
        </h1>
        <p className="text-muted-foreground mb-6">Manage details and labels.</p>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Workspace Details</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="labels">Labels</TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="space-y-4 max-w-2xl mx-auto text-left"
          >
            <Card>
              <CardHeader>
                <CardTitle>{workspace.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <BoardWorkspaceForm
                  isPending={isPending}
                  className="[&_.color-class]:size-9"
                  initialName={workspace.name}
                  initialDescription={workspace.description}
                  initialColor={workspace.color}
                  onSubmit={(formData) => handleworkspaceUpdate(formData)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="members"
            className="space-y-4 max-w-2xl mx-auto text-left"
          >
            <Card>
              <CardHeader>
                <CardTitle>Workspace Members</CardTitle>
                <CardDescription>
                  Manage who has access to this workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkspaceMembersManager
                  workspaceId={workspaceId}
                  members={workspace.members}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="labels"
            className="space-y-4 max-w-4xl mx-auto text-left"
          >
            <Card>
              <CardHeader>
                <CardTitle>Labels</CardTitle>
                <CardDescription>
                  Create and manage labels for your tasks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Current Labels</h3>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
                    {labels?.map((label) => (
                      <LabelItem
                        key={label._id}
                        label={label}
                        onDelete={() =>
                          deleteLabel({ labelId: label._id as Id<'labels'> })
                        }
                      />
                    ))}

                    <p className="hidden only:block text-sm text-muted-foreground">
                      No labels created yet.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-2xl font-medium mb-4">Create new</h3>
                  <CreateLabelForm onAddLabel={handleAddLabel} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (error) {
    return <div>An error has occured: {error.message}</div>;
  }

  return (
    <div className="flex items-center justify-center h-1/3">
      <Spinner className="size-10" />
    </div>
  );
}

interface CreateLabelFormProps {
  onAddLabel: (label: { name: string; color: string }) => void;
  defaultColor?: Color;
  defaultName?: string;
  className?: string;
}

export function CreateLabelForm({
  onAddLabel,
  defaultColor,
  defaultName,
  className,
}: CreateLabelFormProps) {
  const [name, setName] = useState(defaultName ?? '');
  const [color, setColor] = useState(defaultColor ?? colorSelections[0]);
  const isEditMode = defaultColor && defaultName;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = v.safeParse(LabelSchema, { name, color: color.value });

    if (result.success) {
      onAddLabel(result.output);
      setName('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex items-end gap-4', className)}
    >
      <div className="space-y-1">
        <label htmlFor="label-name">Name</label>
        <Input
          id="label-name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="label-color">Color</label>
        <ColorPicker color={color} onChange={setColor} />
      </div>

      <Button type="submit">
        {isEditMode ? 'Update Label' : 'Create Label'}
      </Button>
    </form>
  );
}

interface ColorPickerProps {
  color: Color | undefined;
  onChange: (color: Color) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full justify-start"
        >
          <div className={cn('w-4 h-4 rounded-full', color?.value)} />
          <span className="capitalize">
            {colorSelections.find((c) => c.value === color?.value)?.name ||
              'Select color'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-5 gap-2">
          {colorSelections.map((colorOpt) => (
            <button
              key={colorOpt.value}
              className={cn(
                'size-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform',
                colorOpt.value,
              )}
              onClick={() => {
                onChange(colorOpt);
                setOpen(false);
              }}
              title={colorOpt.name}
            >
              {colorOpt.value === color?.value && (
                <Check className="size-4 text-white" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
interface LabelItemProps {
  label: Doc<'labels'>;
  onDelete: () => void;
}

export function LabelItem({ label, onDelete }: LabelItemProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const { mutate: updateLabel } = useMutation({
    mutationFn: useConvexMutation(api.labels.updateLabel),
  });

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md bg-card py-1.5 pl-3 pr-1 text-white dark:text-neutral-100',
        label.color,
      )}
    >
      {label.name}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVerticalIcon className="size-4" />
          <span className="sr-only">Column actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isEditMode ? (
            <div className="[&>*]:m-0 px-3 py-1">
              <CreateLabelForm
                defaultName={label.name}
                defaultColor={colorSelections.find(
                  (color) => color.value === label.color,
                )}
                onAddLabel={(data) => {
                  updateLabel({ labelId: label._id, ...data });
                  setIsEditMode(false);
                }}
              />
            </div>
          ) : (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsEditMode(true);
                }}
                className="cursor-pointer"
              >
                <PencilIcon className="mr-2 size-4" />
                <span className="sr-only">Edit label</span>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onDelete}
                className="cursor-pointer text-destructive"
              >
                <Trash2Icon className="mr-2 size-4" />
                <span className="sr-only">Delete label</span>
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
