// db/schema.js
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Define the schema
export const lostItems = sqliteTable("lost_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  contact: text("contact").notNull(),
  date_lost: text("date_lost").notNull(),
});
