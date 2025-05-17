import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/tanstack-react-start';
import { SearchIcon, Settings, BellIcon } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { ThemeToggle } from '../ui/theme-toggle';

export const HeaderBar = () => {
  return (
    <header className="flex items-center justify-between px-6 py-5 h-20">
      <SidebarTrigger className="-ml-1" />
      <label className="relative flex items-center gap-x-2">
        <SearchIcon className="absolute left-2 size-5 " />
        {/* TODO - implement search functionality */}
        <input
          className="pl-9 pr-3 py-1.5 bg-inherit border rounded-xl"
          type="text"
          placeholder="Search..."
        />
      </label>

      <div className="flex items-center gap-x-6">
        <ThemeToggle />

        <SignedIn>
          <Settings className="size-6 cursor-pointer" />
          <BellIcon className="size-6 cursor-pointer" />
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
};
