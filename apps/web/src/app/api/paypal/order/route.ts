import { NextRequest, NextResponse } from 'next/server'
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from '@paypal/paypal-server-sdk'

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

export async function POST(request: NextRequest) {
  try {
    const client = getPayPalClient()
    
    if (!client) {
      return NextResponse.json(
        { error: 'PayPal is not configured. Please contact the administrator.' },
        { status: 503 }
      )
    }

    const { amount, currency, intent } = await request.json()

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a positive number.' },
        { status: 400 }
      )
    }

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency is required.' },
        { status: 400 }
      )
    }

    if (!intent) {
      return NextResponse.json(
        { error: 'Intent is required.' },
        { status: 400 }
      )
    }

    const ordersController = new OrdersController(client)

    const { body, statusCode } = await ordersController.createOrder({
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount.toString(),
            },
            description: 'Support AODI - Donation',
          },
        ],
      },
      prefer: 'return=minimal',
    })

    const jsonResponse = JSON.parse(String(body))
    return NextResponse.json(jsonResponse, { status: statusCode })
  } catch (error) {
    console.error('PayPal order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order.' },
      { status: 500 }
    )
  }
}
