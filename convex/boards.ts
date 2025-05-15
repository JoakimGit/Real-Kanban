import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { mustGetCurrentUser, User } from './model/user';
import {
  ensureIsBoardWorkspaceOwner,
  ensureIsWorkspaceOwner,
} from './model/workspace';
import { getManyVia } from 'convex-helpers/server/relationships';

export const createBoard = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, boardData) => {
    const currentUser = await mustGetCurrentUser(ctx);

    await ensureIsWorkspaceOwner(ctx, boardData.workspaceId);

    const createdBoardId = await ctx.db.insert('boards', boardData);
    console.log(
      `Created board '${createdBoardId}' for user ${currentUser._id}`,
    );
    const boardMemberLink = await ctx.db.insert('boardMembers', {
      boardId: createdBoardId,
      userId: currentUser._id,
    });
    console.log(`Generated board link '${boardMemberLink}'`);
    return createdBoardId;
  },
});

export const deleteBoard = mutation({
  args: {
    boardId: v.id('boards'),
  },
  handler: async (ctx, { boardId }) => {
    const board = await ensureIsBoardWorkspaceOwner(ctx, boardId);

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

export const updateBoard = mutation({
  args: {
    boardId: v.id('boards'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { boardId, ...updatedBoard }) => {
    await ensureIsBoardWorkspaceOwner(ctx, boardId);
    await ctx.db.patch(boardId, { ...updatedBoard });
  },
});

export const getBoardWithColumnsAndTasks = query({
  args: {
    boardId: v.id('boards'),
  },
  handler: async (ctx, { boardId }) => {
    const board = await ctx.db.get(boardId);

    if (!board) {
      return null;
    }

    // Fetch columns for the board, ordered by position
    const columns = await ctx.db
      .query('columns')
      .withIndex('by_board_position', (q) => q.eq('boardId', boardId))
      .collect();

    // Fetch tasks and related data for each column
    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasksForColumn = await ctx.db
          .query('tasks')
          .withIndex('by_columnId', (q) => q.eq('columnId', column._id))
          .collect();

        // Fetch related data for tasks in parallel
        const tasksWithDetails = await Promise.all(
          tasksForColumn.map(async (task) => {
            const [assignedTo, labels, checklistItems] = await Promise.all([
              (task.assignedTo
                ? ctx.db.get(task.assignedTo)
                : null) as User | null,
              getManyVia(
                ctx.db,
                'taskLabels',
                'labelId',
                'by_taskId_labelId',
                task._id,
                'taskId',
              ),
              ctx.db
                .query('checklistItems')
                .withIndex('by_taskId_position', (q) =>
                  q.eq('taskId', task._id),
                )
                .collect(),
            ]);

            return {
              ...task,
              assignedTo,
              labels: labels.filter(Boolean),
              checklistItems,
            };
          }),
        );

        return {
          ...column,
          tasks: tasksWithDetails,
        };
      }),
    );

    return {
      ...board,
      columns: columnsWithTasks,
    };
  },
});
