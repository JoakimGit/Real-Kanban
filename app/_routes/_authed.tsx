import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SignIn } from '@clerk/tanstack-react-start';
import { AppSidebar } from '~/components/layout/app-sidebar';
import { HeaderBar } from '~/components/layout/header-bar';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw new Error('Not authenticated');
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return (
        <div className="flex items-center justify-center p-12">
          <SignIn routing="hash" forceRedirectUrl={window.location.href} />
        </div>
      );
    }

    throw error;
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
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
