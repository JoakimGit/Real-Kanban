import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { mustGetCurrentUser } from './model/user';
import { getManyFrom, getManyVia } from 'convex-helpers/server/relationships';
import { Doc } from './_generated/dataModel';
import { ensureIsWorkspaceOwner } from './model/workspace';

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

export const getUserWorkspaces = query({
  handler: async (ctx) => {
    const currentUser = await mustGetCurrentUser(ctx);

    const userOwnedWorkspaces = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', currentUser._id),
      )
      .collect();

    const result = await Promise.all(
      userOwnedWorkspaces.map(async (ws) => {
        const workspace = (await ctx.db.get(
          ws.workspaceId,
        )) as Doc<'workspaces'>;
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
        const filteredMembers = members.filter(Boolean);

        return { workspace, boards, members: filteredMembers };
      }),
    );

    return result;
  },
});

export const getWorkspace = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId }) => {
    await mustGetCurrentUser(ctx);
    return await ctx.db.get(workspaceId);
  },
});

export const inviteUserToWorkspace = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    invitedUserId: v.id('users'),
    initialRole: v.literal('member'),
  },
  handler: async (ctx, { workspaceId, invitedUserId, initialRole }) => {
    const currentUser = await mustGetCurrentUser(ctx);

    // Verify that the current user is an owner of the workspace
    const workspaceMembership = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', currentUser._id).eq('workspaceId', workspaceId),
      )
      .first();

    if (workspaceMembership?.role !== 'owner') {
      throw new ConvexError(
        'Unauthorized: You are not an owner of this workspace.',
      );
    }

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
