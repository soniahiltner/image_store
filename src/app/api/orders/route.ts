import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import Order from '@/models/Order'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { productId, variant } = await request.json()
    // connect to database and create order
    await dbConnect()
    // create order Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Product Name'
            },
            unit_amount: Math.round(variant.price * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        productId: productId.toString()
      },
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel'
    })

    //Create order in database
    const newOrder = await Order.create({
      userId: session.user.id,
      productId,
      variant,
      stripeOrderId: stripeSession.id,
      amount: variant.price,
      status: 'pending'
    })
    return NextResponse.json({
      orderId: stripeSession.id,
      amount: stripeSession.amount_total,
      currency: stripeSession.currency,
      dbOrderId: newOrder._id
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
