import raw from "./places.json";
import regionsRaw from "./regions.json";
import type { Box, Place, Region } from "./types";

export const places = raw.places as Place[];
export const CITY_BOX = raw.city as Box;
export const regions = regionsRaw as Region[];
export const FULL_BOX: Box = { lon0: 129.03, lon1: 129.53, lat0: 35.645, lat1: 36.025 };
export * from "./types";
