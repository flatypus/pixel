"use client";

import { env } from "process";
import { NestedObject } from "@/types/entry";
import { useEffect, useState } from "react";
import Display from "@/components/Display";

const PUBLIC_API_URL = env.NEXT_PUBLIC_API_URL;

export default function Page({ params }: { params: { id: string } }) {
  const [all_data, setAllData] = useState<NestedObject>({});
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    fetch(`${PUBLIC_API_URL}/views/${id}`)
      .then((r) => r.json())
      .then((data) => setAllData(data));
  }, [id]);

  return (
    <main>
      <h1>Tracking: {id}</h1>
      <Display data={all_data} />
    </main>
  );
}
