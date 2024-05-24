import Head from "next/head";
import { v4 as uuidv4 } from "uuid";

export default function Page() {
  const uuid = uuidv4();
  return (
    <main
      className="w-[800px] max-w-[calc(100%-2rem)] p-8 text-2xl text-white"
      style={{ margin: "auto" }}
    >
      <Head>
        <title>pixel | a simple view tracker</title>
      </Head>
      <h1>pixel | a simple view tracker</h1>
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
