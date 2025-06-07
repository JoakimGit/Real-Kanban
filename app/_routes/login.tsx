import { SignedIn, SignedOut, SignInButton } from '@clerk/tanstack-react-start';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '~/components/ui/button';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <main className="text-center">
        <SignedOut>
          <h1 className="text-4xl mb-10">Welcome to Real Kanban demo app.</h1>
          <div className="mb-6 max-w-prose space-y-3">
            <p>
              Sign up easily by simply with email + password. Username optional.
            </p>
            <p>
              It doesn&apos;t have to be a real email, as no verification mail
              will be sent.
            </p>
            <p>
              Some initial sample data will be displayed after signup. Demo data
              resets every 2 weeks.
            </p>
          </div>

          <SignInButton forceRedirectUrl={'/'}>
            <Button
              size="lg"
              className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
            >
              Sign In/Up
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <p className="mb-2">You are already logged in.</p>
          <Button
            size="lg"
            asChild
            className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            <Link to="/">Go to Home</Link>
          </Button>
        </SignedIn>
      </main>
    </div>
  );
}
