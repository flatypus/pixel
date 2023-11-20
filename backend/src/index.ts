import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fetch from "node-fetch";
import { pgTable, serial, text } from "drizzle-orm/pg-core";

config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const queryClient = postgres(DATABASE_URL);

const db = drizzle(queryClient);

const app = new Elysia();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

const transparentPngBuffer = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489000000017352474200aece1ce90000000b494441541857636000020000050001aad5c8510000000049454e44ae426082",
  "hex"
);

type IPInfo = {
  query: string;
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
};

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
});

app
  .get("/:id", async ({ params: { id }, request }) => {
    const user_agent = request.headers.get("user-agent");
    const ip = request.headers.get("x-forwarded-for");
    const ip_info = await fetch(`http://ip-api.com/json/${ip}`);
    const ip_info_json = (await ip_info.json()) as IPInfo;
    const { country, region, city, lat, lon, isp } = ip_info_json;

    db.insert(views).values({
      path: id,
      ip: ip,
      country: country,
      region: region,
      city: city,
      latitude: lat.toString(),
      longitude: lon.toString(),
      isp: isp,
      user_agent: user_agent,
    });

    return new Response(transparentPngBuffer, {
      headers: {
        "content-type": "image/png",
      },
    });
  })
  .listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
