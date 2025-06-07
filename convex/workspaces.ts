import { getManyFrom } from 'convex-helpers/server/relationships';
import { ConvexError, v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { mustGetCurrentUser, User } from './model/user';
import {
  ensureIsWorkspaceMember,
  ensureIsWorkspaceOwner,
} from './model/workspace';
import * as Workspaces from './model/workspace';

type WorkspaceModel = {
  workspace: Doc<'workspaces'>;
  boards: Array<Doc<'boards'>>;
  members: Array<User>;
};

export type WorkspaceRole = Doc<'userWorkspaces'>['role'];

export const createWorkspace = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, workspace) => {
    const currentUser = await mustGetCurrentUser(ctx);

    const workspaceId = await ctx.db.insert('workspaces', workspace);

    await ctx.db.insert('userWorkspaces', {
      userId: currentUser._id,
      workspaceId,
      role: 'owner',
    });

    return workspaceId;
  },
});

export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, ...updatedWs }) => {
    await ensureIsWorkspaceOwner(ctx, workspaceId);
    await ctx.db.patch(workspaceId, updatedWs);
  },
});

export const deleteWorkspace = mutation({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId }) => {
    await Workspaces.deleteWorkspace(ctx, workspaceId);
  },
});

export const getUserWorkspaces = query({
  handler: async (ctx) => {
    const currentUser = await mustGetCurrentUser(ctx);

    const workspaceMemberships = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', currentUser._id),
      )
      .collect();

    const result = await Promise.all(
      workspaceMemberships.map(async (ws) => {
        const workspace = await ctx.db.get(ws.workspaceId);
        const boards = await getManyFrom(
          ctx.db,
          'boards',
          'by_workspaceId',
          ws.workspaceId,
        );
        const memberships = await ctx.db
          .query('userWorkspaces')
          .withIndex('by_workspaceId', (q) =>
            q.eq('workspaceId', ws.workspaceId),
          )
          .collect();

        const members = await Promise.all(
          memberships.map(async (m) => await ctx.db.get(m.userId)),
        );

        return { workspace, boards, members: members.filter(Boolean) };
      }),
    );

    const filteredResult = result
      .filter((wsModel) => !!wsModel.workspace)
      .sort((a, b) => a.workspace!.name.localeCompare(b.workspace!.name));
    return filteredResult as Array<WorkspaceModel>;
  },
});

export const getWorkspace = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId }) => {
    await ensureIsWorkspaceMember(ctx, workspaceId);
    const workspace = await ctx.db.get(workspaceId);

    if (!workspace) return null;

    const memberships = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', workspaceId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => ({
        user: await ctx.db.get(m.userId),
        role: m.role,
      })),
    );

    return {
      ...workspace,
      members: members.filter((m) => m.user !== null) as Array<{
        user: User;
        role: Doc<'userWorkspaces'>['role'];
      }>,
    };
  },
});

export const getWorkspaceMembers = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId }) => {
    await ensureIsWorkspaceMember(ctx, workspaceId);
    const workspace = await ctx.db.get(workspaceId);

    if (!workspace) return null;

    const memberships = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', workspaceId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => await ctx.db.get(m.userId)),
    );

    return members.filter(Boolean);
  },
});

export const getWorkspaceRole = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId }) => {
    const user = await mustGetCurrentUser(ctx);

    const membership = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', user._id).eq('workspaceId', workspaceId),
      )
      .first();

    if (!membership) return null;

    return membership.role;
  },
});

export const getWorkspacesWithRole = query({
  handler: async (ctx) => {
    const user = await mustGetCurrentUser(ctx);

    const memberships = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) => q.eq('userId', user._id))
      .collect();

    return memberships.reduce(
      (map, { workspaceId, role }) => {
        if (!map[workspaceId]) {
          map[workspaceId] = role;
        }
        return map;
      },
      {} as Record<string, Doc<'userWorkspaces'>['role']>,
    );
  },
});

export const inviteUserToWorkspace = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    invitedUserId: v.id('users'),
    initialRole: v.union(v.literal('member'), v.literal('owner')),
  },
  handler: async (ctx, { workspaceId, invitedUserId, initialRole }) => {
    await ensureIsWorkspaceOwner(ctx, workspaceId);

    // Prevent inviting someone already in the workspace
    const existingMembership = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', invitedUserId).eq('workspaceId', workspaceId),
      )
      .first();

    if (existingMembership) {
      throw new ConvexError('User is already a member of this workspace.');
    }

    await ctx.db.insert('userWorkspaces', {
      workspaceId,
      userId: invitedUserId,
      role: initialRole,
    });
  },
});

export const removeUserFromWorkspace = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    userId: v.id('users'),
  },
  handler: async (ctx, { workspaceId, userId }) => {
    await ensureIsWorkspaceOwner(ctx, workspaceId);

    // Don't allow removing the last owner
    const ownersOfWorkspace = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', workspaceId))
      .filter((q) => q.eq(q.field('role'), 'owner'))
      .collect();

    if (
      ownersOfWorkspace.length === 1 &&
      ownersOfWorkspace[0].userId === userId
    ) {
      throw new ConvexError('Cannot remove the last owner of a workspace');
    }

    // Remove the user from the workspace
    const userWorkspaceToRemove = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', userId).eq('workspaceId', workspaceId),
      )
      .unique();

    if (userWorkspaceToRemove) {
      await ctx.db.delete(userWorkspaceToRemove._id);
    }
  },
});

export const updateUserWorkspaceRole = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    userId: v.id('users'),
    role: v.union(v.literal('owner'), v.literal('member')),
  },
  handler: async (ctx, { workspaceId, userId, role }) => {
    await ensureIsWorkspaceOwner(ctx, workspaceId);

    // Don't allow removing the last owner
    if (role === 'member') {
      const owners = await ctx.db
        .query('userWorkspaces')
        .withIndex('by_workspaceId', (q) => q.eq('workspaceId', workspaceId))
        .filter((q) => q.eq(q.field('role'), 'owner'))
        .collect();

      if (owners.length === 1 && owners[0].userId === userId) {
        throw new ConvexError('Cannot demote the last owner of a workspace');
      }
    }

    // Update the role
    const targetMembership = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', userId).eq('workspaceId', workspaceId),
      )
      .unique();

    if (!targetMembership)
      throw new ConvexError('User is not workspace member');

    await ctx.db.patch(targetMembership._id, { role });
  },
});
