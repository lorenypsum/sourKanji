import { PrismaClient } from "@prisma/client";

declare global {
  var __dev_db: PrismaClient;
}

let db: PrismaClient;

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.__dev_db) global.__dev_db = new PrismaClient();
  db = global.__dev_db;
  db.$connect();
}

export default db;
