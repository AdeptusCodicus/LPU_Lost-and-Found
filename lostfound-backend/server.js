// server.js
import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { lostItems } from "./db/schema.js";

dotenv.config();

const fastify = Fastify({ logger: true, connectionTimeout: 5000 });
await fastify.register(cors);

const sqlite = new Database("lostfound.db");
const db = drizzle(sqlite);

// Create table if not exists (using raw SQL)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS lost_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    contact TEXT NOT NULL,
    date_lost TEXT NOT NULL
  )
`);

// GET all lost items
fastify.get("/items", async (req, reply) => {
  const items = db.select().from(lostItems).all();
  return { items };
});

// POST a new lost item
fastify.post("/items", async (req, reply) => {
  const { name, description, location, contact, date_lost } = req.body;
  db.insert(lostItems).values({ name, description, location, contact, date_lost }).run();
  return { message: "Item added successfully" };
});

// Optional root route
fastify.get("/", async (req, reply) => {
  return { message: "Lost & Found API is running!" };
});

// Start server
fastify.listen( {host: "192.168.100.158", port: 3000} , (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
