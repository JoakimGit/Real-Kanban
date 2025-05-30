import { UserJSON } from '@clerk/backend';
import { v } from 'convex/values';
import { internalMutation, internalQuery, query } from './_generated/server';
import {
  ensureAuthenticated,
  getCurrentUser,
  User,
  userQuery,
} from './model/user';

/** The current user, containing user preferences and Clerk user info. */
export const currentUser = query((ctx) => getCurrentUser(ctx));

export const getAllUsers = query({
  handler: async (ctx): Promise<Array<User>> => {
    await ensureAuthenticated(ctx);
    return await ctx.db.query('users').collect();
  },
});

// INTERNAL APIS BELOW

/** Get user by Clerk user id (AKA "subject" on auth)  */
export const getUser = internalQuery({
  args: { subject: v.string() },
  async handler(ctx, args) {
    return await userQuery(ctx, args.subject);
  },
});

/** Create a new Clerk user or update existing Clerk user data. */
export const updateOrCreateUser = internalMutation({
  args: { clerkUser: v.any() }, // no runtime validation, trust Clerk
  async handler(ctx, { clerkUser }: { clerkUser: UserJSON }) {
    const userRecord = await userQuery(ctx, clerkUser.id);

    if (userRecord === null) {
      await ctx.db.insert('users', { clerkUser });
    } else {
      await ctx.db.patch(userRecord._id, { clerkUser });
    }
  },
});

/** Delete a user by clerk user ID. */
export const deleteUser = internalMutation({
  args: { id: v.string() },
  async handler(ctx, { id }) {
    const userRecord = await userQuery(ctx, id);

    if (userRecord === null) {
      console.warn("can't delete user, does not exist", id);
    } else {
      await ctx.db.delete(userRecord._id);
    }
  },
});
