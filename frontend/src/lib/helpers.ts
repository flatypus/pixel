import type { NestedObject, Entry } from "../types/entry";

export const recursiveFlatten = (obj: NestedObject) => {
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
};

export const sortByCount = (data: Entry[]): Entry[] => {
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
};

export const percentageToRgb = (val: number, opacity = 100) => {
  val = val || 0;
  const min = 0;
  const max = 1;
  var minHue = 240,
    maxHue = 0;
  var curPercent = (val - min) / (max - min);
  var colString = `hsl(${
    curPercent * (maxHue - minHue) + minHue
  } 100%  50% / ${opacity}%)`;
  return colString;
};
