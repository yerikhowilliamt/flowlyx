import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@flowlyx/database';
import midtransClient from 'midtrans-client';
import * as crypto from 'crypto';
import { UpdatePlanRequestDto } from './dto/organization-billing.dto';
@Injectable()
export class OrganizationBillingService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private snap: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private coreApi: any;

  constructor(private readonly configService: ConfigService) {
    const isProduction = this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true';
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') || '';
    const clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY') || '';

    this.snap = new midtransClient.Snap({ isProduction, serverKey, clientKey });
    this.coreApi = new midtransClient.CoreApi({ isProduction, serverKey, clientKey });
  }

  async getBillingInfo(organizationId: string) {
    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found for this organization');
    }

    return {
      id: subscription.id,
      organizationId: subscription.organizationId,
      currentPlan: subscription.plan,
      billingCycle: subscription.billingCycle,
      status: subscription.status,
      nextBillingDate: subscription.currentPeriodEnd.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }

  async updatePlan(organizationId: string, updatePlanRequestDto: UpdatePlanRequestDto) {
    const orderId = `TX-${organizationId.substring(0, 8)}-${Date.now()}`;
    const rate = this.configService.get<number>('EXCHANGE_RATE_USD_IDR') ?? 17990;

    const usdPrices: Record<string, Record<string, number>> = {
      PRO: { MONTHLY: 29, YEARLY: 24 * 12 },
      ENTERPRISE: { MONTHLY: 99, YEARLY: 79 * 12 },
    };

    const usd = usdPrices[updatePlanRequestDto.plan]?.[updatePlanRequestDto.billingCycle];
    if (!usd) {
      throw new BadRequestException('Use another endpoint to downgrade to free');
    }

    const amount = Math.round(usd * rate);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3015';

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: 'Org',
        last_name: organizationId,
      },
      callbacks: {
        finish: `${frontendUrl}/payment/finish?order_id=${orderId}`,
        error: `${frontendUrl}/payment/finish?order_id=${orderId}&status=error`,
        pending: `${frontendUrl}/payment/finish?order_id=${orderId}&status=pending`,
      },
    };

    const transaction = await this.snap.createTransaction(parameter);

    await prisma.paymentTransaction.create({
      data: {
        organizationId,
        orderId,
        amount,
        status: 'PENDING',
        paymentUrl: transaction.redirect_url,
        plan: updatePlanRequestDto.plan,
        billingCycle: updatePlanRequestDto.billingCycle,
      },
    });

    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleWebhook(payload: any) {
    // Validate signature key
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') || '';
    const hash = crypto
      .createHash('sha512')
      .update(payload.order_id + payload.status_code + payload.gross_amount + serverKey)
      .digest('hex');

    if (hash !== payload.signature_key) {
      throw new BadRequestException('Invalid signature key');
    }

    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;
    const orderId = payload.order_id;

    let dbStatus = 'PENDING';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        dbStatus = 'PENDING';
      } else if (fraudStatus === 'accept') {
        dbStatus = 'SETTLEMENT';
      }
    } else if (transactionStatus === 'settlement') {
      dbStatus = 'SETTLEMENT';
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      dbStatus = 'CANCEL';
    } else if (transactionStatus === 'pending') {
      dbStatus = 'PENDING';
    }

    const tx = await prisma.paymentTransaction.update({
      where: { orderId },
      data: { status: dbStatus },
    });

    if (dbStatus === 'SETTLEMENT') {
      const now = new Date();
      const isYearly = tx.billingCycle === 'YEARLY';
      const periodEnd = new Date(now);
      if (isYearly) {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await prisma.organizationSubscription.upsert({
        where: { organizationId: tx.organizationId },
        update: {
          plan: tx.plan ?? 'PRO',
          billingCycle: (tx.billingCycle as 'MONTHLY' | 'YEARLY') ?? 'MONTHLY',
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        create: {
          organizationId: tx.organizationId,
          plan: tx.plan ?? 'PRO',
          billingCycle: tx.billingCycle ?? 'MONTHLY',
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    return { status: 'OK' };
  }

  async syncTransactionStatus(orderId: string) {
    const tx = await prisma.paymentTransaction.findUnique({ where: { orderId } });
    if (!tx) throw new NotFoundException('Transaction not found');

    let mtStatus: { transaction_status?: string; fraud_status?: string };
    try {
      mtStatus = await this.coreApi.transaction.status(orderId);
    } catch {
      return { synced: false, status: tx.status };
    }

    const transactionStatus = mtStatus.transaction_status;
    const fraudStatus = mtStatus.fraud_status;

    let dbStatus = tx.status;
    if (transactionStatus === 'capture' && fraudStatus === 'accept') {
      dbStatus = 'SETTLEMENT';
    } else if (transactionStatus === 'settlement') {
      dbStatus = 'SETTLEMENT';
    } else if (transactionStatus && ['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      dbStatus = 'CANCEL';
    }

    if (dbStatus === tx.status) {
      return { synced: false, status: dbStatus };
    }

    await prisma.paymentTransaction.update({ where: { orderId }, data: { status: dbStatus } });

    if (dbStatus === 'SETTLEMENT') {
      const now = new Date();
      const periodEnd = new Date(now);
      if (tx.billingCycle === 'YEARLY') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await prisma.organizationSubscription.upsert({
        where: { organizationId: tx.organizationId },
        update: {
          plan: tx.plan ?? 'PRO',
          billingCycle: tx.billingCycle ?? 'MONTHLY',
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        create: {
          organizationId: tx.organizationId,
          plan: tx.plan ?? 'PRO',
          billingCycle: tx.billingCycle ?? 'MONTHLY',
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    return { synced: true, status: dbStatus };
  }
}
