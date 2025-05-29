import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { User } from 'convex/model/user';
import { MoreVerticalIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { TaskLabel } from '~/components/ui/task-label';
import { cn } from '~/utils/cn';
import { getUserDisplayName } from '~/utils/user';

interface WorkspaceMembersManagerProps {
  workspaceId: Id<'workspaces'>;
  members: Array<{ user: User; role: 'owner' | 'member' }>;
}

export function WorkspaceMembersManager({
  workspaceId,
  members,
}: WorkspaceMembersManagerProps) {
  const [search, setSearch] = useState('');

  const { data: allUsers } = useQuery(convexQuery(api.users.getAllUsers, {}));

  const { mutate: inviteUser } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.inviteUserToWorkspace),
  });

  const { mutate: removeUser } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.removeUserFromWorkspace),
  });

  const nonMembers = allUsers?.filter(
    (user) => !members.find((m) => m.user._id === user._id),
  );

  const filteredNonMembers = search
    ? nonMembers?.filter((user) => {
        const name = getUserDisplayName(user.clerkUser)?.toLowerCase() ?? '';
        return name.includes(search.toLowerCase());
      })
    : nonMembers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Current Members</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2"
              />
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredNonMembers?.map((user) => (
                  <Button
                    key={user._id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      inviteUser({
                        workspaceId,
                        invitedUserId: user._id,
                        initialRole: 'member',
                      });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={user.clerkUser.image_url}
                          alt={getUserDisplayName(user.clerkUser) ?? ''}
                        />
                        <AvatarFallback>
                          {(getUserDisplayName(user.clerkUser) ?? '')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">
                        {getUserDisplayName(user.clerkUser)}
                      </span>
                    </div>
                  </Button>
                ))}
                {filteredNonMembers?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users found
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        {members.map(({ user, role }) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.clerkUser.image_url}
                  alt={getUserDisplayName(user.clerkUser) ?? ''}
                />
                <AvatarFallback>
                  {(getUserDisplayName(user.clerkUser) ?? '')[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {getUserDisplayName(user.clerkUser)}
                  </p>
                  <TaskLabel
                    className={cn(
                      'capitalize',
                      role === 'owner' ? 'bg-green-600' : 'bg-blue-600',
                    )}
                  >
                    {role}
                  </TaskLabel>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.clerkUser.email_addresses[0]?.email_address}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    removeUser({
                      workspaceId,
                      userId: user._id,
                    })
                  }
                  className="text-destructive cursor-pointer"
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Remove from workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
