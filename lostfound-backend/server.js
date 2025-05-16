// server.js (backend entry point)
import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/libsql";
import { users, lostItems, reportedItems } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { createClient } from "@libsql/client";

dotenv.config();

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: '*' });

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(turso);

// Middleware to protect admin routes
function verifyAdmin(req, reply, done) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.email.endsWith("@lpuadmin.edu.ph")) {
      return reply.status(403).send({ error: "Admin access only" });
    }
    req.user = decoded;
    done();
  } catch {
    reply.status(401).send({ error: "Unauthorized" });
  }
}

// Middleware to protect user routes
function verifyUser(req, reply, done) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.email.endsWith("@lpunetwork.edu.ph")) {
      return reply.status(403).send({ error: "User access only" });
    }
    req.user = decoded;
    done();
  } catch {
    reply.status(401).send({ error: "Unauthorized" });
  }
}

function verifyMultiple(req, reply, done) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.email.endsWith("@lpunetwork.edu.ph") && !decoded.email.endsWith("@lpuadmin.edu.ph")) {
      return reply.status(403).send({ error: "Admin or User access only" });
    }
    req.user = decoded;
    done();
  } catch {
    reply.status(401).send({ error: "Unauthorized" });
  }
}
// Register
fastify.post("/auth/register", async (req, reply) => {
  const { email, password } = req.body;
  if (!email.endsWith("@lpunetwork.edu.ph") && !email.endsWith("@lpuadmin.edu.ph")) {
    return reply.status(400).send({ error: "Invalid email domain" });
  }
  const hashed = await bcrypt.hash(password, 10);
  db.insert(users).values({ email, password: hashed }).run();
  reply.send({ message: "Registered successfully" });
});

// Login
fastify.post("/auth/login", async (req, reply) => {
  const { email, password } = req.body;
  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return reply.status(401).send({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
  reply.send({ token });
});

// Admin adds lost item
fastify.post("/admin/items", { preHandler: verifyAdmin }, async (req, reply) => {
  const { name, description, location, contact, date_lost } = req.body;
  await db.insert(lostItems).values({ name, description, location, contact, date_lost });
  reply.send({ message: "Item added by admin" });
});

// User reports item (lost or found)
fastify.post("/user/report", { preHandler: verifyUser }, async (req, reply) => {
  const { name, description, location, contact, date_reported, type} = req.body;
  const userResults = await db.select().from(users).where(eq(users.email, req.user.email));

  const user = userResults[0];
  if (!user) {
    return reply.status(404).send({ error: "User not found" });
  }

  await db.insert(reportedItems).values({
    name,
    description,
    location,
    contact,
    date_reported,
    type,
    status: "pending",
    user_email: req.user.email,
    reporterID: user.id
  });
  reply.send({ message: "Report submitted" });
});

// Admin gets all reports
fastify.get("/admin/reports", { preHandler: verifyAdmin }, async (req, reply) => {
  const reports = await db.select().from(reportedItems).all();
  reply.send({ reports });
});

// Admin verifies report (adds to lost items)
fastify.post("/admin/reports/:id/approve", { preHandler: verifyAdmin }, async (req, reply) => {
  const report = db.select().from(reportedItems).where(eq(reportedItems.id, Number(req.params.id))).get();
  if (!report) return reply.status(404).send({ error: "Report not found" });
  db.insert(lostItems).values({
    name: report.name,
    description: report.description,
    location: report.location,
    contact: report.contact,
    date_lost: report.date_reported
  }).run();
  db.delete(reportedItems).where(eq(reportedItems.id, report.id)).run();
  reply.send({ message: "Report approved and added to lost items" });
});

fastify.get("/lost-items", { preHandler: verifyMultiple }, async (req, reply) => {
  const items = await db.select().from(lostItems);
  reply.send({ items });
});

fastify.get("/", async (req, reply) => {
  return { message: "Lost & Found API is running!" };
});

const host = '0.0.0.0';
const port = 3000;
fastify.listen({ port, host}, (err) => {
  if (err) throw err;
  console.log(`🚀 Server running at http://${host}:${port}`);
});
