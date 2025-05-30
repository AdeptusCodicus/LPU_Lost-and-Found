import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const foundItems = sqliteTable("found_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  contact: text("contact").notNull(),
  date_found: text("date_found").notNull(),
  status: text("status").$default('available').notNull(),
});

export const lostItems = sqliteTable("lost_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  contact: text("contact").notNull(),
  date_lost: text("date_lost").notNull(),
  status: text("status").$default('missing').notNull(),
});

export const reportedItems = sqliteTable("reported_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  contact: text("contact").notNull(),
  date_reported: text("date_reported").notNull(),
  type: text("type").notNull(), // 'found' or 'lost'
  status: text("status").notNull(), // 'pending', 'approved', etc.
  user_email: text("user_email").notNull(),
  reporterID: integer("reporterID").references(() => users.id)
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isVerified: integer("is_verified", { mode: "boolean" }).$default(false).notNull(),
  verificationOtp: text("verification_otp"),
  verificationOtpExpiresAt: integer("verification_otp_expires_at", { mode: 'timestamp_ms' }),
  passwordResetOtp: text("password_reset_otp"),
  passwordResetOtpExpiresAt: integer("password_reset_otp_expires_at", { mode: 'timestamp_ms' }),
  pendingPasswordChangeOtp: text("pending_password_change_otp"),
  pendingPasswordChangeOtpExpiresAt: integer("pending_password_change_otp_expires_at", { mode: 'timestamp_ms' }),
  pendingNewPasswordHash: text("pending_new_password_hash")
});
