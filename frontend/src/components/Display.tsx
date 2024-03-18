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

function useSwitch() {
  const [unique, setUnique] = useState<boolean>(false);
  const switchComponent = (
    <div
      className="relative h-[27px] w-[52px] cursor-pointer rounded-full border-[1px] border-gray-500 transition-all duration-300 ease-in-out"
      style={{ background: unique ? "rgb(209 213 219)" : "transparent" }}
      onClick={() => setUnique((unique) => !unique)}
    >
      <button
        className="absolute top-0 m-[1px] h-[23px] w-[23px] rounded-full border-[1px] bg-white transition-all duration-300 ease-in-out"
        style={unique ? { left: "50%" } : { left: "0%" }}
      ></button>
    </div>
  );
  return [switchComponent, unique];
}

export default function Display({ data: all_data }: { data: NestedObject }) {
  const [data, setData] = useState<Entry[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [switchComponent, unique] = useSwitch();

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

  const sortByCount = useCallback((data: Entry[]): Entry[] => {
    let counts: { [key: string]: Entry[] } = {};
    data.forEach((d) => {
      if (d.city in counts) {
        counts[d.city].push(d);
      } else {
        counts[d.city] = [d];
      }
    });
    return Object.values(counts)
      .sort((a, b) => b.length - a.length)
      .flat();
  }, []);

  const uniqueViewers = useMemo(() => {
    let unique: { [key: string]: Entry } = {};
    data.forEach((d) => {
      unique[d.ip] = d;
    });
    return Object.values(unique).length;
  }, [data]);

  const titleString = useMemo(() => {
    let str = "";
    if (path.length > 0) {
      str += path.filter((e) => e != "/").join("/");
    } else {
      str += "All routes";
    }
    str += ` - ${data.length} total views and ${uniqueViewers} unique viewers`;
    if (data?.length > 0) {
      const date = new Date(data.map((e) => e.date).at(0) ?? 0).toDateString();
      str += ` since ${date}`;
    }
    return str;
  }, [data, uniqueViewers]);

  const uniqueData = useMemo(() => {
    if (!unique) return data;
    let uniqueMap: { [key: string]: Entry[] } = {};
    data.forEach((d) => {
      const day = new Date(d.date).toDateString();
      if (!(day in uniqueMap)) {
        uniqueMap[day] = [d];
        return;
      }

      if (!uniqueMap[day].find((e) => e.ip === d.ip)) {
        uniqueMap[day].push(d);
      }
    });
    let uniqueList: Entry[] = [];
    for (const key in uniqueMap) {
      uniqueList = uniqueList.concat(uniqueMap[key]);
    }
    return sortByCount(uniqueList);
  }, [data, unique]);

  const uniqueText = useCallback(
    (text: string) => (
      <>{`${unique ? "Unique " + text[0].toLowerCase() : text[0]}${text.slice(
        1,
      )}`}</>
    ),
    [unique],
  );

  useEffect(() => {
    if (!all_data) return;
    if (!path.length) setData(sortByCount(recursiveFlatten(all_data)));

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

    setData(sortByCount(recursiveFlatten(data)));
  }, [all_data, path]);

  return (
    <h3 className="mb-4 text-2xl font-medium">
      <div className="flex w-full flex-row justify-between pr-4">
        <span>{titleString}</span>
        <span className="flex flex-row items-center gap-x-2">
          <p>Unique: </p>
          {unique ? "true" : "false"}
          {switchComponent}
        </span>
      </div>
      <div className="flex flex-row">
        <div className="mr-4 text-lg text-blue-500">
          <button className="whitespace-nowrap" onClick={() => setPath([])}>
            All routes
          </button>
          <PathList data={all_data} path={[]} setPath={setPath} />
        </div>
        <div>
          <div className="mb-4 flex w-full flex-row gap-x-4">
            <div>
              <h3>{uniqueText("Views per day")}</h3>
              <Graph data={uniqueData} />
            </div>
            <div>
              <h3>{uniqueText("Views by city")}</h3>
              <CityPieChart data={uniqueData} />
            </div>
          </div>
          <div>
            <h3>{uniqueText("Views by country")}</h3>
            <Geo data={uniqueData} />
          </div>
        </div>
      </div>
    </h3>
  );
}