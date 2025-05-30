/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as boards from "../boards.js";
import type * as columns from "../columns.js";
import type * as http from "../http.js";
import type * as labels from "../labels.js";
import type * as model_task from "../model/task.js";
import type * as model_user from "../model/user.js";
import type * as model_workspace from "../model/workspace.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  boards: typeof boards;
  columns: typeof columns;
  http: typeof http;
  labels: typeof labels;
  "model/task": typeof model_task;
  "model/user": typeof model_user;
  "model/workspace": typeof model_workspace;
  tasks: typeof tasks;
  users: typeof users;
  workspaces: typeof workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
