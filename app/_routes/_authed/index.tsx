import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { PlusIcon } from 'lucide-react';
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
import { WorkspaceMembersList } from '~/features/workspaces/workspace-members-list';

export const Route = createFileRoute('/_authed/')({
  component: Home,
});

function Home() {
  const { data: workspaces, error } = useQuery(
    convexQuery(api.workspaces.getUserWorkspaces, {}),
  );

  const { mutate: createWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.createWorkspace),
  });

  if (workspaces) {
    return (
      <div className="space-y-6 py-8 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Workspaces</h1>
            <p className="text-muted-foreground">
              Select a workspace to view its boards
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="accent">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Workspace
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="ml-5 space-y-4"
              align="start"
              side="left"
            >
              <h2 className="text-lg text-center">Add Workspace</h2>

              <BoardWorkspaceForm
                onSubmit={(formData) => createWorkspace(formData)}
              >
                <PopoverClose asChild>
                  <Button type="submit">Create</Button>
                </PopoverClose>
              </BoardWorkspaceForm>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {workspaces?.map(({ workspace, boards, members }) => (
            <Card
              className="flex flex-col h-full transition-all hover:shadow-md"
              key={workspace._id}
            >
              <Link
                to="/workspaces/$workspaceId"
                params={{ workspaceId: workspace._id }}
                className="h-full"
              >
                <CardHeader className="pb-2">
                  <div
                    className={`w-12 h-1.5 rounded-full mb-2 ${workspace.color}`}
                  />
                  <CardTitle>{workspace.name}</CardTitle>
                  <CardDescription>{workspace.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground grow">
                  <p>{boards.length} boards</p>
                </CardContent>
              </Link>

              <CardFooter className="border-t pt-4">
                <WorkspaceMembersList
                  workspaceId={workspace._id}
                  members={members}
                />
              </CardFooter>
            </Card>
          ))}

          <div className="hidden only:block">
            No workspaces found. Try creating one first.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error fetching workspaces</div>;
  }

  return (
    <div className="flex items-center justify-center h-1/3">
      <Spinner className="size-10" />
    </div>
  );
}
