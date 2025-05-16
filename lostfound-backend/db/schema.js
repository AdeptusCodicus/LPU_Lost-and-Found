import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const lostItems = sqliteTable("lost_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  contact: text("contact").notNull(),
  date_lost: text("date_lost").notNull(),
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
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});
