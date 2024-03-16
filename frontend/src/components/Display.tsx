import { CityPieChart } from "./Pie.tsx";
import { Geo } from "./Geo.tsx";
import { Graph } from "./Graph.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Entry, NestedObject } from "../types/entry";

function ArrowDown() {
  return (
    <svg
      className="mt-1"
      enable-background="new 0 0 960 560"
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

function PathList({
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
    <div className="ml-4 flex flex-col">
      {Object.keys(data).map((key) => (
        <div key={key} className="flex flex-col items-start">
          <button
            onClick={() => {
              setOpen({ ...open, [key]: !open[key] });
              setPath(path.concat(key));
            }}
            className="flex flex-row items-center justify-between"
          >
            <span>
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

          {data[key].pages.length > 0 && open[key] && (
            <>
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
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Display({ data: all_data }: { data: NestedObject }) {
  const [data, setData] = useState<Entry[]>([]);
  const [path, setPath] = useState<string[]>([]);

  const recursiveFlatten = useCallback((obj: NestedObject) => {
    let result: Entry[] = [];
    for (const key in obj) {
      if (obj[key].pages.length > 0) {
        result = result.concat(obj[key].pages);
      }
      if (obj[key].subdir) {
        result = result.concat(recursiveFlatten(obj[key].subdir));
      }
    }
    return result;
  }, []);

  const uniqueViewers = useMemo(() => {
    let unique: { [key: string]: Entry } = {};
    data.forEach((d) => {
      unique[d.ip] = d;
    });
    return Object.values(unique).length;
  }, [data]);

  const uniqueDataByDay = useMemo(() => {
    let unique: { [key: string]: Entry[] } = {};
    data.forEach((d) => {
      console.log(d.date);
      const day = new Date(d.date).toDateString();
      if (!(day in unique)) {
        unique[day] = [d];
        return;
      }

      if (!unique[day].find((e) => e.ip === d.ip)) {
        unique[day].push(d);
      }
    });
    let uniqueList: Entry[] = [];
    for (const key in unique) {
      uniqueList = uniqueList.concat(unique[key]);
    }
    return uniqueList;
  }, [data]);

  useEffect(() => {
    if (!all_data) return;
    if (!path.length) setData(recursiveFlatten(all_data));

    let data = all_data;
    path.forEach((part, index) => {
      if (path[index + 1] === "/") {
        data = {
          "/": {
            subdir: {},
            pages: data[part].pages,
          },
        };
        return;
      }
      if (index === path.length - 1) {
        data = {
          [part]: data[part],
        };
      } else {
        data = data[part].subdir;
      }
    });

    setData(recursiveFlatten(data));
  }, [all_data, path]);

  return (
    <h3 className="mb-4 text-2xl font-medium">
      {path.length > 0 ? path.filter((e) => e != "/").join("/") : "All routes"}{" "}
      - {data.length} total views and {uniqueViewers} unique viewers
      {data?.length > 0 &&
        ` since ${new Date(data.map((e) => e.date).at(0) ?? 0).toDateString()}`}
      <div className="flex flex-row">
        <div className="py-8 text-lg text-blue-500">
          <button onClick={() => setPath([])}>All routes</button>

          <PathList data={all_data} path={[]} setPath={setPath} />
        </div>
        <div>
          <div className="grid w-full grid-cols-2">
            <div className="p-8">
              <h3>Views per day</h3>

              <Graph data={data} />
            </div>
            <div className="p-8">
              <h3>Views by city</h3>

              <CityPieChart data={data} />
            </div>
            <div className="p-8">
              <h3>Unique views per day</h3>

              <Graph data={uniqueDataByDay} />
            </div>
            <div className="p-8">
              <h3>Unique views by city</h3>

              <CityPieChart data={uniqueDataByDay} />
            </div>
          </div>
          <div className="p-8">
            <h3>Views by country</h3>
            <Geo data={data} />
          </div>
        </div>
      </div>
    </h3>
  );
}
