import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { PlusIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '~/components/ui/card';

export const Route = createFileRoute('/_authed/')({
  component: Home,
});

function Home() {
  const { data: workspaces } = useQuery(
    convexQuery(api.workspaces.getUserWorkspaces, {}),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:pr-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">
            Select a workspace to view its boards
          </p>
        </div>
        <Button variant="accent">
          <PlusIcon className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {workspaces?.map(({ workspace, boards }) => (
          <Link
            to="/workspaces/$workspaceId"
            params={{ workspaceId: workspace._id }}
            key={workspace._id}
          >
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div
                  className={`w-12 h-1.5 rounded-full mb-2 ${workspace.color}`}
                />
                <CardTitle className="text-lg">{workspace.name}</CardTitle>
                <CardDescription>{workspace.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>{boards.length} boards</p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  {/*  <span>{workspace.members} members</span> */}
                  <span>7 members</span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
