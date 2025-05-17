// server.js (backend entry point)
import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/libsql";
import { users, foundItems, lostItems, reportedItems } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { createClient } from "@libsql/client";
import fastifyWebsocket from "@fastify/websocket";

dotenv.config();

const fastify = Fastify({ logger: true });

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(turso);

const connections = new Set();

await fastify.register(cors, { origin: '*' });
await fastify.register(fastifyWebsocket);

function broadcast(data){
  const message = JSON.stringify(data);
  console.log("Broadcasting message:", message);
  for (const connection of connections) {
    const clientSocket = connection.socket;
    if (clientSocket.readyState === 1){
      try {
        clientSocket.send(message);
      } catch (error) {
        console.error("Error sending message to client:", error);
      }
    } else {
      console.warn(`Skipping send to client with readyState: ${clientSocket.readyState}`);
    }
}
}

fastify.get("/ws", {websocket: true}, (connection, req) => {
  console.log('Client connected');
  connections.add(connection);

  connection.socket.on('message', message => {
    console.log("Received message from client:", message.toString());
  });

  connection.socket.on('close', () => {
    console.log('Client disconnected');
    connections.delete(connection);
  });

  connection.socket.on('error', (error) => {
    console.error('WebSocket error:', error);
    connections.delete(connection);
  });
});

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
  try {
    const newItem = await db.insert(foundItems).values({ name, description, location, contact, date_lost }).returning().get();
    if (newItem) {
      broadcast({ type: "NEW_LOST_ITEM", payload: newItem });
      reply.send({ message: "Item added by admin", item: newItem });
    } else {
      reply.status(500).send({ error: "Failed to add item or retrieve it after adding." });
    }
  } catch (error) {
    fastify.log.error(error, "Error adding lost item by admin");
    reply.status(500).send({ error: "Internal server error while adding item." });
  }
});

// User reports item (lost or found)
fastify.post("/user/report", { preHandler: verifyUser }, async (req, reply) => {
  const { name, description, location, contact, date_reported, type} = req.body;
  const userResults = await db.select().from(users).where(eq(users.email, req.user.email));

  const user = userResults[0];
  if (!user) {
    return reply.status(404).send({ error: "User not found" });
  }

  try { 
    const newReport =await db.insert(reportedItems).values({
      name,
      description,
      location,
      contact,
      date_reported,
      type,
      status: "pending",
      user_email: req.user.email,
      reporterID: user.id
    }).returning().get();

    if (newReport) {
      broadcast({ type: "NEW_REPORT", payload: newReport });
      reply.send({ message: "Report submitted", report: newReport });
    } else {
      reply.status(500).send({ error: "Failed to add report or retrieve it." });
    }
  } catch (error) {
    fastify.log.error(error, "Error submitting report by user");
    reply.status(500).send({ error: "Internal server error while submitting report." });
  }
});

// Admin gets all reports
fastify.get("/admin/reports", { preHandler: verifyAdmin }, async (req, reply) => {
  const reports = await db.select().from(reportedItems).all();
  reply.send({ reports });
});

// Admin verifies report (adds to lost items)
fastify.post("/admin/reports/:id/approve", { preHandler: verifyAdmin }, async (req, reply) => {
  const reportIdParam = req.params.id;
  const reportId = Number(reportIdParam);

  if (isNaN(reportId) || !isFinite(reportId)) {
    return reply.status(400).send({ error: "Invalid report ID format. ID must be a finite number." });	
  }

  try {
    const report = await db.select().from(reportedItems).where(eq(reportedItems.id, reportId)).get();
    if (!report) return reply.status(404).send({ error: "Report not found" });

    let approvedItem;

    if (report.type === "found") {
      approvedItem = await db.insert(foundItems).values({
        name: report.name,
        description: report.description,
        location: report.location,
        contact: report.contact,
        date_found: report.date_reported
      }).returning().get();
   } else if (report.type === "lost") {
      approvedItem = await db.insert(lostItems).values({
        name: report.name,
        description: report.description,
        location: report.location,
        contact: report.contact,
        owner: report.user_email,
        date_lost: report.date_reported
      }).returning().get();
    } else {
      fastify.log.warn(`Unknown report type: ${report.type} for report ID ${reportId}`);
      return reply.status(400).send({ error: `Invalid report type: ${report.type}` });
    }
    if (!approvedItem){
      return reply.status(500).send({ error: "Failed to create item from report." });
    }

    await db.delete(reportedItems).where(eq(reportedItems.id, reportId)).run();

    broadcast({ type: "REPORT_APPROVED", payload: { reportId: reportId, approvedItem: approvedItem } });
    broadcast({ type: "NEW_ITEM_APPROVED", payload: approvedItem });
    reply.send({ message: `Report approved and added to ${report.type === 'found' ? 'found items' : 'lost items'}`, item: approvedItem });
  } catch (error) {
    fastify.log.error(error, `Error approving report ID ${reportId}`);
    reply.status(500).send({ error: "Internal server error while approving report." });
  }
});

fastify.get("/found-items", { preHandler: verifyMultiple }, async (req, reply) => {
  const items = await db.select().from(foundItems).all();
  reply.send({ items });
});

fastify.get("/lost-items", { preHandler: verifyMultiple }, async (req, reply) => {
  const items = await db.select().from(lostItems).all();
  reply.send({ items });
});

fastify.get("/", async (req, reply) => {
  return { message: "Lost & Found API is running!" };
});

const host = '0.0.0.0';
const port = process.env.PORT || 3000;
fastify.listen({ port, host}, (err) => {
  if (err) throw err;
  console.log(`🚀 Server running at http://${host}:${port}`);
});
