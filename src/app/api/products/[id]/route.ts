import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: {params: Promise<{id: string}>}
) {
  try {
    const { id } = await props.params
    // connect to the database
    await dbConnect()
    // get the product by id
    const product = await Product.findById(id).lean()
    if (!product) {
      return {status: 404, json: { error: 'Product not found'}}
    }
    return NextResponse.json({ product }, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch the product'}, { status: 500 })
  }
}