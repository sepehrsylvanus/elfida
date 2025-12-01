import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI as string | undefined

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in your .env.local file")
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

let cached = global.mongooseCache

if (!cached) {
  cached = { conn: null, promise: null }
  global.mongooseCache = cached
}

export async function connectToDatabase() {
  if (cached?.conn) {
    return cached.conn
  }

  if (!cached?.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance) => {
        console.log("[MongoDB] Connected successfully")
        return mongooseInstance
      })
      .catch((error) => {
        console.error("[MongoDB] Connection error", error)
        throw error
      })
  }

  cached!.conn = await cached!.promise
  return cached!.conn
}
