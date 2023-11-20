import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app
  .get("/:id", ({ params: { id }, request }) => {
    return `Hello Elysia ${id} ${request.headers.get(
      "user-agent"
    )} ${request.headers.get("x-forwarded-for")}`;
  })
  .listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
