import { useState, useEffect, useRef } from "react";
import { Chart as ChartJS } from "chart.js";
import type { Entry } from "../types/entry";
import { COUNTRIES } from "../lib/countries";
import { PointElement, CategoryScale, Tooltip } from "chart.js";
import { ChoroplethController } from "chartjs-chart-geo";
import {
  topojson,
  GeoFeature,
  ColorScale,
  ProjectionScale,
  SizeScale,
} from "chartjs-chart-geo";

const count = (data: Entry[]) => {
  let counts: Record<string, number> = {};

  const find = (country: string) => {
    for (let i = 0; i < COUNTRIES.length; i++) {
      if (COUNTRIES[i].startsWith(country)) {
        return COUNTRIES[i];
      }
    }
    return country;
  };

  data.forEach((d: Entry) => {
    let country = find(d.country);
    if (country in counts) {
      counts[country] += 1;
    } else {
      counts[country] = 1;
    }
  });

  const countries = fetch("https://unpkg.com/world-atlas/countries-50m.json")
    .then((r) => r.json())
    .then((data) => {
      const countries = (
        topojson.feature(data, data.objects.countries) as any
      ).features.map((d: any) => ({
        feature: d,
        value: counts[d.properties.name] || 0,
      }));
      return countries;
    });
  return { countries };
};

export function Geo({ data }: { data: Entry[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { countries } = count(data);

  useEffect(() => {
    ChartJS.register(
      Tooltip,
      GeoFeature,
      ColorScale,
      ProjectionScale,
      CategoryScale,
      ChoroplethController,
      SizeScale,
      PointElement,
    );
    setIsRegistered(true);

    let canvas = canvasRef.current;
    const canvasContext = canvas?.getContext("2d");
    if (!canvasContext) return;

    countries.then((countries) => {
      new ChartJS(canvasContext, {
        type: "choropleth",
        data: {
          labels: COUNTRIES,
          datasets: [
            {
              label: "Countries",
              data: countries,
            },
          ],
        },
        options: {
          showOutline: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            projection: {
              axis: "x",
              projection: "equalEarth",
            },
          },
        },
      });
    });
  });

  if (!isRegistered) return <></>;

  return (
    <div className="w-full">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
