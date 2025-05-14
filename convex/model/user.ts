import { UserJSON } from '@clerk/backend';
import { Doc, Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';

export type User = Omit<Doc<'users'>, 'clerkUser'> & { clerkUser: UserJSON };

export async function mustGetCurrentUser(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error('Not authenticated');
  return userRecord;
}

export async function userQuery(
  ctx: QueryCtx,
  clerkUserId: string,
): Promise<User | null> {
  return await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkUser.id', clerkUserId))
    .unique();
}

export async function userById(
  ctx: QueryCtx,
  id: Id<'users'>,
): Promise<User | null> {
  return await ctx.db.get(id);
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userQuery(ctx, identity.subject);
}

export async function ensureAuthenticated(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
}
