import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const views = pgTable("views", {
  id: serial("id").primaryKey(),
  path: text("path"),
  ip: text("ip"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isp: text("isp"),
  user_agent: text("user_agent"),
  date: timestamp("date"),
});

export const view_counts = pgTable("view_counts", {
  id: serial("id").primaryKey(),
  path: text("path"),
  count: integer("count"),
});
