import { config } from "dotenv";
import { cors } from "@elysiajs/cors";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { Elysia } from "elysia";
import { sql, eq, asc } from "drizzle-orm";
import { views } from "./schema";
import * as schema from "./schema";
import fetch from "node-fetch";
import outdent from "outdent";
import postgres from "postgres";

config();

const DATABASE_URL = process.env.DATABASE_URL;
const BLACKLIST = ["localhost:", "127.0.0.1"];
const CHUNK_SIZE = 5000;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const app = new Elysia();
app.use(cors());

const transparentPngBuffer = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489000000017352474200aece1ce90000000b494441541857636000020000050001aad5c8510000000049454e44ae426082",
  "hex",
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

async function queryAndRelease<T>(
  run: (db: PostgresJsDatabase<typeof schema>) => Promise<T>,
) {
  const queryClient = postgres(DATABASE_URL!);
  const db = drizzle(queryClient, { schema });
  const result = await run(db);
  await queryClient.end();
  return result;
}

app
  .get("/", () => new Response("Hi! Pixel server is up :)"))
  .get("/.well-known/health-check", () => new Response("OK"))
  .get("/views/:id", async ({ params: { id }, query: { page } }) => {
    console.log(`Fetching ${id} page ${page}`);
    const result = await queryAndRelease((db) => {
      return db.query.views.findMany({
        where: eq(views.path, id),
        columns: {
          ip: true,
          country: true,
          region: false,
          city: true,
          latitude: true,
          longitude: true,
          isp: false,
          user_agent: false,
          host: true,
          pathname: true,
          date: true,
        },
        orderBy: [asc(views.date)],
        limit: CHUNK_SIZE,
        offset: page ? parseInt(page) * CHUNK_SIZE : 0,
      });
    });

    return new Response(
      JSON.stringify({ finished: result.length < CHUNK_SIZE, data: result }),
      {
        headers: {
          "content-type": "application/json",
        },
      },
    );
  })

  .get("/:id", async ({ params: { id }, query: { type }, request }) => {
    const referrer = request.headers.get("referer");
    const { host, pathname } = referrer
      ? new URL(referrer)
      : {
          host: "",
          pathname: "",
        };

    let result;
    if (!BLACKLIST.some((h) => host.startsWith(h))) {
      const user_agent = request.headers.get("user-agent");
      const ip_list = request.headers.get("x-forwarded-for")?.split(",");
      const ip = ip_list?.at(0)?.trim() || "";
      const ip_info = await fetch(`http://ip-api.com/json/${ip}`);
      const ip_info_json = (await ip_info.json()) as IPInfo;
      const { country, region, city, lat, lon, isp } = ip_info_json;

      result = await queryAndRelease<
        postgres.RowList<Record<string, number>[]>
      >(async (db) => {
        await db.insert(views).values({
          path: id,
          ip: ip,
          country: country,
          region: region,
          city: city,
          latitude: lat?.toString(),
          longitude: lon?.toString(),
          isp: isp,
          user_agent: user_agent,
          host: host,
          pathname: pathname,
          date: new Date(),
        });

        return await db.execute(
          sql`
            INSERT INTO view_counts (path, count)
            VALUES (${id}, 1)
            ON CONFLICT (path) DO UPDATE
            SET count = view_counts.count + 1
            WHERE view_counts.path = ${id}
            RETURNING count;
          `,
        );
      });
    }

    if (type === "tracker") {
      return new Response(
        outdent`
        <html>
          <body>
            <span style="font-size: 1px; color: #FFFFFF01">${
              result ? result[0].count : 0
            }</span>
          </body>
        </html>`,
        {
          headers: {
            "content-type": "text/html",
          },
        },
      );
    }

    return new Response(transparentPngBuffer, {
      headers: {
        "content-type": "image/png",
      },
    });
  })
  .listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
