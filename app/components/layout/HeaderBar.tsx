import {
  SignedIn,
  SignIn,
  SignInButton,
  UserButton,
} from '@clerk/tanstack-react-start';
import { Authenticated, Unauthenticated } from 'convex/react';
import { SearchIcon, Settings, BellIcon } from 'lucide-react';

export const HeaderBar = () => {
  return (
    <div className="flex items-center justify-between px-6 py-5 h-20 border-b">
      <label className="relative flex items-center gap-x-2">
        <SearchIcon className="absolute left-2 size-5" />
        <input
          className="pl-9 pr-3 py-1.5 bg-inherit border rounded-xl"
          type="text"
          placeholder="Search..."
        />
      </label>

      <div className="flex items-center gap-x-6">
        <Authenticated>
          <Settings className="size-6 cursor-pointer" />
          <BellIcon className="size-6 cursor-pointer" />
          <UserButton />
        </Authenticated>

        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
      </div>
    </div>
  );
};
