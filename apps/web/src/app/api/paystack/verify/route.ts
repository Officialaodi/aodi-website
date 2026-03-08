import { NextRequest, NextResponse } from 'next/server'
import { trackConversion } from '@/lib/track-conversion'
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack is not configured' },
        { status: 503 }
      )
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!data.status || data.data?.status !== 'success') {
      return NextResponse.json({
        verified: false,
        message: data.message || 'Transaction not verified',
      })
    }

    const transaction = data.data
    const amount = transaction.amount / 100
    const currency = transaction.currency || 'NGN'

    // Use conversionReference with unique constraint for idempotency
    // If this reference already exists, the unique constraint will prevent duplicate inserts
    const tracked = await trackConversion({
      conversionType: 'donation',
      conversionName: 'Paystack Donation',
      conversionReference: `paystack_${reference}`,
      value: amount,
      currency,
      metadata: {
        reference,
        paymentMethod: 'paystack',
        email: transaction.customer?.email,
      },
    })

    return NextResponse.json({
      verified: true,
      alreadyTracked: !tracked,
      amount,
      currency,
      reference,
    })
  } catch (error) {
    console.error('Paystack verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify transaction' },
      { status: 500 }
    )
  }
}
