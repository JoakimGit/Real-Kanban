import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { QueryCtx, MutationCtx } from '../_generated/server';
import { mustGetCurrentUser } from './user';

export const ensureIsWorkspaceOwner = async (
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<'workspaces'>,
) => {
  const currentUser = await mustGetCurrentUser(ctx);

  const workspaceMembership = await ctx.db
    .query('userWorkspaces')
    .withIndex('by_userId_workspaceId', (q) =>
      q.eq('userId', currentUser._id).eq('workspaceId', workspaceId),
    )
    .first();

  if (workspaceMembership?.role !== 'owner') {
    throw new ConvexError('Unauthorized: Not workspace owner.');
  }
};

export const ensureIsWorkspaceMember = async (
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<'workspaces'>,
) => {
  const currentUser = await mustGetCurrentUser(ctx);

  const workspaceMembership = await ctx.db
    .query('userWorkspaces')
    .withIndex('by_userId_workspaceId', (q) =>
      q.eq('userId', currentUser._id).eq('workspaceId', workspaceId),
    )
    .first();

  if (!workspaceMembership) {
    throw new ConvexError('Unauthorized: Not workspace member.');
  }

  return currentUser;
};

export const ensureIsBoardWorkspaceOwner = async (
  ctx: QueryCtx | MutationCtx,
  boardId: Id<'boards'>,
) => {
  const board = await ctx.db.get(boardId);

  if (!board) {
    throw new ConvexError('Board not found');
  }

  await ensureIsWorkspaceOwner(ctx, board.workspaceId);
};
