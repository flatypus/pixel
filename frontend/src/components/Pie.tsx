import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Colors } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useEffect, useState } from "react";
import type { Entry } from "../types/entry";

function count(data: Entry[], key: keyof Entry) {
  let counts: Record<string, number> = {};
  let set = [];
  let countsArray = [];
  data.forEach((d: Entry) => {
    let item = d[key];
    if (item in counts) {
      counts[item] += 1;
    } else {
      counts[item] = 1;
    }
  });

  for (let item in counts) {
    set.push(item);
    countsArray.push(counts[item]);
  }

  return { set, countsArray };
}

function PieChart({ labels, counts }: { labels: string[]; counts: number[] }) {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    ChartJS.register(ArcElement, Tooltip, Legend, Colors);
    ChartJS.defaults.plugins.legend.labels.color = "white";
    setIsRegistered(true);
  }, []);

  if (!isRegistered) return <></>;

  return (
    <div className="flex w-[500px] flex-row">
      <div>
        <Pie
          className="w-full"
          height={500}
          options={{ responsive: false }}
          style={{ width: "100%" }}
          width={500}
          data={{
            labels: labels.slice(0, 20),
            datasets: [
              {
                data: counts,
                label: "Visits",
              },
            ],
          }}
        />
      </div>
      <div className="flex h-[300px] w-full flex-col flex-wrap gap-x-4 text-[0.5rem] leading-3">
        {labels.map((label, index) => (
          <span>{`${label} - ${counts[index]}`}</span>
        ))}
      </div>
    </div>
  );
}

export function CountryPieChart({ data }: { data: Entry[] }) {
  const { set: countries, countsArray } = count(data, "country");

  return <PieChart labels={countries} counts={countsArray} />;
}

export function CityPieChart({ data }: { data: Entry[] }) {
  const { set: cities, countsArray } = count(data, "city");
  return <PieChart labels={cities} counts={countsArray} />;
}
