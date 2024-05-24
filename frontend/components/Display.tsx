"use client";

import { Geo } from "./Geo";
import { Graph } from "./Graph";
import { PathList } from "./display/PathList";
import { sortByCount, recursiveFlatten, count } from "../lib/helpers";
import { useEffect, useState } from "react";
import type { Entry, NestedObject } from "@/types/entry";

type modes = "all" | "recent" | "unique" | "uniqueRecent";

interface StatViewerProps {
  title: string;
  num: number;
  since?: string | undefined;
  last?: string | undefined;
  mode: modes;
  currentMode: string;
  setMode: (mode: modes) => void;
}

function StatViewer({
  title,
  num,
  since,
  last,
  mode,
  currentMode,
  setMode,
}: StatViewerProps) {
  return (
    <button
      className={`p-4 ${
        mode === currentMode ? "bg-[#ffffff14]" : ""
      } text-left`}
      onClick={() => setMode(mode)}
    >
      <h3 className="text-xl font-normal text-gray-400">{title}</h3>
      <h4 className="text-base font-normal text-gray-500">
        {last ??
          `Since ${num ? new Date(since ?? 0).toDateString() : "all time"}`}
      </h4>
      <h1>{num}</h1>
    </button>
  );
}

function Graphs({ data }: { data: Entry[] }) {
  const { set: cities, countsArray: counts } = count(data, "city");
  const [detailedStats, setDetailedStats] = useState(false);
  return (
    <>
      <div className="grid grid-cols-2 divide-x-[1px] divide-gray-600 text-center text-lg">
        <button
          className={!detailedStats ? "bg-[#ffffff14]" : ""}
          onClick={() => setDetailedStats(false)}
        >
          Stats
        </button>
        <button
          className={detailedStats ? "bg-[#ffffff14]" : ""}
          onClick={() => setDetailedStats(true)}
        >
          Detailed Stats
        </button>
      </div>
      {detailedStats ? (
        <div className="p-4">
          <span className="mb-4 text-xl font-medium">Web Traffic by City</span>
          <div
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.5) transparent",
            }}
            className="flex h-[800px] w-full flex-col flex-wrap gap-x-4 overflow-x-scroll text-[0.5rem] leading-3"
          >
            {cities.map((label, index) => {
              const tag = `${label} - ${counts[index]}`;
              return <span key={tag}>{tag}</span>;
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="p-4">
            <span className="text-xl font-medium">Web Traffic per Day</span>
            <Graph data={data} />
          </div>
          <div className="p-4">
            <span className="text-xl font-medium">Web Traffic by Location</span>
            <Geo data={data} />
          </div>
        </>
      )}
    </>
  );
}

export default function Display({ data: all_data }: { data: NestedObject }) {
  const [data, setData] = useState<Entry[]>([]);
  const [recentData, setRecentData] = useState<Entry[]>([]);
  const [uniqueData, setUniqueData] = useState<Entry[]>([]);
  const [uniqueRecentData, setUniqueRecentData] = useState<Entry[]>([]);

  const [path, setPath] = useState<string[]>([]);
  const [mode, setMode] = useState<modes>("all");

  useEffect(() => {
    if (!all_data) return;
    let dataList = sortByCount(recursiveFlatten(all_data));
    if (path.length) {
      let dataTree = all_data;
      path.forEach((part, index) => {
        if (path[index + 1] === "/") {
          dataTree = {
            "/": {
              subdir: {},
              pages: dataTree[part].pages,
            },
          };
          return;
        }
        if (index === path.length - 1) {
          dataTree = {
            [part]: dataTree[part],
          };
        } else {
          dataTree = dataTree[part].subdir;
        }
      });
      dataList = sortByCount(recursiveFlatten(dataTree));
    }

    let uniqueMap: { [key: string]: Entry[] } = {};
    let ips = new Set<string>();
    for (const d of dataList) {
      const day = new Date(d.date).toDateString();
      if (!(day in uniqueMap)) {
        uniqueMap[day] = [d];
        continue;
      }
      if (!ips.has(d.ip)) {
        uniqueMap[day].push(d);
        ips.add(d.ip);
      }
    }

    const uniqueList: Entry[] = Object.values(uniqueMap).flat();
    const MONTH = 1000 * 60 * 60 * 24 * 30;
    const month_filter = (d: Entry) =>
      new Date(d.date) > new Date(Date.now() - MONTH);
    const recentList: Entry[] = dataList.filter(month_filter);
    const uniqueRecentList: Entry[] = uniqueList.filter(month_filter);

    setData(dataList);
    setRecentData(sortByCount(recentList));
    setUniqueData(sortByCount(uniqueList));
    setUniqueRecentData(sortByCount(uniqueRecentList));
  }, [all_data, path]);

  return (
    <div className="mb-4 divide-y-[1px] divide-gray-600 border-[1px] border-gray-600">
      <h3 className="w-full p-4 text-xl font-normal text-white">
        Displaying stats for views coming from{" "}
        {path.at(0) === "Unknown source" ? (
          <span className="font-medium text-blue-500">Unknown source</span>
        ) : path.length > 0 ? (
          <a
            className="font-medium text-blue-500"
            href={`https://${path.filter((e) => e != "/").join("/")}`}
            target="_blank"
          >
            https://{path.filter((e) => e != "/").join("/")}
          </a>
        ) : (
          <span className="font-medium text-blue-500">All Routes</span>
        )}
      </h3>
      <div className="flex flex-row divide-x-[1px] divide-gray-600">
        <div
          style={{
            width: `400px`,
            height: `1180px`,
            boxShadow: "inset -8px -5px 10px -5px rgba(255, 255, 255, 0.2)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.5) rgba(0, 0, 0, 0.5)",
          }}
          className="m-4 overflow-x-scroll rounded-sm text-lg text-blue-500"
        >
          <button className="whitespace-nowrap" onClick={() => setPath([])}>
            All routes
          </button>
          <PathList data={all_data} path={[]} setPath={setPath} />
        </div>
        <div className="col-span-4 w-full divide-y-[1px] divide-gray-600">
          <div className="grid grid-cols-4 divide-x-[1px] divide-gray-600">
            <StatViewer
              title="Total requests"
              num={data.length}
              since={data.map((e) => e.date).at(0)}
              mode="all"
              currentMode={mode}
              setMode={setMode}
            />
            <StatViewer
              title="Unique requests"
              num={uniqueData.length}
              mode="unique"
              currentMode={mode}
              since={uniqueData.map((e) => e.date).at(0)}
              setMode={setMode}
            />
            <StatViewer
              title="Recent requests"
              num={recentData.length}
              mode="recent"
              currentMode={mode}
              last={"Last 30 days"}
              setMode={setMode}
            />
            <StatViewer
              title="Unique recent requests"
              num={uniqueData.length}
              mode="uniqueRecent"
              currentMode={mode}
              last={"Last 30 days"}
              setMode={setMode}
            />
          </div>
          <Graphs
            data={(() => {
              switch (mode) {
                case "all":
                  return data;
                case "recent":
                  return recentData;
                case "unique":
                  return uniqueData;
                case "uniqueRecent":
                  return uniqueRecentData;
              }
            })()}
          />
        </div>
      </div>
    </div>
  );
}
