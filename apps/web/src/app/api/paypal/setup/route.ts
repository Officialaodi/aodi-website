import { NextResponse } from 'next/server'
import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
} from '@paypal/paypal-server-sdk'

 export const runtime = 'edge';

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

export async function GET() {
  try {
    const client = getPayPalClient()
    
    if (!client) {
      return NextResponse.json(
        { error: 'PayPal is not configured. Please contact the administrator.' },
        { status: 503 }
      )
    }

    const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

    const oAuthController = new OAuthAuthorizationController(client)
    const { result } = await oAuthController.requestToken(
      { authorization: `Basic ${auth}` },
      { intent: 'sdk_init', response_type: 'client_token' }
    )

    return NextResponse.json({ clientToken: result.accessToken })
  } catch (error) {
    console.error('PayPal setup error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize PayPal' },
      { status: 500 }
    )
  }
}
