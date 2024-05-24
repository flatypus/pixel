import { useState } from "react";
import type { NestedObject } from "../../types/entry";

function ArrowDown() {
  return (
    <svg
      className="mt-1"
      enableBackground="new 0 0 960 560"
      fill="#FFFFFF"
      id="Capa_1"
      version="1.1"
      viewBox="0 0 960 560"
      width={24}
      x="0px"
      xmlns="http://www.w3.org/2000/svg"
      y="0px"
    >
      <g id="Rounded_Rectangle_33_copy_4_1_">
        <path d="M480,344.181L268.869,131.889c-15.756-15.859-41.3-15.859-57.054,0c-15.754,15.857-15.754,41.57,0,57.431l237.632,238.937   c8.395,8.451,19.562,12.254,30.553,11.698c10.993,0.556,22.159-3.247,30.555-11.698l237.631-238.937   c15.756-15.86,15.756-41.571,0-57.431s-41.299-15.859-57.051,0L480,344.181z" />
      </g>
      <script id="bw-fido2-page-script" />
    </svg>
  );
}

export function PathList({
  data,
  path,
  setPath,
}: {
  data: NestedObject;
  path: string[];
  setPath: (path: string[]) => void;
}) {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  return (
    <div className="ml-4 flex w-[92%] flex-col">
      {Object.keys(data).map((key) => (
        <div key={key} className="flex flex-col items-start">
          <button
            onClick={() => {
              setOpen({ ...open, [key]: !open[key] });
              setPath(path.concat(key));
            }}
            className="flex flex-row items-center justify-between"
          >
            <span className="whitespace-nowrap">
              {path.length > 0 && "/"}
              {key}
            </span>
            {Object.keys(data[key].subdir).length > 0 && (
              <span
                className="transition-all duration-300 ease-in-out"
                style={{
                  rotate: open[key] ? "0deg" : "-90deg",
                }}
              >
                <ArrowDown />
              </span>
            )}
          </button>
          <div className={open[key] ? "block" : "hidden"}>
            {Object.keys(data[key].subdir).length > 0 && (
              <button
                className="ml-4"
                onClick={() => {
                  setPath([...path, key, "/"]);
                }}
              >
                /
              </button>
            )}
            <PathList
              data={{
                ...data[key].subdir,
              }}
              path={[...path, key]}
              setPath={setPath}
            ></PathList>
          </div>
        </div>
      ))}
    </div>
  );
}
