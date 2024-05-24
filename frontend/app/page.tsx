import { v4 as uuidv4 } from "uuid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "pixel | a simple view tracker",
};

export default function Page() {
  const uuid = uuidv4();
  return (
    <main className="m-auto w-[800px] max-w-[calc(100%-2rem)] p-8 text-2xl text-white">
      <h1 className="mb-4">pixel | a simple view tracker</h1>
      <p>
        Embed{" "}
        <a href={`https://pixel.flatypus.me/${uuid}`} target="_blank">
          https://pixel.flatypus.me/{uuid}
        </a>{" "}
        in your website to track views.
      </p>
      <p>
        Visit{" "}
        <a href={`https://view.flatypus.me/${uuid}`} target="_blank">
          https://view.flatypus.me/{uuid}
        </a>{" "}
        to view stats.
      </p>
    </main>
  );
}
