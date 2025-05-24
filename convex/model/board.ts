import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { QueryCtx, MutationCtx } from '../_generated/server';
import { mustGetCurrentUser } from './user';

export const ensureIsBoardMember = async (
  ctx: QueryCtx | MutationCtx,
  config: {
    fromBoardId?: Id<'boards'>;
    fromColumnId?: Id<'columns'>;
    fromTaskId?: Id<'tasks'>;
  },
) => {
  const currentUser = await mustGetCurrentUser(ctx);
  let boardId: Id<'boards'> | undefined = config.fromBoardId;

  if (config.fromColumnId) {
    const column = await ctx.db.get(config.fromColumnId);
    boardId = column?.boardId;
  } else if (config.fromTaskId) {
    const task = await ctx.db.get(config.fromTaskId);

    if (task) {
      const column = await ctx.db.get(task?.columnId);
      boardId = column?.boardId;
    }
  }

  if (!boardId) {
    throw new ConvexError('Board not found');
  }

  const boardFound = await ctx.db
    .query('boardMembers')
    .withIndex('by_userId_boardId', (q) =>
      q.eq('userId', currentUser._id).eq('boardId', boardId),
    )
    .unique();

  if (!boardFound) {
    throw new ConvexError('Unauthorized');
  }

  return currentUser;
};
