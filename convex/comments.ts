import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { ensureIsWorkspaceMember } from './model/workspace';
import { mustGetCurrentUser, User } from './model/user';
import { getAll, getManyFrom } from 'convex-helpers/server/relationships';
import { Doc } from './_generated/dataModel';

export type TaskComment = Omit<Doc<'comments'>, 'author'> & {
  author: User;
};

export const getCommentsByTask = query({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, { taskId }) => {
    const comments = await getManyFrom(ctx.db, 'comments', 'by_taskId', taskId);
    const authorIds = new Set(comments.map((comment) => comment.author));
    const authors = (await getAll(ctx.db, authorIds)).filter(Boolean);

    return comments.map((comment) => ({
      ...comment,
      author: authors.find((author) => author._id === comment.author)!,
    }));
  },
});

export const createComment = mutation({
  args: {
    text: v.string(),
    taskId: v.id('tasks'),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId, ...data }) => {
    const user = await ensureIsWorkspaceMember(ctx, workspaceId);

    await ctx.db.insert('comments', { ...data, author: user._id });
  },
});

export const updateComment = mutation({
  args: {
    commentId: v.id('comments'),
    text: v.string(),
  },
  handler: async (ctx, { commentId, text }) => {
    const user = await mustGetCurrentUser(ctx);
    const comment = await ctx.db.get(commentId);

    if (comment?.author !== user._id) throw new ConvexError('Unauthorized');

    await ctx.db.patch(commentId, { text, lastModified: Date.now() });
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id('comments'),
  },
  handler: async (ctx, { commentId }) => {
    const user = await mustGetCurrentUser(ctx);
    const comment = await ctx.db.get(commentId);

    if (comment?.author !== user._id) throw new ConvexError('Unauthorized');

    await ctx.db.delete(commentId);
  },
});
