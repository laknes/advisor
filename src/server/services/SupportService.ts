import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import type { CreateSupportTicketInput, UpdateSupportTicketInput } from '@/lib/validations';

export class SupportService {
  static async createTicket(input: CreateSupportTicketInput, userId?: string) {
    return prisma.supportTicket.create({
      data: {
        ...input,
        userId,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  static async getTickets(status?: string) {
    return prisma.supportTicket.findMany({
      where: status && status !== 'all' ? { status } : undefined,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  static async updateTicket(ticketId: string, input: UpdateSupportTicketInput) {
    const existing = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!existing) throw new NotFoundError('Support ticket');

    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: input,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }
}
