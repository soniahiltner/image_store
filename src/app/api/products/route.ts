import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect()
    const products = await Product.find({}).lean()
    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products found'}, { status: 404 })
    }
    return NextResponse.json(products)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Internal server error'}, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    //authenticate the user
    const session = await getServerSession(authOptions)
    // only admin can upload products
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized'}, { status: 401 })
    }
    // connect to the database
    await dbConnect()
    // get the product data from the request body
    const body: IProduct = await request.json()

    if (!body.name || !body.description || !body.imageUrl || body.variants.length === 0) {
      return NextResponse.json({ error: 'All fields are required'}, { status: 400 })
    }

    // create a new product
    const newProduct = await Product.create(body)
    return NextResponse.json({ newProduct }, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error'}, { status: 500 })
  }
} 