import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '~/components/ui/card';

export const Route = createFileRoute('/_authed/workspaces/$workspaceId')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { workspaceId } = Route.useParams();
  const { data: workspaceModel } = useQuery({
    ...convexQuery(api.workspaces.getUserWorkspaces, {}),
    select: (workspaces) =>
      workspaces.find((ws) => ws.workspace._id === workspaceId),
  });
  const { workspace, boards } = workspaceModel || {};

  const goBack = () => navigate({ to: '/' });
  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Workspace not found</p>
        <Button variant="outline" onClick={goBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workspaces
        </Button>
      </div>
    );
  }
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
        <Button className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Board
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {boards?.map((board) => (
          <Card
            key={board._id}
            className="cursor-pointer transition-all hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div
                className={`w-12 h-1.5 rounded-full mb-2 ${board.color ?? 'bg-green-400'}`}
              />
              <CardTitle>{board.name}</CardTitle>
              <CardDescription>{board.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>23 cards</p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                {/*  <span>{workspace.members} members</span> */}
                <span>12 members</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
