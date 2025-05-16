import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { Doc, Id } from 'convex/_generated/dataModel';
import { Spinner } from '~/components/ui/spinner';
import { useState } from 'react';
import { Input } from '~/components/ui/input';
import { TagIcon, Trash2Icon, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { availableColorClasses } from '~/utils/constants';
import { cn } from '~/utils/cn';

export const Route = createFileRoute(
  '/_authed/workspaces_/$workspaceId/settings',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const workspaceId = Route.useParams().workspaceId as Id<'workspaces'>;
  const [isEditing, setIsEditing] = useState(false);

  const { data: workspace, error } = useQuery(
    convexQuery(api.workspaces.getWorkspace, { workspaceId }),
  );

  const { data: labels } = useQuery(
    convexQuery(api.workspaces.getWorkspaceLabels, { workspaceId }),
  );

  const { mutate: updateWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.updateWorkspace),
  });

  const handleworkspaceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // In a real app, you would save to backend here
    console.log('workspace updated:', workspace);
  };

  const handleAddLabel = (newLabel: { title: string; color: string }) => {};

  const handleDeleteLabel = (id: string) => {};

  if (workspace) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Workspace Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your workspace details and labels.
              </p>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Workspace Details</TabsTrigger>
              <TabsTrigger value="labels">Labels</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Workspace Information</CardTitle>
                      <CardDescription>
                        Update your workspace details and preferences.
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleworkspaceUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name">Workspace Name</label>
                      <Input
                        id="name"
                        value={workspace.name}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description">Description</label>
                      <Textarea
                        id="description"
                        rows={4}
                        value={workspace.description}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Workspace Color</label>
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full border',
                            workspace.color,
                          )}
                        />
                        {isEditing && (
                          <ColorPicker
                            color={workspace.color}
                            onChange={(color) =>
                              console.log('Selected color:', color)
                            }
                          />
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <Button type="submit" className="mt-4">
                        Save Changes
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="labels" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Labels</CardTitle>
                  <CardDescription>
                    Create and manage labels for your tasks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Current Labels</h3>
                    {labels?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No labels created yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {labels?.map((label) => (
                          <LabelItem
                            key={label._id}
                            label={label}
                            onDelete={() => handleDeleteLabel(label._id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-4">
                      Create New Label
                    </h3>
                    <CreateLabelForm onAddLabel={handleAddLabel} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>An error has occured: {error.message}</div>;
  }

  return (
    <div>
      <Spinner className="size-10" />
    </div>
  );
}

interface CreateLabelFormProps {
  onAddLabel: (label: { title: string; color: string }) => void;
}

export function CreateLabelForm({ onAddLabel }: CreateLabelFormProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddLabel({ title, color });
      setTitle('');
      setColor('#3b82f6');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="label-title">Label Title</label>
        <Input
          id="label-title"
          placeholder="Enter label title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="label-color">Label Color</label>
        <ColorPicker color={color} onChange={setColor} />
      </div>

      <Button type="submit" disabled={!title.trim()} className="w-full">
        Create Label
      </Button>
    </form>
  );
}

interface ColorPickerProps {
  color: string | undefined;
  onChange: (color: string) => void;
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
          <div className={cn('w-4 h-4 rounded-full', color)} />
          <span className="capitalize">
            {availableColorClasses.find((c) => c === color) || 'Select color'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-5 gap-2">
          {availableColorClasses.map((option) => (
            <button
              key={option}
              className={cn(
                'w-8 h-8 rounded-full relative flex items-center justify-center hover:scale-110 transition-transform',
                option,
              )}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              title={option}
            >
              {option === color && (
                <Check className="h-4 w-4 text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
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
  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-card h-full">
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: label.color }}
        />
        <div className="flex items-center gap-2 overflow-hidden">
          {/* <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" /> */}
          <span className="font-medium truncate">{label.name}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
      >
        <Trash2Icon className="h-4 w-4" />
        <span className="sr-only">Delete label</span>
      </Button>
    </div>
  );
}
