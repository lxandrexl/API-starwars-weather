import { Before, Then } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import { Container, Types } from "../../../lambdas/starwars/src/config";
import type {
  ISwapiDAO,
  IWeatherDAO,
} from "../../../lambdas/starwars/src/utils/interfaces";

// --------- Mocks unificados ----------
export class SwapiMock implements ISwapiDAO {
  private planet: any = null;
  setPlanet(p: any) {
    this.planet = p;
  }
  async getPlanetById(): Promise<any> {
    return this.planet;
  }
}
export class WeatherMock implements IWeatherDAO {
  private now: any = {};
  setWeather(w: any) {
    this.now = w;
  }
  async getCurrent(): Promise<any> {
    return this.now;
  }
}
export class StorageMock {
  private cached: Record<number, any> = {};
  private listResp: {
    items: any[];
    nextKey?: { pk: string; sk: number } | null;
  } = { items: [] };

  // fusionados
  async getFusionByPlanet(id: number) {
    return this.cached[id] ?? null;
  }
  async putFusion(id: number, data: any) {
    this.cached[id] = data;
  }

  // almacenados
  async putHistory(item: any) {
    this.cached[-1] = item;
  }

  // historial
  setListResponse(r: {
    items: any[];
    nextKey?: { pk: string; sk: number } | null;
  }) {
    this.listResp = r;
  }
  async listFusion() {
    return this.listResp;
  }
}

// --------- shared response ----------
let res: { statusCode: number; body: string } | undefined;
export const saveResponse = (r: { statusCode: number; body: string }) => {
  res = r;
};

// --------- wiring global ----------
Before(() => {
  const wire = (key: symbol, val: any) => {
    try {
      if ((Container as any).isBound(key)) (Container as any).unbind(key);
    } catch {}
    (Container as any).bind(key).toConstantValue(val);
  };
  wire(Types.SwapiDAO, new SwapiMock() as any);
  wire(Types.WeatherDAO, new WeatherMock() as any);
  wire(Types.StorageDAO, new StorageMock() as any);
  res = undefined;
});

// --------- Then comunes ----------
Then("la respuesta tiene statusCode {int}", function (code: number) {
  assert.ok(res, "No hay respuesta");
  assert.equal(res!.statusCode, code);
});

Then("el cuerpo contiene status {string}", function (status: string) {
  const body = JSON.parse(res!.body);
  assert.equal(body.status, status);
});

Then("el detalle incluye un id generado", function () {
  const body = JSON.parse(res!.body);
  assert.ok(body.details?.id && typeof body.details.id === "string");
});

Then("el detalle incluye {int} elementos", function (n: number) {
  const body = JSON.parse(res!.body);
  assert.equal(body.details?.items?.length ?? -1, n);
});

Then("el detalle incluye next keys", function () {
  const body = JSON.parse(res!.body);
  assert.ok(body.details?.nextPk);
  assert.ok(body.details?.nextSk || body.details?.nextSk === 0);
});

Then("el detalle no tiene next keys", function () {
  const body = JSON.parse(res!.body);
  assert.strictEqual(body.details?.nextPk ?? null, null);
  assert.strictEqual(body.details?.nextSk ?? null, null);
});

// 🔥 Los 3 que faltaban para fusionados:
Then("el detalle incluye el nombre {string}", function (name: string) {
  const body = JSON.parse(res!.body);
  assert.equal(body.details?.name, name);
});

Then("el detalle incluye información de clima", function () {
  const body = JSON.parse(res!.body);
  assert.ok(body.details?.weather, "No hay weather en details");
});

Then(
  "el mensaje indica que planetId debe estar entre {int} y {int}",
  function (min: number, max: number) {
    const body = JSON.parse(res!.body);
    const msg: string = body?.details?.message ?? "";
    assert.match(msg, new RegExp(`${min}`));
    assert.match(msg, new RegExp(`${max}`));
  }
);

export const getStorageMock = () =>
  Container.get(Types.StorageDAO) as unknown as StorageMock;
export const getSwapiMock = () =>
  Container.get(Types.SwapiDAO) as unknown as SwapiMock;
export const getWeatherMock = () =>
  Container.get(Types.WeatherDAO) as unknown as WeatherMock;
