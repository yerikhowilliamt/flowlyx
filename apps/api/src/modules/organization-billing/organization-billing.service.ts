import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@flowlyx/database';
// @ts-expect-error Midtrans does not have types
import midtransClient from 'midtrans-client';
import * as crypto from 'crypto';
import { UpdatePlanRequestDto } from './dto/organization-billing.dto';

@Injectable()
export class OrganizationBillingService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private snap: any;

  constructor(private readonly configService: ConfigService) {
    this.snap = new midtransClient.Snap({
      isProduction: this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.configService.get<string>('MIDTRANS_SERVER_KEY') || '',
      clientKey: this.configService.get<string>('MIDTRANS_CLIENT_KEY') || '',
    });
  }

  async getBillingInfo(organizationId: string) {
    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found for this organization');
    }

    return subscription;
  }

  async updatePlan(organizationId: string, updatePlanRequestDto: UpdatePlanRequestDto) {
    const orderId = `ORDER-${organizationId}-${Date.now()}`;
    // Determine amount based on plan
    let amount = 0;
    if (updatePlanRequestDto.plan === 'PRO') {
      amount = updatePlanRequestDto.billingCycle === 'MONTHLY' ? 150000 : 1500000;
    } else if (updatePlanRequestDto.plan === 'ENTERPRISE') {
      amount = updatePlanRequestDto.billingCycle === 'MONTHLY' ? 500000 : 5000000;
    } else {
      // FREE plan update logic
      // Should handle directly without midtrans
      throw new BadRequestException('Use another endpoint to downgrade to free');
    }

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
    };

    const transaction = await this.snap.createTransaction(parameter);

    // Save to database
    await prisma.paymentTransaction.create({
      data: {
        organizationId,
        orderId,
        amount,
        status: 'PENDING',
        paymentUrl: transaction.redirect_url,
      },
    });

    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
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
      // Logic to parse orderId or update the respective subscription.
      // Usually, you should store the selected plan in the transaction or pass it via metadata/custom_field.
      // For now, let's just make it active if we had custom_fields
      // A more robust implementation would fetch the plan info.
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await prisma.organizationSubscription.upsert({
        where: { organizationId: tx.organizationId },
        update: {
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
        },
        create: {
          organizationId: tx.organizationId,
          plan: 'PRO', // Placeholder, should be retrieved from tx metadata
          billingCycle: 'MONTHLY',
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
        },
      });
    }

    return { status: 'OK' };
  }
}
