import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import type { WebhookEvent } from '@clerk/backend';
import { Webhook } from 'svix';

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response('Error occured', { status: 400 });
  }
  switch (event.type) {
    case 'user.created': // intentional fallthrough
    case 'user.updated': {
      const existingUser = await ctx.runQuery(internal.users.getUser, {
        subject: event.data.id,
      });
      if (existingUser && event.type === 'user.created') {
        console.warn('Overwriting user', event.data.id, 'with', event.data);
      }
      console.log('creating/updating user', event.data.id);
      const userId = await ctx.runMutation(internal.users.updateOrCreateUser, {
        clerkUser: event.data,
      });
      await ctx.runMutation(internal.users.addUserToDemoBoards, {
        userId,
      });
      break;
    }
    case 'user.deleted': {
      // Clerk docs say this is required, but the types say optional?
      const id = event.data.id!;
      await ctx.runMutation(internal.users.deleteUser, { id });
      break;
    }
    default: {
      console.log('ignored Clerk webhook event', event.type);
    }
  }
  return new Response(null, { status: 200 });
});

async function validateRequest(
  req: Request,
): Promise<WebhookEvent | undefined> {
  const payloadString = await req.text();

  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string);
  let evt: Event | null = null;
  try {
    evt = wh.verify(payloadString, svixHeaders) as Event;
  } catch (_) {
    console.log('error verifying');
    return;
  }

  return evt as unknown as WebhookEvent;
}

// define the http router
const http = httpRouter();

// define the webhook route
http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: handleClerkWebhook,
});

export default http;
