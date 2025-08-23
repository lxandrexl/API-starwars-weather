import { Before, Given, When } from "@cucumber/cucumber";
import { makeApiEvent } from "../../factories/api-event";
import { Almacenados } from "../../../lambdas/starwars/src/app/almacenados/handler";
import { saveResponse } from "./_common.steps";

let bodyPayload: any;

Before(() => {
  bodyPayload = undefined;
});

Given(
  "un payload válido para almacenar con planetId {int}",
  function (id: number) {
    bodyPayload = { planetId: id, notes: "nota x" };
  }
);

Given(
  "un payload inválido para almacenar con planetId {int}",
  function (id: number) {
    bodyPayload = { planetId: id };
  }
);

When("hago POST {string}", async function (url: string) {
  const u = new URL(`http://dummy${url}`);
  const event = makeApiEvent({
    httpMethod: "POST",
    path: u.pathname,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(bodyPayload ?? {}),
  });
  saveResponse(await Almacenados(event as any));
});
