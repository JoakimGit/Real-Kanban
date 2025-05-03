import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
  }),
  boards: defineTable({
    workspaceId: v.id('workspaces'),
    name: v.string(),
    color: v.optional(v.string()),
  }).index('by_workspace', ['workspaceId']),
  columns: defineTable({
    boardId: v.id('boards'),
    name: v.string(),
    position: v.number(),
  })
    .index('by_board', ['boardId'])
    .index('by_board_position', ['boardId', 'position']),
  cards: defineTable({
    title: v.string(),
    columnId: v.id('columns'),
    position: v.number(),
    estimate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    description: v.optional(v.string()),
    createdBy: v.string(),
  }).index('by_column', ['columnId']),
  labels: defineTable({
    title: v.string(),
    color: v.string(),
    workspaceId: v.id('workspaces'),
  }).index('by_workspace', ['workspaceId']),
  cardAssignments: defineTable({
    cardId: v.id('cards'),
    userId: v.id('users'),
  })
    .index('by_card', ['cardId'])
    .index('by_user', ['userId']),
  cardLabels: defineTable({
    cardId: v.id('cards'),
    labelId: v.id('labels'),
  })
    .index('by_card', ['cardId'])
    .index('by_label', ['labelId']),
  tasks: defineTable({
    cardId: v.id('cards'),
    title: v.string(),
    isComplete: v.boolean(),
    dueDate: v.optional(v.number()),
    position: v.number(),
  })
    .index('by_card', ['cardId'])
    .index('by_card_position', ['cardId', 'position']),
  comments: defineTable({
    cardId: v.id('cards'),
    text: v.string(),
    author: v.string(),
  }).index('by_card', ['cardId']),
  activityLog: defineTable({
    cardId: v.id('cards'),
    userId: v.id('users'),
    action: v.string(),
    details: v.optional(v.string()),
  }).index('by_card', ['cardId']),
  notifications: defineTable({
    userId: v.id('users'),
    type: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    message: v.string(),
    isRead: v.boolean(),
  })
    .index('by_user', ['userId'])
    .index('by_user_read', ['userId', 'isRead'])
    .index('by_entity', ['entityType', 'entityId']),
  users: defineTable({
    clerkUser: v.any(), // this is UserJSON from @clerk/backend
    color: v.string(),
  }).index('by_clerk_id', ['clerkUser.id']),
  userWorkspaces: defineTable({
    workspaceId: v.id('workspaces'),
    userId: v.id('users'),
  })
    .index('by_workspaceId', ['workspaceId'])
    .index('by_userId', ['userId']),
});
