import { NextRequest, NextResponse } from 'next/server'
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from '@paypal/paypal-server-sdk'
import { trackConversion } from '@/lib/track-conversion'

function getPayPalClient() {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return null
  }

  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID,
      oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment:
      process.env.NODE_ENV === 'production'
        ? Environment.Production
        : Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderID: string }> }
) {
  try {
    const client = getPayPalClient()
    
    if (!client) {
      return NextResponse.json(
        { error: 'PayPal is not configured. Please contact the administrator.' },
        { status: 503 }
      )
    }

    const { orderID } = await params

    const ordersController = new OrdersController(client)

    const { body, statusCode } = await ordersController.captureOrder({
      id: orderID,
      prefer: 'return=representation',
    })

    const jsonResponse = JSON.parse(String(body))
    
    // Track donation conversion on successful capture
    // Use conversionReference with unique constraint for idempotency
    if (jsonResponse.status === 'COMPLETED') {
      const captureAmount = jsonResponse.purchase_units?.[0]?.payments?.captures?.[0]?.amount
      const amount = captureAmount?.value ? parseFloat(captureAmount.value) : 0
      const currency = captureAmount?.currency_code || 'USD'
      
      await trackConversion({
        conversionType: 'donation',
        conversionName: 'PayPal Donation',
        conversionReference: `paypal_${orderID}`,
        value: amount,
        currency,
        metadata: { orderID, paymentMethod: 'paypal' },
      })
    }
    
    return NextResponse.json(jsonResponse, { status: statusCode })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json(
      { error: 'Failed to capture order.' },
      { status: 500 }
    )
  }
}
