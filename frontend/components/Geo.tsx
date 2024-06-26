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
import { percentageToRgb } from "../lib/helpers";

// 'azimuthalEqualArea' | 'azimuthalEquidistant' | 'gnomonic' | 'orthographic' | 'stereographic' | 'equalEarth' | 'albers' | 'albersUsa' | 'conicConformal' | 'conicEqualArea' | 'conicEquidistant' | 'equirectangular' | 'mercator' | 'transverseMercator' | 'naturalEarth1';
const PROJECTION = "naturalEarth1";

const find = (country: string) => {
  for (let c of COUNTRIES) {
    if (c.startsWith(country)) {
      return c;
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
    return countDict(
      data.map((value) => ({ ...value, country: find(value.country) })),
      "country",
    );
  }, [data]);

  const countries = useMemo(() => {
    if (!countryFeatures) return [];
    return countryFeatures.map((d: any) => {
      return {
        feature: d,
        value: counts[d.properties.name]?.length || 0,
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
            backgroundColor: countries.map((d: any) => {
              return d.value
                ? percentageToRgb(Math.log(d.value) / Math.log(1000), 40)
                : "rgba(0,0,0,0)";
            }),
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

    const { cityLatLongMap, labels, colors } = (() => {
      let cityLatLongMap: {
        name: string;
        longitude: number;
        latitude: number;
        value: number;
      }[] = [];
      let labels: string[] = [];
      let colors: string[] = [];

      const maximum = Math.max(...Object.values(cities).map((d) => d.length));

      Object.entries(cities).map(([city, cityData]) => {
        const str = percentageToRgb(
          Math.log(cityData.length) / Math.log(maximum),
        );
        cityLatLongMap.push({
          name: city,
          longitude: cityData[0].longitude,
          latitude: cityData[0].latitude,
          value: cityData.length,
        });
        labels.push(city);
        colors.push(str);
      });

      return { cityLatLongMap, labels, colors };
    })();

    const newCityChart = new ChartJS(cityCanvasContext, {
      type: "bubbleMap",
      data: {
        labels: labels,
        datasets: [
          {
            data: cityLatLongMap,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        showOutline: false,
        elements: {
          point: {
            borderWidth: 1,
            borderColor: "#00000044",
          },
        },
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
    <div className="mt-4 w-full">
      <div className="relative mb-4 w-full flex-1 grid-cols-1 rounded-sm bg-white">
        <canvas
          ref={cityCanvasRef}
          className="absolute top-0"
          style={{ width: "100%", height: "500px" }}
        ></canvas>
        <canvas
          ref={countryCanvasRef}
          style={{ width: "100%", height: "500px" }}
        ></canvas>
      </div>
    </div>
  );
}
