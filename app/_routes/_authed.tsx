import { useAuth } from '@clerk/tanstack-react-start';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { HeaderBar } from '~/components/layout/header-bar';
import { AppSidebar } from '~/components/layout/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';

export const Route = createFileRoute('/_authed')({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(
      convexQuery(api.workspaces.getWorkspacesWithRole, {}),
    );
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center p-12">
        <Navigate to="/login" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HeaderBar />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
