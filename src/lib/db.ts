import mongoose from "mongoose"

const MONGO_URI = process.env.MONGO_URI!

if(!MONGO_URI) {
  throw new Error("Check your database connection string")
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function dbConnect() {
  // Check if the connection is already cached
  if (cached.conn) {
    return cached.conn
  }

  // If  there is no promise, make a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    cached.promise = mongoose.connect(MONGO_URI, opts).then((connection) => {
      return connection.connection
    })
  }
  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
  }

  return cached.conn
}
