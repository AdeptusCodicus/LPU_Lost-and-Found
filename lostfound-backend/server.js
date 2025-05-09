// server.js
import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { lostItems } from "./db/schema.js";

// Load environment variables from .env
dotenv.config();

// Initialize Fastify
const fastify = Fastify({ logger: true, connectionTimeout: 5000 });

// Register CORS plugin
await fastify.register(cors, { origin: "*" });

// Create and initialize SQLite database
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

// Define POST route to report a missing item
fastify.post("/report", async (request, reply) => {
  const { name, description, location, contact } = request.body;

  // You can log to debug
  console.log("Report received:", request.body);

  // Insert to DB here
  // await db.query(...);

  reply.send({ message: "Report submitted successfully" });
});

// Define POST route to add an item to the lost items
fastify.post("/items", async (request, reply) => {
  const { name, description, location, contact, date_lost } = request.body;

  // Insert to DB
  db.insert(lostItems).values({ name, description, location, contact, date_lost }).run();

  reply.send({ message: "Item added successfully" });
});

// Define GET route to fetch all lost items
fastify.get("/items", async (req, reply) => {
  const items = db.select().from(lostItems).all();
  return { items };
});

// Optional root route to check if server is running
fastify.get("/", async (req, reply) => {
  return { message: "Lost & Found API is running!" };
});


export const HOST = '0.0.0.0';
export const PORT = 3000;
// Start server
fastify.listen({ host: HOST, port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening on http://${HOST}:${PORT}`);
});

// Config endpoint to expose server information
fastify.get("/config", async (req, reply) => {
  const serverAddress = getServerIP();
  return { 
    api_url: `http://${serverAddress}:${PORT}` 
  };
});

export async function serverIP({host: HOST, port: PORT}){
    return{
      api_url: "http://${HOST}:${PORT}"
    }
}