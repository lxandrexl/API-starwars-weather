import { IUseCase } from "core";
import { Container } from "inversify";
import { IStorageDAO, ISwapiDAO, IWeatherDAO } from "../utils//interfaces";
import { Types } from "./types";
import { WeatherDAO } from "../dao/weather";
import { SwapiDAO } from "../dao/swapi";
import { StorageDAO } from "../dao/storage";
import { FusionadosUseCase } from "../app/fusionados/usecase";
import { AlmacenadosUseCase } from "../app/almacenados/usecase";
import { HistorialUseCase } from "../app/historial/usecase";

const container = new Container();
container.bind<ISwapiDAO>(Types.SwapiDAO).to(SwapiDAO);
container.bind<IWeatherDAO>(Types.WeatherDAO).to(WeatherDAO);
container.bind<IStorageDAO>(Types.StorageDAO).to(StorageDAO);
container.bind<IUseCase<any, any>>(Types.FusionadosUseCaseApp).to(FusionadosUseCase);
container.bind<IUseCase<any, any>>(Types.AlmacenadosUseCaseApp).to(AlmacenadosUseCase);
container.bind<IUseCase<any, any>>(Types.HistorialUseCaseApp).to(HistorialUseCase);

export { container as Container };