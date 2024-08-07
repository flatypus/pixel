import { config } from "dotenv";
import { Entry, NestedObject } from "@/types/entry";
import { env } from "process";
import Display from "@/components/Display";

config();

const PUBLIC_API_URL = env.NEXT_PUBLIC_API_URL;

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Tracking: ${params.id}`,
  };
}
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  let finished = false;
  let result: Entry[] = [];
  let page = 0;

  while (!finished) {
    const res = await fetch(
      `${PUBLIC_API_URL ?? "http://localhost:4000"}/views/${id}?page=${page}`,
      { next: { revalidate: 60 } },
    );
    const response = (await res.json()) as {
      data: Entry[];
      finished: boolean;
    };
    result = result.concat(response.data);
    finished = response.finished;
    page++;
  }

  let structure: NestedObject = {
    "Unknown source": { subdir: {}, pages: [] },
  };

  for (const row of result) {
    if (!row.ip || !row.country) continue;
    if (!row.host || !row.pathname) {
      structure["Unknown source"].pages.push(row);
      continue;
    }
    const parts = [row.host, ...row.pathname.split("/").filter(Boolean)];
    let current = structure;

    while (parts.length) {
      const part = parts.shift() as string;
      if (!current[part]) {
        current[part] = { subdir: {}, pages: [] };
      }
      if (parts.length === 0) {
        current[part].pages.push(row);
        break;
      }
      current = current[part].subdir;
    }
  }

  return (
    <main className="w-full text-white">
      <h1 className="p-4">Tracking: {id}</h1>
      <Display data={structure} />
    </main>
  );
}
