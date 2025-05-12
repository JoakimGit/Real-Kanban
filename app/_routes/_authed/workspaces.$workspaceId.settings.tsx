import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authed/workspaces/$workspaceId/settings',
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>Hello &quot;/_authed/workspaces/$workspaceId/settings&quot;!</div>
  );
}
