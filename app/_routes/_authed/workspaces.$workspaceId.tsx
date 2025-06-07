import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import {
  ArrowLeft,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
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
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Spinner } from '~/components/ui/spinner';
import { useWorkspacePermission } from '~/utils/auth';

export const Route = createFileRoute('/_authed/workspaces/$workspaceId')({
  beforeLoad: async ({ context, params: { workspaceId } }) => {
    const workspaces = await context.queryClient.ensureQueryData(
      convexQuery(api.workspaces.getUserWorkspaces, {}),
    );
    const currentWs = workspaces.filter(
      (ws) => ws.workspace._id === workspaceId,
    );
    if (!currentWs) return redirect({ to: '/' });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { workspaceId } = Route.useParams();

  const { mutate: createBoard } = useMutation({
    mutationFn: useConvexMutation(api.boards.createBoard),
  });

  const { data: workspaceModel, isPending } = useQuery({
    ...convexQuery(api.workspaces.getUserWorkspaces, {}),
    select: (workspaces) =>
      workspaces.find((ws) => ws.workspace?._id === workspaceId),
  });

  const { mutate: deleteBoard } = useMutation({
    mutationFn: useConvexMutation(api.boards.deleteBoard),
  });

  const goBack = () => navigate({ to: '/' });

  const isOwner = useWorkspacePermission(workspaceId, 'owner');
  const { workspace, boards } = workspaceModel || {};

  if (workspace) {
    return (
      <div className="space-y-6 py-8 px-4">
        <div className="flex items-center gap-4 lg:pr-8">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-normal">
              {workspace.name}
            </h1>
            <p className="text-muted-foreground">{workspace.description}</p>
          </div>

          {isOwner && (
            <Popover>
              <PopoverTrigger asChild>
                <Button className="ml-auto" variant="accent">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Board
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="ml-5 space-y-4"
                align="start"
                side="left"
              >
                <h2 className="text-lg text-center">Add Workspace</h2>

                <BoardWorkspaceForm
                  onSubmit={(formData) =>
                    createBoard({ workspaceId: workspace._id, ...formData })
                  }
                >
                  <PopoverClose asChild>
                    <Button type="submit">Create</Button>
                  </PopoverClose>
                </BoardWorkspaceForm>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {boards?.map((board) => (
            <Link
              to="/boards/$boardId"
              params={{ boardId: board._id }}
              key={board._id}
            >
              <Card
                key={board._id}
                className="flex flex-col h-full cursor-pointer transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-12 h-1.5 rounded-full mb-2 ${board.color}`}
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6">
                          <MoreHorizontalIcon className="size-4" />
                          <span className="sr-only">Column actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmed = confirm(
                              'Are you sure you want to delete this board? This action will delete all items inside the board.',
                            );

                            if (!confirmed) return;
                            deleteBoard({ boardId: board._id });
                          }}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2Icon className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardTitle>{board.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground grow">
                  <CardDescription>{board.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-1/3">
        <Spinner className="size-10" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <p className="text-muted-foreground">Workspace not found</p>
      <Button variant="outline" onClick={goBack} className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
    </div>
  );
}
