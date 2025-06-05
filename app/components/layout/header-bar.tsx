import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/tanstack-react-start';
import { SearchIcon, Settings, BellIcon } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { ThemeToggle } from '../ui/theme-toggle';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export const HeaderBar = () => {
  return (
    <header className="flex items-center justify-between px-6 py-5 h-20">
      <SidebarTrigger className="-ml-1" />
      <label className="relative flex items-center gap-x-2">
        <SearchIcon className="absolute left-2 size-5 " />
        {/* TODO - implement search functionality */}
        <Input
          className="pl-9 border rounded-xl"
          type="text"
          placeholder="I do nothing right now.."
        />
      </label>

      <div className="flex items-center gap-x-6">
        <ThemeToggle />

        <SignedIn>
          <NotImplementedPopover>
            <Settings className="size-6" />
          </NotImplementedPopover>
          <NotImplementedPopover>
            <BellIcon className="size-6" />
          </NotImplementedPopover>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
};

const NotImplementedPopover = ({ children }: { children: React.ReactNode }) => {
  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>{"I'm not yet implemented"}</PopoverContent>
    </Popover>
  );
};
