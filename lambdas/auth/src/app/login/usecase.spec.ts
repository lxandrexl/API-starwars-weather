// tests/http/auth/login.handler.spec.ts
import { makeApiEvent } from "../../../../../tests/factories/api-event";
import { AuthLogin } from "./handler";
jest.mock("core/xray-bootstrap", () => ({}), { virtual: true });

const login = jest.fn();
jest.mock("../../dao/auth", () => ({
  AuthDAO: jest.fn().mockImplementation(() => ({ login })),
}));

describe("LoginUseCase", () => {
  beforeEach(() => {
    login.mockReset();
    login.mockResolvedValue({
      user: { Username: "u" },
      tokens: {
        IdToken: "id-token",
        AccessToken: "acc-token",
        RefreshToken: "ref-token",
      },
    });
  });

  it("loguea usuario y retorna tokens", async () => {
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/login",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "Xyz11234" }),
    });
    const response = {
      user: { Username: "u" },
      tokens: {
        IdToken: expect.any(String),
        AccessToken: expect.any(String),
        RefreshToken: expect.any(String),
      },
    };
    const res = await AuthLogin(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.details).toMatchObject(response);
  });

  it("retorna 500 si credenciales son inválidas", async () => {
    login.mockRejectedValueOnce(new Error("NotAuthorizedException"));
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/login",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "bad@b.com", password: "wrong" }),
    });
    const errorResponse = {
      error: {
        code: "IE",
        httpStatus: 500,
        message: "Internal Server Error",
        details: ["NotAuthorizedException"],
      },
      payload: null,
    };
    const res = await AuthLogin(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(500);
    expect(body).toMatchObject(errorResponse);
  });

  it("retorna 400 si body es inválido", async () => {
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/login",
      headers: { "content-type": "application/json" },
      body: null,
    });
    const errorResponse = {
      error: {
        code: "INVR",
        httpStatus: 400,
        message: "Bad Request",
        details: ["Faltan parámetros obligatorios"],
      },
      payload: null,
    };
    const res = await AuthLogin(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(400);
    expect(body).toMatchObject(errorResponse);
  });

  it("retorna 501 si método no permitido", async () => {
    const event = makeApiEvent({
      httpMethod: "GET",
      path: "/auth/login",
      headers: {},
      body: null,
    });
    const errorResponse = {
      error: {
        code: "NOT_IMPLEMENTED",
        httpStatus: 501,
        message: "Método no implementado",
        details: "",
      },
      payload: null,
    };
    const res = await AuthLogin(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(501);
    expect(body).toMatchObject(errorResponse);
  });

  it("retorna 500 ante error inesperado", async () => {
    login.mockRejectedValueOnce(new Error("InternalError"));
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/login",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "Xyz11234" }),
    });
    const errorResponse = {
      error: {
        code: "IE",
        httpStatus: 500,
        message: "Internal Server Error",
        details: ["InternalError"],
      },
      payload: null,
    };
    const res = await AuthLogin(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(500);
    expect(body).toMatchObject(errorResponse);
  });
});
