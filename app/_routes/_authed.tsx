import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SignIn, useAuth } from '@clerk/tanstack-react-start';
import { AppSidebar } from '~/components/layout/sidebar/app-sidebar';
import { HeaderBar } from '~/components/layout/header-bar';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';

export const Route = createFileRoute('/_authed')({
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return (
        <div className="flex items-center justify-center p-12">
          <SignIn routing="hash" />
        </div>
      );
    }

    throw error;
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center p-12">
        <SignIn routing="hash" />
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
