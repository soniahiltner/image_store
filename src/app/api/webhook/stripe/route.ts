import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Order from '@/models/Order'
import nodemailer from 'nodemailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    console.error('Error verifying webhook signature:', err)
    return new NextResponse(JSON.stringify({ received: false }), {
      status: 400
    })
  }
  // Connection to the database
  await dbConnect()
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Session ID: ', session.id)

      // Save an order in the database
      const order = await Order.findOneAndUpdate(
        { stripeOrderId: session.id },
        { status: 'completed', stripePaymentId: session.payment_intent }
      ).populate([
        { path: 'userId', select: 'email' },
        { path: 'productId', select: 'name' }
      ])

      // Send an email to the customer
      if (order) {
        const transporter = nodemailer.createTransport({
          host: 'sandbox.smtp.mailtrap.io',
          port: 2525,
          auth: {
            user: process.env.NEXT_PUBLIC_MAILTRAP_USER,
            pass: process.env.NEXT_PUBLIC_MAILTRAP_PASS
          }
        })

        await transporter.sendMail({
          from: '"ImageKit Shop" <noreply@imagekitshop.com>',
          to: order.userId.email,
          subject: 'Payment Confirmation - ImageKit Shop',
          text: `
Thank you for your purchase!

Order Details:
- Order ID: ${order._id.toString().slice(-6)}
- Product: ${order.productId.name}
- Version: ${order.variant.type}
- License: ${order.variant.license}
- Price: $${order.amount.toFixed(2)}

Your image is now available in your orders page.
Thank you for shopping with ImageKit Shop!
          `.trim()
        })
      }

      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Return a response to acknowledge receipt of the event to Stripe
  return new NextResponse(JSON.stringify({ received: true }), {
    status: 200
  })
}
