import { NextRequest, NextResponse } from 'next/server'

 export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { amount, email, currency } = await request.json()

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack is not configured. Please contact the administrator.' },
        { status: 503 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const amountInKobo = Math.round(amount * 100)

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        currency: currency || 'NGN',
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://africaofourdreaminitiative.org'}/support/thank-you`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Donation Type',
              variable_name: 'donation_type',
              value: 'Support AODI',
            },
          ],
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Failed to initialize payment' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error('Paystack initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
