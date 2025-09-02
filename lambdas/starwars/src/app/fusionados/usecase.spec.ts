import { makeApiEvent } from "../../../../../tests/factories/api-event";
import { Fusionados } from "./handler";
jest.mock("core/xray-bootstrap", () => ({}), { virtual: true });

const getPlanetById = jest.fn();
const getCurrent = jest.fn();
const getFusionByPlanet = jest.fn();
const putFusion = jest.fn();

jest.mock("../../dao/swapi", () => ({
  SwapiDAO: jest.fn().mockImplementation(() => ({ getPlanetById })),
}));
jest.mock("../../dao/weather", () => ({
  WeatherDAO: jest.fn().mockImplementation(() => ({ getCurrent })),
}));
jest.mock("../../dao/storage", () => ({
  StorageDAO: jest
    .fn()
    .mockImplementation(() => ({ getFusionByPlanet, putFusion })),
}));

describe("FusionadosUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("200 ok (no cache): combina SWAPI + Weather y guarda en cache", async () => {
    getFusionByPlanet.mockResolvedValueOnce(null);
    getPlanetById.mockResolvedValueOnce({
      name: "Tatooine",
      climate: "arid",
      terrain: "desert",
      population: "200000",
      url: "https://swapi.info/api/planets/1",
    });
    getCurrent.mockResolvedValueOnce({
      temperature: 30,
      windspeed: 3,
      time: "2025-08-23T00:00:00Z",
    });
    const event = makeApiEvent({
      httpMethod: "GET",
      path: "/starwars/fusionados",
      queryStringParameters: { planetId: "1" },
    });
    const response = {
      status: "ok",
      cached: false,
      details: {
        id: 1,
        name: "Tatooine",
        climate: "arid",
        terrain: "desert",
        population: "200000",
        weather: expect.any(Object),
        source: { planetUrl: expect.any(String) },
      },
    };
    const res = await Fusionados(event as any);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toMatchObject(response);
    expect(putFusion).toHaveBeenCalledWith(1, expect.any(Object), 60 * 30);
  });

  it("200 ok con weather null si no hay datos", async () => {
    getFusionByPlanet.mockResolvedValueOnce(null);
    getPlanetById.mockResolvedValueOnce({
      name: "Tatooine",
      climate: "arid",
      terrain: "desert",
      population: "200000",
      url: "https://swapi.info/api/planets/1",
    });
    getCurrent.mockResolvedValueOnce(null);

    const event = makeApiEvent({
      httpMethod: "GET",
      path: "/starwars/fusionados",
      queryStringParameters: { planetId: "1" },
    });

    const res = await Fusionados(event as any);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      cached: false,
    });
    expect(body.details.weather).toBeNull();
    expect(putFusion).toHaveBeenCalledWith(1, expect.any(Object), 60 * 30);
  });

  it("200 bad_request si planetId inválido", async () => {
    const event = makeApiEvent({
      httpMethod: "GET",
      path: "/starwars/fusionados",
      queryStringParameters: { planetId: "0" },
    });
    const res = await Fusionados(event as any);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: "bad_request",
      details: { message: expect.stringMatching(/planetId.*1.*60/i) },
    });
  });
});
