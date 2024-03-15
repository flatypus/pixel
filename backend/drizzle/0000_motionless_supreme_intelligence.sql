CREATE TABLE IF NOT EXISTS "view_counts" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text,
	"count" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text,
	"ip" text,
	"country" text,
	"region" text,
	"city" text,
	"latitude" text,
	"longitude" text,
	"isp" text,
	"user_agent" text,
	"date" timestamp
);
