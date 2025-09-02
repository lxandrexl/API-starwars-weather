export interface ISwapiDAO {
  getPlanetById(id?: number): Promise<SwapiPlanet>;
}

export interface IWeatherDAO {
  getCurrent(name: string): Promise<WeatherNow>;
}

export interface IStorageDAO {
  putHistory(payload: any): Promise<void>;
  putFusion(planetId: number, data: any, ttlSeconds: number): Promise<void>;
  getFusionByPlanet(planetId: number): Promise<any | null>;
  listFusion(
    limit?: number,
    nextKey?: { pk: string; sk: number },
  ): Promise<{ items: any[]; nextKey?: { pk: string; sk: number } }>;
}

export type SwapiPlanet = {
  name: string;
  climate?: string;
  terrain?: string;
  population?: string;
  url?: string;
};

export type WeatherCurrent = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    time?: string;
  };
};

export type WeatherNow = {
  temperature: number;
  windspeed: number;
  time: string;
} | null;
