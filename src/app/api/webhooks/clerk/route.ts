import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

async function validateWebhook(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env file');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    return wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const evt = await validateWebhook(req);
    if (!evt) {
      return new Response('Error occured', {
        status: 400
      });
    }

    // Handle the webhook
    switch (evt.type) {
      case 'user.created':
      case 'user.updated':
        await prisma.user.upsert({
          where: { id: evt.data.id },
          update: {
            email: evt.data.email_addresses[0]?.email_address,
            name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
          },
          create: {
            id: evt.data.id,
            email: evt.data.email_addresses[0]?.email_address || '',
            name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
            role: 'EMPLOYEE', // default role
          },
        });
        break;
      case 'user.deleted':
        await prisma.user.delete({
          where: { id: evt.data.id }
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}