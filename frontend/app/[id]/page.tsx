"use client";

import { env } from "process";
import { NestedObject } from "@/types/entry";
import { useEffect, useState } from "react";
import { config } from "dotenv";
import Display from "@/components/Display";

config();

const PUBLIC_API_URL = env.NEXT_PUBLIC_API_URL;

export default function Page({ params }: { params: { id: string } }) {
  const [all_data, setAllData] = useState<NestedObject>({});
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    fetch(`${PUBLIC_API_URL ?? "http://localhost:4000"}/views/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    })
      .then((r) => r.json())
      .then((data) => setAllData(data));
  }, [id]);

  return (
    <main className="w-full text-white">
      <h1 className="p-4">Tracking: {id}</h1>
      <Display data={all_data} />
    </main>
  );
}
