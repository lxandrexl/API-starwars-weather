// lambdas/starwars/src/app/historial/usecase.spec.ts
import { makeApiEvent } from "../../../../../tests/factories/api-event";
import { Historial } from "./handler";
jest.mock("core/xray-bootstrap", () => ({}), { virtual: true });

const listFusion = jest.fn();
jest.mock("../../dao/storage", () => ({
  StorageDAO: jest.fn().mockImplementation(() => ({ listFusion })),
}));

describe("HistorialUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("200 ok: lista historial con paginación", async () => {
    listFusion.mockResolvedValueOnce({
      items: [
        { ts: 1730000000000, payload: { id: 1, name: "Tatooine" } },
        { sk: 1730000001000, payload: { id: 2, name: "Alderaan" } },
      ],
      nextKey: { pk: "fusion#1", sk: 1730000001000 },
    });

    const event = makeApiEvent({
      httpMethod: "GET",
      path: "/starwars/historial",
      queryStringParameters: { limit: "2" },
    });

    const res = await Historial(event as any);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.details.items.length).toBe(2);
    expect(body.details).toMatchObject({
      nextPk: "fusion#1",
      nextSk: 1730000001000,
    });
  });

  it("200 ok: sin nextKey ni items", async () => {
    listFusion.mockResolvedValueOnce({ items: [] });

    const event = makeApiEvent({
      httpMethod: "GET",
      path: "/starwars/historial",
    });

    const res = await Historial(event as any);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      details: { items: [], nextPk: null, nextSk: null },
    });
  });
});
