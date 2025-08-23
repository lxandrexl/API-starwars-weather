import { makeApiEvent } from "../../../../../tests/factories/api-event";
import { Almacenados } from "./handler";
jest.mock("core/xray-bootstrap", () => ({}), { virtual: true });

const putHistory = jest.fn();
jest.mock("../../dao/storage", () => ({
  StorageDAO: jest.fn().mockImplementation(() => ({ putHistory })),
}));

describe("AlmacenadosUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("201 created: guarda item en historial", async () => {
    putHistory.mockResolvedValueOnce(null);
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/starwars/almacenar",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planetId: 5, notes: "nota x" }),
    });
    const res = await Almacenados(event as any);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.status).toBe("created");
    expect(body.details).toHaveProperty("id");
    expect(putHistory).toHaveBeenCalledWith(
      expect.objectContaining({ planetId: 5, notes: "nota x" })
    );
  });

  it("200 bad_request si planetId inválido", async () => {
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/starwars/almacenar",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planetId: 0 }),
    });

    const res = await Almacenados(event as any);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: "bad_request",
      details: { message: expect.stringMatching(/planetId.*1.*60/i) },
    });
  });
});
