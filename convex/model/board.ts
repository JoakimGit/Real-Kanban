import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { QueryCtx, MutationCtx } from '../_generated/server';
import { mustGetCurrentUser } from './user';

export const ensureIsBoardMember = async (
  ctx: QueryCtx | MutationCtx,
  boardId: Id<'boards'>,
) => {
  const currentUser = await mustGetCurrentUser(ctx);

  const boardFound = await ctx.db
    .query('boardMembers')
    .withIndex('by_userId_boardId', (q) =>
      q.eq('userId', currentUser._id).eq('boardId', boardId),
    )
    .unique();

  if (!boardFound) {
    throw new ConvexError('Unauthorized');
  }
};
