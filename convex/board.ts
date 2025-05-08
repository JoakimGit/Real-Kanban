import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { mustGetCurrentUser } from './users';

export const createBoard = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, boardData) => {
    const currentUser = await mustGetCurrentUser(ctx);

    const isUserOwnerOfBoardWorkspace = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q
          .eq('userId', currentUser._id)
          .eq('workspaceId', boardData.workspaceId),
      )
      .unique();

    if (!isUserOwnerOfBoardWorkspace) {
      throw new Error('Unauthorized');
    }

    const createdBoardId = await ctx.db.insert('boards', boardData);
    console.log(
      `Created board <${createdBoardId}> for user ${currentUser._id}`,
    );
    const boardMemberLink = await ctx.db.insert('boardMembers', {
      boardId: createdBoardId,
      userId: currentUser._id,
    });
    console.log(`Generated board link <${boardMemberLink}>`);
    return createdBoardId;
  },
});

export const deleteBoard = mutation({
  args: {
    boardId: v.id('boards'),
  },
  handler: async (ctx, { boardId }) => {
    const currentUser = await mustGetCurrentUser(ctx);
    const board = await ctx.db.get(boardId);

    if (!board) {
      throw new Error('No board found');
    }

    const isUserOwnerOfBoardWorkspace = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', currentUser._id).eq('workspaceId', board.workspaceId),
      )
      .unique();

    if (!isUserOwnerOfBoardWorkspace) {
      throw new Error('Unauthorized');
    }

    const boardMembersToDelete = await ctx.db
      .query('boardMembers')
      .withIndex('by_boardId', (q) => q.eq('boardId', board._id))
      .collect();

    // Delete each boardMembers entry
    for (const member of boardMembersToDelete) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(board._id);
    console.log(`Deleted board and boardMember links for board: ${board._id}`);
  },
});
