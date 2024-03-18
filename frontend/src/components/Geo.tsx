import { Chart as ChartJS } from "chart.js";
import { BubbleMapController, ChoroplethController } from "chartjs-chart-geo";
import { COUNTRIES } from "../lib/countries";
import { PointElement, CategoryScale, Tooltip } from "chart.js";
import { useState, useEffect, useRef, useMemo } from "react";
import type { Entry } from "../types/entry";
import {
  topojson,
  GeoFeature,
  ColorScale,
  ProjectionScale,
  SizeScale,
} from "chartjs-chart-geo";

const PROJECTION = "mercator";

const count = (counts: Record<string, Entry[]>) => {
  const find = (country: string) => {
    for (let i = 0; i < COUNTRIES.length; i++) {
      if (COUNTRIES[i].startsWith(country)) {
        return COUNTRIES[i];
      }
    }
    return country;
  };
  const countries = fetch("https://unpkg.com/world-atlas/countries-50m.json")
    .then((r) => r.json())
    .then((data) => {
      const countries = (
        topojson.feature(data, data.objects.countries) as any
      ).features.map((d: any) => {
        return {
          feature: d,
          value: counts[find(d.properties.name)]?.length || 0,
        };
      });
      return countries;
    });
  return { countries };
};

const countDict = (dict: any[], key: string) => {
  let counts: Record<string, any[]> = {};

  dict.forEach((d: { [key: string]: string }) => {
    if (d[key] in counts) {
      counts[d[key]].push(d);
    } else {
      counts[d[key]] = [d];
    }
  });
  return counts;
};

export function Geo({ data }: { data: Entry[] }) {
  const countryCanvasRef = useRef<HTMLCanvasElement>(null);
  const cityCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const counts = useMemo(() => {
    return countDict(data, "country");
  }, [data]);

  const cities = useMemo(() => countDict(data, "city"), [data]);

  const { countries } = count(counts);

  useEffect(() => {
    ChartJS.register(
      Tooltip,
      GeoFeature,
      ColorScale,
      ProjectionScale,
      CategoryScale,
      ChoroplethController,
      BubbleMapController,
      SizeScale,
      PointElement,
    );
    setIsRegistered(true);

    let countryCanvas = countryCanvasRef.current;
    const countryCanvasContext = countryCanvas?.getContext("2d");
    if (!countryCanvasContext) return;

    let cityCanvas = cityCanvasRef.current;
    const cityCanvasContext = cityCanvas?.getContext("2d");
    if (!cityCanvasContext) return;

    countries.then((countries) => {
      new ChartJS(countryCanvasContext, {
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
              projection: PROJECTION,
            },
          },
        },
      });

      const cityLatLongMap = Object.keys(cities).map((city) => {
        return {
          name: city,
          longitude: cities[city][0].longitude,
          latitude: cities[city][0].latitude,
          value: cities[city].length,
        };
      });

      console.log(cityLatLongMap, Object.keys(cities).length);

      new ChartJS(cityCanvasContext, {
        type: "bubbleMap",
        data: {
          labels: Object.keys(cities),
          datasets: [
            {
              backgroundColor: "steelblue",
              data: cityLatLongMap,
            },
          ],
        },
        options: {
          showOutline: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            projection: {
              axis: "x",
              projection: PROJECTION,
            },
          },
        },
      });
    });
  });

  if (!isRegistered) return <></>;

  return (
    <div className="flex w-full flex-row gap-x-4">
      <div className="relative w-full flex-1 grid-cols-1 rounded-lg bg-white">
        <canvas
          ref={cityCanvasRef}
          className="absolute top-0"
          style={{ width: "100%", height: "100%" }}
        ></canvas>
        <canvas
          ref={countryCanvasRef}
          style={{ width: "100%", height: "100%" }}
        ></canvas>
      </div>

      <div className="flex h-[400px] flex-col flex-wrap gap-x-4 text-[0.5rem] leading-3">
        {counts &&
          Object.keys(counts)
            .sort((a, b) => counts[b].length - counts[a].length)
            .map((key, index) => (
              <div key={index} className="flex flex-row items-center">
                {key} - {counts[key].length}
              </div>
            ))}
      </div>
    </div>
  );
}
