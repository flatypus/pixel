export type Entry = {
  id: number;
  path: string;
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: string;
  longitude: string;
  isp: string;
  user_agent: string;
  date: string;
  host: string;
  pathname: string;
};

export type NestedObject = {
  [key: string]: { subdir: NestedObject; pages: Entry[] };
};
