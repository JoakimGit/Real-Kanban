## Task Management App with real-time kanban

### Rough outline for stuff to implement

1. Project setup

- [x] initialize project from Convex Tanstack Start template /w Clerk
- [x] setup convex db schema
- [x] create main layout with header, sidebar and main section
- [x] setup clerk webhook for adding user to our own convex db
- [x] figure out theming/dark mode

2. Workspaces and boards

- [x] create mutations for workspaces/boards
- [x] update sidebar ui with buttons to call mutations
- [x] create query for real data and replace hardcoded sidebar
- [x] create list view for workspaces and boards
- [ ] add description and color to workspace/board create/update
- [ ] reuse create workspace/board functionality for create button in list views

3. Board columns and cards

- [ ] create board view with columns/cards
- [ ] modal for updating card with all its properties, including tasks
- [ ] implement drag & drop
- [ ] implement conflict resolution for 2 users updating same entity

4. Secondary features

- [ ] add user management (inviting users to workspace/board, role/authorization stuff)
- [ ] various actions (minimize card fields, copy card, delete for all entities, etc.)
- [ ] add card comments

5. Bonus features

- [ ] add notifications
- [ ] add activity log to cards
- [ ] add file upload for card attachments
- [ ] settings pages for user/workspace/others?

6. Polish

- [ ] better error handling?
- [ ] logging/metrics?
- [ ] overall ui polishing

7. Deployment

- [ ] deploy Tanstack app to netlify
- [ ] deploy convex to production
