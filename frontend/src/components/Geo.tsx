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

// 'azimuthalEqualArea' | 'azimuthalEquidistant' | 'gnomonic' | 'orthographic' | 'stereographic' | 'equalEarth' | 'albers' | 'albersUsa' | 'conicConformal' | 'conicEqualArea' | 'conicEquidistant' | 'equirectangular' | 'mercator' | 'transverseMercator' | 'naturalEarth1';
const PROJECTION = "naturalEarth1";

const find = (country: string) => {
  for (let i = 0; i < COUNTRIES.length; i++) {
    if (COUNTRIES[i].startsWith(country)) {
      return COUNTRIES[i];
    }
  }
  return country;
};

const getCountryFeatures = () => {
  const countries = fetch("https://unpkg.com/world-atlas/countries-50m.json")
    .then((r) => r.json())
    .then((data) => {
      const countries = (topojson.feature(data, data.objects.countries) as any)
        .features;
      return countries;
    });

  return countries;
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
  const [countryFeatures, setCountryFeatures] = useState<any>(null);
  const [countryChart, setCountryChart] =
    useState<ChartJS<"choropleth"> | null>(null);
  const [cityChart, setCityChart] = useState<ChartJS<"bubbleMap"> | null>(null);

  const counts = useMemo(() => {
    return countDict(data, "country");
  }, [data]);

  const countries = useMemo(() => {
    if (!countryFeatures) return [];
    return countryFeatures.map((d: any) => {
      return {
        feature: d,
        value: counts[find(d.properties.name)]?.length || 0,
      };
    });
  }, [countryFeatures, counts]);

  const cities = useMemo(() => countDict(data, "city"), [data]);

  useEffect(() => {
    getCountryFeatures().then((countryFeatures) => {
      setCountryFeatures(countryFeatures);
    });
  }, []);

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
  }, []);

  useEffect(() => {
    if (!isRegistered) return;

    let countryCanvas = countryCanvasRef.current;
    const countryCanvasContext = countryCanvas?.getContext("2d");
    if (!countryCanvasContext) return;

    let cityCanvas = cityCanvasRef.current;
    const cityCanvasContext = cityCanvas?.getContext("2d");
    if (!cityCanvasContext) return;

    if (!countryFeatures) return;
    if (!countryCanvas || !cityCanvas) return;

    if (countryChart) countryChart.destroy();
    if (cityChart) cityChart.destroy();

    countryCanvas.width = countryCanvas.clientWidth;
    countryCanvas.height = countryCanvas.clientHeight;
    cityCanvas.width = cityCanvas.clientWidth;
    cityCanvas.height = cityCanvas.clientHeight;

    const newCountryChart = new ChartJS(countryCanvasContext, {
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

    setCountryChart(newCountryChart);

    const cityLatLongMap = Object.keys(cities).map((city) => {
      return {
        name: city,
        longitude: cities[city][0].longitude,
        latitude: cities[city][0].latitude,
        value: cities[city].length,
      };
    });

    const newCityChart = new ChartJS(cityCanvasContext, {
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

    setCityChart(newCityChart);
  }, [countryFeatures, countries, cities]);

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

      <div className="flex h-[400px] flex-col flex-wrap gap-x-4 text-sm">
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
