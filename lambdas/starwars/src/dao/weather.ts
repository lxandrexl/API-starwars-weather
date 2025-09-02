// lambdas/auth/src/dao/auth.ts
import { injectable } from "inversify";
import { IWeatherDAO, WeatherCurrent, WeatherNow } from "../utils/interfaces";
import { PLANET_COORDS } from "../helpers/planets";

@injectable()
export class WeatherDAO implements IWeatherDAO {
  async getCurrent(name: string): Promise<WeatherNow> {
    const p = PLANET_COORDS[name];
    if (!p) return null; // si no tenemos coords, omitimos clima

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,wind_speed_10m&timezone=UTC`;
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) return null;

    const j = (await r.json()) as WeatherCurrent;
    return {
      temperature: j.current?.temperature_2m ?? 0,
      windspeed: j.current?.wind_speed_10m ?? 0,
      time: j.current?.time ?? "",
    };
  }
}
