import { Given, When } from "@cucumber/cucumber";
import { makeApiEvent } from "../../factories/api-event";
import { Historial } from "../../../lambdas/starwars/src/app/historial/handler";
import { saveResponse, getStorageMock } from "./_common.steps";

Given("existen 2 elementos en el historial con nextKey", function () {
  getStorageMock().setListResponse({
    items: [
      { ts: 1730000000000, payload: { planetId: 1, name: "Tatooine" } },
      { ts: 1730000001000, payload: { planetId: 2, name: "Alderaan" } },
    ],
    nextKey: { pk: "fusion#1", sk: 1730000001000 },
  });
});

Given("el historial está vacío", function () {
  getStorageMock().setListResponse({ items: [], nextKey: null });
});

When("hago GET {string}", async function (url: string) {
  const u = new URL(`http://dummy${url}`);
  const event = makeApiEvent({
    httpMethod: "GET",
    path: u.pathname,
    queryStringParameters: Object.fromEntries(u.searchParams.entries()),
  });
  saveResponse(await Historial(event as any));
});
