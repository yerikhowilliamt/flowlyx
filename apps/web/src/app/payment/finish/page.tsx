'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncBillingTransaction } from '@/features/organizations/api/organizations.api';

export default function PaymentFinishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const transactionStatus = searchParams.get('transaction_status');

  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');

  useEffect(() => {
    if (!orderId) {
      router.replace('/organizations');
      return;
    }

    const immediateStatus = transactionStatus;
    if (immediateStatus === 'capture' || immediateStatus === 'settlement') {
      queueMicrotask(() => setStatus('success'));
    } else if (immediateStatus === 'pending') {
      queueMicrotask(() => setStatus('pending'));
    } else if (immediateStatus === 'cancel' || immediateStatus === 'deny' || immediateStatus === 'expire') {
      queueMicrotask(() => setStatus('failed'));
      return;
    }

    syncBillingTransaction(orderId)
      .then((res) => {
        if (res.status === 'SETTLEMENT') setStatus('success');
        else if (res.status === 'CANCEL') setStatus('failed');
        else setStatus('pending');
      })
      .catch(() => {
        setStatus((prev) => (prev !== 'success' ? 'pending' : prev));
      });
  }, [orderId, transactionStatus, router]);

  const config: Record<string, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
    loading: {
      icon: <Loader2 className="h-12 w-12 animate-spin text-orange-500" />,
      title: 'Verifying payment...',
      desc: 'Please wait while we confirm your payment.',
      color: 'text-zinc-300',
    },
    success: {
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      title: 'Payment successful!',
      desc: 'Your subscription has been updated. Thank you!',
      color: 'text-green-400',
    },
    pending: {
      icon: <Clock className="h-12 w-12 text-yellow-500" />,
      title: 'Payment pending',
      desc: 'Your payment is being processed. We will notify you once confirmed.',
      color: 'text-yellow-400',
    },
    failed: {
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      title: 'Payment failed',
      desc: 'Your payment was cancelled or failed. Please try again.',
      color: 'text-red-400',
    },
  };

  const current = config[status];

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center gap-6 text-center px-4">
      {current.icon}
      <div className="space-y-2">
        <h1 className={`text-2xl font-bold ${current.color}`}>{current.title}</h1>
        <p className="text-sm text-zinc-400 max-w-sm">{current.desc}</p>
        {orderId && (
          <p className="text-zinc-600 text-xs font-mono mt-2">Order: {orderId}</p>
        )}
      </div>
      {status !== 'loading' && (
        <Button
          onClick={() => router.replace('/organizations')}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6"
        >
          Back to Organizations
        </Button>
      )}
    </div>
  );
}
