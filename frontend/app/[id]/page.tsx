import { config } from "dotenv";
import { env } from "process";
import { NestedObject } from "@/types/entry";
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

  const res = await fetch(
    `${PUBLIC_API_URL ?? "http://localhost:4000"}/views/${id}`,
  );

  const data = (await res.json()) as NestedObject;

  return (
    <main className="w-full text-white">
      <h1 className="p-4">Tracking: {id}</h1>
      <Display data={data} />
    </main>
  );
}
