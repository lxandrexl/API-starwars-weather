import { injectable, inject } from "inversify";
import { IUseCase, Request } from "core";
import { ReasonPhrases } from "http-status-codes";
import { Types } from "../../config";
import { IStorageDAO, ISwapiDAO, IWeatherDAO } from "../../utils/interfaces";

type Q = { planetId?: string };

@injectable()
export class FusionadosUseCase implements IUseCase<any, any> {
  constructor(
    @inject(Types.SwapiDAO) private _swapiDAO: ISwapiDAO,
    @inject(Types.WeatherDAO) private _weatherDAO: IWeatherDAO,
    @inject(Types.StorageDAO) private _storageDAO: IStorageDAO
  ) {}

  async execute(req: Request<unknown, any, Q>) {
    const planetId = Number(req.query?.planetId ?? 0);

    if (!Number.isInteger(planetId) || planetId < 1 || planetId > 60) {
      return {
        status: "bad_request",
        details: { message: "planetId debe ser número entre 1 y 60" },
      };
    }

    const cached = await this._storageDAO.getFusionByPlanet(planetId);
    if (cached)
      return {
        status: ReasonPhrases.OK.toLowerCase(),
        cached: true,
        details: cached,
      };

    const result = await this._swapiDAO.getPlanetById(planetId);
    console.log("results::getPlanetById", result);
    if (!result) {
      return {
        status: "not_found",
        details: { message: `No se encontró planeta con id ${planetId}` },
      };
    }
    const weather = await this._weatherDAO.getCurrent(result.name);
    const data = {
      id: planetId,
      name: result.name,
      climate: result.climate ?? "",
      terrain: result.terrain ?? "",
      population: result.population ?? "0",
      weather,
      source: { planetUrl: result.url ?? "" },
    };
    await this._storageDAO.putFusion(planetId, data, 60 * 30); // 30 min

    return {
      status: ReasonPhrases.OK.toLowerCase(),
      cached: false,
      details: data,
    };
  }
}
