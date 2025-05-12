import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/workspaces/$workspaceId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /_authed/workspaces/$workspaceId!</div>;
}
