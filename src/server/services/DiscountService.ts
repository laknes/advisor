import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';

export class DiscountService {
  static async getDiscounts() {
    return prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createDiscount(data: any) {
    return prisma.discountCode.create({ data });
  }

  static async updateDiscount(id: string, data: any) {
    const discount = await prisma.discountCode.findUnique({ where: { id } });
    if (!discount) throw new NotFoundError('Discount code');

    return prisma.discountCode.update({
      where: { id },
      data,
    });
  }

  static async deleteDiscount(id: string) {
    const discount = await prisma.discountCode.findUnique({ where: { id } });
    if (!discount) throw new NotFoundError('Discount code');

    return prisma.discountCode.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
