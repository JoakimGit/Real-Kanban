import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/boards/$boardId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello from board</div>;
}
