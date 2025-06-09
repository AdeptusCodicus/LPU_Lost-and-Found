import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/libsql";
import { users, foundItems, lostItems, reportedItems } from "./db/schema.js";
import { eq, and, asc, desc } from "drizzle-orm";
import { createClient } from "@libsql/client";
import fastifyWebsocket from "@fastify/websocket";
import crypto from "crypto";
import { sendVerificationEmail } from "./emailService.js";
import { sendPasswordChangedNotification } from "./emailService.js";
import { sendPasswordResetEmail } from "./emailService.js";
import { sendPasswordChangeConfirmationEmail } from "./emailService.js";

function generateOtp(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

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
  for (const conn of connections) {
    try {
      if (conn.readyState === 1) {
        conn.send(message);
      } else {
        console.warn(`Skipping send to client because WebSocket readyState is: ${conn.readyState}`);
      }
    } catch (error) {
      console.error("Error sending message via WebSocket:", error);
    }
  }
}

function broadcastToAdmins(data) {
  const message = JSON.stringify(data);
  console.log("Broadcasting message to ADMINS:", message);
  for (const conn of connections){
    if (conn.userData && conn.userData.email && conn.userData.email.endsWith("@lpuadmin.edu.ph" || "somedudein@gmail.com")) { //remove gmail in prod
      try {
        if (conn.readyState === 1){
          conn.send(message);
          console.log(`Sent admin message to: ${conn.userData.email}`);
        } else {
          console.warn(`Skipping send to admin ${conn.userData.email} because WebSocket readyState is: ${conn.readyState}`);
        }
      } catch (error) {
        console.error(`Error sending message to admin ${conn.userData.email}:`, error);
      }
    }
  }
} 

function broadcastToUserByEmail(userEmail, data) {
  if (!userEmail) {
    console.warn("broadcastToUserByEmail called without a userEmail.");
    return;
  }
  const message = JSON.stringify(data);
  console.log(`Attempting to broadcast message to USER ${userEmail}:`, message);
  let foundUserConnection = false;
  for (const conn of connections) {
    if (conn.userData && conn.userData.email === userEmail) {
      foundUserConnection = true;
      try {
        if (conn.readyState === 1){
          conn.send(message);
          console.log(`Sent message to user: ${userEmail} via connection.`);
        } else {
          console.warn(`Skipping send to user ${userEmail} (connection not open). State: ${conn.readyState}`);
        }
      } catch (error) {
        console.error(`Error sending message to user ${userEmail} via connection:`, error);
      }
    }
  }
  if (!foundUserConnection) {
    console.log(`No active WebSocket connection found for user: ${userEmail} ti send targeted message.`);
  }
}

fastify.get("/ws", {websocket: true}, (connection, req) => {
  try {  
    const token = req.query.token;
    if (!token){
      console.log("WS connection attempt without token. Closing.");
      connection.close(1008, "No token provided");
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Client connected. Initial check of connection object (which is a ws.WebSocket):');
    console.log("connection.readyState:", connection.readyState);
    connections.add(connection);

    connection.userData = decoded;

    connection.on('message', message => {
      console.log("Received message from client:", message.toString());
    });

    connection.on('close', (code, reason) => { 
      console.log(`Client disconnected. Code: ${code}, Reason: ${reason ? reason.toString() : 'N/A'}`);
      connections.delete(connection);
    });

    connection.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      connections.delete(connection);
    });
  } catch (error){
      console.log("WS connection attempt with invalid token. Closing.", error.message);
      connection.close(1008, "Invalid token");
  }
});

function verifyAdmin(req, reply, done) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return reply.status(401).send({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.email.endsWith("@gmail.com")) { //remove gmail in prod
      return reply.status(403).send({ error: "Admin access only" });
    }
    req.user = decoded;
    done();
  } catch (err) {
    fastify.log.warn({ error: err.message }, "User verification failed" );
    reply.status(401).send({ error: "Unauthorized" });
  }
}

function verifyUser(req, reply, done) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return reply.status(401).send({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.email.endsWith("@lpunetwork.edu.ph" || "@gmail.com")) { //Remove gmail in prod
      return reply.status(403).send({ error: "User access only" }); 
    }
    req.user = decoded;
    done();
  } catch (err) {
    fastify.log.warn({ error: err.message }, "User verification failed" );
    reply.status(401).send({ error: "Unauthorized" });
  }
}

function verifyMultiple(req, reply, done) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return reply.status(401).send({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.email.endsWith("@lpunetwork.edu.ph") && !decoded.email.endsWith("@lpuadmin.edu.ph") && !decoded.email.endsWith("@gmail.com")) { //remove gmail in prod
      return reply.status(403).send({ error: "Admin or User access only" });
    }
    req.user = decoded;
    done();
  } catch (err) {
    fastify.log.warn({ error: err.message }, "User verification failed" );
    reply.status(401).send({ error: "Unauthorized" });
  }
}

fastify.post("/auth/register", async (req, reply) => {
  const { username, email, password } = req.body;

  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser){
    return reply.status(409).send({error: "Email already in use! Please try a different email."});
  }
  
  if (!email.endsWith("@lpunetwork.edu.ph") && !email.endsWith("@lpuadmin.edu.ph") && !email.endsWith("@gmail.com")) { //remove gmail in prod
    return reply.status(400).send({ error: "Invalid email domain" });
  }
  
  try {
    const hashedUserPassword = await bcrypt.hash(password, 10);

    const plainOtp = generateOtp(); 
    const hashedOtp = crypto.createHash('sha256').update(plainOtp).digest('hex'); 
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await db.insert(users).values({ 
      username,
      email, 
      password: hashedUserPassword,
      isVerified: false,
      verificationOtp: hashedOtp,                 
      verificationOtpExpiresAt: otpExpires      
    }).returning().get();

    if (!newUser) {
      fastify.log.error({ email }, "Failed to insert new user into database or retrieve it after insert.");
      return reply.status(500).send({ error: "Registration failed due to a server error." });
    }

    const emailResult = await sendVerificationEmail(newUser.email, plainOtp); 

    if (!emailResult.success) {
      fastify.log.error(`Failed to send verification OTP email to ${newUser.email}`, emailResult.errorDetail);
    }

    reply.send({ message: "Registered successfully. Please check your email for the OTP to verify your account.", userId: newUser.id });
  } catch (dbError) {
    fastify.log.error({ error: dbError, email }, "Database error during user registration.");
    reply.status(500).send({ error: "Registration failed due to a database error." });
  }
});

fastify.post("/auth/verify-email", async (req, reply) => { 
  const { email, otp } = req.body;

  if (!email || !otp) {
    return reply.status(400).send({ error: "Email and OTP are required." });
  }

  try{
    const hashedOtpToCompare = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await db.select().from(users).where(eq(users.email, email)).get(); 

    if (!user) {
      return reply.status(400).send({ error: "Invalid email or OTP. Please try again or contact support." });
    }

    if (user.isVerified) {
      return reply.status(200).send({ message: "Account already verified. You can log in." });
    }

    if (!user.verificationOtp || user.verificationOtp !== hashedOtpToCompare) {
        return reply.status(400).send({ error: "Invalid OTP." });
    }

    if (user.verificationOtpExpiresAt === null || new Date() > new Date(user.verificationOtpExpiresAt)) {
      await db.update(users).set({
        verificationOtp: null,
        verificationOtpExpiresAt: null
      }).where(eq(users.id, user.id)).run();
      return reply.status(400).send({ error: "OTP has expired. Please request a new one or try registering again." });
    }

    await db.update(users).set({
      isVerified: true,
      verificationOtp: null, 
      verificationOtpExpiresAt: null,
      verificationToken: null, 
      verificationExpires: null
    }).where(eq(users.id, user.id)).run();

    reply.send({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    fastify.log.error(error, "Error during OTP email verification.");
    reply.status(500).send({ error: "Internal server error during email verification." });
  }
});

fastify.post("/auth/login", async (req, reply) => {
  const { email, password } = req.body;
  const client = await db.select().from(users).where(eq(users.email, email)).get();
  if (!client || !(await bcrypt.compare(password, client.password))) {
    return reply.status(401).send({ error: "Invalid credentials" });
  }

  if (!client.isVerified) {
    return reply.status(403).send({ error: "Account not verified. Please check your email for the verification link.", });
  }

  const token = jwt.sign({ id: client.id, email: client.email }, process.env.JWT_SECRET);
  const user = {id: client.id, username:client.username, email: client.email};
  reply.send({ token, user });
});

fastify.post("/auth/change-password", { preHandler: verifyMultiple }, async (req, reply) => { 
  const { currentPassword, newPassword } = req.body;
  const userId= req.user.id;
  const userEmail = req.user.email;

  if(!currentPassword || !newPassword) {
    return reply.status(400).send({ error: "Current password and new password are required." });
  }
  if (newPassword.length < 6) {
    return reply.status(400).send({ error: "New password must be at least 6 characters long." });
  }
  if (currentPassword === newPassword) {
    return reply.status(400).send({ error: "New password cannot be the same as the current password." });
  }

  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return reply.status(404).send({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if(!isMatch) {
      return reply.status(401).send({ error: "Incorrect current password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const plainOtp = generateOtp();
    const hashedOtp = crypto.createHash('sha256').update(plainOtp).digest('hex');
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await db.update(users)
      .set({ 
        pendingPasswordChangeOtp: hashedOtp,        
        pendingPasswordChangeOtpExpiresAt: otpExpires, 
        pendingNewPasswordHash: hashedNewPassword
      })
      .where(eq(users.id, userId)).run();
    
    const emailResult = await sendPasswordChangeConfirmationEmail(userEmail, plainOtp);

    if (!emailResult.success){
      fastify.log.error(`Failed to send password change confirmation OTP to ${userEmail}`, emailResult.errorDetail);
    }

    reply.send({ message: "Password change initiated. Please check your email for the OTP to confirm the change." });
  } catch (error) {
    fastify.log.error(error, `Error initiating password change for user ID ${userId}`);
    reply.status(500).send({ error: "Internal server error while initiating password change." });
  }
});

fastify.post("/auth/confirm-password-change", async (req, reply) => {
  const { email, otp } = req.body;

  if (!otp || !email ) {
    return reply.status(400).send({ error: "Confirmation OTP and email are required." });
  }

  try {
    const hashedOtpToCompare = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.pendingPasswordChangeOtp, hashedOtpToCompare)
      ))
      .get();

    if (!user) {
      return reply.status(400).send({ error: "Invalid or expired password change OTP. Please try again." });
    }

    if (user.pendingPasswordChangeOtpExpiresAt == null || new Date() > new Date(user.pendingPasswordChangeOtpExpiresAt)) {
      await db.update(users).set({
        pendingPasswordChangeOtp: null,
        pendingPasswordChangeOtpExpiresAt: null,
        pendingNewPasswordHash: null,
        pendingPasswordChangeToken: null,
        pendingPasswordChangeExpires: null
      }).where(eq(users.id, user.id)).run();
      return reply.status(400).send({ error: "Password change OTP has expired. Please initiate the password change again." });
    }

    if (!user.pendingNewPasswordHash) {
        fastify.log.error(`User ID ${user.id} confirmed password change OTP, but no pendingNewPasswordHash found.`);
        await db.update(users).set({
            pendingPasswordChangeOtp: null,
            pendingPasswordChangeOtpExpiresAt: null,
            pendingNewPasswordHash: null,
            pendingPasswordChangeToken: null,
            pendingPasswordChangeExpires: null
        }).where(eq(users.id, user.id)).run();
        return reply.status(500).send({ error: "Could not finalize password change. Please try again." });
    }

    await db.update(users)
      .set({
        password: user.pendingNewPasswordHash,
        pendingPasswordChangeOtp: null,
        pendingPasswordChangeOtpExpiresAt: null,
        pendingNewPasswordHash: null,
        pendingPasswordChangeToken: null,
        pendingPasswordChangeExpires: null
      })
      .where(eq(users.id, user.id))
      .run();

    await sendPasswordChangedNotification(user.email);

    reply.send({ message: "Password has been changed successfully. You can now use your new password." });

  } catch (error) {
    fastify.log.error(error, "Error confirming password change with OTP.");
    reply.status(500).send({ error: "Internal server error while confirming password change." });
  }
});

fastify.post("/auth/forgot-password", async (req, reply) => {
  const { email } = req.body;
  if (!email) {
    return reply.status(400).send({ error: "Email is required." });
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).get();

    const genericMessage = "If an account with that email exists and is verified, a password reset OTP has been sent."; // Updated message
    if (!user || !user.isVerified) {
      fastify.log.info(`Password reset requested for non-existent or unverified email: ${email}`);
      return reply.send({ message: genericMessage });
    }

    const plainOtp = generateOtp();
    const hashedOtp = crypto.createHash('sha256').update(plainOtp).digest('hex'); 
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    await db.update(users)
      .set({
        passwordResetOtp: hashedOtp,              
        passwordResetOtpExpiresAt: otpExpires  
      })
      .where(eq(users.id, user.id)).run();
    
      const emailResult = await sendPasswordResetEmail(user.email, plainOtp);

      if(!emailResult.success) {
        fastify.log.error(`Failed to send password reset OTP to ${user.email}`, emailResult.errorDetail);
      }

      reply.send({ message: genericMessage });
  } catch (error) {
    fastify.log.error(error, `Error in forgot-password for email: ${email}`);
    reply.send({ message: "If an account with that email exists and is verified, a password reset OTP has been sent."});
  }
});

fastify.post("/auth/reset-password", async (req, reply) => {
  const { email, otp } = req.body; 
  const { newPassword } = req.body;

  if (!otp || !email || !newPassword) {
    return reply.status(400).send({ error: "OTP, email, and new password are required." });
  }
  if (newPassword.length < 6) {
    return reply.status(400).send({ error: "New password must be at least 6 characters long." });
  }

  try {
    const hashedOtpToCompare = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await db.select().from(users).where(and(eq(users.email, email), eq(users.passwordResetOtp, hashedOtpToCompare))).get(); // Check against OTP field

    if (!user) {
      return reply.status(400).send({ error: "Invalid or expired password reset OTP." });
    }
    
    if (user.passwordResetOtpExpiresAt == null || new Date() > new Date(user.passwordResetOtpExpiresAt)) {
      await db.update(users).set({
        passwordResetOtp: null,
        passwordResetOtpExpiresAt: null,
        passwordResetToken: null,
        passwordResetExpires: null
      }).where(eq(users.id, user.id)).run();
      return reply.status(400).send({ error: "Password reset OTP has expired. Please request a new one."});
    }

    const isSameAsOldPassword = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOldPassword) {
      return reply.status(400).send({ error: "New password cannot be the same as the old password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({
        password: hashedNewPassword,
        passwordResetOtp: null,
        passwordResetOtpExpiresAt: null,
        passwordResetToken: null,
        passwordResetExpires: null
      }).where(eq(users.id, user.id)).run();
    await sendPasswordChangedNotification(user.email);
    reply.send({ message: "Password has been reset successfully. You can now login with your new password." });
  } catch (error) {
    fastify.log.error(error, " Error resetting password with OTP.");
    reply.status(500).send({ error: "Internal server error while resetting password." });
  }
});

fastify.post("/auth/change-username", { preHandler: [verifyMultiple] }, async (req, reply) => {
  const { newUsername } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email; 

  if (!newUsername || newUsername.trim() === "") {
    return reply.status(400).send({ error: "New username cannot be empty." });
  }

  if (newUsername.length < 3) {
    return reply.status(400).send({ error: "New username must be at least 3 characters long." });
  }

  try {
    const updatedUser = await db.update(users)
      .set({ username: newUsername })
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username, email: users.email }) 
      .get();

    if (!updatedUser) {
      fastify.log.error(`Failed to update username for user ID ${userId} to ${newUsername}`);
      return reply.status(500).send({ error: "Failed to update username. Please try again." });
    }

    fastify.log.info(`User ${userEmail} (ID: ${userId}) successfully changed username to ${newUsername}`);

    reply.send({ message: "Username changed successfully.", user: { id: updatedUser.id, username: updatedUser.username, email: updatedUser.email } });

  } catch (error) {
    fastify.log.error(error, `Error changing username for user ID ${userId}`);
    reply.status(500).send({ error: "Internal server error while changing username." });
  }
});

fastify.post("/auth/resend-otp", async (req, reply) => {
  const { email, purpose } = req.body;

  if (!email || !purpose) {
    return reply.status(400).send({ error: "Email and purpose (e.g., 'verification', 'passwordReset', 'passwordChangeConfirmation') are required." });
  }

  if (purpose !== "verification" && purpose !== "passwordReset" && purpose !== "passwordChangeConfirmation") {
    return reply.status(400).send({ error: "Invalid purpose. Must be 'verification', 'passwordReset', or 'passwordChangeConfirmation'." });
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).get();

    if (!user) {
      if (purpose === "passwordReset" || purpose === "passwordChangeConfirmation") {
        fastify.log.info(`OTP resend (${purpose}) requested for non-existent email: ${email}`);
        return reply.send({ message: "If your email is registered and meets the criteria, an OTP will be sent." });
      }
      return reply.status(404).send({ error: "User not found." });
    }

    const plainOtp = generateOtp();
    const hashedOtp = crypto.createHash('sha256').update(plainOtp).digest('hex');
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    let emailResult;

    if (purpose === "verification") {
      if (user.isVerified) {
        return reply.status(400).send({ message: "Account is already verified." });
      }
      await db.update(users)
        .set({
          verificationOtp: hashedOtp,
          verificationOtpExpiresAt: otpExpires,
        })
        .where(eq(users.id, user.id))
        .run();
      
      emailResult = await sendVerificationEmail(user.email, plainOtp);
      if (!emailResult.success) {
        fastify.log.error(`Failed to resend verification OTP to ${user.email}`, emailResult.errorDetail);
      }
      fastify.log.info(`Verification OTP resent attempt to ${user.email}`);
      return reply.send({ message: "Verification OTP resent. Please check your email." });

    } else if (purpose === "passwordReset") {
      if (!user.isVerified) {
         fastify.log.info(`Password reset OTP resend requested for unverified email: ${email}`);
         return reply.send({ message: "If your email is registered and meets the criteria, an OTP will be sent." });
      }
      await db.update(users)
        .set({
          passwordResetOtp: hashedOtp,
          passwordResetOtpExpiresAt: otpExpires,
        })
        .where(eq(users.id, user.id))
        .run();

      emailResult = await sendPasswordResetEmail(user.email, plainOtp);
      if (!emailResult.success) {
        fastify.log.error(`Failed to resend password reset OTP to ${user.email}`, emailResult.errorDetail);
      }
      fastify.log.info(`Password reset OTP resent attempt to ${user.email}`);
      return reply.send({ message: "If your email is registered and meets the criteria, an OTP will be sent." });

    } else if (purpose === "passwordChangeConfirmation") {
      if (!user.pendingNewPasswordHash || !user.pendingPasswordChangeOtpExpiresAt) {
        fastify.log.info(`Password change confirmation OTP resend requested for ${email}, but no pending change found.`);
        return reply.status(400).send({ error: "No pending password change found to resend OTP for. Please initiate the password change again." });
      }
      await db.update(users)
        .set({
          pendingPasswordChangeOtp: hashedOtp,
          pendingPasswordChangeOtpExpiresAt: otpExpires,
        })
        .where(eq(users.id, user.id))
        .run();
      
      emailResult = await sendPasswordChangeConfirmationEmail(user.email, plainOtp);
      if (!emailResult.success) {
        fastify.log.error(`Failed to resend password change confirmation OTP to ${user.email}`, emailResult.errorDetail);
      }
      fastify.log.info(`Password change confirmation OTP resent attempt to ${user.email}`);
      return reply.send({ message: "Password change confirmation OTP resent. Please check your email." });
    }
    
    return reply.status(500).send({ error: "An unexpected error occurred processing the OTP purpose."});

  } catch (error) {
    fastify.log.error(error, `Error resending OTP for email ${email} and purpose ${purpose}`);
    return reply.status(500).send({ error: "An internal server error occurred while attempting to resend the OTP." });
  }
});

fastify.post("/admin/items", { preHandler: verifyAdmin }, async (req, reply) => {
  const { name, description, location, contact, date_found } = req.body;
  try {
    const newItem = await db.insert(foundItems).values({ 
      name, 
      description, 
      location, 
      contact, 
      date_found,
      status: 'available' 
    }).returning().get();
    if (newItem) {
      broadcast({ type: "NEW_FOUND_ITEM", payload: newItem });
      reply.send({ message: "Item added by admin", item: newItem });
    } else {
      reply.status(500).send({ error: "Failed to add item or retrieve it after adding." });
    }
  } catch (error) {
    fastify.log.error(error, "Error adding found item by admin");
    reply.status(500).send({ error: "Internal server error while adding item." });
  }
});

fastify.post("/user/report", { preHandler: verifyUser }, async (req, reply) => {
  const { name, description, location, contact, date_reported, type} = req.body;

  try { 
    const newReport = await db.insert(reportedItems).values({
      name,
      description,
      location,
      contact,
      date_reported,
      type,
      status: "pending",
      user_email: req.user.email,
      reporterID: req.user.id
    }).returning().get();

    if (newReport) {
      broadcastToAdmins({ type: "NEW_PENDING_REPORT", payload: newReport });
      if (newReport.type === "found"){
        reply.send({ message: "Report for FOUND item submitted, please surrender the item to the Student Affairs Office for verification.", report: newReport });
      } else if (newReport.type === "lost") {
        reply.send({message: "Report for LOST item submitted. You will be notified if a matching item is found or your report is approved for listing.", report: newReport});
      } else {
        fastify.log.warn(`Report submitted with unexpected type: ${newReport.type}`);
        reply.send({ message: "Report submitted", report: newReport});
      }
    } else {
      reply.status(500).send({ error: "Failed to add report or retrieve it." });
    }
  } catch (error) {
    fastify.log.error(error, "Error submitting report by user");
    reply.status(500).send({ error: "Internal server error while submitting report." });
  }
});

fastify.get("/user/my-reports", { preHandler: verifyUser }, async (req, reply) => {
  try {
    const userId = req.user.id;
    fastify.log.info({ userFromToken: req.user }, "User details");

    const reports = await db.select().from(reportedItems).where(eq(reportedItems.reporterID, userId)).orderBy(reportedItems.date_reported).all();

    if (reports.length === 0) {
      return reply.send({ message: "You have no pending reports", reports: [] });
    } else {
    reply.send({ reports });
    }
  } catch (error) {
    fastify.log.error(error, `Error fetching reports for user ID ${req.user.id}`);
    reply.status(500).send({ error: "Internal server error while fetching your reports." });
  }
});

fastify.get("/admin/reports", { preHandler: verifyAdmin }, async (req, reply) => {
  const reports = await db.select().from(reportedItems).all();
  reply.send({ reports });
});

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
    if (report.status === 'approved' || report.status === 'rejected') {
      return reply.status(400).send({ error: `Report already ${report.status}. Cannot process again.` });
    }

    if (report.type === "found") {
      approvedItem = await db.insert(foundItems).values({
        name: report.name,
        description: report.description,
        location: report.location,
        contact: report.contact,
        date_found: report.date_reported,
        status: 'available'
      }).returning().get();
   } else if (report.type === "lost") {
      approvedItem = await db.insert(lostItems).values({
        name: report.name,
        description: report.description,
        location: report.location,
        contact: report.contact,
        owner: report.user_email,
        date_lost: report.date_reported,
        status: 'missing'
      }).returning().get();
    } else {
      fastify.log.warn(`Unknown report type: ${report.type} for report ID ${reportId}`);
      return reply.status(400).send({ error: `Invalid report type: ${report.type}` });
    }
    if (!approvedItem){
      return reply.status(500).send({ error: "Failed to create item from report." });
    }

    const updatedReport = await db.update(reportedItems).set({status: "approved" }).where(eq(reportedItems.id, reportId)).returning().get();
    if (!updatedReport) {
      fastify.log.error(`Failed to update status to 'approved' for report ID ${reportId}. The item was created but report status update failed.`);
    }

    if (report.user_email) {
      broadcastToUserByEmail(report.user_email, { type: "REPORT_APPROVED", payload: { reportId: report.id, approvedItem: approvedItem } }); 
      broadcastToUserByEmail(report.user_email, {
        type: "YOUR_REPORT_STATUS_UPDATE",
        payload: {
          reportName: report.name,
          reportId: report.id,
          status: "approved",
          approvedItemDetails: approvedItem
        }
      });
    } else {
      fastify.log.warn(`Report ID ${reportId} was approved, but no user_email found on the report to send targeted notification.`);
    }
    broadcast({ type: "NEW_ITEM_APPROVED", payload: approvedItem }); 
    reply.send({ message: `Report approved and added to ${report.type === 'found' ? 'found items' : 'lost items'}. Report status updated.`, item: approvedItem, updated_report_status: updatedReport ? updatedReport.status : 'update_failed' });
  } catch (error) {
    fastify.log.error(error, `Error approving report ID ${reportId}`);
    reply.status(500).send({ error: "Internal server error while approving report." });
  }
});

fastify.post("/admin/reports/:id/reject", { preHandler: verifyAdmin }, async (req, reply) => {
  const reportIdParam = req.params.id;
  const reportId = Number(reportIdParam);

  if (isNaN(reportId) || !isFinite(reportId)) {
    return reply.status(400).send({ error: "Invalid report ID format. ID must be a finite number." });
  }

  try {
    const report = await db.select().from(reportedItems).where(eq(reportedItems.id, reportId)).get();
    if (!report) {
      return reply.status(404).send({ error: "Report not found" });
    }

    if (report.status === 'rejected' || report.status === 'approved') {
      return reply.status(400).send({ error: `Report already ${report.status}. Cannot process again.` });
    }

    const updatedReport = await db.update(reportedItems)
      .set({ status: "rejected" })
      .where(eq(reportedItems.id, reportId))
      .returning()
      .get();

    if (!updatedReport) {
      fastify.log.error(`Failed to update report ID ${reportId} to rejected status.`);
      return reply.status(500).send({ error: "Failed to update report status." });
    }

    if (report.user_email) { // Use original report for user_email and name
      broadcastToUserByEmail(report.user_email, {
        type: "YOUR_REPORT_STATUS_UPDATE",
        payload: {
          reportName: report.name,
          reportId: report.id,
          status: "rejected",
          // reason: "Optional reason can be added here if implemented" 
        }
      });
    } else {
      fastify.log.warn(`Report ID ${reportId} was rejected, but no user_email found on the report to send targeted notification.`);
    }

    broadcastToAdmins({ type: "REPORT_REJECTED", payload: updatedReport });

    reply.send({ message: "Report rejected successfully.", report: updatedReport });
  } catch (error) {
    fastify.log.error(error, `Error rejecting report ID ${reportId}`);
    reply.status(500).send({ error: "Internal server error while rejecting report." });
  }
});

fastify.post("/admin/found-items/:id/mark-claimed", { preHandler: verifyAdmin }, async (req, reply) => {
  const itemId = Number(req.params.id);
  if (isNaN(itemId) || !isFinite(itemId)) {
    return reply.status(400).send({ error: "Invalid item ID format." });
  }

  try {
    const itemToUpdate = await db.select().from(foundItems).where(eq(foundItems.id, itemId)).get();
    if (!itemToUpdate) {
      return reply.status(404).send({ error: "Found item not found." });
    }
    if (itemToUpdate.status === 'claimed') {
       return reply.status(400).send({ error: "Item already marked as claimed." });
    }

    const updatedItem = await db.update(foundItems)
      .set({ status: "claimed" })
      .where(eq(foundItems.id, itemId))
      .returning()
      .get();

    if (!updatedItem) {
      return reply.status(500).send({ error: "Failed to update item status." });
    }

    broadcast({ type: "FOUND_ITEM_STATUS_UPDATED", payload: updatedItem });

    reply.send({ message: "Found item marked as claimed.", item: updatedItem });
  } catch (error) {
    fastify.log.error(error, `Error marking found item ID ${itemId} as claimed by admin ${req.user.email}`);
    reply.status(500).send({ error: "Internal server error." });
  }
});

fastify.post("/admin/lost-items/:id/mark-found", { preHandler: verifyAdmin }, async (req, reply) => {
  const itemId = Number(req.params.id);
  if (isNaN(itemId) || !isFinite(itemId)) {
    return reply.status(400).send({ error: "Invalid item ID format." });
  }

  try {
    const itemToUpdate = await db.select().from(lostItems).where(eq(lostItems.id, itemId)).get();
    if (!itemToUpdate) {
      return reply.status(404).send({ error: "Lost item not found." });
    }
    if (itemToUpdate.status === 'found') {
       return reply.status(400).send({ error: "Item already marked as returned." });
    }

    const updatedItem = await db.update(lostItems)
      .set({ status: "found" })
      .where(eq(lostItems.id, itemId))
      .returning()
      .get();

    if (!updatedItem) {
      return reply.status(500).send({ error: "Failed to update item status." });
    }

    broadcast({ type: "LOST_ITEM_STATUS_UPDATED", payload: updatedItem });

    reply.send({ message: "Lost item marked as found.", item: updatedItem });
  } catch (error) {
    fastify.log.error(error, `Error marking lost item ID ${itemId} as found by admin ${req.user.email}`);
    reply.status(500).send({ error: "Internal server error." });
  }
});

fastify.post("/admin/item/:id/mark-expired", { preHandler: verifyAdmin }, async (req, reply) => {
  const itemId = Number(req.params.id);
  if (isNaN(itemId) || !isFinite(itemId)) {
    return reply.status(400).send({ error: "Invalid item ID format." });
  }

  try {
    let itemToUpdate;
    let itemType; 

    itemToUpdate = await db.select().from(foundItems).where(eq(foundItems.id, itemId)).get();
    if (itemToUpdate) {
      itemType = "found";
      if (itemToUpdate.status === 'claimed') {
        return reply.status(400).send({ error: "Found item is already claimed and cannot be marked as expired." });
      }
      if (itemToUpdate.status === 'expired') {
        return reply.status(400).send({ error: "Item is already marked as expired." });
      }
    } else {
      // If not in foundItems, try lostItems
      itemToUpdate = await db.select().from(lostItems).where(eq(lostItems.id, itemId)).get();
      if (itemToUpdate) {
        itemType = "lost";
        if (itemToUpdate.status === 'found') {
          return reply.status(400).send({ error: "Lost item has been marked as found and cannot be marked as expired." });
        }
        if (itemToUpdate.status === 'expired') {
          return reply.status(400).send({ error: "Item is already marked as expired." });
        }
      }
    }

    if (!itemToUpdate) {
      return reply.status(404).send({ error: "Item not found in either found or lost items." });
    }

    let updatedItem;
    if (itemType === "found") {
      updatedItem = await db.update(foundItems)
        .set({ status: "expired" })
        .where(eq(foundItems.id, itemId))
        .returning()
        .get();
    } else if (itemType === "lost") {
      updatedItem = await db.update(lostItems)
        .set({ status: "expired" })
        .where(eq(lostItems.id, itemId))
        .returning()
        .get();
    }

    if (!updatedItem) {
      return reply.status(500).send({ error: "Failed to update item status to expired." });
    }

    const broadcastType = itemType === "found" ? "FOUND_ITEM_STATUS_UPDATED" : "LOST_ITEM_STATUS_UPDATED";
    broadcast({ type: broadcastType, payload: updatedItem });

    reply.send({ message: `Item (type: ${itemType}) marked as expired.`, item: updatedItem });

  } catch (error) {
    fastify.log.error(error, `Error marking item ID ${itemId} as expired by admin ${req.user.email}`);
    reply.status(500).send({ error: "Internal server error." });
  }
});

fastify.delete("/admin/item/delete/:id", { preHandler: verifyAdmin }, async (req, reply) => {
  const itemId = Number(req.params.id);
  if (isNaN(itemId) || !isFinite(itemId)) {
    return reply.status(400).send({ error: "Invalid item ID format." });
  }

  try {
    let deletedItem;
    let itemType;

    const foundItemToDelete = await db.select().from(foundItems).where(eq(foundItems.id, itemId)).get();
    if (foundItemToDelete) {
      deletedItem = await db.delete(foundItems).where(eq(foundItems.id, itemId)).returning().get();
      itemType = "found";
    } else {
      const lostItemToDelete = await db.select().from(lostItems).where(eq(lostItems.id, itemId)).get();
      if (lostItemToDelete) {
        deletedItem = await db.delete(lostItems).where(eq(lostItems.id, itemId)).returning().get();
        itemType = "lost";
      }
    }

    if (!deletedItem) {
      return reply.status(404).send({ error: "Item not found in either found or lost items to delete." });
    }

    const broadcastType = itemType === "found" ? "FOUND_ITEM_DELETED" : "LOST_ITEM_DELETED";
    broadcast({ type: broadcastType, payload: { id: itemId } }); // Send ID of deleted item

    reply.send({ message: `Item (ID: ${itemId}, type: ${itemType}) deleted successfully.` });

  } catch (error) {
    fastify.log.error(error, `Error deleting item ID ${itemId} by admin ${req.user.email}`);
    reply.status(500).send({ error: "Internal server error while deleting item." });
  }
});

fastify.get("/found-items", { preHandler: verifyMultiple }, async (req, reply) => {
  const items = await db.select().from(foundItems).where(eq(foundItems.status, "available")).orderBy(desc(foundItems.id)).all();
  reply.send({ items });
});

fastify.get("/lost-items", { preHandler: verifyMultiple }, async (req, reply) => {
  const items = await db.select().from(lostItems).where(eq(lostItems.status, "missing")).orderBy(desc(lostItems.id)).all();
  reply.send({ items });
});

fastify.get("/admin/archive", { preHandler: verifyAdmin }, async (req, reply) => {
  const { type } = req.query; 
  
  if (!type || !['claimed', 'reunited', 'expired'].includes(type)) {
    return reply.status(400).send({ 
      error: "Invalid or missing 'type' query parameter. Must be 'claimed', 'reunited', or 'expired'." 
    });
  }

  try {
    let items = [];

    if (type === 'claimed') {
      const claimedItems = await db.select()
        .from(foundItems)
        .where(eq(foundItems.status, "claimed"))
        .orderBy(desc(foundItems.id))
        .all();
      
      items = claimedItems.map(item => ({
        ...item,
        date_reported: item.date_found, 
        itemType: 'Found'
      }));

    } else if (type === 'reunited') {
      const reunitedItems = await db.select()
        .from(lostItems)
        .where(eq(lostItems.status, "found"))
        .orderBy(desc(lostItems.id))
        .all();
      
      items = reunitedItems.map(item => ({
        ...item,
        date_reported: item.date_lost, 
        itemType: 'Lost',
        user_email: item.owner 
      }));

    } else if (type === 'expired') {
      const [expiredFoundItems, expiredLostItems] = await Promise.all([
        db.select()
          .from(foundItems)
          .where(eq(foundItems.status, "expired"))
          .orderBy(desc(foundItems.id))
          .all(),
        db.select()
          .from(lostItems)
          .where(eq(lostItems.status, "expired"))
          .orderBy(desc(lostItems.id))
          .all()
      ]);

      const mappedFoundItems = expiredFoundItems.map(item => ({
        ...item,
        date_reported: item.date_found,
        itemType: 'Found'
      }));

      const mappedLostItems = expiredLostItems.map(item => ({
        ...item,
        date_reported: item.date_lost,
        itemType: 'Lost',
        user_email: item.owner
      }));

      items = [...mappedFoundItems, ...mappedLostItems]
        .sort((a, b) => b.id - a.id);
    }

    reply.send({ items });

  } catch (error) {
    fastify.log.error(error, `Error fetching archive items of type: ${type}`);
    reply.status(500).send({ error: "Internal server error while fetching archive items." });
  }
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