import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { ArrowLeft, PlusIcon } from 'lucide-react';
import { BoardWorkspaceForm } from '~/components/layout/sidebar/board-workspace-form';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Spinner } from '~/components/ui/spinner';

export const Route = createFileRoute('/_authed/workspaces/$workspaceId')({
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
      workspaces.find((ws) => ws.workspace._id === workspaceId),
  });

  const goBack = () => navigate({ to: '/' });

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
            <p className="text-muted-foreground">
              Select a board to view its tasks
            </p>
          </div>

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
                  <div
                    className={`w-12 h-1.5 rounded-full mb-2 ${board.color}`}
                  />
                  <CardTitle>{board.name}</CardTitle>
                  <CardDescription>{board.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground grow">
                  <p>23 cards</p> {/* TODO - get cards count */}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>12 members</span> {/* TODO - get actual members */}
                  </div>
                </CardFooter>
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
