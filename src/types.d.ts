import { Connection } from "mongoose"

declare global {
  var mongoose: {
    conn: Connection | null
    promise: Promise<Connection> | null
  }
}

export {} // This is needed to prevent TS from throwing an error about the file being empty