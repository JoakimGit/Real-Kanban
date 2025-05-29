import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { User } from 'convex/model/user';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { getUserDisplayName } from '~/utils/user';

interface WorkspaceMembersProps {
  workspaceId: Id<'workspaces'>;
  members: Array<User>;
}

export function WorkspaceMembersList({
  workspaceId,
  members,
}: WorkspaceMembersProps) {
  const [search, setSearch] = useState('');

  const { data: allUsers } = useQuery(convexQuery(api.users.getAllUsers, {}));

  const { mutate: inviteUser } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.inviteUserToWorkspace),
  });

  const nonMembers = allUsers?.filter(
    (user) => !members.find((m) => m._id === user._id),
  );

  const filteredUsers =
    search !== ''
      ? nonMembers?.filter((user) => {
          const fullName = user.clerkUser.username?.toLowerCase() ?? '';
          const primaryEmail = user.clerkUser.primary_email_address_id;
          const emailAddress = primaryEmail
            ? user.clerkUser.email_addresses.find((e) => e.id === primaryEmail)
            : user.clerkUser.email_addresses[0];
          return (
            fullName.includes(search) ||
            (emailAddress ? emailAddress?.email_address : '').includes(search)
          );
        })
      : nonMembers;
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {members.map((member) => (
          <Avatar
            key={member._id}
            className="size-8 border-2 border-background"
          >
            <AvatarImage
              src={member.clerkUser.image_url}
              alt={getUserDisplayName(member.clerkUser) ?? ''}
            />
            <AvatarFallback>
              {(getUserDisplayName(member.clerkUser) ?? '')[0]}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full size-7 z-[1] -ml-2.5"
          >
            <PlusIcon className="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start" side="top">
          <div className="space-y-4">
            <h2 className="font-medium">Invite Member</h2>
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
              className="mb-2"
            />
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredUsers?.map((user) => (
                <Button
                  key={user._id}
                  variant="ghost"
                  className="w-full justify-start px-1"
                  onClick={() => {
                    inviteUser({
                      workspaceId,
                      invitedUserId: user._id,
                      initialRole: 'member',
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
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
              <p className="hidden only:block text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
