import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

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

app
  .get("/:id", ({ params: { id }, request }) => {
    console.log(
      `Hello Elysia ${id} ${request.headers.get(
        "user-agent"
      )} ${request.headers.get("x-forwarded-for")}`
    );
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
