import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';

async function validateRequest(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env file');
  }

  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error('No svix headers');
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  return wh.verify(body, {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  }) as WebhookEvent;
}

export async function POST(req: Request) {
  try {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env file');
    const evt = await validateRequest(req);
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const userData = evt.data;
      
      await prisma.user.create({
        data: {
          id: userData.id,
          email: userData.email_addresses[0].email_address,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          role: 'EMPLOYEE', // Default role
          createdAt: new Date(userData.created_at),
          updatedAt: new Date(userData.updated_at)
        }
      });

      return NextResponse.json({ success: true });
    }

    if (eventType === 'user.updated') {
      const userData = evt.data;

      await prisma.user.update({
        where: { id: userData.id },
        data: {
          email: userData.email_addresses[0].email_address,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          updatedAt: new Date(userData.updated_at)
        }
      });

      return NextResponse.json({ success: true });
    }

    // Return 200 for other event types
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}