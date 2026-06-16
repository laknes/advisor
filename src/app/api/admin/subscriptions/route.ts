import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: true,
        market: true,
      },
    });

    return successResponse({ subscriptions });
  } catch (error) {
    return handleError(error);
  }
}
