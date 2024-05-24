import { CityPieChart } from "./Pie.tsx";
import { Geo } from "./Geo.tsx";
import { Graph } from "./Graph.tsx";
import { PathList } from "./display/PathList.tsx";
import { sortByCount, recursiveFlatten } from "../lib/helpers.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSwitch } from "./display/Switch.tsx";
import type { Entry, NestedObject } from "../types/entry.ts";

export default function Display({ data: all_data }: { data: NestedObject }) {
  const [data, setData] = useState<Entry[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [switchComponent, unique] = useSwitch();

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
      <div className="mb-4 flex w-full flex-row justify-between pr-4">
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
