import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import type { Entry } from "../types/entry";

function count(data: Entry[]) {
  let counts: Record<string, number> = {};
  let countsArray = [];
  data.forEach((d: Entry) => {
    let date = d.date.split("T")[0];
    if (date in counts) {
      counts[date] += 1;
    } else {
      counts[date] = 1;
    }
  });

  let dates = [];
  for (let date of Object.keys(counts).sort()) {
    dates.push(date);
    countsArray.push(counts[date]);
  }
  console.log(dates, countsArray, Object.keys(counts).sort());

  return { dates, countsArray };
}

export function Graph({ data }: { data: any }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const { dates, countsArray } = count(data);

  useEffect(() => {
    ChartJS.register(
      LineElement,
      PointElement,
      LinearScale,
      Title,
      CategoryScale,
      Tooltip,
    );
    setIsRegistered(true);
  }, []);

  if (!isRegistered) return <></>;

  return (
    <Line
      width={600}
      height={300}
      style={{ width: "100%" }}
      className="w-full"
      data={{
        labels: dates,
        datasets: [
          {
            data: countsArray,
            label: "Visits",
            borderColor: "#3e95cd",
            fill: false,
          },
        ],
      }}
      options={{
        responsive: false,
        interaction: {
          mode: "point",
        },
      }}
    />
  );
}
