import { Given, When } from "@cucumber/cucumber";
import { makeApiEvent } from "../../factories/api-event";
import { Fusionados } from "../../../lambdas/starwars/src/app/fusionados/handler";
import { saveResponse, getSwapiMock, getWeatherMock } from "./_common.steps";

// Givens específicos
Given("el planeta con id {int} existe en SWAPI", function (id: number) {
  getSwapiMock().setPlanet({
    name: "Tatooine",
    climate: "arid",
    terrain: "desert",
    population: "200000",
    url: `https://swapi.info/api/planets/${id}`,
  });
});

Given("el clima para {string} está disponible", function (_name: string) {
  getWeatherMock().setWeather({
    temperature: 30,
    windspeed: 3,
    time: "2025-01-01T00:00:00Z",
  });
});

// When como string (recomendado en .feature)
When("consulto GET {string}", async function (url: string) {
  const u = new URL(`http://dummy${url}`);
  const event = makeApiEvent({
    httpMethod: "GET",
    path: u.pathname,
    queryStringParameters: Object.fromEntries(u.searchParams.entries()),
  });
  saveResponse(await Fusionados(event as any));
});

// Compat con feature sin comillas
When(
  /^consulto GET \/starwars\/fusionados\?planetId=(\d+)$/,
  async function (id: string) {
    const event = makeApiEvent({
      httpMethod: "GET",
      path: "/starwars/fusionados",
      queryStringParameters: { planetId: id },
    });
    saveResponse(await Fusionados(event as any));
  }
);
